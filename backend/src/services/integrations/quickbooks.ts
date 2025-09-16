import axios from 'axios';
import { IntegrationConfiguration, QuickBooksConfig } from '../../types/enhanced';
import pool from '../../database/connection';

export class QuickBooksIntegration {
  private config: QuickBooksConfig;
  private baseURL: string;

  constructor(config: QuickBooksConfig) {
    this.config = config;
    this.baseURL = 'https://sandbox-quickbooks.api.intuit.com'; // Use production URL for live
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}/v3/company/${this.config.realm_id}/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.config.access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        // Retry the request
        return this.makeRequest(endpoint, method, data);
      }
      throw error;
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refresh_token
        }), {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.config.client_id}:${this.config.client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

      this.config.access_token = response.data.access_token;
      this.config.refresh_token = response.data.refresh_token;

      // Update in database
      await this.updateTokens(this.config.access_token, this.config.refresh_token);
    } catch (error) {
      throw new Error('Failed to refresh QuickBooks token');
    }
  }

  private async updateTokens(accessToken: string, refreshToken: string): Promise<void> {
    const query = `
      UPDATE integration_configurations 
      SET configuration_data = jsonb_set(
        jsonb_set(configuration_data, '{access_token}', $1::jsonb),
        '{refresh_token}', $2::jsonb
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE integration_type = 'quickbooks' 
        AND configuration_data->>'realm_id' = $3
    `;
    
    await pool.query(query, [
      JSON.stringify(accessToken),
      JSON.stringify(refreshToken),
      this.config.realm_id
    ]);
  }

  // Customer Management
  async syncCustomers(companyId: string): Promise<void> {
    try {
      const customers = await this.makeRequest('customers');
      
      for (const qbCustomer of customers.QueryResponse.Customer || []) {
        await this.syncCustomerToSiteBoss(qbCustomer, companyId);
      }

      console.log(`Synced ${customers.QueryResponse.Customer?.length || 0} customers from QuickBooks`);
    } catch (error) {
      console.error('Error syncing customers:', error);
      throw error;
    }
  }

  private async syncCustomerToSiteBoss(qbCustomer: any, companyId: string): Promise<void> {
    const customerData = {
      external_id: qbCustomer.Id,
      source: 'quickbooks',
      name: qbCustomer.Name,
      company_name: qbCustomer.CompanyName,
      email: qbCustomer.PrimaryEmailAddr?.Address,
      phone: qbCustomer.PrimaryPhone?.FreeFormNumber,
      address: this.formatAddress(qbCustomer.BillAddr),
      active: qbCustomer.Active === 'true'
    };

    // Check if customer already exists
    const existingQuery = `
      SELECT id FROM users 
      WHERE company_id = $1 AND role = 'client' 
        AND (email = $2 OR (first_name || ' ' || last_name) = $3)
    `;
    
    const existing = await pool.query(existingQuery, [
      companyId, 
      customerData.email, 
      customerData.name
    ]);

    if (existing.rows.length === 0) {
      // Create new client user
      const names = customerData.name.split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      const insertQuery = `
        INSERT INTO users (
          company_id, email, first_name, last_name, phone, role, 
          password_hash, external_id, external_source
        ) VALUES ($1, $2, $3, $4, $5, 'client', 'external_user', $6, $7)
      `;

      await pool.query(insertQuery, [
        companyId,
        customerData.email || `${customerData.external_id}@quickbooks.temp`,
        firstName,
        lastName,
        customerData.phone,
        customerData.external_id,
        customerData.source
      ]);
    }
  }

  // Vendor Management
  async syncVendors(companyId: string): Promise<void> {
    try {
      const vendors = await this.makeRequest('vendors');
      
      for (const qbVendor of vendors.QueryResponse.Vendor || []) {
        await this.syncVendorToSiteBoss(qbVendor, companyId);
      }

      console.log(`Synced ${vendors.QueryResponse.Vendor?.length || 0} vendors from QuickBooks`);
    } catch (error) {
      console.error('Error syncing vendors:', error);
      throw error;
    }
  }

  private async syncVendorToSiteBoss(qbVendor: any, companyId: string): Promise<void> {
    const vendorData = {
      external_id: qbVendor.Id,
      business_name: qbVendor.Name,
      contact_name: qbVendor.PrimaryContact?.Name,
      email: qbVendor.PrimaryEmailAddr?.Address,
      phone: qbVendor.PrimaryPhone?.FreeFormNumber,
      address: this.formatAddress(qbVendor.BillAddr),
      active: qbVendor.Active === 'true'
    };

    // Check if vendor exists
    const existingQuery = `
      SELECT id FROM subcontractors 
      WHERE company_id = $1 AND business_name = $2
    `;
    
    const existing = await pool.query(existingQuery, [companyId, vendorData.business_name]);

    if (existing.rows.length === 0) {
      const insertQuery = `
        INSERT INTO subcontractors (
          company_id, business_name, contact_name, email, phone, address,
          is_active, external_id, external_source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'quickbooks')
      `;

      await pool.query(insertQuery, [
        companyId,
        vendorData.business_name,
        vendorData.contact_name,
        vendorData.email,
        vendorData.phone,
        vendorData.address,
        vendorData.active,
        vendorData.external_id
      ]);
    }
  }

  // Expense Sync
  async syncExpensesToQuickBooks(companyId: string, startDate?: Date): Promise<void> {
    try {
      let query = `
        SELECT e.*, p.name as project_name, u.first_name, u.last_name,
               bc.name as category_name
        FROM expenses e
        JOIN projects p ON e.project_id = p.id
        JOIN users u ON e.user_id = u.id
        LEFT JOIN budget_categories bc ON e.budget_category_id = bc.id
        WHERE p.company_id = $1 AND e.is_approved = true AND e.external_id IS NULL
      `;
      
      const params = [companyId];
      
      if (startDate) {
        query += ` AND e.expense_date >= $2`;
        params.push(startDate.toISOString().split('T')[0]);
      }
      
      query += ` ORDER BY e.expense_date DESC`;

      const expenses = await pool.query(query, params);

      for (const expense of expenses.rows) {
        await this.createQuickBooksExpense(expense);
      }

      console.log(`Synced ${expenses.rows.length} expenses to QuickBooks`);
    } catch (error) {
      console.error('Error syncing expenses to QuickBooks:', error);
      throw error;
    }
  }

  private async createQuickBooksExpense(expense: any): Promise<void> {
    const qbExpense = {
      Name: `${expense.project_name} - ${expense.description}`,
      Account: {
        value: "41", // Default expense account - should be configurable
        name: "Meals and Entertainment"
      },
      Amount: parseFloat(expense.amount),
      PaymentType: "Cash",
      TxnDate: expense.expense_date,
      EntityRef: {
        value: "1", // Default employee/vendor - should be mapped
        name: `${expense.first_name} ${expense.last_name}`
      },
      Memo: `Project: ${expense.project_name} | Category: ${expense.category_name || 'General'}`
    };

    try {
      const result = await this.makeRequest('purchases', 'POST', qbExpense);
      
      // Update expense with QuickBooks ID
      const updateQuery = `
        UPDATE expenses 
        SET external_id = $1, external_source = 'quickbooks', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      await pool.query(updateQuery, [result.Purchase.Id, expense.id]);
      
      console.log(`Created QuickBooks expense for ${expense.description}`);
    } catch (error) {
      console.error(`Failed to create QuickBooks expense for ${expense.description}:`, error);
    }
  }

  // Invoice Creation
  async createInvoiceFromProject(projectId: string): Promise<string | null> {
    try {
      const projectQuery = `
        SELECT p.*, u.first_name, u.last_name, u.email, p.contract_value
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE p.id = $1
      `;
      
      const project = await pool.query(projectQuery, [projectId]);
      const projectData = project.rows[0];

      if (!projectData) {
        throw new Error('Project not found');
      }

      // Get project expenses for invoice line items
      const expenseQuery = `
        SELECT bc.name as category, SUM(e.amount) as total
        FROM expenses e
        JOIN budget_categories bc ON e.budget_category_id = bc.id
        WHERE e.project_id = $1 AND e.is_approved = true
        GROUP BY bc.name
        ORDER BY total DESC
      `;
      
      const expenses = await pool.query(expenseQuery, [projectId]);

      // Create invoice
      const qbInvoice = {
        Line: expenses.rows.map((expense, index) => ({
          Id: (index + 1).toString(),
          LineNum: index + 1,
          Amount: parseFloat(expense.total),
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: {
              value: "1", // Default service item
              name: "Services"
            },
            Qty: 1,
            UnitPrice: parseFloat(expense.total)
          },
          Description: `${projectData.name} - ${expense.category}`
        })),
        CustomerRef: {
          value: "1", // Should be mapped from client
          name: `${projectData.first_name} ${projectData.last_name}`
        },
        TotalAmt: projectData.contract_value || expenses.rows.reduce((sum: number, exp: any) => sum + parseFloat(exp.total), 0),
        DocNumber: `INV-${projectData.name.replace(/\s+/g, '-').toUpperCase()}-${new Date().getFullYear()}`,
        TxnDate: new Date().toISOString().split('T')[0],
        DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        Memo: `Invoice for project: ${projectData.name}`
      };

      const result = await this.makeRequest('invoices', 'POST', qbInvoice);
      
      // Update project with invoice reference
      await pool.query(`
        UPDATE projects 
        SET external_invoice_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [result.Invoice.Id, projectId]);

      return result.Invoice.Id;
    } catch (error) {
      console.error('Failed to create QuickBooks invoice:', error);
      return null;
    }
  }

  // Chart of Accounts sync
  async syncChartOfAccounts(): Promise<void> {
    try {
      const accounts = await this.makeRequest('accounts');
      
      // Store account mapping for expense categorization
      const accountMapping: any = {};
      
      for (const account of accounts.QueryResponse.Account || []) {
        accountMapping[account.Id] = {
          name: account.Name,
          type: account.AccountType,
          subType: account.AccountSubType
        };
      }

      // Store mapping in integration configuration
      const updateQuery = `
        UPDATE integration_configurations 
        SET configuration_data = jsonb_set(configuration_data, '{account_mapping}', $1::jsonb),
            updated_at = CURRENT_TIMESTAMP
        WHERE integration_type = 'quickbooks' AND configuration_data->>'realm_id' = $2
      `;

      await pool.query(updateQuery, [
        JSON.stringify(accountMapping),
        this.config.realm_id
      ]);

      console.log(`Synced ${accounts.QueryResponse.Account?.length || 0} accounts from QuickBooks`);
    } catch (error) {
      console.error('Error syncing chart of accounts:', error);
      throw error;
    }
  }

  private formatAddress(addr: any): string {
    if (!addr) return '';
    
    const parts = [
      addr.Line1,
      addr.City,
      addr.CountrySubDivisionCode,
      addr.PostalCode
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('companyinfo/1');
      return !!response.QueryResponse;
    } catch (error) {
      console.error('QuickBooks connection test failed:', error);
      return false;
    }
  }

  // Get company info
  async getCompanyInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('companyinfo/1');
      return response.QueryResponse.CompanyInfo[0];
    } catch (error) {
      console.error('Error fetching company info:', error);
      return null;
    }
  }
}

// Integration Service Factory
export class IntegrationService {
  static async createQuickBooksIntegration(companyId: string): Promise<QuickBooksIntegration | null> {
    try {
      const query = `
        SELECT configuration_data 
        FROM integration_configurations 
        WHERE company_id = $1 AND integration_type = 'quickbooks' AND is_active = true
      `;
      
      const result = await pool.query(query, [companyId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const config = result.rows[0].configuration_data as QuickBooksConfig;
      return new QuickBooksIntegration(config);
    } catch (error) {
      console.error('Failed to create QuickBooks integration:', error);
      return null;
    }
  }

  static async syncAllIntegrations(companyId: string): Promise<void> {
    try {
      // QuickBooks sync
      const qbIntegration = await this.createQuickBooksIntegration(companyId);
      if (qbIntegration) {
        await qbIntegration.syncCustomers(companyId);
        await qbIntegration.syncVendors(companyId);
        await qbIntegration.syncExpensesToQuickBooks(companyId);
        await qbIntegration.syncChartOfAccounts();
      }

      // Add other integrations here (Salesforce, etc.)
      
      // Log sync completion
      await pool.query(`
        INSERT INTO integration_sync_logs (integration_id, sync_type, sync_status, started_at, completed_at)
        SELECT id, 'scheduled', 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM integration_configurations 
        WHERE company_id = $1 AND is_active = true
      `, [companyId]);

    } catch (error) {
      console.error('Error in scheduled integration sync:', error);
      
      // Log sync failure
      await pool.query(`
        INSERT INTO integration_sync_logs (integration_id, sync_type, sync_status, started_at, completed_at, sync_details)
        SELECT id, 'scheduled', 'failed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $2::jsonb
        FROM integration_configurations 
        WHERE company_id = $1 AND is_active = true
      `, [companyId, JSON.stringify({ error: (error as Error).message })]);
    }
  }
}
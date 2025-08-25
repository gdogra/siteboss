import axios from 'axios';
import { SalesforceConfig } from '../../types/enhanced';
import pool from '../../database/connection';

export class SalesforceIntegration {
  private config: SalesforceConfig;

  constructor(config: SalesforceConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.config.instance_url}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.config.access_token}`,
          'Content-Type': 'application/json'
        },
        data
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await this.refreshToken();
        return this.makeRequest(endpoint, method, data);
      }
      throw error;
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(`${this.config.instance_url}/services/oauth2/token`, 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refresh_token,
          client_id: process.env.SALESFORCE_CLIENT_ID!,
          client_secret: process.env.SALESFORCE_CLIENT_SECRET!
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

      this.config.access_token = response.data.access_token;
      
      // Update in database
      await this.updateTokens(this.config.access_token);
    } catch (error) {
      throw new Error('Failed to refresh Salesforce token');
    }
  }

  private async updateTokens(accessToken: string): Promise<void> {
    const query = `
      UPDATE integration_configurations 
      SET configuration_data = jsonb_set(configuration_data, '{access_token}', $1::jsonb),
      updated_at = CURRENT_TIMESTAMP
      WHERE integration_type = 'salesforce' 
        AND configuration_data->>'instance_url' = $2
    `;
    
    await pool.query(query, [
      JSON.stringify(accessToken),
      this.config.instance_url
    ]);
  }

  // Sync Accounts (Companies/Clients)
  async syncAccounts(companyId: string): Promise<void> {
    try {
      const query = `SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, 
                     Phone, Website, Industry, Type FROM Account WHERE Type = 'Customer'`;
      
      const accounts = await this.makeRequest(`/services/data/v57.0/query?q=${encodeURIComponent(query)}`);
      
      for (const sfAccount of accounts.records) {
        await this.syncAccountToSiteBoss(sfAccount, companyId);
      }

      console.log(`Synced ${accounts.records.length} accounts from Salesforce`);
    } catch (error) {
      console.error('Error syncing Salesforce accounts:', error);
      throw error;
    }
  }

  private async syncAccountToSiteBoss(sfAccount: any, companyId: string): Promise<void> {
    const address = [
      sfAccount.BillingStreet,
      sfAccount.BillingCity,
      sfAccount.BillingState,
      sfAccount.BillingPostalCode
    ].filter(Boolean).join(', ');

    // Check if account already exists
    const existingQuery = `
      SELECT id FROM users 
      WHERE company_id = $1 AND role = 'client' AND external_id = $2
    `;
    
    const existing = await pool.query(existingQuery, [companyId, sfAccount.Id]);

    if (existing.rows.length === 0) {
      const insertQuery = `
        INSERT INTO users (
          company_id, email, first_name, last_name, phone, role, 
          password_hash, external_id, external_source
        ) VALUES ($1, $2, $3, $4, $5, 'client', 'external_user', $6, 'salesforce')
      `;

      // For accounts, we'll use the account name as the user name
      const accountName = sfAccount.Name || '';
      const firstName = accountName.split(' ')[0] || 'Account';
      const lastName = accountName.split(' ').slice(1).join(' ') || 'Contact';

      await pool.query(insertQuery, [
        companyId,
        `${sfAccount.Id}@salesforce.temp`, // Temporary email
        firstName,
        lastName,
        sfAccount.Phone,
        sfAccount.Id
      ]);
    }
  }

  // Sync Opportunities to Projects
  async syncOpportunities(companyId: string): Promise<void> {
    try {
      const query = `SELECT Id, Name, AccountId, Amount, CloseDate, StageName, Description, 
                     Probability, Type FROM Opportunity WHERE StageName IN ('Closed Won', 'Negotiation/Review')`;
      
      const opportunities = await this.makeRequest(`/services/data/v57.0/query?q=${encodeURIComponent(query)}`);
      
      for (const sfOpportunity of opportunities.records) {
        await this.syncOpportunityToProject(sfOpportunity, companyId);
      }

      console.log(`Synced ${opportunities.records.length} opportunities from Salesforce`);
    } catch (error) {
      console.error('Error syncing Salesforce opportunities:', error);
      throw error;
    }
  }

  private async syncOpportunityToProject(sfOpportunity: any, companyId: string): Promise<void> {
    // Find the client user
    const clientQuery = `
      SELECT id FROM users 
      WHERE company_id = $1 AND role = 'client' AND external_id = $2
    `;
    
    const client = await pool.query(clientQuery, [companyId, sfOpportunity.AccountId]);
    const clientId = client.rows[0]?.id;

    // Check if project already exists
    const existingQuery = `
      SELECT id FROM projects 
      WHERE company_id = $1 AND external_id = $2
    `;
    
    const existing = await pool.query(existingQuery, [companyId, sfOpportunity.Id]);

    const projectStatus = this.mapSalesforceStageToStatus(sfOpportunity.StageName);

    if (existing.rows.length === 0) {
      const insertQuery = `
        INSERT INTO projects (
          company_id, client_id, name, description, start_date, end_date,
          status, contract_value, external_id, external_source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'salesforce')
      `;

      const startDate = sfOpportunity.StageName === 'Closed Won' ? new Date() : null;
      const endDate = sfOpportunity.CloseDate ? new Date(sfOpportunity.CloseDate) : null;

      await pool.query(insertQuery, [
        companyId,
        clientId,
        sfOpportunity.Name,
        sfOpportunity.Description,
        startDate,
        endDate,
        projectStatus,
        sfOpportunity.Amount,
        sfOpportunity.Id
      ]);
    } else {
      // Update existing project
      const updateQuery = `
        UPDATE projects 
        SET name = $1, description = $2, status = $3, contract_value = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `;

      await pool.query(updateQuery, [
        sfOpportunity.Name,
        sfOpportunity.Description,
        projectStatus,
        sfOpportunity.Amount,
        existing.rows[0].id
      ]);
    }
  }

  // Sync Contacts
  async syncContacts(companyId: string): Promise<void> {
    try {
      const query = `SELECT Id, AccountId, FirstName, LastName, Email, Phone, Title 
                     FROM Contact WHERE Email != null`;
      
      const contacts = await this.makeRequest(`/services/data/v57.0/query?q=${encodeURIComponent(query)}`);
      
      for (const sfContact of contacts.records) {
        await this.syncContactToUser(sfContact, companyId);
      }

      console.log(`Synced ${contacts.records.length} contacts from Salesforce`);
    } catch (error) {
      console.error('Error syncing Salesforce contacts:', error);
      throw error;
    }
  }

  private async syncContactToUser(sfContact: any, companyId: string): Promise<void> {
    // Check if contact already exists
    const existingQuery = `
      SELECT id FROM users 
      WHERE company_id = $1 AND (email = $2 OR external_id = $3)
    `;
    
    const existing = await pool.query(existingQuery, [
      companyId, 
      sfContact.Email, 
      sfContact.Id
    ]);

    if (existing.rows.length === 0) {
      const insertQuery = `
        INSERT INTO users (
          company_id, email, first_name, last_name, phone, role, 
          password_hash, external_id, external_source
        ) VALUES ($1, $2, $3, $4, $5, 'client', 'external_user', $6, 'salesforce')
      `;

      await pool.query(insertQuery, [
        companyId,
        sfContact.Email,
        sfContact.FirstName || 'Contact',
        sfContact.LastName || 'User',
        sfContact.Phone,
        sfContact.Id
      ]);
    }
  }

  // Create/Update Opportunities from Projects
  async syncProjectsToOpportunities(companyId: string): Promise<void> {
    try {
      const projectsQuery = `
        SELECT p.*, u.external_id as client_sf_id
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id AND u.external_source = 'salesforce'
        WHERE p.company_id = $1 AND p.external_id IS NULL
      `;
      
      const projects = await pool.query(projectsQuery, [companyId]);

      for (const project of projects.rows) {
        await this.createSalesforceOpportunity(project);
      }

      console.log(`Synced ${projects.rows.length} projects to Salesforce opportunities`);
    } catch (error) {
      console.error('Error syncing projects to Salesforce:', error);
      throw error;
    }
  }

  private async createSalesforceOpportunity(project: any): Promise<void> {
    const opportunityData = {
      Name: project.name,
      AccountId: project.client_sf_id,
      Amount: project.contract_value,
      CloseDate: project.end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      StageName: this.mapProjectStatusToStage(project.status),
      Description: project.description,
      Type: 'New Business',
      LeadSource: 'SiteBoss'
    };

    try {
      const result = await this.makeRequest('/services/data/v57.0/sobjects/Opportunity/', 'POST', opportunityData);
      
      // Update project with Salesforce ID
      await pool.query(`
        UPDATE projects 
        SET external_id = $1, external_source = 'salesforce', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [result.id, project.id]);

      console.log(`Created Salesforce opportunity for project: ${project.name}`);
    } catch (error) {
      console.error(`Failed to create Salesforce opportunity for project ${project.name}:`, error);
    }
  }

  // Create Tasks from SiteBoss Tasks
  async syncTasksToSalesforce(companyId: string): Promise<void> {
    try {
      const tasksQuery = `
        SELECT t.*, p.name as project_name, p.external_id as project_sf_id,
               u.external_id as assigned_to_sf_id
        FROM tasks t
        JOIN projects p ON t.project_id = p.id AND p.external_source = 'salesforce'
        LEFT JOIN users u ON t.assigned_to = u.id AND u.external_source = 'salesforce'
        WHERE p.company_id = $1 AND t.external_id IS NULL AND t.status IN ('not_started', 'in_progress')
      `;
      
      const tasks = await pool.query(tasksQuery, [companyId]);

      for (const task of tasks.rows) {
        await this.createSalesforceTask(task);
      }

      console.log(`Synced ${tasks.rows.length} tasks to Salesforce`);
    } catch (error) {
      console.error('Error syncing tasks to Salesforce:', error);
      throw error;
    }
  }

  private async createSalesforceTask(task: any): Promise<void> {
    const taskData = {
      Subject: task.title,
      Description: task.description,
      Status: this.mapTaskStatusToSalesforce(task.status),
      Priority: this.mapTaskPriorityToSalesforce(task.priority),
      ActivityDate: task.due_date,
      WhatId: task.project_sf_id, // Link to opportunity
      OwnerId: task.assigned_to_sf_id
    };

    try {
      const result = await this.makeRequest('/services/data/v57.0/sobjects/Task/', 'POST', taskData);
      
      // Update task with Salesforce ID
      await pool.query(`
        UPDATE tasks 
        SET external_id = $1, external_source = 'salesforce', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [result.id, task.id]);

      console.log(`Created Salesforce task: ${task.title}`);
    } catch (error) {
      console.error(`Failed to create Salesforce task ${task.title}:`, error);
    }
  }

  // Utility mapping methods
  private mapSalesforceStageToStatus(stage: string): string {
    const stageMapping: { [key: string]: string } = {
      'Prospecting': 'planning',
      'Qualification': 'planning',
      'Needs Analysis': 'planning',
      'Value Proposition': 'planning',
      'Id. Decision Makers': 'planning',
      'Perception Analysis': 'planning',
      'Proposal/Price Quote': 'planning',
      'Negotiation/Review': 'planning',
      'Closed Won': 'active',
      'Closed Lost': 'cancelled'
    };
    
    return stageMapping[stage] || 'planning';
  }

  private mapProjectStatusToStage(status: string): string {
    const statusMapping: { [key: string]: string } = {
      'planning': 'Proposal/Price Quote',
      'active': 'Closed Won',
      'on_hold': 'Negotiation/Review',
      'completed': 'Closed Won',
      'cancelled': 'Closed Lost'
    };
    
    return statusMapping[status] || 'Proposal/Price Quote';
  }

  private mapTaskStatusToSalesforce(status: string): string {
    const statusMapping: { [key: string]: string } = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'on_hold': 'Waiting on someone else',
      'cancelled': 'Deferred'
    };
    
    return statusMapping[status] || 'Not Started';
  }

  private mapTaskPriorityToSalesforce(priority: string): string {
    const priorityMapping: { [key: string]: string } = {
      'low': 'Low',
      'medium': 'Normal',
      'high': 'High',
      'critical': 'High'
    };
    
    return priorityMapping[priority] || 'Normal';
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/services/data/v57.0/');
      return !!response.sobjects;
    } catch (error) {
      console.error('Salesforce connection test failed:', error);
      return false;
    }
  }

  // Get organization info
  async getOrganizationInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('/services/data/v57.0/query?q=SELECT Id, Name, Country FROM Organization');
      return response.records[0];
    } catch (error) {
      console.error('Error fetching organization info:', error);
      return null;
    }
  }
}
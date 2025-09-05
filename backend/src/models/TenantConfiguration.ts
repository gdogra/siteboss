import pool from '../database/connection';
import { TenantConfiguration } from '../types/enhanced';

export class TenantConfigurationModel {
  private static async ensureTable(): Promise<void> {
    const ddl = `
      CREATE TABLE IF NOT EXISTS tenant_configurations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        tenant_type VARCHAR(50) DEFAULT 'standard',
        branding_config JSONB,
        feature_flags JSONB,
        custom_fields JSONB,
        api_limits JSONB,
        billing_config JSONB,
        support_config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(ddl);
  }
  static async getByCompanyId(companyId: string): Promise<TenantConfiguration | null> {
    await this.ensureTable();
    const query = `
      SELECT id, company_id, tenant_type, branding_config, feature_flags, custom_fields,
             api_limits, billing_config, support_config, created_at, updated_at
      FROM tenant_configurations
      WHERE company_id = $1
      ORDER BY created_at ASC
      LIMIT 1
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows[0] || null;
  }

  static async upsertBillingConfig(companyId: string, billingConfig: any): Promise<any> {
    await this.ensureTable();
    const selectQuery = `SELECT id FROM tenant_configurations WHERE company_id = $1 LIMIT 1`;
    const existing = await pool.query(selectQuery, [companyId]);

    if (existing.rowCount && existing.rows.length > 0) {
      const updateQuery = `
        UPDATE tenant_configurations
        SET billing_config = $2::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE company_id = $1
        RETURNING billing_config
      `;
      const updateRes = await pool.query(updateQuery, [companyId, billingConfig]);
      return updateRes.rows[0]?.billing_config ?? billingConfig;
    }

    const insertQuery = `
      INSERT INTO tenant_configurations (company_id, billing_config)
      VALUES ($1, $2::jsonb)
      RETURNING billing_config
    `;
    const insertRes = await pool.query(insertQuery, [companyId, billingConfig]);
    return insertRes.rows[0]?.billing_config ?? billingConfig;
  }
}

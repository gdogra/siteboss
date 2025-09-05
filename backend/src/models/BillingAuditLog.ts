import pool from '../database/connection';

export class BillingAuditLogModel {
  private static async ensureTable(): Promise<void> {
    const ddl = `
      CREATE TABLE IF NOT EXISTS billing_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        previous_config JSONB,
        new_config JSONB,
        updated_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_billing_audit_company ON billing_audit_logs(company_id, created_at);
    `;
    await pool.query(ddl);
  }

  static async logUpdate(params: {
    companyId: string;
    previousConfig: any;
    newConfig: any;
    updatedBy?: string;
  }): Promise<void> {
    await this.ensureTable();
    const { companyId, previousConfig, newConfig, updatedBy } = params;
    const query = `
      INSERT INTO billing_audit_logs (company_id, action, previous_config, new_config, updated_by)
      VALUES ($1, 'update', $2::jsonb, $3::jsonb, $4)
    `;
    await pool.query(query, [companyId, previousConfig, newConfig, updatedBy || null]);
  }
}


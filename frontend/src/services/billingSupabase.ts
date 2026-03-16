import { supabase } from './supabase';

export const billingStore = {
  // Reads billing_config from tenant_configurations by company_id
  async get(companyId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('tenant_configurations')
      .select('billing_config')
      .eq('company_id', companyId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.billing_config ?? null;
  },

  // Upserts billing_config for a company_id
  async upsert(companyId: string, billingConfig: any): Promise<any> {
    const { data, error } = await supabase
      .from('tenant_configurations')
      .upsert(
        { company_id: companyId, billing_config: billingConfig },
        { onConflict: 'company_id' }
      )
      .select('billing_config')
      .maybeSingle();
    if (error) throw error;
    return data?.billing_config ?? billingConfig;
  },
};


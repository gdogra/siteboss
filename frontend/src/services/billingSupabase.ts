import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const billingStore = {
  // Reads billing_config from tenant_configurations by company_id
  async get(companyId: string): Promise<any | null> {
    if (!supabase) return null;
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
    if (!supabase) return null;
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


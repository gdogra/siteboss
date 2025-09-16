import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
};

export const getBucketName = (): string => process.env.SUPABASE_BUCKET || 'documents';


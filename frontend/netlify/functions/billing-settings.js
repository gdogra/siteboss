// Netlify Function: billing-settings
// Handles GET/PUT for /api/billing/settings backed by Supabase (service role)

const { createClient } = require('@supabase/supabase-js');

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const sanitizeConfig = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {};
  const cleaned = {};
  // Provider
  if (payload.provider && ['stripe', 'manual'].includes(payload.provider)) cleaned.provider = payload.provider;
  // Plan & cycle
  if (payload.defaultPlan && ['starter', 'pro', 'enterprise'].includes(payload.defaultPlan)) cleaned.defaultPlan = payload.defaultPlan;
  if (payload.billingCycle && ['monthly', 'yearly'].includes(payload.billingCycle)) cleaned.billingCycle = payload.billingCycle;
  // Currency
  if (payload.currency && ['USD', 'CAD', 'EUR', 'GBP'].includes(payload.currency)) cleaned.currency = payload.currency;
  // Numerics & misc
  if (payload.taxRate != null) cleaned.taxRate = Number(payload.taxRate) || 0;
  if (payload.trialDays != null) cleaned.trialDays = Math.max(0, parseInt(payload.trialDays, 10) || 0);
  if (payload.netTerms != null) cleaned.netTerms = Math.max(0, parseInt(payload.netTerms, 10) || 0);
  if (payload.proration != null) cleaned.proration = !!payload.proration;
  if (payload.invoicePrefix != null) cleaned.invoicePrefix = String(payload.invoicePrefix).slice(0, 10).toUpperCase();
  if (payload.billingEmail != null) cleaned.billingEmail = String(payload.billingEmail).toLowerCase();
  // Stripe
  if (payload.stripe) {
    const s = {};
    if (payload.stripe.publishableKey) s.publishableKey = String(payload.stripe.publishableKey);
    if (payload.stripe.customerPortalUrl) s.customerPortalUrl = String(payload.stripe.customerPortalUrl);
    if (payload.stripe.priceIds) {
      s.priceIds = {};
      const ids = ['starterMonthly','starterYearly','proMonthly','proYearly','enterpriseMonthly','enterpriseYearly'];
      for (const k of ids) if (payload.stripe.priceIds[k]) s.priceIds[k] = String(payload.stripe.priceIds[k]);
    }
    cleaned.stripe = s;
  }
  // Dunning
  if (payload.dunning) {
    const d = {};
    if (payload.dunning.retries != null) d.retries = Math.max(0, parseInt(payload.dunning.retries, 10) || 0);
    if (payload.dunning.retryIntervalDays != null) d.retryIntervalDays = Math.max(1, parseInt(payload.dunning.retryIntervalDays, 10) || 1);
    if (payload.dunning.sendEmails != null) d.sendEmails = !!payload.dunning.sendEmails;
    cleaned.dunning = d;
  }
  return cleaned;
};

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    if (!['GET', 'PUT', 'OPTIONS'].includes(method)) {
      return json(405, { success: false, error: 'Method not allowed' });
    }

    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-Id',
        },
        body: '',
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json(500, { success: false, error: 'Supabase env vars not configured' });
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // Company identity: prefer header, then query, then demo UUID
    const headers = event.headers || {};
    const qs = event.queryStringParameters || {};
    const companyId = headers['x-company-id'] || headers['X-Company-Id'] || qs.companyId || '123e4567-e89b-12d3-a456-426614174000';

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('tenant_configurations')
        .select('billing_config')
        .eq('company_id', companyId)
        .maybeSingle();
      if (error) return json(500, { success: false, error: error.message });
      return json(200, { success: true, data: data?.billing_config || null });
    }

    // PUT
    let payload;
    try { payload = JSON.parse(event.body || '{}'); } catch { payload = {}; }
    const cleaned = sanitizeConfig(payload);

    // Fetch current for merge
    const { data: existing, error: getErr } = await supabase
      .from('tenant_configurations')
      .select('billing_config')
      .eq('company_id', companyId)
      .maybeSingle();
    if (getErr && getErr.code !== 'PGRST116') return json(500, { success: false, error: getErr.message });
    const prev = existing?.billing_config || {};
    const merged = { ...prev, ...cleaned };

    const { data: upserted, error: upsertErr } = await supabase
      .from('tenant_configurations')
      .upsert({ company_id: companyId, billing_config: merged }, { onConflict: 'company_id' })
      .select('billing_config')
      .maybeSingle();
    if (upsertErr) return json(500, { success: false, error: upsertErr.message });

    // Best-effort audit log
    try {
      await supabase.from('billing_audit_logs').insert({
        company_id: companyId,
        action: 'update',
        previous_config: prev,
        new_config: upserted?.billing_config || merged,
      });
    } catch {}

    return json(200, { success: true, data: upserted?.billing_config || merged });
  } catch (e) {
    return json(500, { success: false, error: e?.message || 'Unexpected error' });
  }
};


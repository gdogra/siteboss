import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TenantConfigurationModel } from '../models/TenantConfiguration';
import { BillingAuditLogModel } from '../models/BillingAuditLog';

const validateBillingConfig = (payload: any): { valid: boolean; cleaned?: any; error?: string } => {
  if (typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, error: 'Invalid payload type' };
  }
  const cleaned: any = {};
  // Provider
  if (payload.provider && !['stripe', 'manual'].includes(payload.provider)) {
    return { valid: false, error: 'Unsupported provider' };
  }
  if (payload.provider) cleaned.provider = payload.provider;

  // Plan & billing cycle
  if (payload.defaultPlan && !['starter', 'pro', 'enterprise'].includes(payload.defaultPlan)) {
    return { valid: false, error: 'Invalid defaultPlan' };
  }
  if (payload.defaultPlan) cleaned.defaultPlan = payload.defaultPlan;

  if (payload.billingCycle && !['monthly', 'yearly'].includes(payload.billingCycle)) {
    return { valid: false, error: 'Invalid billingCycle' };
  }
  if (payload.billingCycle) cleaned.billingCycle = payload.billingCycle;

  // Currency
  if (payload.currency && !['USD', 'CAD', 'EUR', 'GBP'].includes(payload.currency)) {
    return { valid: false, error: 'Invalid currency' };
  }
  if (payload.currency) cleaned.currency = payload.currency;

  // Numerics
  if (payload.taxRate != null) cleaned.taxRate = Number(payload.taxRate) || 0;
  if (payload.trialDays != null) cleaned.trialDays = Math.max(0, parseInt(payload.trialDays, 10) || 0);
  if (payload.netTerms != null) cleaned.netTerms = Math.max(0, parseInt(payload.netTerms, 10) || 0);
  if (payload.proration != null) cleaned.proration = !!payload.proration;

  if (payload.invoicePrefix != null) cleaned.invoicePrefix = String(payload.invoicePrefix).slice(0, 10).toUpperCase();
  if (payload.billingEmail != null) cleaned.billingEmail = String(payload.billingEmail).toLowerCase();

  // Stripe
  if (payload.stripe) {
    const s: any = {};
    if (payload.stripe.publishableKey) s.publishableKey = String(payload.stripe.publishableKey);
    if (payload.stripe.customerPortalUrl) s.customerPortalUrl = String(payload.stripe.customerPortalUrl);
    if (payload.stripe.priceIds) {
      const ids = ['starterMonthly','starterYearly','proMonthly','proYearly','enterpriseMonthly','enterpriseYearly'];
      s.priceIds = {};
      for (const k of ids) {
        if (payload.stripe.priceIds[k]) s.priceIds[k] = String(payload.stripe.priceIds[k]);
      }
    }
    cleaned.stripe = s;
  }

  // Dunning
  if (payload.dunning) {
    const d: any = {};
    if (payload.dunning.retries != null) d.retries = Math.max(0, parseInt(payload.dunning.retries, 10) || 0);
    if (payload.dunning.retryIntervalDays != null) d.retryIntervalDays = Math.max(1, parseInt(payload.dunning.retryIntervalDays, 10) || 1);
    if (payload.dunning.sendEmails != null) d.sendEmails = !!payload.dunning.sendEmails;
    cleaned.dunning = d;
  }

  return { valid: true, cleaned };
};

export const BillingController = {
  getSettings: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const companyId = req.user.companyId;
    const config = await TenantConfigurationModel.getByCompanyId(companyId);
    return res.json({ success: true, data: config?.billing_config || null });
  },

  updateSettings: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const companyId = req.user.companyId;
    const payload = req.body || {};
    const current = await TenantConfigurationModel.getByCompanyId(companyId);
    const prev = current?.billing_config || null;

    const { valid, cleaned, error } = validateBillingConfig(payload);
    if (!valid) {
      return res.status(400).json({ success: false, error });
    }

    // Prevent storing secrets even if passed
    if (payload?.stripe?.secretKey) {
      // ignore silently
    }

    // Merge with existing to preserve unspecified keys
    const merged = { ...(prev || {}), ...(cleaned || {}) };

    const updated = await TenantConfigurationModel.upsertBillingConfig(companyId, merged);
    await BillingAuditLogModel.logUpdate({
      companyId,
      previousConfig: prev,
      newConfig: updated,
      updatedBy: req.user.userId,
    });
    return res.json({ success: true, data: updated });
  }
};

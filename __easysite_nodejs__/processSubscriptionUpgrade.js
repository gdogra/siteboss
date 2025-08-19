function processSubscriptionUpgrade(tenantId, newPlan, billingCycle) {
  const currentTime = new Date().toISOString();

  // Define plan features and pricing
  const plans = {
    starter: {
      name: 'Starter',
      monthly_price: 49,
      annual_price: 470, // 20% discount
      max_users: 10,
      storage_limit_gb: 5,
      api_rate_limit: 1000,
      features: ['basic_reporting', 'mobile_app', 'email_support'],
      white_label_enabled: false,
      custom_domain_enabled: false
    },
    professional: {
      name: 'Professional',
      monthly_price: 99,
      annual_price: 950, // 20% discount
      max_users: 25,
      storage_limit_gb: 25,
      api_rate_limit: 5000,
      features: ['advanced_analytics', 'priority_support', 'custom_branding', 'api_access', 'webhooks'],
      white_label_enabled: false,
      custom_domain_enabled: true
    },
    enterprise: {
      name: 'Enterprise',
      monthly_price: 199,
      annual_price: 1910, // 20% discount
      max_users: -1, // unlimited
      storage_limit_gb: -1, // unlimited
      api_rate_limit: 10000,
      features: ['white_label', 'dedicated_support', 'custom_development', 'sla_guarantee', 'advanced_integrations'],
      white_label_enabled: true,
      custom_domain_enabled: true
    }
  };

  if (!plans[newPlan]) {
    throw new Error('Invalid plan selected');
  }

  const plan = plans[newPlan];
  const isAnnual = billingCycle === 'annual';
  const price = isAnnual ? plan.annual_price : plan.monthly_price;
  const discount = isAnnual ? Math.round((plan.monthly_price * 12 - plan.annual_price) / (plan.monthly_price * 12) * 100) : 0;

  // Calculate proration for immediate upgrade
  const nextBillingDate = new Date();
  if (isAnnual) {
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
  } else {
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  }

  // Generate subscription details
  const subscriptionId = 'sub_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const subscription = {
    id: subscriptionId,
    tenant_id: tenantId,
    plan: newPlan,
    billing_cycle: billingCycle,
    status: 'active',
    current_period_start: currentTime,
    current_period_end: nextBillingDate.toISOString(),
    amount: price,
    currency: 'USD',
    created_at: currentTime,
    updated_at: currentTime
  };

  // Create billing record
  const billingRecord = {
    tenant_id: tenantId,
    subscription_id: subscriptionId,
    amount: price,
    currency: 'USD',
    billing_cycle: billingCycle,
    status: 'paid',
    payment_date: currentTime,
    next_payment_date: nextBillingDate.toISOString(),
    discount_percent: discount
  };

  // Update tenant with new plan limits
  const tenantUpdate = {
    plan: newPlan,
    max_users: plan.max_users,
    storage_limit_gb: plan.storage_limit_gb,
    api_rate_limit: plan.api_rate_limit,
    white_label_enabled: plan.white_label_enabled,
    custom_domain_enabled: plan.custom_domain_enabled,
    billing_status: 'active',
    updated_at: currentTime
  };

  // Generate referral code for this tenant
  const referralCode = tenantId.substring(0, 8).toUpperCase();

  return {
    subscription: subscription,
    billing: billingRecord,
    tenantUpdate: tenantUpdate,
    planFeatures: plan.features,
    referralCode: referralCode,
    discount: discount,
    savings: isAnnual ? plan.monthly_price * 12 - plan.annual_price : 0,
    message: `Successfully upgraded to ${plan.name} plan. ${isAnnual ? `You saved $${Math.round(plan.monthly_price * 12 - plan.annual_price)} with annual billing!` : ''}`
  };
}
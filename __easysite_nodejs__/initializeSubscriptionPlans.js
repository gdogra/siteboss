async function initializeSubscriptionPlans() {
  try {
    // Check if plans already exist
    const { data: existingPlans, error: checkError } = await window.ezsite.apis.tablePage('35510', {
      PageNo: 1,
      PageSize: 1,
      OrderByField: 'id',
      IsAsc: true,
      Filters: []
    });

    if (checkError) {
      throw new Error('Failed to check existing plans: ' + checkError);
    }

    if (existingPlans && existingPlans.List && existingPlans.List.length > 0) {
      return {
        success: true,
        message: 'Subscription plans already exist'
      };
    }

    // Create default subscription plans
    const plans = [
    {
      plan_name: 'Starter',
      plan_code: 'starter',
      plan_description: 'Perfect for small teams getting started with construction management',
      price: 49,
      currency: 'USD',
      plan_type: 'monthly',
      billing_cycle: 1,
      max_users: 10,
      max_projects: 5,
      max_storage_gb: 5,
      trial_period_days: 30,
      features: JSON.stringify([
      'project_management',
      'basic_reporting',
      'file_storage',
      'team_collaboration',
      'mobile_app']
      ),
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      plan_name: 'Professional',
      plan_code: 'professional',
      plan_description: 'Advanced features for growing construction companies',
      price: 99,
      currency: 'USD',
      plan_type: 'monthly',
      billing_cycle: 1,
      max_users: 25,
      max_projects: -1, // unlimited
      max_storage_gb: 25,
      trial_period_days: 30,
      features: JSON.stringify([
      'project_management',
      'advanced_reporting',
      'file_storage',
      'team_collaboration',
      'mobile_app',
      'time_tracking',
      'inventory_management',
      'custom_branding',
      'priority_support',
      'api_access']
      ),
      is_active: true,
      is_popular: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      plan_name: 'Enterprise',
      plan_code: 'enterprise',
      plan_description: 'Complete solution for large construction enterprises',
      price: 199,
      currency: 'USD',
      plan_type: 'monthly',
      billing_cycle: 1,
      max_users: -1, // unlimited
      max_projects: -1, // unlimited
      max_storage_gb: -1, // unlimited
      trial_period_days: 30,
      features: JSON.stringify([
      'project_management',
      'advanced_reporting',
      'file_storage',
      'team_collaboration',
      'mobile_app',
      'time_tracking',
      'inventory_management',
      'custom_branding',
      'priority_support',
      'api_access',
      'white_label',
      'advanced_analytics',
      'phone_support',
      'dedicated_manager']
      ),
      is_active: true,
      is_popular: false,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];


    // Insert each plan
    for (const plan of plans) {
      const { error: insertError } = await window.ezsite.apis.tableCreate('35510', plan);
      if (insertError) {
        throw new Error(`Failed to create ${plan.plan_name} plan: ${insertError}`);
      }
    }

    return {
      success: true,
      message: 'Successfully created default subscription plans',
      plansCreated: plans.length
    };
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
    throw new Error(error.message || 'Failed to initialize subscription plans');
  }
}
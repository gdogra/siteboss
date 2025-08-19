function createTenant(tenantData) {
    const { name, subdomain, plan, adminEmail, adminName, customDomain } = tenantData;
    
    // Validate required fields
    if (!name || !subdomain || !adminEmail) {
        throw new Error('Name, subdomain, and admin email are required');
    }
    
    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
        throw new Error('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }
    
    // Generate tenant ID and default branding
    const tenantId = 'tenant_' + Date.now();
    const currentTime = new Date().toISOString();
    
    const defaultBranding = {
        company_name: name,
        tagline: 'Powered by SiteBoss',
        logo_url: '',
        favicon_url: '',
        primary_color: '#0f172a',
        secondary_color: '#1e293b',
        accent_color: '#3b82f6',
        background_color: '#ffffff',
        text_color: '#1f2937',
        font_family: 'Inter, system-ui, sans-serif',
        custom_css: '',
        login_background: ''
    };
    
    // Create tenant record
    const tenant = {
        id: tenantId,
        name: name,
        subdomain: subdomain,
        custom_domain: customDomain || null,
        plan: plan || 'starter',
        status: 'active',
        max_users: plan === 'enterprise' ? -1 : (plan === 'professional' ? 25 : 10),
        storage_limit_gb: plan === 'enterprise' ? -1 : (plan === 'professional' ? 25 : 5),
        api_rate_limit: plan === 'enterprise' ? 10000 : (plan === 'professional' ? 5000 : 1000),
        white_label_enabled: plan === 'enterprise',
        custom_domain_enabled: plan !== 'starter',
        created_at: currentTime,
        updated_at: currentTime,
        trial_ends_at: null,
        billing_status: 'trial'
    };
    
    // Create default admin user
    const adminUser = {
        tenant_id: tenantId,
        email: adminEmail,
        name: adminName,
        role: 'admin',
        status: 'active',
        created_at: currentTime
    };
    
    // Generate API keys
    const apiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const webhookSecret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    return {
        tenant: tenant,
        branding: defaultBranding,
        adminUser: adminUser,
        apiKey: apiKey,
        webhookSecret: webhookSecret,
        setupUrl: `https://${subdomain}.siteboss.com/setup`,
        message: `Tenant '${name}' created successfully. Setup URL: https://${subdomain}.siteboss.com/setup`
    };
}
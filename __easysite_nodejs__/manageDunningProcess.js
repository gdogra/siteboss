function manageDunningProcess(tenantId, failedPayment) {
    const currentTime = new Date().toISOString();
    const { amount, currency, attempt_number, last_attempt_date, failure_reason } = failedPayment;
    
    // Define dunning workflow stages
    const dunningStages = [
        {
            day: 1,
            action: 'email_reminder',
            subject: 'Payment Failed - Please Update Your Payment Method',
            urgency: 'low',
            grace_period_days: 3
        },
        {
            day: 4,
            action: 'email_warning',
            subject: 'Urgent: Payment Required to Maintain Service',
            urgency: 'medium',
            grace_period_days: 3
        },
        {
            day: 7,
            action: 'service_restriction',
            subject: 'Service Restricted - Immediate Action Required',
            urgency: 'high',
            restrictions: ['read_only_mode', 'no_new_projects', 'limited_users']
        },
        {
            day: 14,
            action: 'final_warning',
            subject: 'Final Notice - Account Suspension in 24 Hours',
            urgency: 'critical',
            grace_period_days: 1
        },
        {
            day: 15,
            action: 'suspend_account',
            subject: 'Account Suspended - Contact Support',
            urgency: 'critical',
            restrictions: ['full_suspension', 'data_retention_30_days']
        },
        {
            day: 45,
            action: 'delete_account',
            subject: 'Account Deletion Notice',
            urgency: 'final',
            restrictions: ['permanent_deletion', 'no_recovery']
        }
    ];
    
    // Calculate days since first failed payment
    const firstFailureDate = new Date(last_attempt_date);
    const daysSinceFailure = Math.floor((new Date().getTime() - firstFailureDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Find current dunning stage
    let currentStage = dunningStages.find(stage => stage.day <= daysSinceFailure && 
        daysSinceFailure < (dunningStages[dunningStages.indexOf(stage) + 1]?.day || Infinity));
    
    if (!currentStage) {
        currentStage = dunningStages[0]; // Default to first stage
    }
    
    // Generate dunning record
    const dunningId = 'dun_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const dunningRecord = {
        id: dunningId,
        tenant_id: tenantId,
        stage: currentStage.action,
        attempt_number: attempt_number,
        days_overdue: daysSinceFailure,
        failed_amount: amount,
        currency: currency,
        failure_reason: failure_reason,
        urgency_level: currentStage.urgency,
        created_at: currentTime,
        next_action_date: new Date(Date.now() + (currentStage.grace_period_days || 1) * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Define actions based on current stage
    const actions = [];
    
    switch (currentStage.action) {
        case 'email_reminder':
            actions.push({
                type: 'send_email',
                template: 'payment_failed_reminder',
                data: {
                    amount: amount,
                    currency: currency,
                    failure_reason: failure_reason,
                    retry_url: `https://billing.siteboss.com/retry-payment/${tenantId}`,
                    support_url: 'https://support.siteboss.com'
                }
            });
            break;
            
        case 'email_warning':
            actions.push({
                type: 'send_email',
                template: 'payment_failed_warning',
                data: {
                    days_until_restriction: 3,
                    amount: amount,
                    currency: currency
                }
            });
            break;
            
        case 'service_restriction':
            actions.push({
                type: 'restrict_service',
                restrictions: currentStage.restrictions
            });
            actions.push({
                type: 'send_email',
                template: 'service_restricted'
            });
            break;
            
        case 'final_warning':
            actions.push({
                type: 'send_email',
                template: 'final_warning',
                data: {
                    suspension_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }
            });
            break;
            
        case 'suspend_account':
            actions.push({
                type: 'suspend_account',
                data_retention_days: 30
            });
            actions.push({
                type: 'send_email',
                template: 'account_suspended'
            });
            break;
            
        case 'delete_account':
            actions.push({
                type: 'delete_account',
                backup_data: true,
                permanent: true
            });
            actions.push({
                type: 'send_email',
                template: 'account_deleted'
            });
            break;
    }
    
    // Calculate recovery options
    const recoveryOptions = {
        payment_retry: {
            available: currentStage.action !== 'delete_account',
            url: `https://billing.siteboss.com/retry-payment/${tenantId}`,
            discount_offered: daysSinceFailure > 7 ? 50 : 0 // 50% discount after 7 days
        },
        contact_support: {
            available: true,
            url: 'https://support.siteboss.com/billing-help',
            phone: '+1-800-SITEBOSS'
        },
        downgrade_plan: {
            available: currentStage.action !== 'delete_account',
            url: `https://billing.siteboss.com/downgrade/${tenantId}`
        }
    };
    
    // Update tenant billing status
    const billingStatusUpdate = {
        billing_status: currentStage.action === 'suspend_account' ? 'suspended' : 
                       currentStage.action === 'delete_account' ? 'deleted' : 'overdue',
        dunning_stage: currentStage.action,
        service_restrictions: currentStage.restrictions || [],
        updated_at: currentTime
    };
    
    return {
        dunning: dunningRecord,
        currentStage: currentStage,
        actions: actions,
        recoveryOptions: recoveryOptions,
        billingUpdate: billingStatusUpdate,
        nextActionDate: dunningRecord.next_action_date,
        message: `Dunning process executed for tenant ${tenantId}. Current stage: ${currentStage.action}. Days overdue: ${daysSinceFailure}.`
    };
}
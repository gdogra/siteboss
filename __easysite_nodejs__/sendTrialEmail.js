
function sendTrialEmail(userId, emailType, customData = {}) {
    if (!userId || !emailType) {
        throw new Error('User ID and email type are required');
    }

    // Email templates based on trial stage
    const emailTemplates = {
        welcome: {
            subject: 'Welcome to your 30-day free trial! 🚀',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb;">Welcome to ContractPro!</h1>
                    <p>Your 30-day free trial has started. Here's what you can do next:</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Quick Start Guide:</h3>
                        <ul>
                            <li>✅ Complete your onboarding (5 minutes)</li>
                            <li>🏗️ Create your first project</li>
                            <li>👥 Invite your team members</li>
                            <li>📱 Download our mobile app</li>
                        </ul>
                    </div>
                    <a href="${customData.dashboardUrl || '#'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Get Started →
                    </a>
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                        Questions? Reply to this email or visit our help center.
                    </p>
                </div>
            `
        },
        feature_highlight: {
            subject: `Master ${customData.featureName} in 5 minutes`,
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb;">Feature Spotlight: ${customData.featureName}</h1>
                    <p>${customData.featureDescription}</p>
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                        <h3>Why customers love this feature:</h3>
                        <p>"${customData.customerTestimonial || 'This feature saved us 10+ hours per week!'}"</p>
                    </div>
                    <a href="${customData.featureUrl || '#'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Try ${customData.featureName} →
                    </a>
                </div>
            `
        },
        trial_ending: {
            subject: '⏰ Your trial ends in 3 days - Choose your plan',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #dc2626;">Don't lose your progress!</h1>
                    <p>Your trial ends in <strong>3 days</strong>. Choose a plan to continue using ContractPro and keep all your data.</p>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h3 style="color: #92400e;">Most Popular: Professional Plan</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #92400e;">$149/month</p>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Everything you're using now</li>
                            <li>Advanced analytics & reporting</li>
                            <li>Priority support</li>
                            <li>API access</li>
                        </ul>
                    </div>
                    
                    <a href="${customData.pricingUrl || '#'}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 18px;">
                        Choose Your Plan →
                    </a>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                        Need more time to decide? <a href="#">Contact us</a> about extending your trial.
                    </p>
                </div>
            `
        }
    };

    const template = emailTemplates[emailType];
    if (!template) {
        throw new Error(`Unknown email type: ${emailType}`);
    }

    return {
        emailData: {
            userId,
            emailType,
            subject: template.subject,
            content: template.content,
            sentAt: new Date().toISOString()
        },
        success: true
    };
}

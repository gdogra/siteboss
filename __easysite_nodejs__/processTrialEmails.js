
function processTrialEmails() {
  const axios = require('axios');
  
  try {
    // This function will be called periodically to send scheduled trial emails
    // In a production system, this would be triggered by a cron job or scheduled task
    
    const now = new Date();
    const currentDateISO = now.toISOString();
    
    // Query for emails that are scheduled to be sent now or in the past
    const scheduledEmails = []; // This would be fetched from the email_sequences table
    
    // Process each scheduled email
    scheduledEmails.forEach(async (emailRecord) => {
      try {
        const emailContent = generateEmailContent(emailRecord.email_type, emailRecord);
        
        // Send the email
        await sendEmail({
          to: [emailRecord.user_email],
          subject: emailRecord.subject,
          html: emailContent
        });
        
        // Update the email record as sent
        // This would update the email_sequences table to mark as sent
        
      } catch (error) {
        console.error(`Error sending email ${emailRecord.id}:`, error);
      }
    });
    
    return {
      success: true,
      processed: scheduledEmails.length,
      timestamp: currentDateISO
    };
    
  } catch (error) {
    throw new Error(`Trial email processing failed: ${error.message}`);
  }
}

function generateEmailContent(emailType, emailRecord) {
  const baseUrl = 'https://contractpro.com'; // Replace with actual domain
  
  const templates = {
    onboarding_tips: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">💡 Quick Setup Tips for ContractPro</h1>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p>Hi there!</p>
          
          <p>Welcome to day 1 of your ContractPro trial! Here are some quick tips to help you get the most out of your experience:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🚀 Quick Wins for Day 1:</h3>
            <ul style="color: #374151; line-height: 1.8;">
              <li><strong>Upload a project document</strong> - Try our document management system</li>
              <li><strong>Create your first invoice</strong> - See how AI streamlines the process</li>
              <li><strong>Download the mobile app</strong> - Access your projects anywhere</li>
              <li><strong>Invite one team member</strong> - Experience real-time collaboration</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/client/dashboard" 
               style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Continue Setup →
            </a>
          </div>
          
          <p><strong>💬 Need Help?</strong><br>
          Reply to this email or call (949) 555-WAVE. Our team is here to help you succeed!</p>
          
          <p>Best regards,<br>
          <strong>The ContractPro Team</strong></p>
        </div>
      </div>
    `,
    
    feature_highlight: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🤖 Discover AI-Powered Project Insights</h1>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p>Hi there!</p>
          
          <p>You're 3 days into your ContractPro trial! Today, let's explore one of our most powerful features: <strong>AI-Powered Project Insights</strong>.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">🎯 What AI Insights Can Do:</h3>
            <ul style="color: #1e3a8a; line-height: 1.8;">
              <li><strong>Predict project delays</strong> before they happen</li>
              <li><strong>Identify cost overruns</strong> in real-time</li>
              <li><strong>Optimize resource allocation</strong> automatically</li>
              <li><strong>Suggest timeline improvements</strong> based on data</li>
            </ul>
          </div>
          
          <p>Companies using our AI features save an average of <strong style="color: #10b981;">$47,000 per month</strong>!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/client/dashboard?tab=insights" 
               style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Explore AI Insights →
            </a>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #047857; margin: 0;"><strong>📈 Success Story:</strong> Metro Construction used AI insights to identify material waste patterns, saving $12K on their last project alone!</p>
          </div>
          
          <p>Questions about AI features? Just reply to this email!</p>
          
          <p>Best regards,<br>
          <strong>The ContractPro Team</strong></p>
        </div>
      </div>
    `,
    
    mid_trial_check: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📊 How's Your Trial Going?</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You're halfway through your 30-day trial!</p>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p>Hi there!</p>
          
          <p>You're 14 days into your ContractPro trial - congratulations on making it to the halfway point!</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">🎯 Let's Optimize Your Setup</h3>
            <p style="color: #92400e; margin-bottom: 0;">Based on successful customers, here's what you should focus on next:</p>
          </div>
          
          <ul style="color: #374151; line-height: 1.8;">
            <li><strong>Import your existing projects</strong> - See the full power of our platform</li>
            <li><strong>Set up automated workflows</strong> - Save 5+ hours per week</li>
            <li><strong>Connect your accounting software</strong> - Streamline invoicing</li>
            <li><strong>Train your team</strong> - Everyone should know the basics</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/client/dashboard" 
               style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Complete Setup →
            </a>
          </div>
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0;"><strong>🤝 Need Personal Help?</strong> Book a free 15-minute setup call with our success team. We'll help optimize your account for maximum results!</p>
          </div>
          
          <p>Questions or feedback? Just reply to this email!</p>
          
          <p>Best regards,<br>
          <strong>The ContractPro Team</strong></p>
        </div>
      </div>
    `,
    
    upgrade_reminder: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⏰ 7 Days Left - Special Discount!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your trial ends soon - secure your discount now</p>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p>Hi there!</p>
          
          <p>Your ContractPro trial ends in just 7 days. We hope you've experienced the power of our platform!</p>
          
          <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">🎯 Limited-Time Offer</h3>
            <p style="color: #7f1d1d; font-size: 18px; margin: 0;"><strong>Save 30% on your first year</strong> when you upgrade before your trial expires!</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">📈 Your Trial Results:</h3>
            <ul style="color: #166534; line-height: 1.8;">
              <li>Projects managed more efficiently</li>
              <li>Time saved on administrative tasks</li>
              <li>Better team communication and collaboration</li>
              <li>Streamlined invoicing and payments</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/pricing?discount=TRIAL30" 
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              Claim Your 30% Discount →
            </a>
          </div>
          
          <p>This discount expires when your trial ends. Don't miss out on this special pricing!</p>
          
          <p><strong>Questions about pricing or features?</strong><br>
          Reply to this email or call (949) 555-WAVE. We're here to help!</p>
          
          <p>Best regards,<br>
          <strong>The ContractPro Team</strong></p>
        </div>
      </div>
    `,
    
    final_reminder: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c2d12, #dc2626); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 Last Chance - Trial Expires Tomorrow!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Don't lose access to your ContractPro account</p>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p>Hi there!</p>
          
          <p><strong>Your ContractPro trial expires tomorrow at midnight.</strong> After that, you'll lose access to all your projects, data, and team collaboration features.</p>
          
          <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">⏰ What Happens If You Don't Upgrade:</h3>
            <ul style="color: #7f1d1d; line-height: 1.8;">
              <li>❌ Lose access to all project data</li>
              <li>❌ Can't manage ongoing projects</li>
              <li>❌ Team collaboration stops</li>
              <li>❌ Invoicing and payment tracking ends</li>
            </ul>
          </div>
          
          <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #047857; margin-top: 0;">✅ Keep Your Account Active:</h3>
            <p style="color: #047857; font-size: 18px; margin: 0;"><strong>Still get 30% off your first year!</strong> This offer expires with your trial.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/pricing?discount=TRIAL30&urgent=true" 
               style="background: linear-gradient(135deg, #dc2626, #7c2d12); color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Upgrade Now - Save 30% →
            </a>
          </div>
          
          <p style="text-align: center; color: #dc2626; font-weight: bold;">
            This offer expires in less than 24 hours!
          </p>
          
          <p><strong>Need to speak with someone?</strong><br>
          Call us immediately at (949) 555-WAVE. We can help you upgrade over the phone.</p>
          
          <p>Thank you for trying ContractPro,<br>
          <strong>The ContractPro Team</strong></p>
        </div>
      </div>
    `
  };
  
  return templates[emailType] || templates.onboarding_tips;
}

// Export the function
module.exports = processTrialEmails;

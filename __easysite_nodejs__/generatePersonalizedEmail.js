
function generatePersonalizedEmail(userId, emailType, userData) {
  try {
    const baseUrl = 'https://contractpro.com'; // Replace with actual domain
    const userName = userData.name || 'there';
    const companyName = userData.company || 'your company';

    // Get user's trial progress and personalize accordingly
    const personalizedContent = {
      subject: generatePersonalizedSubject(emailType, userData),
      html: generatePersonalizedHTML(emailType, userData, baseUrl)
    };

    return personalizedContent;

  } catch (error) {
    throw new Error(`Email personalization failed: ${error.message}`);
  }
}

function generatePersonalizedSubject(emailType, userData) {
  const subjects = {
    welcome: `🚀 Welcome to ContractPro, ${userData.name}!`,
    onboarding_tips: `${userData.name}, quick setup tips for ${userData.company}`,
    feature_highlight: `${userData.name}, see how AI saved Metro Construction $50K`,
    success_story: `How companies like ${userData.company} are saving $47K/month`,
    mid_trial_check: `${userData.name}, let's optimize your ContractPro setup`,
    upgrade_reminder: `${userData.name}, your ContractPro discount expires in 7 days`,
    final_reminder: `⏰ ${userData.name}, your trial expires tomorrow!`,
    onboarding_complete: `🎉 You're all set, ${userData.name}! Welcome to ContractPro`
  };

  return subjects[emailType] || `Update from ContractPro`;
}

function generatePersonalizedHTML(emailType, userData, baseUrl) {
  const templates = {
    welcome: generateWelcomeEmail(userData, baseUrl),
    onboarding_complete: generateOnboardingCompleteEmail(userData, baseUrl),
    success_story: generateSuccessStoryEmail(userData, baseUrl)
  };

  return templates[emailType] || generateDefaultEmail(userData, baseUrl);
}

function generateWelcomeEmail(userData, baseUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 32px;">🎉 Welcome ${userData.name}!</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Your ContractPro journey starts now</p>
      </div>
      
      <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
        <p>Hi ${userData.name},</p>
        
        <p>Welcome to ContractPro! We're excited to help ${userData.company} streamline operations and boost profitability.</p>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #1f2937; margin-top: 0; font-size: 20px;">🚀 Your 30-Day Trial Includes:</h3>
          <ul style="color: #374151; line-height: 2; margin-bottom: 0; padding-left: 20px;">
            <li><strong>Unlimited projects</strong> and team members</li>
            <li><strong>AI-powered insights</strong> that save $47K+ monthly</li>
            <li><strong>Mobile app</strong> with offline capabilities</li>
            <li><strong>Advanced reporting</strong> and analytics</li>
            <li><strong>Invoice automation</strong> and payment processing</li>
            <li><strong>24/7 customer support</strong></li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${baseUrl}/onboarding?step=1" 
             style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 18px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 18px; box-shadow: 0 4px 15px rgba(37,99,235,0.3);">
            Start 5-Minute Setup →
          </a>
        </div>
        
        <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0;">
          <h4 style="color: #047857; margin: 0 0 10px 0;">💡 Success Tip for ${userData.company}:</h4>
          <p style="color: #065f46; margin: 0; line-height: 1.6;">
            Companies similar to yours see the biggest impact by starting with project tracking and invoice automation. 
            We'll guide you through both during onboarding!
          </p>
        </div>
        
        <p><strong>What's next?</strong></p>
        <ol style="color: #374151; line-height: 1.8; padding-left: 20px;">
          <li>Complete your personalized onboarding (5 minutes)</li>
          <li>Import your first project</li>
          <li>Invite team members</li>
          <li>Start saving time and money!</li>
        </ol>
        
        <p>Questions? Reply to this email or call (949) 555-WAVE. Our success team is standing by!</p>
        
        <p>Excited to help ${userData.company} succeed,<br>
        <strong>The ContractPro Team</strong></p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            ContractPro | Newport Beach, CA | (949) 555-WAVE
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateOnboardingCompleteEmail(userData, baseUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <div style="font-size: 50px; margin-bottom: 15px;">🎉</div>
        <h1 style="margin: 0; font-size: 28px;">Congratulations ${userData.name}!</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Your ContractPro account is ready!</p>
      </div>
      
      <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
        <p>Hi ${userData.name},</p>
        
        <p>🎊 <strong>Amazing work!</strong> You've successfully completed your ContractPro onboarding. ${userData.company} is now ready to experience next-level construction management.</p>
        
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #0369a1; margin-top: 0;">🚀 You're Now Ready To:</h3>
          <div style="display: grid; gap: 10px;">
            <div style="color: #0c4a6e; display: flex; align-items: center; gap: 10px;">
              <span style="background: #0ea5e9; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</span>
              <span>Manage unlimited projects with your team</span>
            </div>
            <div style="color: #0c4a6e; display: flex; align-items: center; gap: 10px;">
              <span style="background: #0ea5e9; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</span>
              <span>Generate and send professional invoices</span>
            </div>
            <div style="color: #0c4a6e; display: flex; align-items: center; gap: 10px;">
              <span style="background: #0ea5e9; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</span>
              <span>Access AI insights for better decisions</span>
            </div>
            <div style="color: #0c4a6e; display: flex; align-items: center; gap: 10px;">
              <span style="background: #0ea5e9; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</span>
              <span>Use mobile app for field management</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${baseUrl}/client/dashboard" 
             style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 18px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 18px; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
            Go to Your Dashboard →
          </a>
        </div>
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
          <h4 style="color: #d97706; margin: 0 0 10px 0;">📱 Don't Forget Your Mobile App!</h4>
          <p style="color: #92400e; margin: 0 0 15px 0;">Download ContractPro mobile for iOS or Android to manage projects on-site.</p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <a href="#" style="background: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">📱 iOS App</a>
            <a href="#" style="background: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">🤖 Android App</a>
          </div>
        </div>
        
        <p><strong>Over the next few days, watch for:</strong></p>
        <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
          <li>📧 <strong>Daily productivity tips</strong> to maximize your results</li>
          <li>🎥 <strong>Video tutorials</strong> for advanced features</li>
          <li>📊 <strong>Success stories</strong> from companies like ${userData.company}</li>
          <li>💡 <strong>Best practices</strong> from our customer success team</li>
        </ul>
        
        <p>Have questions or need help? Our team is here for you at (949) 555-WAVE or just reply to this email.</p>
        
        <p>Welcome to the ContractPro family, ${userData.name}!<br>
        <strong>The ContractPro Team</strong></p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            ContractPro | Newport Beach, CA | (949) 555-WAVE
          </p>
        </div>
      </div>
    </div>
  `;
}

function generateSuccessStoryEmail(userData, baseUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">📈 How Metro Construction Saved $50K</h1>
        <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">A success story that could inspire ${userData.company}</p>
      </div>
      
      <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
        <p>Hi ${userData.name},</p>
        
        <p>I wanted to share an inspiring success story from Metro Construction - a company similar to ${userData.company} that transformed their operations with ContractPro.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">📊 Metro Construction's Results:</h3>
          <div style="display: grid; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="background: #10b981; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">$50K</div>
              <span style="color: #334155;"><strong>Monthly savings</strong> through AI optimization</span>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="background: #3b82f6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">40%</div>
              <span style="color: #334155;"><strong>Faster project completion</strong> with better coordination</span>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="background: #8b5cf6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">85%</div>
              <span style="color: #334155;"><strong>Reduction in admin time</strong> through automation</span>
            </div>
          </div>
        </div>
        
        <blockquote style="border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; background: #f1f5f9; font-style: italic; color: #1e293b;">
          "ContractPro's AI insights helped us identify cost overruns before they became major problems. We caught a material waste issue that would have cost us $15K. The platform pays for itself every month."
          <br><br>
          <strong>- Sarah Johnson, Project Manager at Metro Construction</strong>
        </blockquote>
        
        <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h4 style="color: #047857; margin: 0 0 15px 0;">🎯 How ${userData.company} Can Achieve Similar Results:</h4>
          <ol style="color: #065f46; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Use AI Project Insights</strong> - Catch issues early like Metro did</li>
            <li><strong>Automate Your Workflows</strong> - Reduce manual tasks by 85%</li>
            <li><strong>Implement Mobile Tracking</strong> - Real-time updates from the field</li>
            <li><strong>Optimize Resource Allocation</strong> - AI suggests the best approaches</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${baseUrl}/client/dashboard?tab=insights" 
             style="background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 18px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 18px;">
            Explore AI Insights →
          </a>
        </div>
        
        <p>Want to discuss how ${userData.company} can achieve similar results? Reply to this email or call (949) 555-WAVE. Our success team can show you exactly how Metro implemented these strategies.</p>
        
        <p>Here's to your success,<br>
        <strong>The ContractPro Team</strong></p>
      </div>
    </div>
  `;
}

function generateDefaultEmail(userData, baseUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #374151, #1f2937); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Update from ContractPro</h1>
      </div>
      
      <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
        <p>Hi ${userData.name},</p>
        
        <p>We hope you're getting great value from ContractPro!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/client/dashboard" 
             style="background: linear-gradient(135deg, #374151, #1f2937); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Visit Your Dashboard →
          </a>
        </div>
        
        <p>Questions? Reply to this email or call (949) 555-WAVE.</p>
        
        <p>Best regards,<br>
        <strong>The ContractPro Team</strong></p>
      </div>
    </div>
  `;
}

module.exports = generatePersonalizedEmail;
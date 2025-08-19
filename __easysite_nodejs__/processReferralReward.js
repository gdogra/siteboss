function processReferralReward(referrerTenantId, referredTenantId, referralCode) {
    const currentTime = new Date().toISOString();
    
    // Validate referral code
    if (!referralCode || referralCode.length !== 8) {
        throw new Error('Invalid referral code');
    }
    
    // Define referral rewards
    const referralRewards = {
        referrer: {
            credit_amount: 50, // $50 credit
            bonus_months: 1, // 1 month free
            description: 'Thank you for referring a new customer!'
        },
        referred: {
            discount_percent: 20, // 20% off first 3 months
            discount_months: 3,
            description: 'Welcome! You get 20% off your first 3 months.'
        }
    };
    
    // Generate unique referral tracking ID
    const referralId = 'ref_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Create referral record
    const referralRecord = {
        id: referralId,
        referrer_tenant_id: referrerTenantId,
        referred_tenant_id: referredTenantId,
        referral_code: referralCode,
        status: 'completed',
        referrer_reward_amount: referralRewards.referrer.credit_amount,
        referred_discount_percent: referralRewards.referred.discount_percent,
        referred_discount_months: referralRewards.referred.discount_months,
        created_at: currentTime,
        processed_at: currentTime
    };
    
    // Create credit for referrer
    const referrerCredit = {
        tenant_id: referrerTenantId,
        amount: referralRewards.referrer.credit_amount,
        currency: 'USD',
        type: 'referral_bonus',
        description: referralRewards.referrer.description,
        reference_id: referralId,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        created_at: currentTime
    };
    
    // Create discount for referred tenant
    const referredDiscount = {
        tenant_id: referredTenantId,
        discount_percent: referralRewards.referred.discount_percent,
        discount_months_remaining: referralRewards.referred.discount_months,
        type: 'referral_discount',
        description: referralRewards.referred.description,
        reference_id: referralId,
        created_at: currentTime
    };
    
    // Generate referral link for the referring tenant
    const newReferralLink = `https://siteboss.com/trial-signup?ref=${referralCode}`;
    
    // Email data for notifications
    const emailNotifications = {
        referrer: {
            to: referrerTenantId, // This would be resolved to actual email
            subject: '🎉 You earned a $50 credit!',
            template: 'referral_success_referrer',
            data: {
                credit_amount: referralRewards.referrer.credit_amount,
                referred_company: referredTenantId, // This would be resolved to company name
                new_referral_link: newReferralLink
            }
        },
        referred: {
            to: referredTenantId, // This would be resolved to actual email
            subject: 'Welcome to SiteBoss! Your discount is active',
            template: 'referral_success_referred',
            data: {
                discount_percent: referralRewards.referred.discount_percent,
                discount_months: referralRewards.referred.discount_months,
                savings_per_month: 20 // This would be calculated based on their plan
            }
        }
    };
    
    // Update referrer's referral stats
    const referrerStats = {
        total_referrals: 1, // This would be incremented
        total_credits_earned: referralRewards.referrer.credit_amount,
        next_referral_tier: 'silver', // bronze -> silver -> gold -> platinum
        updated_at: currentTime
    };
    
    return {
        referral: referralRecord,
        referrerCredit: referrerCredit,
        referredDiscount: referredDiscount,
        referrerStats: referrerStats,
        emailNotifications: emailNotifications,
        newReferralLink: newReferralLink,
        message: `Referral processed successfully! Referrer earned $${referralRewards.referrer.credit_amount} credit, referred customer gets ${referralRewards.referred.discount_percent}% off for ${referralRewards.referred.discount_months} months.`
    };
}

function getTrialStatus(userId) {
    if (!userId) {
        throw new Error('User ID is required');
    }

    // This would typically fetch from database
    // For now, return sample trial status
    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.max(0, ((30 - daysRemaining) / 30) * 100);

    return {
        isTrialActive: daysRemaining > 0,
        daysRemaining: Math.max(0, daysRemaining),
        totalTrialDays: 30,
        progressPercentage: Math.min(100, progressPercentage),
        trialEndDate: trialEndDate.toISOString(),
        canExtendTrial: daysRemaining <= 7 && daysRemaining > 0,
        featuresUsed: [],
        onboardingProgress: 0
    };
}

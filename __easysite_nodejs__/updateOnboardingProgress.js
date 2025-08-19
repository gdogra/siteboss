
function updateOnboardingProgress(userId, stepName, stepData = {}) {
    if (!userId || !stepName) {
        throw new Error('User ID and step name are required');
    }

    const now = new Date();
    const progressData = {
        user_id: userId,
        step_name: stepName,
        completed_at: now.toISOString(),
        is_completed: true,
        step_data: JSON.stringify(stepData),
        time_spent_minutes: stepData.timeSpent || 5,
        attempts: 1
    };

    // Calculate overall progress
    const totalSteps = 5; // Based on our onboarding steps
    const completedSteps = 1; // This would be calculated from database
    const progressPercentage = (completedSteps / totalSteps) * 100;

    return {
        progressData,
        overallProgress: progressPercentage,
        nextStep: getNextOnboardingStep(stepName),
        isOnboardingComplete: progressPercentage >= 100
    };
}

function getNextOnboardingStep(currentStep) {
    const stepOrder = {
        'welcome': 'company_setup',
        'company_setup': 'first_project',
        'first_project': 'team_invitation',
        'team_invitation': 'feature_tour',
        'feature_tour': null
    };
    
    return stepOrder[currentStep] || null;
}

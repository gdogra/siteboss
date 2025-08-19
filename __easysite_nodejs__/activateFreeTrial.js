async function activateFreeTrial(trialData) {
  if (!trialData || !trialData.email) {
    throw new Error('Trial data with email is required');
  }

  try {
    const now = new Date().toISOString();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + (trialData.trialDays || 30));
    const trialEnd = trialEndDate.toISOString();

    // For now, we'll use a default plan ID since we can't easily query in Node.js
    // In a real implementation, you'd need to set up proper database access
    const planId = 2; // Default to Professional plan

    // Return the data that the frontend will use to create the records
    return {
      success: true,
      trialData: {
        planId,
        trialStartDate: now,
        trialEndDate: trialEnd,
        daysRemaining: trialData.trialDays || 30,
        status: 'active',
        userEmail: trialData.email,
        company: trialData.company,
        firstName: trialData.firstName,
        lastName: trialData.lastName
      },
      message: 'Free trial data prepared successfully!'
    };
  } catch (error) {
    console.error('Error preparing free trial:', error);
    throw new Error(error.message || 'Failed to prepare free trial');
  }
}
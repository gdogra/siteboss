function trackProposalStatus(proposalId, eventType, eventData = {}) {
    // This function tracks proposal status changes and events
    
    if (!proposalId || !eventType) {
        throw new Error('Proposal ID and event type are required');
    }

    const validEventTypes = [
        'created',
        'sent',
        'viewed',
        'downloaded',
        'signed',
        'rejected',
        'expired',
        'approved',
        'edited',
        'version_created',
        'reminder_sent',
        'follow_up_sent'
    ];

    if (!validEventTypes.includes(eventType)) {
        throw new Error(`Invalid event type. Must be one of: ${validEventTypes.join(', ')}`);
    }

    const timestamp = new Date().toISOString();
    
    // Create tracking record
    const trackingRecord = {
        proposalId: proposalId,
        eventType: eventType,
        timestamp: timestamp,
        eventData: eventData,
        userAgent: eventData.userAgent || '',
        ipAddress: eventData.ipAddress || '',
        userEmail: eventData.userEmail || '',
        deviceInfo: {
            type: eventData.deviceType || 'unknown',
            os: eventData.operatingSystem || 'unknown',
            browser: eventData.browser || 'unknown'
        },
        location: eventData.location || null,
        metadata: eventData.metadata || {}
    };

    // Calculate additional metrics based on event type
    let statusUpdate = null;
    let nextActions = [];
    let notifications = [];

    switch (eventType) {
        case 'created':
            statusUpdate = { status: 'draft', created_at: timestamp };
            nextActions = ['review', 'edit', 'send'];
            notifications = ['notify_team'];
            break;

        case 'sent':
            statusUpdate = { status: 'sent', sent_at: timestamp };
            nextActions = ['track_views', 'schedule_reminder'];
            notifications = ['notify_client', 'notify_team'];
            break;

        case 'viewed':
            statusUpdate = { status: 'viewed', viewed_at: timestamp };
            nextActions = ['wait_for_signature', 'schedule_follow_up'];
            notifications = ['notify_team'];
            break;

        case 'signed':
            statusUpdate = { status: 'signed', signed_at: timestamp };
            nextActions = ['create_project', 'generate_contract'];
            notifications = ['notify_team', 'notify_client', 'notify_management'];
            break;

        case 'rejected':
            statusUpdate = { status: 'rejected', rejected_at: timestamp };
            nextActions = ['analyze_feedback', 'create_revision'];
            notifications = ['notify_team', 'notify_management'];
            break;

        case 'expired':
            statusUpdate = { status: 'expired', expired_at: timestamp };
            nextActions = ['create_renewal', 'follow_up'];
            notifications = ['notify_team', 'notify_client'];
            break;

        case 'approved':
            nextActions = ['send_to_client'];
            notifications = ['notify_requester', 'notify_team'];
            break;

        case 'version_created':
            nextActions = ['review_changes', 'notify_stakeholders'];
            notifications = ['notify_team'];
            break;

        default:
            nextActions = ['review'];
            break;
    }

    // Calculate time-based metrics
    const metrics = calculateProposalMetrics(proposalId, eventType, trackingRecord);

    // Prepare the response
    const result = {
        success: true,
        trackingId: `track_${proposalId}_${Date.now()}`,
        proposalId: proposalId,
        eventType: eventType,
        timestamp: timestamp,
        statusUpdate: statusUpdate,
        nextActions: nextActions,
        notifications: notifications,
        metrics: metrics,
        trackingRecord: trackingRecord
    };

    // Log for debugging
    console.log('Proposal status tracked:', {
        proposalId: proposalId,
        eventType: eventType,
        timestamp: timestamp,
        statusUpdate: statusUpdate
    });

    return result;
}

function calculateProposalMetrics(proposalId, eventType, trackingRecord) {
    // Calculate various metrics based on the event
    const metrics = {
        responseTime: null,
        conversionRate: null,
        engagementScore: null,
        timeToSign: null
    };

    // In a real implementation, you would:
    // 1. Fetch previous events for this proposal
    // 2. Calculate time differences
    // 3. Update engagement scores
    // 4. Calculate conversion rates

    switch (eventType) {
        case 'viewed':
            // Calculate time from sent to viewed
            metrics.responseTime = calculateTimeDifference('sent', 'viewed', proposalId);
            metrics.engagementScore = 75; // Base engagement for viewing
            break;

        case 'signed':
            // Calculate time from sent to signed
            metrics.timeToSign = calculateTimeDifference('sent', 'signed', proposalId);
            metrics.conversionRate = 100; // Successful conversion
            metrics.engagementScore = 100; // Maximum engagement
            break;

        case 'rejected':
            metrics.conversionRate = 0; // No conversion
            metrics.engagementScore = 25; // Low engagement
            break;

        case 'downloaded':
            metrics.engagementScore = 85; // High engagement for downloading
            break;
    }

    return metrics;
}

function calculateTimeDifference(fromEvent, toEvent, proposalId) {
    // In a real implementation, you would query the database
    // to find the timestamps of these events and calculate the difference
    
    // For now, return a mock calculation (in minutes)
    const mockTimes = {
        'sent_to_viewed': Math.floor(Math.random() * 1440) + 60, // 1 hour to 24 hours
        'sent_to_signed': Math.floor(Math.random() * 7200) + 720, // 12 hours to 5 days
        'viewed_to_signed': Math.floor(Math.random() * 2880) + 180 // 3 hours to 2 days
    };
    
    const eventPair = `${fromEvent}_to_${toEvent}`;
    return mockTimes[eventPair] || null;
}
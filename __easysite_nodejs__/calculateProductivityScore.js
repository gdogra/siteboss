
function calculateProductivityScore(sessionData) {
    if (!sessionData) {
        throw new Error('Session data is required');
    }

    const {
        totalDuration,
        workDuration,
        breakDuration,
        geofenceViolations = 0,
        gpsAccuracyAverage = 50,
        locationPoints = 0,
        expectedHours = 8,
        movementDistance = 0
    } = sessionData;

    let score = 100;

    // Work efficiency (40% of score)
    const workEfficiency = workDuration / totalDuration;
    const efficiencyScore = Math.min(workEfficiency * 1.2, 1) * 40;
    score = efficiencyScore;

    // Break time penalty (20% of score)
    const expectedBreakTime = totalDuration * 0.15; // 15% break time is normal
    const breakRatio = breakDuration / expectedBreakTime;
    let breakScore = 20;
    
    if (breakRatio > 1.5) {
        breakScore = Math.max(0, 20 - (breakRatio - 1.5) * 10);
    } else if (breakRatio < 0.5) {
        breakScore = Math.max(10, 20 - (0.5 - breakRatio) * 10);
    }
    
    score += breakScore;

    // Geofence compliance (20% of score)
    const complianceScore = Math.max(0, 20 - (geofenceViolations * 5));
    score += complianceScore;

    // GPS accuracy and reliability (10% of score)
    let accuracyScore = 10;
    if (gpsAccuracyAverage > 100) {
        accuracyScore = Math.max(0, 10 - (gpsAccuracyAverage - 100) / 20);
    } else if (gpsAccuracyAverage <= 20) {
        accuracyScore = 10;
    } else {
        accuracyScore = 10 - (gpsAccuracyAverage - 20) / 10;
    }
    score += accuracyScore;

    // Activity level (10% of score)
    let activityScore = 10;
    if (locationPoints > 0) {
        const averageMovement = movementDistance / locationPoints;
        if (averageMovement > 10 && averageMovement < 1000) { // Reasonable movement
            activityScore = 10;
        } else if (averageMovement <= 10) { // Too stationary
            activityScore = 5;
        } else { // Too much movement (possible GPS drift)
            activityScore = Math.max(2, 10 - (averageMovement - 1000) / 500);
        }
    }
    score += activityScore;

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
        score,
        breakdown: {
            workEfficiency: Math.round(efficiencyScore),
            breakCompliance: Math.round(breakScore),
            geofenceCompliance: Math.round(complianceScore),
            gpsAccuracy: Math.round(accuracyScore),
            activityLevel: Math.round(activityScore)
        },
        recommendations: generateRecommendations(score, sessionData)
    };
}

function generateRecommendations(score, sessionData) {
    const recommendations = [];
    
    if (score < 60) {
        recommendations.push('Consider reviewing work patterns and break frequency');
    }
    
    if (sessionData.geofenceViolations > 2) {
        recommendations.push('Reduce time spent outside designated work areas');
    }
    
    if (sessionData.gpsAccuracyAverage > 100) {
        recommendations.push('Improve GPS signal by working in areas with better satellite reception');
    }
    
    const workEfficiency = sessionData.workDuration / sessionData.totalDuration;
    if (workEfficiency < 0.7) {
        recommendations.push('Optimize work time by reducing non-productive activities');
    }
    
    if (sessionData.breakDuration / sessionData.totalDuration > 0.25) {
        recommendations.push('Consider taking more frequent shorter breaks instead of long breaks');
    }
    
    return recommendations;
}


function validateTimesheetData(timesheetData, sessionsData) {
    if (!timesheetData || !sessionsData) {
        throw new Error('Timesheet data and sessions data are required');
    }

    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
    };

    const {
        total_hours,
        regular_hours,
        overtime_hours,
        break_hours,
        period_start,
        period_end
    } = timesheetData;

    // Basic math validation
    const calculatedTotal = regular_hours + overtime_hours;
    if (Math.abs(total_hours - calculatedTotal) > 0.1) {
        validation.errors.push(`Total hours (${total_hours}) doesn't match regular + overtime (${calculatedTotal})`);
        validation.isValid = false;
    }

    // Validate against session data
    let sessionTotalMinutes = 0;
    let sessionWorkMinutes = 0;
    let sessionBreakMinutes = 0;
    let geofenceViolations = 0;
    let unverifiedSessions = 0;

    sessionsData.forEach(session => {
        sessionTotalMinutes += session.total_duration || 0;
        sessionWorkMinutes += session.work_duration || 0;
        sessionBreakMinutes += session.break_duration || 0;
        geofenceViolations += session.geofence_violations || 0;
        
        if (session.verification_status === 'pending') {
            unverifiedSessions++;
        } else if (session.verification_status === 'rejected') {
            validation.warnings.push(`Session ${session.id} was rejected and may need review`);
        }
    });

    const sessionTotalHours = sessionTotalMinutes / 60;
    const sessionWorkHours = sessionWorkMinutes / 60;
    const sessionBreakHours = sessionBreakMinutes / 60;

    // Compare timesheet vs session totals
    if (Math.abs(total_hours - sessionTotalHours) > 0.5) {
        validation.warnings.push(`Timesheet total hours (${total_hours.toFixed(1)}) differs significantly from session total (${sessionTotalHours.toFixed(1)})`);
    }

    if (Math.abs(break_hours - sessionBreakHours) > 0.3) {
        validation.warnings.push(`Break hours mismatch: timesheet (${break_hours.toFixed(1)}) vs sessions (${sessionBreakHours.toFixed(1)})`);
    }

    // Overtime validation (assuming 8 hours per day is regular)
    const periodDays = (new Date(period_end) - new Date(period_start)) / (1000 * 60 * 60 * 24) + 1;
    const expectedRegularHours = Math.min(periodDays * 8, regular_hours + overtime_hours);
    
    if (overtime_hours > 0 && regular_hours < expectedRegularHours) {
        validation.warnings.push('Overtime logged but regular hours are below expected threshold');
    }

    // Geofence violations check
    if (geofenceViolations > 0) {
        validation.warnings.push(`${geofenceViolations} geofence violations detected in sessions`);
    }

    // Unverified sessions check
    if (unverifiedSessions > 0) {
        validation.warnings.push(`${unverifiedSessions} sessions are still pending verification`);
    }

    // Reasonable hours check
    const averageHoursPerDay = total_hours / periodDays;
    if (averageHoursPerDay > 12) {
        validation.warnings.push(`High average daily hours (${averageHoursPerDay.toFixed(1)}). Please verify accuracy.`);
    } else if (averageHoursPerDay < 4 && total_hours > 0) {
        validation.warnings.push(`Low average daily hours (${averageHoursPerDay.toFixed(1)}). Some work sessions may be missing.`);
    }

    // Break time validation
    const breakRatio = break_hours / total_hours;
    if (breakRatio > 0.3) {
        validation.warnings.push(`High break time ratio (${(breakRatio * 100).toFixed(1)}%). Industry standard is 10-20%.`);
    } else if (breakRatio < 0.05 && total_hours > 4) {
        validation.suggestions.push('Consider taking regular breaks for better productivity and health.');
    }

    // GPS accuracy assessment
    const avgAccuracy = sessionsData.reduce((sum, session) => {
        // This would come from GPS location data analysis
        return sum + (session.avg_gps_accuracy || 50);
    }, 0) / sessionsData.length;

    if (avgAccuracy > 100) {
        validation.suggestions.push('GPS accuracy was below optimal levels. Consider working in areas with better satellite reception.');
    }

    return validation;
}

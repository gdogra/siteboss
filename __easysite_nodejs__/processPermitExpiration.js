
function processPermitExpiration() {
  // Process permit expirations and generate renewal notices
  const today = new Date();
  const warningPeriods = [30, 14, 7, 1]; // Days before expiration to send warnings

  const expirationResults = {
    processed: 0,
    expired: [],
    expiringSoon: [],
    renewalNotices: []
  };

  // This would normally query the database for permits
  // For demo purposes, we'll simulate the logic

  // Check for permits expiring in warning periods
  warningPeriods.forEach((days) => {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + days);

    // Simulate finding permits expiring on this date
    // In real implementation, this would be a database query
    const expiringPermits = []; // await queryPermitsExpiringOnDate(checkDate)

    expiringPermits.forEach((permit) => {
      const daysUntilExpiration = Math.ceil((new Date(permit.expires_at) - today) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration <= 0) {
        // Permit has expired
        expirationResults.expired.push({
          permitId: permit.id,
          applicationNumber: permit.application_number,
          expiredDate: permit.expires_at,
          daysExpired: Math.abs(daysUntilExpiration)
        });
      } else if (daysUntilExpiration <= 30) {
        // Permit expiring soon
        expirationResults.expiringSoon.push({
          permitId: permit.id,
          applicationNumber: permit.application_number,
          expirationDate: permit.expires_at,
          daysUntilExpiration
        });

        // Generate renewal notice
        const renewalNotice = generateRenewalNotice(permit, daysUntilExpiration);
        expirationResults.renewalNotices.push(renewalNotice);
      }
    });
  });

  expirationResults.processed = expirationResults.expired.length + expirationResults.expiringSoon.length;

  return expirationResults;
}

function generateRenewalNotice(permit, daysUntilExpiration) {
  const urgencyLevel = daysUntilExpiration <= 7 ? 'urgent' :
  daysUntilExpiration <= 14 ? 'high' : 'medium';

  const renewalFee = calculateRenewalFee(permit.permit_type_id);

  return {
    permitId: permit.id,
    applicationNumber: permit.application_number,
    applicantEmail: permit.applicant_email,
    expirationDate: permit.expires_at,
    daysUntilExpiration,
    urgencyLevel,
    renewalFee,
    renewalDeadline: new Date(permit.expires_at).toISOString(),
    message: generateRenewalMessage(permit, daysUntilExpiration),
    actionRequired: daysUntilExpiration <= 7 ? 'immediate' : 'prompt'
  };
}

function calculateRenewalFee(permitTypeId) {
  // Renewal fees are typically 50% of original fee
  const renewalRates = {
    1: 7500, // Residential: $75
    2: 12500, // Commercial: $125
    3: 3750, // Electrical: $37.50
    4: 2500, // Plumbing: $25
    5: 5000, // HVAC: $50
    6: 10000 // Demolition: $100
  };

  return renewalRates[permitTypeId] || 5000; // Default $50
}

function generateRenewalMessage(permit, daysUntilExpiration) {
  if (daysUntilExpiration <= 1) {
    return `URGENT: Your permit ${permit.application_number} expires ${daysUntilExpiration === 0 ? 'today' : 'tomorrow'}. Immediate action required to avoid work stoppage.`;
  } else if (daysUntilExpiration <= 7) {
    return `Your permit ${permit.application_number} expires in ${daysUntilExpiration} days. Please submit renewal application immediately.`;
  } else if (daysUntilExpiration <= 14) {
    return `Your permit ${permit.application_number} expires in ${daysUntilExpiration} days. Consider submitting renewal application soon.`;
  } else {
    return `Your permit ${permit.application_number} expires in ${daysUntilExpiration} days. You may want to start planning for renewal.`;
  }
}
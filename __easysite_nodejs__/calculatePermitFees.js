
function calculatePermitFees(permitTypeId, estimatedValue, additionalServices = []) {
  // Base fee calculation logic
  let totalFee = 0;
  let breakdown = [];

  // Standard permit type fees (would normally fetch from database)
  const permitTypeFees = {
    1: { base: 15000, name: "Residential Building Permit", valueBased: true, rate: 0.005 }, // $150 base + 0.5% of value
    2: { base: 25000, name: "Commercial Building Permit", valueBased: true, rate: 0.008 }, // $250 base + 0.8% of value
    3: { base: 7500, name: "Electrical Permit", valueBased: false }, // $75 flat
    4: { base: 5000, name: "Plumbing Permit", valueBased: false }, // $50 flat
    5: { base: 10000, name: "HVAC Permit", valueBased: false }, // $100 flat
    6: { base: 20000, name: "Demolition Permit", valueBased: true, rate: 0.003 } // $200 base + 0.3% of value
  };

  const permitType = permitTypeFees[permitTypeId];
  if (!permitType) {
    throw new Error("Invalid permit type ID");
  }

  // Base permit fee
  let baseFee = permitType.base;
  breakdown.push({
    type: "Base Fee",
    description: permitType.name,
    amount: baseFee
  });
  totalFee += baseFee;

  // Value-based additional fee
  if (permitType.valueBased && estimatedValue > 0) {
    const valueBasedFee = Math.round(estimatedValue * permitType.rate);
    breakdown.push({
      type: "Value-Based Fee",
      description: `${(permitType.rate * 100).toFixed(1)}% of estimated value ($${(estimatedValue / 100).toLocaleString()})`,
      amount: valueBasedFee
    });
    totalFee += valueBasedFee;
  }

  // Additional services
  const serviceRates = {
    "expedited_processing": { amount: 10000, description: "Expedited Processing (5 business days)" },
    "after_hours_inspection": { amount: 15000, description: "After Hours Inspection" },
    "weekend_inspection": { amount: 20000, description: "Weekend Inspection" },
    "plan_review": { amount: 7500, description: "Additional Plan Review" },
    "reinspection": { amount: 5000, description: "Reinspection Fee" }
  };

  additionalServices.forEach((service) => {
    if (serviceRates[service]) {
      breakdown.push({
        type: "Additional Service",
        description: serviceRates[service].description,
        amount: serviceRates[service].amount
      });
      totalFee += serviceRates[service].amount;
    }
  });

  return {
    totalFee,
    breakdown,
    permitType: permitType.name,
    estimatedValue: estimatedValue || 0
  };
}
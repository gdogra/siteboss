
function scheduleInspection(permitApplicationId, inspectionType, inspectorId, preferredDate, timeSlot = 'morning') {
  // Validate inputs
  if (!permitApplicationId || !inspectionType || !inspectorId) {
    throw new Error("Missing required parameters: permitApplicationId, inspectionType, inspectorId");
  }

  // Parse preferred date
  const requestedDate = new Date(preferredDate);
  const today = new Date();

  // Ensure inspection is not scheduled for past dates
  if (requestedDate < today) {
    throw new Error("Cannot schedule inspection for past dates");
  }

  // Check if it's a weekend (assuming inspections not allowed on weekends by default)
  const dayOfWeek = requestedDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {// Sunday = 0, Saturday = 6
    // Move to next Monday
    const daysToAdd = dayOfWeek === 0 ? 1 : 2;
    requestedDate.setDate(requestedDate.getDate() + daysToAdd);
  }

  // Set time based on time slot
  const timeSlots = {
    'morning': { start: 8, end: 12 },
    'afternoon': { start: 13, end: 17 },
    'early_morning': { start: 7, end: 9 },
    'late_afternoon': { start: 15, end: 17 }
  };

  const slot = timeSlots[timeSlot] || timeSlots['morning'];

  // Set scheduled time (start of time slot)
  requestedDate.setHours(slot.start, 0, 0, 0);

  // Generate inspection data
  const inspectionData = {
    permit_application_id: permitApplicationId,
    inspection_type: inspectionType,
    inspector_user_id: inspectorId,
    scheduled_at: requestedDate.toISOString(),
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Calculate estimated duration based on inspection type
  const inspectionDurations = {
    'foundation': 120, // 2 hours
    'framing': 180, // 3 hours
    'electrical': 90, // 1.5 hours
    'plumbing': 90, // 1.5 hours
    'hvac': 90, // 1.5 hours
    'insulation': 60, // 1 hour
    'drywall': 60, // 1 hour
    'final': 240, // 4 hours
    'safety': 90, // 1.5 hours
    'code_compliance': 120 // 2 hours
  };

  const estimatedDuration = inspectionDurations[inspectionType.toLowerCase()] || 90;

  return {
    inspectionData,
    scheduledDateTime: requestedDate.toISOString(),
    timeSlot: `${slot.start}:00 - ${slot.end}:00`,
    estimatedDuration,
    dayOfWeek: requestedDate.toLocaleDateString('en-US', { weekday: 'long' }),
    confirmation: `Inspection scheduled for ${requestedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} at ${requestedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`
  };
}

async function processWebformLead(formData, signature) {
  // Verify signature if provided (basic implementation)
  // In production, implement proper webhook signature verification

  const leadData = {
    contact_name: formData.name || '',
    contact_email: formData.email || '',
    contact_phone: formData.phone || '',
    company: formData.company || '',
    address: formData.address || '',
    project_type: formData.projectType || '',
    project_description: formData.description || '',
    budget_min: parseFloat(formData.budgetMin) || 0,
    budget_max: parseFloat(formData.budgetMax) || 0,
    lead_source: formData.source || 'website',
    status: 'NEW',
    owner_id: 0, // Will be assigned later
    score: 0, // Will be calculated
    notes: formData.notes || '',
    next_action_at: calculateNextActionAt('NEW'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Calculate lead score
  const calculateLeadScore = require('./calculateLeadScore');
  leadData.score = calculateLeadScore(leadData);

  // Create the lead
  const leadResponse = await fetch(`${process.env.EASYSITE_API_URL}/api/table/33726`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(leadData)
  });

  if (!leadResponse.ok) {
    throw new Error('Failed to create lead');
  }

  const lead = await leadResponse.json();

  // Create initial activity log
  const activityData = {
    lead_id: lead.id,
    user_id: 0,
    activity_type: 'NOTE',
    title: 'Lead Created',
    description: `New lead created from ${formData.source || 'website'} form`,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  await fetch(`${process.env.EASYSITE_API_URL}/api/table/33727`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(activityData)
  });

  return {
    leadId: lead.id,
    status: 'success',
    message: 'Lead created successfully'
  };
}

function calculateNextActionAt(status) {
  const now = new Date();
  const slaHours = {
    'NEW': 24,
    'QUALIFYING': 24,
    'CONTACTED': 72,
    'ESTIMATE_SENT': 72,
    'NEGOTIATING': 72,
    'WON': 0,
    'LOST': 0
  };

  const hours = slaHours[status] || 24;
  if (hours === 0) return null;

  const nextAction = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return nextAction.toISOString();
}
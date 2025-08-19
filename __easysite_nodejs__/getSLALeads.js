
// Function to get leads that need SLA attention
async function getSLALeads() {
  const now = new Date();
  const warningThreshold = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now

  try {
    // Fetch all active leads
    const response = await fetch(`${process.env.EASYSITE_API_URL}/api/table/33726/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'next_action_at',
        IsAsc: true,
        Filters: [
        { name: 'status', op: 'NotEqual', value: 'WON' },
        { name: 'status', op: 'NotEqual', value: 'LOST' }]

      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }

    const data = await response.json();
    const leads = data.List || [];

    // Categorize leads by SLA status
    const slaLeads = {
      overdue: [],
      dueToday: [],
      dueSoon: []
    };

    leads.forEach((lead) => {
      if (!lead.next_action_at) return;

      const nextAction = new Date(lead.next_action_at);
      const hoursUntilDue = (nextAction.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilDue < 0) {
        slaLeads.overdue.push(lead);
      } else if (hoursUntilDue < 6) {
        slaLeads.dueToday.push(lead);
      } else if (hoursUntilDue < 24) {
        slaLeads.dueSoon.push(lead);
      }
    });

    return {
      summary: {
        overdue: slaLeads.overdue.length,
        dueToday: slaLeads.dueToday.length,
        dueSoon: slaLeads.dueSoon.length,
        total: leads.length
      },
      leads: slaLeads
    };

  } catch (error) {
    throw new Error(`Failed to get SLA leads: ${error.message}`);
  }
}

async function convertLeadToProject(leadId, userId) {
    // Get the lead details
    const leadResponse = await fetch(`${process.env.EASYSITE_API_URL}/api/table/33726/${leadId}`, {
        headers: { 'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}` }
    });
    
    if (!leadResponse.ok) {
        throw new Error('Lead not found');
    }
    
    const lead = await leadResponse.json();
    
    // Create project from lead data
    const projectData = {
        name: `${lead.contact_name} - ${lead.project_type}`,
        description: lead.project_description || `Project converted from lead: ${lead.contact_name}`,
        status: 'Planning',
        client_name: lead.contact_name,
        client_email: lead.contact_email,
        client_phone: lead.contact_phone,
        client_company: lead.company,
        address: lead.address,
        budget_estimated: lead.budget_max || lead.budget_min || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Create the project (assuming projects table exists with ID 32232)
    const projectResponse = await fetch(`${process.env.EASYSITE_API_URL}/api/table/32232`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
    });
    
    if (!projectResponse.ok) {
        throw new Error('Failed to create project');
    }
    
    const project = await projectResponse.json();
    
    // Update lead status to WON and set converted_project_id
    const leadUpdateData = {
        ID: leadId,
        status: 'WON',
        converted_project_id: project.id,
        updated_at: new Date().toISOString()
    };
    
    const leadUpdateResponse = await fetch(`${process.env.EASYSITE_API_URL}/api/table/33726`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadUpdateData)
    });
    
    if (!leadUpdateResponse.ok) {
        throw new Error('Failed to update lead status');
    }
    
    // Log the conversion activity
    const activityData = {
        lead_id: leadId,
        user_id: userId,
        activity_type: 'STATUS_CHANGE',
        title: 'Lead Converted to Project',
        description: `Lead successfully converted to project: ${project.name}`,
        old_value: lead.status,
        new_value: 'WON',
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
        projectId: project.id,
        projectName: project.name,
        leadId: leadId
    };
}

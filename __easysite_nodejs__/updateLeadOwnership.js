
// Function to assign leads based on round-robin or other logic
async function updateLeadOwnership(leadId, newOwnerId, currentUserId) {
    try {
        // Verify the current user has permission to reassign
        // For now, assume Admins and Sales managers can reassign
        
        // Get the lead first
        const leadResponse = await fetch(`${process.env.EASYSITE_API_URL}/api/table/33726/${leadId}`, {
            headers: { 'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}` }
        });
        
        if (!leadResponse.ok) {
            throw new Error('Lead not found');
        }
        
        const lead = await leadResponse.json();
        const oldOwnerId = lead.owner_id;
        
        // Update lead ownership
        const updateData = {
            ID: leadId,
            owner_id: newOwnerId,
            updated_at: new Date().toISOString()
        };
        
        const updateResponse = await fetch(`${process.env.EASYSITE_API_URL}/api/table/33726`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.EASYSITE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update lead ownership');
        }
        
        // Log the ownership change
        const activityData = {
            lead_id: leadId,
            user_id: currentUserId,
            activity_type: 'STATUS_CHANGE',
            title: 'Lead Ownership Changed',
            description: `Lead ownership transferred to new owner`,
            old_value: oldOwnerId.toString(),
            new_value: newOwnerId.toString(),
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
            success: true,
            leadId: leadId,
            newOwnerId: newOwnerId,
            oldOwnerId: oldOwnerId
        };
        
    } catch (error) {
        throw new Error(`Failed to update lead ownership: ${error.message}`);
    }
}

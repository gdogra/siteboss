function sendProposalEmail(proposalId, emailType, recipientEmail, customData = {}) {
    // This function sends various types of proposal-related emails
    
    if (!proposalId || !emailType || !recipientEmail) {
        throw new Error('Proposal ID, email type, and recipient email are required');
    }

    const emailTypes = [
        'proposal_sent',
        'proposal_viewed', 
        'proposal_signed',
        'proposal_rejected',
        'reminder',
        'follow_up',
        'approval_request',
        'approval_granted',
        'approval_denied'
    ];

    if (!emailTypes.includes(emailType)) {
        throw new Error(`Invalid email type. Must be one of: ${emailTypes.join(', ')}`);
    }

    // Generate email content based on type
    let subject, htmlContent, textContent;
    const proposalUrl = `${customData.baseUrl || 'https://yourcompany.com'}/proposal/${proposalId}/view`;
    const companyName = customData.companyName || 'Your Company';
    const proposalNumber = customData.proposalNumber || `PROP-${proposalId}`;
    const clientName = customData.clientName || 'Valued Client';

    switch (emailType) {
        case 'proposal_sent':
            subject = `New Proposal: ${proposalNumber}`;
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Proposal Ready for Review</h2>
                    <p>Dear ${clientName},</p>
                    <p>We have prepared a proposal for your review. Please click the link below to view the details:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${proposalUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Proposal</a>
                    </div>
                    <p><strong>Proposal Number:</strong> ${proposalNumber}</p>
                    <p><strong>Total Amount:</strong> ${customData.totalAmount || 'See proposal for details'}</p>
                    <p><strong>Valid Until:</strong> ${customData.validUntil ? new Date(customData.validUntil).toLocaleDateString() : 'See proposal for details'}</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Thank you for your business!</p>
                    <p>Best regards,<br>${companyName}</p>
                </div>
            `;
            textContent = `
New Proposal Ready for Review

Dear ${clientName},

We have prepared a proposal for your review. Please visit the following link to view the details:
${proposalUrl}

Proposal Number: ${proposalNumber}
Total Amount: ${customData.totalAmount || 'See proposal for details'}
Valid Until: ${customData.validUntil ? new Date(customData.validUntil).toLocaleDateString() : 'See proposal for details'}

If you have any questions, please don't hesitate to contact us.

Thank you for your business!

Best regards,
${companyName}
            `;
            break;

        case 'proposal_signed':
            subject = `Proposal Signed - ${proposalNumber}`;
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Proposal Signed Successfully!</h2>
                    <p>Great news! The proposal ${proposalNumber} has been signed by ${clientName}.</p>
                    <p><strong>Signed At:</strong> ${customData.signedAt ? new Date(customData.signedAt).toLocaleString() : new Date().toLocaleString()}</p>
                    <p><strong>Verification Code:</strong> ${customData.verificationCode || 'N/A'}</p>
                    ${customData.gpsLocation ? `<p><strong>Location:</strong> ${customData.gpsLocation}</p>` : ''}
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${proposalUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Signed Proposal</a>
                    </div>
                    <p>Next steps will be communicated shortly.</p>
                    <p>Thank you for your business!</p>
                    <p>Best regards,<br>${companyName}</p>
                </div>
            `;
            break;

        case 'reminder':
            subject = `Reminder: Proposal ${proposalNumber} Awaiting Review`;
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ffc107;">Friendly Reminder</h2>
                    <p>Dear ${clientName},</p>
                    <p>We wanted to follow up on the proposal we sent you recently. We haven't heard back from you yet and wanted to ensure you received it.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${proposalUrl}" style="background: #ffc107; color: black; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Proposal</a>
                    </div>
                    <p><strong>Proposal Number:</strong> ${proposalNumber}</p>
                    <p><strong>Valid Until:</strong> ${customData.validUntil ? new Date(customData.validUntil).toLocaleDateString() : 'See proposal for details'}</p>
                    <p>If you have any questions or need clarification on any aspect of the proposal, please don't hesitate to reach out.</p>
                    <p>Best regards,<br>${companyName}</p>
                </div>
            `;
            break;

        case 'approval_request':
            subject = `Approval Required: Proposal ${proposalNumber}`;
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc3545;">Approval Required</h2>
                    <p>A proposal requires your approval before it can be sent to the client.</p>
                    <p><strong>Proposal Number:</strong> ${proposalNumber}</p>
                    <p><strong>Client:</strong> ${clientName}</p>
                    <p><strong>Total Amount:</strong> ${customData.totalAmount || 'See proposal for details'}</p>
                    <p><strong>Reason:</strong> ${customData.approvalReason || 'Standard approval workflow'}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${proposalUrl}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Review & Approve</a>
                    </div>
                    <p>Please review the proposal and approve or reject it as appropriate.</p>
                    <p>Best regards,<br>Proposal Management System</p>
                </div>
            `;
            break;

        default:
            subject = `Proposal Update - ${proposalNumber}`;
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Proposal Update</h2>
                    <p>There has been an update to proposal ${proposalNumber}.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${proposalUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Proposal</a>
                    </div>
                    <p>Best regards,<br>${companyName}</p>
                </div>
            `;
    }

    // Return email data (in production, you would send this via your email service)
    const emailData = {
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        metadata: {
            proposalId: proposalId,
            emailType: emailType,
            sentAt: new Date().toISOString(),
            customData: customData
        }
    };

    // Log the email for debugging
    console.log('Email prepared:', {
        type: emailType,
        to: recipientEmail,
        subject: subject,
        proposalId: proposalId
    });

    return emailData;
}
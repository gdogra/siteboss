
function recordLedgerEntry(transactionId, entries) {
    // This function records double-entry bookkeeping entries
    
    if (!transactionId) {
        throw new Error('Transaction ID is required');
    }
    
    if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error('At least one ledger entry is required');
    }
    
    // Validate double-entry bookkeeping (debits must equal credits)
    let totalDebits = 0;
    let totalCredits = 0;
    
    for (const entry of entries) {
        if (!entry.account_type || !entry.entry_type || !entry.amount) {
            throw new Error('Invalid ledger entry format');
        }
        
        if (entry.entry_type === 'debit') {
            totalDebits += entry.amount;
        } else if (entry.entry_type === 'credit') {
            totalCredits += entry.amount;
        } else {
            throw new Error('Entry type must be debit or credit');
        }
    }
    
    if (totalDebits !== totalCredits) {
        throw new Error('Debits must equal credits in double-entry bookkeeping');
    }
    
    // Format entries for database insertion
    const formattedEntries = entries.map(entry => ({
        transaction_id: transactionId,
        account_type: entry.account_type,
        account_id: entry.account_id || '',
        entry_type: entry.entry_type,
        amount: entry.amount,
        description: entry.description || '',
        created_at: new Date().toISOString()
    }));
    
    return {
        success: true,
        entries: formattedEntries,
        total_debits: totalDebits,
        total_credits: totalCredits
    };
}

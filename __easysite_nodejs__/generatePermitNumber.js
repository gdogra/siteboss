
function generatePermitNumber(permitTypeCode, applicationDate, sequenceNumber = null) {
  // Generate unique permit number based on type, date, and sequence
  const date = new Date(applicationDate || Date.now());
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Use sequence number or generate from timestamp
  const sequence = sequenceNumber || String(Date.now()).slice(-4);

  // Format: [TYPE][YYMMDD][SEQUENCE]
  // Example: RBP240315001 (Residential Building Permit, March 15, 2024, sequence 001)
  const permitNumber = `${permitTypeCode}${year}${month}${day}${sequence}`;

  return {
    permitNumber,
    components: {
      typeCode: permitTypeCode,
      year,
      month,
      day,
      sequence
    },
    formatted: `${permitTypeCode}-${year}${month}${day}-${sequence}`
  };
}
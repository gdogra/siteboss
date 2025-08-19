function validateTenantDomain(domain, tenantId) {
  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

  if (!domainRegex.test(domain)) {
    throw new Error('Invalid domain format');
  }

  // Check for reserved domains
  const reservedDomains = [
  'siteboss.com',
  'www.siteboss.com',
  'api.siteboss.com',
  'admin.siteboss.com',
  'app.siteboss.com',
  'mail.siteboss.com'];


  if (reservedDomains.includes(domain.toLowerCase())) {
    throw new Error('This domain is reserved and cannot be used');
  }

  // Generate DNS configuration
  const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const dnsRecords = [
  {
    type: 'CNAME',
    name: domain,
    value: 'siteboss.app',
    ttl: 300
  },
  {
    type: 'TXT',
    name: `_siteboss-verification.${domain}`,
    value: verificationToken,
    ttl: 300
  }];


  return {
    domain: domain,
    tenantId: tenantId,
    verificationToken: verificationToken,
    dnsRecords: dnsRecords,
    status: 'pending_verification',
    instructions: {
      step1: 'Add the CNAME record to point your domain to siteboss.app',
      step2: 'Add the TXT record for domain verification',
      step3: 'Wait up to 24 hours for DNS propagation',
      step4: 'Click verify to complete the setup'
    },
    verifyUrl: `https://api.siteboss.com/verify-domain/${tenantId}/${verificationToken}`
  };
}
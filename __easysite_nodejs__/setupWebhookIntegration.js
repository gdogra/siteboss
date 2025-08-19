function setupWebhookIntegration(tenantId, webhookConfig) {
  const { url, events, secret, name, description, headers } = webhookConfig;

  // Validate webhook URL
  if (!url || !url.startsWith('https://')) {
    throw new Error('Webhook URL must be HTTPS');
  }

  // Validate events
  const supportedEvents = [
  'tenant.created',
  'tenant.updated',
  'tenant.suspended',
  'tenant.deleted',
  'subscription.created',
  'subscription.updated',
  'subscription.cancelled',
  'payment.succeeded',
  'payment.failed',
  'invoice.created',
  'invoice.paid',
  'user.created',
  'user.updated',
  'project.created',
  'project.completed',
  'document.uploaded',
  'timesheet.submitted',
  'lead.created',
  'lead.converted'];


  const invalidEvents = events.filter((event) => !supportedEvents.includes(event));
  if (invalidEvents.length > 0) {
    throw new Error(`Unsupported events: ${invalidEvents.join(', ')}`);
  }

  const currentTime = new Date().toISOString();
  const webhookId = 'wh_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Generate or use provided secret
  const webhookSecret = secret || 'whsec_' + Math.random().toString(36).substring(2, 30);

  const webhook = {
    id: webhookId,
    tenant_id: tenantId,
    name: name || 'Default Webhook',
    description: description || 'Auto-generated webhook endpoint',
    url: url,
    secret: webhookSecret,
    events: events,
    headers: headers || {},
    status: 'active',
    retry_policy: {
      max_retries: 3,
      retry_delays: [30, 300, 1800], // 30s, 5m, 30m
      backoff_strategy: 'exponential'
    },
    rate_limit: {
      requests_per_minute: 60,
      burst_limit: 10
    },
    created_at: currentTime,
    updated_at: currentTime,
    last_triggered_at: null,
    success_count: 0,
    failure_count: 0
  };

  // Generate test payload for verification
  const testPayload = {
    id: 'evt_test_' + Math.random().toString(36).substring(2, 15),
    type: 'webhook.test',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: webhookId,
        tenant_id: tenantId,
        message: 'This is a test webhook to verify your endpoint'
      }
    },
    tenant_id: tenantId
  };

  // Generate signature for test payload
  const crypto = require('crypto');
  const testSignature = crypto.
  createHmac('sha256', webhookSecret).
  update(JSON.stringify(testPayload)).
  digest('hex');

  // Integration instructions
  const instructions = {
    verification: {
      step1: 'Ensure your endpoint accepts POST requests',
      step2: 'Verify the webhook signature using HMAC SHA256',
      step3: 'Return HTTP 200 status for successful processing',
      step4: 'Handle retries gracefully (we retry failed webhooks)'
    },
    signature_verification: {
      header: 'X-SiteBoss-Signature',
      algorithm: 'sha256',
      example: `const signature = req.headers['x-siteboss-signature'];
const expectedSignature = crypto.createHmac('sha256', '${webhookSecret}').update(JSON.stringify(req.body)).digest('hex');
if (signature !== expectedSignature) throw new Error('Invalid signature');`
    },
    testing: {
      test_url: `https://api.siteboss.com/webhooks/${webhookId}/test`,
      test_payload: testPayload,
      expected_signature: `sha256=${testSignature}`
    }
  };

  // Security recommendations
  const security = {
    recommendations: [
    'Always verify webhook signatures',
    'Use HTTPS endpoints only',
    'Implement idempotency for duplicate events',
    'Log webhook events for debugging',
    'Rate limit webhook processing',
    'Validate payload structure'],

    rate_limiting: {
      per_minute: webhook.rate_limit.requests_per_minute,
      burst_limit: webhook.rate_limit.burst_limit,
      headers: {
        'X-RateLimit-Limit': webhook.rate_limit.requests_per_minute,
        'X-RateLimit-Remaining': 'Dynamic',
        'X-RateLimit-Reset': 'Dynamic'
      }
    }
  };

  return {
    webhook: webhook,
    secret: webhookSecret,
    supportedEvents: supportedEvents,
    instructions: instructions,
    security: security,
    testEndpoint: `https://api.siteboss.com/webhooks/${webhookId}/test`,
    message: `Webhook integration configured successfully. Test your endpoint at: https://api.siteboss.com/webhooks/${webhookId}/test`
  };
}
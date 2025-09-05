exports.handler = async () => {
  const started = process.env.DEPLOY_ID || 'manual';
  const version = process.env.COMMIT_REF || process.env.BUILD_ID || 'unknown';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      service: 'siteboss-frontend',
      status: 'ok',
      timestamp: new Date().toISOString(),
      deploy: started,
      version,
    }),
  };
};


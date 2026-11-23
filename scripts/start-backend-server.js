/**
 * CraveCart Production Standalone Backend Server Runner
 * Used by Docker container and CI/CD pipelines to start the REST API (/api/v1).
 */

const { createApiServer } = require('../apps/backend/src/server');

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const apiServer = createApiServer();

apiServer.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(`[CraveCart Backend] REST API live at http://${HOST}:${PORT}/api/v1`);
  console.log(`[CraveCart Backend] Health check: http://${HOST}:${PORT}/api/v1/health`);
  console.log(`[CraveCart Backend] Swagger / OpenAPI: http://${HOST}:${PORT}/api/v1/docs`);
  console.log('====================================================');
});

// Graceful container termination
const shutdown = () => {
  console.log('[CraveCart Backend] Received termination signal. Closing server...');
  apiServer.close(() => {
    console.log('[CraveCart Backend] Server closed successfully. Exiting process.');
    process.exit(0);
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('[CraveCart Backend] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


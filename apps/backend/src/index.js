/**
 * CraveCart Production Backend Entry Point
 * Starts HTTP API engine and real-time dispatcher on port 4000.
 */

const { createApiServer } = require('./server');
const config = require('./config');

const server = createApiServer();

server.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 CraveCart Unified Production Backend Running!`);
  console.log(`📡 Base URL: http://localhost:${config.port}`);
  console.log(`📚 OpenAPI / Swagger Docs: http://localhost:${config.port}/api/v1/docs`);
  console.log(`🏥 Health Check: http://localhost:${config.port}/api/v1/health`);
  console.log(`====================================================`);
});

module.exports = server;


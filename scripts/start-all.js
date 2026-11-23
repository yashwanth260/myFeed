const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('  🚀 Launching Feedo (CraveCart) Full Local Stack');
console.log('========================================================');
console.log(' • [API]  NestJS Enterprise API       -> http://localhost:4000');
console.log(' • [DOCS] Swagger API Documentation   -> http://localhost:4000/api/docs');
console.log(' • [CUST] Customer Web Portal         -> http://localhost:8081');
console.log(' • [REST] Restaurant Kitchen Portal   -> http://localhost:8082');
console.log(' • [DELV] Delivery Partner Portal     -> http://localhost:8083');
console.log(' • [ADMN] Admin Control Dashboard     -> http://localhost:8084');
console.log('========================================================\n');

// 1. Launch NestJS API
const apiProc = spawn(process.execPath, [path.join(__dirname, '../apps/api/dist/main.js')], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, PORT: '4000' },
  stdio: 'inherit'
});

// 2. Launch Web Dev Servers (8081, 8082, 8083, 8084)
const webProc = spawn(process.execPath, [path.join(__dirname, 'start-web-servers.js'), '--web-only'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, SKIP_LEGACY_API: 'true' },
  stdio: 'inherit'
});

const cleanup = () => {
  console.log('\n[Feedo] Shutting down all processes...');
  try { apiProc.kill('SIGINT'); } catch (e) {}
  try { webProc.kill('SIGINT'); } catch (e) {}
  setTimeout(() => process.exit(0), 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

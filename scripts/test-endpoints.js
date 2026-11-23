const http = require('http');

const urls = [
  'http://localhost:4000/api/v1/health',
  'http://localhost:4000/api/docs',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084'
];

async function check(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ url, status: res.statusCode });
      });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
  });
}

(async () => {
  for (const u of urls) {
    const res = await check(u);
    console.log(`[STATUS ${res.status}] ${res.url}`);
  }
})();

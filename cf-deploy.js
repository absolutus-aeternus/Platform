const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCOUNT_ID = 'f891a7b56743e4fb41751c507e3c1c3d';
const API_TOKEN = 'cfat_PFFY7eMgmCOgJP0dmf1QGsBioocHrWjKnloE267Raaafd6d1';

function makeRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function deploy() {
  console.log('Testing API token...');
  const test = await makeRequest('GET', '/client/v4/user/tokens/verify');
  console.log('Token verify:', JSON.stringify(test, null, 2));
  
  if (!test.success) {
    console.log('\nTrying with account endpoint...');
    const account = await makeRequest('GET', `/client/v4/accounts/${ACCOUNT_ID}`);
    console.log('Account:', JSON.stringify(account, null, 2));
  }
}

deploy().catch(console.error);

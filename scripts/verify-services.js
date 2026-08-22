/**
 * Service Verification Script - Sanitized Version
 * Tests connectivity to all external services without exposing credentials
 */

const https = require('https');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const results = [];

// Helper function to make HTTPS requests
function checkService(name, url, options = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    
    try {
      const req = https.request(url, {
        method: options.method || 'GET',
        timeout: 15000,
        headers: options.headers || {}
      }, (res) => {
        const duration = Date.now() - start;
        let status = 'FAILED';
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          status = 'CONNECTED';
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          status = 'API_REACHABLE';
        } else if (res.statusCode === 404) {
          status = 'DEPLOYED';
        }
        
        results.push({
          name,
          url,
          status,
          code: res.statusCode,
          duration
        });
        
        resolve({ name, status, code: res.statusCode, duration });
      });
      
      req.on('error', (err) => {
        const duration = Date.now() - start;
        results.push({
          name,
          url,
          status: 'FAILED',
          code: 0,
          duration,
          error: err.message
        });
        resolve({ name, status: 'FAILED', code: 0, duration, error: err.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        const duration = Date.now() - start;
        results.push({
          name,
          url,
          status: 'TIMEOUT',
          code: 0,
          duration
        });
        resolve({ name, status: 'TIMEOUT', code: 0, duration });
      });
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    } catch (err) {
      const duration = Date.now() - start;
      results.push({
        name,
        url,
        status: 'ERROR',
        code: 0,
        duration,
        error: err.message
      });
      resolve({ name, status: 'ERROR', code: 0, duration, error: err.message });
    }
  });
}

async function runVerification() {
  console.log(`${colors.cyan}`);
  console.log('='.repeat(70));
  console.log('  ALLIANCEHUB SERVICE VERIFICATION - SANITIZED');
  console.log('='.repeat(70));
  console.log(`${colors.reset}\n`);
  
  console.log(`${colors.blue}Starting service health checks...${colors.reset}\n`);
  
  // Load environment variables from .env file
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env');
  
  let envVars = {};
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value;
      }
    });
  }
  
  // Supabase
  await checkService(
    'Supabase API',
    'https://cfzmdvymqqnrzrytcrie.supabase.co/rest/v1/',
    {
      headers: {
        'apikey': envVars.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${envVars.SUPABASE_ANON_KEY || ''}`
      }
    }
  );
  
  // Upstash Redis
  await checkService(
    'Upstash Redis',
    'https://modest-gopher-184544.upstash.io/ping'
  );
  
  // Backblaze B2
  await checkService(
    'Backblaze B2',
    'https://s3.us-west-000.backblazeb2.com/alliancehub/'
  );
  
  // Resend
  await checkService(
    'Resend API',
    'https://api.resend.com/domains',
    {
      headers: {
        'Authorization': `Bearer ${envVars.RESEND_API_KEY || ''}`
      }
    }
  );
  
  // Brevo
  await checkService(
    'Brevo API',
    'https://api.brevo.com/v3/account',
    {
      headers: {
        'api-key': envVars.BREVO_API_KEY || ''
      }
    }
  );
  
  // Cloudflare
  await checkService(
    'Cloudflare API',
    'https://api.cloudflare.com/client/v4/user/tokens/verify',
    {
      headers: {
        'Authorization': `Bearer ${envVars.CLOUDFLARE_API_TOKEN || ''}`
      }
    }
  );
  
  // OneSignal
  await checkService(
    'OneSignal API',
    'https://onesignal.com/api/v1/apps',
    {
      headers: {
        'Authorization': `Basic ${envVars.ONESIGNAL_REST_API_KEY || ''}`
      }
    }
  );
  
  // GitHub
  await checkService(
    'GitHub API',
    'https://api.github.com/user',
    {
      headers: {
        'Authorization': `token ${envVars.GITHUB_TOKEN || ''}`
      }
    }
  );
  
  // Tawk.to
  await checkService(
    'Tawk.to Widget',
    'https://embed.tawk.to/6a89538ddf6d0434484b9847/1k0k6sod0'
  );
  
  // Cloudflare Worker
  await checkService(
    'Cloudflare Worker',
    'https://alliancehub-api.absolutus-aeternus.workers.dev/health'
  );
  
  // Print results
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}  VERIFICATION RESULTS${colors.reset}`);
  console.log('='.repeat(70) + '\n');
  
  console.log(`${colors.yellow}%-35s %-15s %-10s %s${colors.reset}`, 'SERVICE', 'STATUS', 'CODE', 'TIME');
  console.log('-'.repeat(70));
  
  let connected = 0;
  let failed = 0;
  
  results.forEach(result => {
    const color = result.status === 'CONNECTED' || result.status === 'API_REACHABLE' || result.status === 'DEPLOYED' 
      ? colors.green 
      : colors.red;
    
    if (result.status === 'CONNECTED' || result.status === 'API_REACHABLE' || result.status === 'DEPLOYED') {
      connected++;
    } else {
      failed++;
    }
    
    console.log(
      `${color}%-35s %-15s %-10d %dms${colors.reset}`,
      result.name,
      result.status,
      result.code,
      result.duration
    );
  });
  
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.blue}SUMMARY:${colors.reset}`);
  console.log(`  Total Services: ${results.length}`);
  console.log(`  ${colors.green}Connected/Reachable: ${connected}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log('='.repeat(70) + '\n');
  
  if (failed > 0) {
    console.log(`${colors.yellow}Note: Some services may require IP whitelisting or additional configuration.${colors.reset}`);
    console.log(`${colors.yellow}Check the error details above for specific issues.${colors.reset}\n`);
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runVerification();

# 🚀 Deployment Guide - AllianceHub Platform

## Automated Deployment to Cloudflare Pages

### Option 1: GitHub Integration (Recommended)

1. **Connect to Cloudflare Pages**
   - Go to https://pages.cloudflare.com
   - Click "Create a project" → "Connect to Git"
   - Select repository: `absolutus-aeternus/Platform`
   - Branch: `main` or your deployment branch

2. **Build Settings**
   - Framework preset: `Vite.js`
   - Build command: `npm run build`
   - Build output directory: `dist`

3. **Environment Variables (Set in Cloudflare Dashboard)**
   
   Navigate to: **Settings** → **Environment Variables** → **Production**
   
   Add the following variables:
   ```
   VITE_SUPABASE_URL = https://cfzmdvymqqnrzrytcrie.supabase.co
   VITE_SUPABASE_ANON_KEY = [Get from Supabase Dashboard]
   VITE_UPSTASH_REDIS_REST_URL = https://modest-gopher-184544.upstash.io
   VITE_UPSTASH_REDIS_REST_TOKEN = [Get from Upstash Dashboard]
   VITE_ONESIGNAL_APP_ID = [Get from OneSignal Dashboard]
   VITE_WORKER_URL = https://alliancehub-api.absolutus-aeternus.workers.dev
   VITE_CLARITY_PROJECT_ID = [Get from Microsoft Clarity]
   ```

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy

---

## Cloudflare Workers Deployment (API)

### Setup Commands

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy secrets (one-time setup)
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put UPSTASH_REDIS_REST_TOKEN
wrangler secret put RESEND_API_KEY
wrangler secret put BREVO_API_KEY

# Deploy worker
wrangler deploy --env production
```

### Worker URL
- Production: `https://alliancehub-api.absolutus-aeternus.workers.dev`

---

## Service Configuration Reference

### Supabase
- **URL**: https://cfzmdvymqqnrzrytcrie.supabase.co
- **Dashboard**: https://app.supabase.com/project/cfzmdvymqqnrzrytcrie
- Get your `anon key` from: Settings → API

### Upstash Redis
- **URL**: https://modest-gopher-184544.upstash.io
- **Dashboard**: https://console.upstash.io
- Get your token from: Data Details → Connect

### OneSignal
- Get App ID from: Settings → Keys & IDs

### Microsoft Clarity
- Get Project ID from: Project Settings

### Backblaze B2
- **Endpoint**: https://s3.us-west-000.backblazeb2.com
- **Bucket**: alliancehub
- Use AWS CLI compatible commands

### Email Services
- **Resend**: Transactional emails
- **Brevo**: SMTP relay (smtp-relay.brevo.com:587)

---

## CI/CD Pipeline

### Automatic Deployment Triggers
1. Push to `main` → Deploy to production
2. Push to `develop` → Deploy to staging
3. Pull requests → Preview deployment

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Required GitHub Secrets
Go to: Repository Settings → Secrets and variables → Actions

Add these secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_TOKEN`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## Security Best Practices

1. **Never commit secrets** - Use environment variables only
2. **Enable 2FA** on all service accounts
3. **Rotate API keys** every 90 days
4. **Use RLS** in Supabase for data security
5. **Enable CORS** restrictions in Workers
6. **Implement rate limiting** via Upstash Redis

---

## Monitoring

- **Cloudflare Analytics**: Performance & traffic
- **Microsoft Clarity**: Session recordings & heatmaps
- **Supabase Logs**: Database queries & auth events
- **Upstash Metrics**: Redis operations

---

## Troubleshooting

### Build Fails
1. Check Cloudflare Pages build logs
2. Verify Node.js version compatibility
3. Ensure all dependencies are installed

### Runtime Errors
1. Check environment variables are set correctly
2. Review Worker logs in Cloudflare Dashboard
3. Test locally with `wrangler dev`

### Secret Scanning Blocks
If GitHub blocks your push:
1. Remove any secrets from commits
2. Use `git reset --hard` to remove sensitive commits
3. Follow GitHub's unblock URL if needed
4. Use environment variables instead of hardcoded values

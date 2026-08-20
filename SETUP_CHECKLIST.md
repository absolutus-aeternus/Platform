# ✅ Setup Checklist - AllianceHub Platform

## 🎯 Quick Start (5 minutes)

### Step 1: Connect Cloudflare Pages
1. Go to https://pages.cloudflare.com
2. Click **Create a project** → **Connect to Git**
3. Select repository: `absolutus-aeternus/Platform`
4. Branch: `main`

### Step 2: Configure Build Settings
- **Framework preset**: Vite.js
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Step 3: Add Environment Variables
In Cloudflare Pages Dashboard → Settings → Environment Variables → Production:

| Variable | Value | Source |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | *(Your Supabase URL)* | Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | *(Your Anon Key)* | Supabase Dashboard |
| `VITE_UPSTASH_REDIS_REST_URL` | *(Your Upstash URL)* | Upstash Dashboard |
| `VITE_UPSTASH_REDIS_REST_TOKEN` | *(Your Upstash Token)* | Upstash Dashboard |
| `VITE_ONESIGNAL_APP_ID` | *(Your App ID)* | OneSignal Dashboard |
| `VITE_WORKER_URL` | *(Your Worker URL)* | Cloudflare Workers |
| `VITE_CLARITY_PROJECT_ID` | *(Your Project ID)* | Microsoft Clarity |

### Step 4: Deploy
Click **Save and Deploy** 🚀

---

## 🔧 GitHub Actions Setup (Optional - for CI/CD)

### Required Secrets
Go to: Repository Settings → Secrets and variables → Actions

Add these secrets:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `UPSTASH_REDIS_REST_URL` - Your Upstash REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Your Upstash token
- `ONESIGNAL_APP_ID` - Your OneSignal app ID
- `WORKER_URL` - Your Cloudflare Worker URL
- `CLARITY_PROJECT_ID` - Your Microsoft Clarity project ID
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

---

## 🗄️ Supabase Setup

1. Go to your Supabase project dashboard
2. Run SQL migrations (if any)
3. Enable Row Level Security (RLS) on all tables
4. Configure authentication providers
5. Set up storage buckets

---

## 📧 Email Services

### Resend (Transactional)
- Get API key from resend.com
- Configure domain for sending

### Brevo (SMTP)
- Host: smtp-relay.brevo.com
- Port: 587
- Get API key from Brevo dashboard

---

## 🔔 Push Notifications (OneSignal)

1. Create app at onesignal.com
2. Configure web push settings
3. Add App ID to environment variables

---

## 📊 Analytics (Microsoft Clarity)

1. Create project at clarity.microsoft.com
2. Get Project ID
3. Tracking code already integrated

---

## 💾 Backblaze B2 (File Storage)

Configure AWS CLI with your credentials for S3-compatible access.

---

## ⏰ Cron Jobs

Setup at cron-job.org:
- Point to your Worker API endpoint
- Use secure token for authentication

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads correctly on Cloudflare Pages URL
- [ ] Supabase connection works (test login/signup)
- [ ] Redis caching is functional
- [ ] Email sending works
- [ ] Push notifications are configured
- [ ] Analytics tracking is active
- [ ] File uploads work
- [ ] Mobile responsive design works
- [ ] All pages load without errors

---

## 🆘 Troubleshooting

### Build fails in Cloudflare
- Check build logs in Pages dashboard
- Verify Node.js version compatibility
- Ensure all dependencies are in package.json

### Runtime errors
- Check environment variables are set correctly
- Review browser console for errors
- Test locally with `npm run dev`

### Secret scanning blocks push
- Never commit API keys or tokens
- Use environment variables only
- Follow GitHub's unblock URL if needed

---

## 📞 Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **GitHub Actions**: https://docs.github.com/actions

---

**Version**: 1.0.0

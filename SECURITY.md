# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | ✅ Active support  |
| < 3.0   | ❌ End of life     |

## Reporting a Vulnerability

If you discover a security vulnerability in AllianceHub, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities.
2. Email security concerns to: **security@alliancehub.com**
3. Include the following in your report:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if available)

### Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 24 hours |
| Initial assessment | Within 72 hours |
| Patch development | Within 7 days (critical), 30 days (other) |
| Public disclosure | After patch is deployed |

## Security Measures

### Infrastructure Security

- **Cloudflare Pages** — Frontend hosting with global CDN and DDoS protection
- **Cloudflare Workers** — API backend running in isolated V8 sandbox
- **Supabase** — Database with Row Level Security (RLS) policies
- **Wrangler Secrets** — All sensitive keys stored via `wrangler secret`, never in code

### Transport Security

- **HTTPS enforced** — All traffic served over TLS
- **HSTS** — `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- **TLS 1.2+** minimum on all Cloudflare endpoints

### HTTP Security Headers

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Strict CSP (see `public/_headers`) |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Embedder-Policy` | `credentialless` |

### Content Security Policy (CSP)

Our CSP follows the principle of least privilege:

- `default-src 'self'` — Only allow same-origin by default
- `script-src` — Restricted to self + approved CDNs (cdnjs, OneSignal, Clarity)
- `style-src` — Self + Google Fonts + inline styles (required for Vue)
- `connect-src` — Only known API endpoints (Supabase, Algolia, Upstash, Worker)
- `img-src` — Self + data URIs + HTTPS images + blob URLs
- `frame-ancestors 'none'` — Prevents clickjacking completely

### Authentication & Authorization

- **Supabase Auth** — JWT-based authentication
- **Row Level Security (RLS)** — Database-level access control
- **Role-based access** — Buyer, Seller, Admin, Superadmin roles
- **Session management** — Automatic token refresh, secure cookie handling

### Data Protection

- **No secrets in code** — All API keys via environment variables / Wrangler Secrets
- **Input validation** — Server-side validation on all API endpoints
- **SQL injection prevention** — Parameterized queries via Supabase client
- **XSS prevention** — CSP headers + Vue's built-in template escaping

### CI/CD Security

- **Automated linting** — ESLint runs before every build
- **Dependency auditing** — Weekly automated `npm audit` via GitHub Actions
- **Build validation** — Output size checks to detect anomalies
- **Branch protection** — PR reviews required for `main` branch

### Service Worker Security

- Cache versioning with automatic cleanup of stale caches
- Only cache GET requests
- Network-first strategy for API calls (no sensitive data cached)
- Offline fallback serves static shell only

## Secrets Inventory

The following secrets MUST be configured in GitHub Actions and Wrangler:

| Secret | Purpose | Where Used |
|--------|---------|------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API access | GitHub Actions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account | GitHub Actions |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | Build env |
| `VITE_ONESIGNAL_APP_ID` | OneSignal push notifications | Build env |
| `VITE_CLARITY_PROJECT_ID` | Microsoft Clarity analytics | Build env |
| `VITE_ALGOLIA_SEARCH_KEY` | Algolia search-only key | Wrangler Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin access | Wrangler Secrets |
| `ALGOLIA_WRITE_KEY` | Algolia admin key | Wrangler Secrets |
| `B2_KEY_ID` / `B2_APPLICATION_KEY` | Backblaze B2 storage | Wrangler Secrets |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Redis rate limiting | Wrangler Secrets |
| `BREVO_API_KEY` / `BREVO_SMTP_KEY` | Transactional email | Wrangler Secrets |

## Incident Response

1. **Detect** — Monitor Cloudflare analytics, error rates, and access logs
2. **Contain** — Revoke compromised secrets immediately via `wrangler secret put`
3. **Eradicate** — Patch vulnerability, rotate all related credentials
4. **Recover** — Deploy fix, verify system integrity
5. **Review** — Post-incident analysis and update this security policy

## Compliance

- All data processing follows applicable privacy regulations
- User data is stored in Supabase (PostgreSQL) with encryption at rest
- No payment card data is stored on our infrastructure
- Third-party services (Supabase, Cloudflare, Algolia) are vetted for compliance

## Security Checklist for Contributors

- [ ] No hardcoded secrets, API keys, or tokens in code
- [ ] All user inputs validated server-side
- [ ] RLS policies cover new database tables
- [ ] New external domains added to CSP in `public/_headers`
- [ ] No `eval()` or `new Function()` usage
- [ ] Dependencies checked for known vulnerabilities
- [ ] Sensitive routes protected by auth middleware

---

Last updated: 2026-08-18
Maintained by: AllianceHub DevOps Team

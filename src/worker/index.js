export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ─── Helper: Service role headers (bypasses RLS) ───
    function getServiceHeaders(extra = {}) {
      return { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY, ...extra };
    }
    // ─── Helpers: Validation ───
    function validateUUID(str) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    }
    function validatePositiveInt(n) {
      const num = Number(n);
      return Number.isInteger(num) && num > 0 && num <= 999999;
    }

    // ─── Helper: Standardized Error Handler ───
    function handleError(e, status = 500) {
      console.error(`[Worker Error] ${path}:`, e.message || e);
      return json({ error: 'Internal server error', message: e.message }, { status, ...corsHeaders });
    }

    // ─── Helper: CSRF Verification ───
    function verifyCSRFToken(req) {
      // Safe methods don't need CSRF
      const m = req.method;
      if (['GET', 'HEAD', 'OPTIONS'].includes(m)) return true;
      const cookie = req.headers.get('Cookie') || '';
      const token = cookie.split(';').find(c => c.trim().startsWith('csrf='))?.split('=')[1];
      const header = req.headers.get('X-CSRF-Token');
      return token && header && token === header;
    }

    const allowedOrigins = (env.ALLOWED_ORIGINS || 'https://alliancehub.dpdns.org,https://alliancehub.pages.dev,http://localhost:3000').split(',').map(s => s.trim());
    const origin = request.headers.get('Origin');
    const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.onesignal.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.algolia.net https://*.algolianet.com https://*.upstash.io https://alliancehub-api.absolutus-aeternus.workers.dev https://ipapi.co wss://*.supabase.co; font-src 'self' https://cdnjs.cloudflare.com;";
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'https://alliancehub.dpdns.org',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Token, X-API-Key, X-CSRF-Token',
      'Content-Security-Policy': cspHeader,
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // Required secrets check
    const requiredSecrets = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingSecrets = requiredSecrets.filter(k => !env[k]);
    if (missingSecrets.length > 0) {
      return json({ error: 'Server misconfiguration: missing secrets', missing: missingSecrets }, { status: 500 });
    }

    // Rate Limiting via Upstash Redis (preferred), fallback to memory
    const RL_LIMIT = 60;
    const RL_WINDOW = 60;
    const _ip = request.headers.get('CF-Connecting-IP') || 'x';
    try {
      if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        const rlKey = 'rl:' + _ip;
        const rlResp = await fetch(env.UPSTASH_REDIS_REST_URL + '/incr/' + rlKey, {
          headers: { 'Authorization': 'Bearer ' + env.UPSTASH_REDIS_REST_TOKEN }
        });
        const rlData = await rlResp.json();
        if (rlData.result === 1) {
          await fetch(env.UPSTASH_REDIS_REST_URL + '/expire/' + rlKey + '/' + RL_WINDOW, {
            headers: { 'Authorization': 'Bearer ' + env.UPSTASH_REDIS_REST_TOKEN }
          });
        }
        if (rlData.result > RL_LIMIT) {
          return json({ error: 'Rate limit exceeded' }, { status: 429, ...corsHeaders });
        }
      } else {
        if (!globalThis._rl) globalThis._rl = new Map();
        const _now = Date.now();
        const _e = globalThis._rl.get(_ip) || { n: 0, t: _now + 60000 };
        if (_now > _e.t) { _e.n = 0; _e.t = _now + 60000; }
        _e.n++;
        globalThis._rl.set(_ip, _e);
        if (_e.n > RL_LIMIT) return json({ error: 'Rate limit exceeded' }, { status: 429, ...corsHeaders });
        // BUG #6 FIX: Stricter rate limit for sensitive endpoints (10 req/min)
        const sensitivePaths = ['/api/checkout', '/api/upload/presign', '/api/log/login'];
        if (sensitivePaths.some(p => path.startsWith(p))) {
          const sKey = 'srl:' + _ip + path;
          if (!globalThis._srl) globalThis._srl = new Map();
          const se = globalThis._srl.get(sKey) || { n: 0, t: _now + 60000 };
          if (_now > se.t) { se.n = 0; se.t = _now + 60000; }
          se.n++;
          globalThis._srl.set(sKey, se);
          if (se.n > 10) return json({ error: 'Rate limit exceeded for this endpoint' }, { status: 429, ...corsHeaders });
        }
        if (globalThis._rl.size > 5000) { for (const [k, v] of globalThis._rl) { if (_now > v.t) globalThis._rl.delete(k); } }
      }
    } catch (rlErr) {
      console.warn('Rate limit error:', rlErr.message);
    }


    try {
      // ─── Helper: Verify Supabase JWT ───
      async function verifyAuth(req) {
        const auth = req.headers.get('Authorization');
        if (!auth || !auth.startsWith('Bearer ')) return null;
        const token = auth.replace('Bearer ', '');
        try {
          // Use service role key for user lookup (bypasses RLS)
          const resp = await fetch(env.VITE_SUPABASE_URL + '/auth/v1/user', {
            headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': 'Bearer ' + token }
          });
          if (!resp.ok) return null;
          return await resp.json();
        } catch { return null; }
      }

      // ─── Helper: Per-User Rate Limit ───
      const USER_RL_LIMIT = 120; // 120 req/min per authenticated user
      async function checkUserRateLimit(userId) {
        if (!globalThis._url) globalThis._url = new Map();
        const _now = Date.now();
        const _e = globalThis._url.get(userId) || { n: 0, t: _now + 60000 };
        if (_now > _e.t) { _e.n = 0; _e.t = _now + 60000; }
        _e.n++;
        globalThis._url.set(userId, _e);
        if (globalThis._url.size > 10000) { for (const [k, v] of globalThis._url) { if (_now > v.t) globalThis._url.delete(k); } }
        return _e.n > USER_RL_LIMIT;
      }

      // ─── Helper: Get user role ───
      async function getUserRole(userId, env) {
        const h = getServiceHeaders();
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + userId, { headers: h });
        const data = await resp.json();
        return data[0]?.role || 'MEMBER';
      }

      // ─── Health ───

      // IP Logger
      if (path === '/api/log/login' && method === 'POST') {
        try {
          const body = await request.json();
          const cf = request.cf || {};
          const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
          const ua = request.headers.get('User-Agent') || '';
          let ipInfo = {};
          try { const r = await fetch('https://ipapi.co/' + ip + '/json/'); if (r.ok) ipInfo = await r.json(); } catch (e) { console.warn("IP lookup failed:", e.message) }
          const record = {
            email: body.email || null, role: body.role || null,
            ip_address: ip,
            user_agent: ua,
            login_type: body.login_type || 'login', login_status: body.login_status || 'success',
            logged_at: new Date().toISOString()
          };
          // Use service role key for writing to system_params (bypasses RLS)
          const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' });
          const logKey = 'ip_log_' + Date.now();
          const spBody = JSON.stringify({ code: logKey, value: JSON.stringify(record), description: 'IP Log' });
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/system_params', { method: 'POST', headers: h, body: spBody });
          return json({ ok: true, ip: ip }, corsHeaders);
        } catch (e) { return json({ error: e.message }, { status: 500, ...corsHeaders }); }
      }
            if (path === '/api/health') {
        const _csrf = generateCSRFToken(); return json({ status: 'ok', timestamp: new Date().toISOString(), storage: 'backblaze-b2', version: '2.2' }, { ...corsHeaders, 'Set-Cookie': 'csrf=' + _csrf + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600' });
      }

      // ─── B2 File proxy (with 24h auth token caching via Upstash) ───
      if (path.startsWith('/api/file/')) {
        const fileName = path.replace('/api/file/', '');
        let authData;
        // Try to load cached B2 auth token from Upstash
        try {
          if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
            const cachedResp = await fetch(env.UPSTASH_REDIS_REST_URL + '/get/b2_auth_token', {
              headers: { 'Authorization': 'Bearer ' + env.UPSTASH_REDIS_REST_TOKEN }
            });
            const cached = await cachedResp.json();
            if (cached.result) authData = JSON.parse(cached.result);
          }
        } catch (e) { /* cache miss */ }
        if (!authData) {
          const b2Auth = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
            headers: { 'Authorization': 'Basic ' + btoa(env.B2_KEY_ID + ':' + env.B2_APPLICATION_KEY) }
          });
          authData = await b2Auth.json();
          // Cache for 24h
          try {
            if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
              await fetch(env.UPSTASH_REDIS_REST_URL + '/set/b2_auth_token/' + encodeURIComponent(JSON.stringify(authData)) + '/EX/86400', {
                headers: { 'Authorization': 'Bearer ' + env.UPSTASH_REDIS_REST_TOKEN }
              });
            }
          } catch (e) { /* best effort */ }
        }
        const listResp = await fetch(authData.apiUrl + '/b2api/v2/b2_list_file_names', {
          method: 'POST',
          headers: { 'Authorization': authData.authorizationToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucketId: env.B2_BUCKET_ID, startFileName: fileName, maxFileCount: 1 })
        });
        const listData = await listResp.json();
        const file = listData.files?.find(f => f.fileName === fileName);
        if (!file) return json({ error: 'File not found' }, { status: 404, ...corsHeaders });
        const dlResp = await fetch(authData.apiUrl + '/b2api/v2/b2_download_file_by_id?fileId=' + file.fileId, {
          headers: { 'Authorization': authData.authorizationToken }
        });
        return new Response(dlResp.body, {
          headers: { 'Content-Type': file.contentType || 'application/octet-stream', 'Cache-Control': 'public, max-age=86400', ...corsHeaders }
        });
      }

      // ─── Upload presign (auth required) ───
      if (path === '/api/upload/presign' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Unauthorized' }, { status: 401, ...corsHeaders });
        const body = await request.json();
        const fileName = 'products/' + Date.now() + '-' + body.filename;
        const b2Auth = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
          headers: { 'Authorization': 'Basic ' + btoa(env.B2_KEY_ID + ':' + env.B2_APPLICATION_KEY) }
        });
        const authData = await b2Auth.json();
        const uploadUrlResp = await fetch(authData.apiUrl + '/b2api/v2/b2_get_upload_url', {
          method: 'POST',
          headers: { 'Authorization': authData.authorizationToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucketId: env.B2_BUCKET_ID })
        });
        const uploadData = await uploadUrlResp.json();
        return json({ key: fileName, uploadUrl: uploadData.uploadUrl, uploadToken: uploadData.authorizationToken, publicUrl: '/api/file/' + fileName }, corsHeaders);
      }

      // ─── Helper: Fetch fresh products for cache revalidation ───
      async function fetchProductsFresh(url, env, corsHeaders) {
        const statusFilter = url.searchParams.get('status') || 'active';
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const category = url.searchParams.get('category');
        const rawSearch = url.searchParams.get('search');
        const search = rawSearch ? rawSearch.replace(/%/g, '\%').replace(/_/g, '\_').substring(0, 100).trim() : null;
        const sortParam = url.searchParams.get('sort') || 'newest';
        const allowedSorts = ['newest', 'price', 'sales', 'rating'];
        const sort = allowedSorts.includes(sortParam) ? sortParam : 'newest';
        const rawLimit = parseInt(url.searchParams.get('limit') || '40');
        const limit = isNaN(rawLimit) ? 40 : Math.min(Math.max(rawLimit, 1), 100);
        let q = 'select=id,name,slug,price,original_price,images,status,sales_count,rating,category_id,seller_id,stock,sellers(name,store_name,logo)&limit=' + limit;
        if (category) q += '&category_id=eq.' + category;
        if (search) q += '&name=ilike.*' + encodeURIComponent(search) + '*';
        if (sort === 'price') q += '&order=price.asc';
        else if (sort === 'sales') q += '&order=sales_count.desc';
        else q += '&order=created_at.desc';
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?' + q, { headers: h });
        const body = JSON.stringify({ data: await resp.json() });
        return new Response(body, {
          headers: { 'Content-Type': 'application/json', 'X-Cached-At': Date.now().toString(), ...corsHeaders }
        });
      }

      // ─── Products (WITH EDGE CACHING) ───
      if (path === '/api/products' && method === 'GET') {
        // Edge cache: 60s TTL, stale-while-revalidate 300s
        const cacheKey = new Request(url.toString());
        const cache = caches.default;
        const cached = await cache.match(cacheKey);
        if (cached) {
          const cachedAt = parseInt(cached.headers.get('X-Cached-At') || '0');
          if (Date.now() - cachedAt < 60000) return cached; // Fresh (< 60s)
          // Stale: return stale, revalidate in background
          const fetchPromise = fetchProductsFresh(url, env, corsHeaders);
          if (typeof ctx !== 'undefined') ctx.waitUntil(fetchPromise);
          return cached;
        }

        // RLS ENFORCEMENT: Only show active products
        const statusFilter = url.searchParams.get('status') || 'active';
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const category = url.searchParams.get('category');
        // Validate category (UUID format)
        if (category && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)) {
          return json({ error: 'Invalid category parameter' }, { status: 400, ...corsHeaders });
        }
        const rawSearch = url.searchParams.get('search');
        // Sanitize search: escape % and _ to prevent ilike pattern manipulation
        const search = rawSearch ? rawSearch.replace(/%/g, '\%').replace(/_/g, '\_').substring(0, 100).trim() : null;
        const sortParam = url.searchParams.get('sort') || 'newest';
        const allowedSorts = ['newest', 'price', 'sales', 'rating'];
        const sort = allowedSorts.includes(sortParam) ? sortParam : 'newest';
        const rawLimit = parseInt(url.searchParams.get('limit') || '40');
        const limit = isNaN(rawLimit) ? 40 : Math.min(Math.max(rawLimit, 1), 100);
        let q = 'select=id,name,slug,price,original_price,images,status,sales_count,rating,category_id,seller_id,stock,sellers(name,store_name,logo)&limit=' + limit;
        if (category) q += '&category_id=eq.' + category;
        if (search) q += '&name=ilike.*' + encodeURIComponent(search) + '*';
        if (sort === 'price') q += '&order=price.asc';
        else if (sort === 'sales') q += '&order=sales_count.desc';
        else q += '&order=created_at.desc';
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?' + q, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Product detail ───
      if (path.startsWith('/api/product/') && method === 'GET') {
        const slug = path.split('/api/product/')[1];
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?slug=eq.' + encodeURIComponent(slug) + '&select=id,name,slug,description,price,original_price,images,status,sales_count,rating,stock,category_id,seller_id,cost_price,min_seller_price,max_seller_price,created_at,sellers(id,name,store_name,user_id,description,logo,rating)', { headers: h });
        const data = await resp.json();
        return json({ data: data[0] || null }, corsHeaders);
      }

      // ─── Categories ───
      if (path === '/api/categories' && method === 'GET') {
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/categories?order=sort_order', { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Sellers ───
      if (path === '/api/sellers' && method === 'GET') {
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const recommended = url.searchParams.get('recommended');
        let q = 'select=id,name,store_name,logo,description,rating,is_recommended';
        if (recommended) q += '&is_recommended=eq.true';
        q += '&limit=20';
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?' + q, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Top Sellers (with follower count) ───
      if (path === '/api/sellers/top' && method === 'GET') {
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
        // Fetch approved sellers ordered by rating
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?select=id,name,store_name,logo,description,rating,is_recommended&approval_status=eq.approved&order=rating.desc&limit=' + limit, { headers: h });
        const sellers = await resp.json();
        if (!sellers?.length) return json({ data: [] }, corsHeaders);
        // Fetch ALL follower counts in ONE query (avoids N+1)
        const sellerIds = sellers.map(s => s.id).join(',');
        const followsResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/follows?seller_id=in.(' + sellerIds + ')&select=seller_id', { headers: h });
        const follows = await followsResp.json();
        const countMap = {};
        (follows || []).forEach(f => { countMap[f.seller_id] = (countMap[f.seller_id] || 0) + 1; });
        const sellersWithCounts = sellers
          .map(s => ({ ...s, follower_count: countMap[s.id] || 0 }))
          .sort((a, b) => b.follower_count - a.follower_count);
        return json({ data: sellersWithCounts }, corsHeaders);
      }

      // ─── Follow Seller (AUTH REQUIRED) ───
      if (path === '/api/follow' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const body = await request.json();
        const { seller_id } = body;
        if (!seller_id) return json({ error: 'seller_id is required' }, { status: 400, ...corsHeaders });
        // Check if already following
        const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
        const existingResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/follows?user_id=eq.' + user.id + '&seller_id=eq.' + seller_id + '&select=id', { headers: h });
        const existing = await existingResp.json();
        if (existing.length > 0) return json({ action: 'already_following' }, corsHeaders);
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/follows', {
          method: 'POST', headers: h, body: JSON.stringify({ user_id: user.id, seller_id })
        });
        if (!resp.ok) return json({ error: 'Failed to follow seller' }, { status: 500, ...corsHeaders });
        return json({ action: 'followed' }, corsHeaders);
      }

      // ─── Unfollow Seller (AUTH REQUIRED) ───
      if (path === '/api/follow' && method === 'DELETE') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const body = await request.json();
        const { seller_id } = body;
        if (!seller_id) return json({ error: 'seller_id is required' }, { status: 400, ...corsHeaders });
        const h = getServiceHeaders();
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/follows?user_id=eq.' + user.id + '&seller_id=eq.' + seller_id, {
          method: 'DELETE', headers: h
        });
        return json({ action: 'unfollowed' }, corsHeaders);
      }

      // ─── Wishlist (GET - auth required) ───
      if (path === '/api/wishlist' && method === 'GET') {
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const h = getServiceHeaders();
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/wishlists?user_id=eq.' + user.id + '&select=id,product_id,created_at,products(id,name,price,images,slug)&order=created_at.desc', { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Wishlist Toggle (POST - auth required) ───
      if (path === '/api/wishlist' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const body = await request.json();
        const { product_id } = body;
        if (!product_id) return json({ error: 'product_id is required' }, { status: 400, ...corsHeaders });
        const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
        // Check existing
        const existingResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/wishlists?user_id=eq.' + user.id + '&product_id=eq.' + product_id + '&select=id', { headers: h });
        const existing = await existingResp.json();
        if (existing.length > 0) {
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/wishlists?id=eq.' + existing[0].id, { method: 'DELETE', headers: h });
          return json({ action: 'removed' }, corsHeaders);
        }
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/wishlists', {
          method: 'POST', headers: h, body: JSON.stringify({ user_id: user.id, product_id })
        });
        return json({ action: 'added' }, corsHeaders);
      }

      // ─── Validate Coupon ───
      if (path === '/api/coupons/validate' && method === 'GET') {
        const code = url.searchParams.get('code');
        const orderTotal = parseFloat(url.searchParams.get('total') || '0');
        if (!code) return json({ error: 'Coupon code is required' }, { status: 400, ...corsHeaders });
        const h = getServiceHeaders({ 'Content-Type': 'application/json' });
        try {
          const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/rpc/validate_coupon', {
            method: 'POST', headers: h,
            body: JSON.stringify({ p_code: code.toUpperCase(), p_order_total: orderTotal })
          });
          const data = await resp.json();
          const result = data?.[0];
          if (!result?.valid) return json({ valid: false, error: result?.error_msg || 'Invalid coupon' }, corsHeaders);
          return json({ valid: true, coupon_id: result.coupon_id, discount_type: result.discount_type, discount_value: result.discount_value, discount_amount: result.discount_amount }, corsHeaders);
        } catch (e) {
          return json({ valid: false, error: 'Coupon validation failed' }, { status: 500, ...corsHeaders });
        }
      }

      // ─── Shipping Estimate ───
      if (path === '/api/shipping/estimate' && method === 'GET') {
        const sellerId = url.searchParams.get('seller_id');
        const region = url.searchParams.get('region') || 'domestic';
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        let q = 'select=id,courier,service,rate,estimated_days,region&is_active=eq.true&region=eq.' + region;
        if (sellerId) {
          q += '&or=(seller_id.eq.' + sellerId + ',seller_id.is.null)';
        } else {
          q += '&seller_id=is.null';
        }
        q += '&order=rate.asc';
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/shipping_rates?' + q, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Product Variants ───
      if (path.match(/^\/api\/products\/[0-9a-f-]+\/variants$/i) && method === 'GET') {
        const productId = path.split('/')[3];
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
          return json({ error: 'Invalid product ID' }, { status: 400, ...corsHeaders });
        }
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/product_variants?product_id=eq.' + productId + '&is_active=eq.true&select=id,name,sku,price,stock,attributes&order=name', { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Algolia Search ───
      if (path === '/api/search' && method === 'GET') {
        // BUG #5 FIX: Sanitize search input
        const rawQuery = url.searchParams.get('q') || '';
        const query = rawQuery.replace(/[<>"'\\]/g, '').substring(0, 200).trim();
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
        if (!query) return json({ hits: [] }, corsHeaders);
        try {
          const resp = await fetch('https://' + env.VITE_ALGOLIA_APP_ID + '-dsn.algolia.net/1/indexes/products/query', {
            method: 'POST',
            headers: {
              'X-Algolia-Application-Id': env.VITE_ALGOLIA_APP_ID,
              'X-Algolia-API-Key': env.VITE_ALGOLIA_SEARCH_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, hitsPerPage: limit })
          });
          const data = await resp.json();
          return json({ hits: data.hits || [] }, corsHeaders);
        } catch (e) {
          return json({ hits: [], error: 'Search unavailable' }, corsHeaders);
        }
      }

      // ─── Dashboard ───
      if (path === '/api/dashboard' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const [products, categories, sellers] = await Promise.all([
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=id,name,slug,price,original_price,images,sales_count,rating,sellers(name,store_name,logo)&status=eq.active&order=sales_count.desc&limit=20', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/categories?order=sort_order', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?is_recommended=eq.true&limit=10', { headers: h }).then(r => r.json()),
        ]);
        return json({ products, categories, sellers }, corsHeaders);
      }

      // ─── Seller Registration (AUTH REQUIRED) ───
      if (path === '/api/seller/register' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
        
        // Check current role
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + user.id, { headers: h });
        const roleData = await roleResp.json();
        const currentRole = roleData[0]?.role || 'MEMBER';
        
        // Only MEMBER can become SELLER
        if (currentRole !== 'MEMBER') {
          return json({ error: 'Only members can register as sellers', currentRole }, { status: 403, ...corsHeaders });
        }
        
        // Create seller record with pending approval
        const body = await request.json();
        const sellerResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers', {
          method: 'POST',
          headers: h,
          body: JSON.stringify({
            user_id: user.id,
            name: body.storeName || body.name || 'New Seller',
            store_name: body.storeName || body.name || 'New Seller',
            description: body.description || '',
            approval_status: 'pending',
            status: 'pending'
          })
        });
        
        // Audit log
        try {
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/audit_logs', {
            method: 'POST',
            headers: h,
            body: JSON.stringify({
              actor_id: user.id,
              action: 'seller_registration',
              target_type: 'seller',
              new_value: { status: 'pending' },
              ip_address: request.headers.get('cf-connecting-ip') || null
            })
          });
        } catch (_) {}
        
        return json({ success: true, status: 'pending', message: 'Seller registration submitted. Awaiting admin approval.' }, corsHeaders);
      }

      // ─── Admin: Approve/Reject Seller (ADMIN ONLY) ───
      if (path === '/api/admin/seller-approval' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
        
        // Verify admin role (use service role key)
        const reqRoleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: getServiceHeaders() });
        const reqRoleData = await reqRoleResp.json();
        if (!['ADMIN', 'SUPER_ADMIN'].includes(reqRoleData[0]?.role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        
        const { sellerId, action, reason } = await request.json();
        
        if (!['approve', 'reject'].includes(action)) {
          return json({ error: 'Action must be approve or reject' }, { status: 400, ...corsHeaders });
        }
        
        // Get seller info
        const sellerResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?id=eq.' + sellerId + '&select=*', { headers: h });
        const sellerData = await sellerResp.json();
        if (!sellerData[0]) return json({ error: 'Seller not found' }, { status: 404, ...corsHeaders });
        
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        // Update seller approval status (use service role key)
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?id=eq.' + sellerId, {
          method: 'PATCH',
          headers: getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' }),
          body: JSON.stringify({
            approval_status: newStatus,
            approved_by: _u.id,
            approved_at: new Date().toISOString(),
            rejection_reason: action === 'reject' ? (reason || 'No reason provided') : null,
            status: action === 'approve' ? 'active' : 'rejected'
          })
        });
        
        // If approved, upgrade user role to SELLER
        if (action === 'approve' && sellerData[0].user_id) {
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?id=eq.' + sellerData[0].user_id, {
            method: 'PATCH',
            headers: getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' }),
            body: JSON.stringify({ role: 'SELLER' })
          });
        }
        
        // Audit log
        try {
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/audit_logs', {
            method: 'POST',
            headers: h,
            body: JSON.stringify({
              actor_id: _u.id,
              action: 'seller_' + action,
              target_type: 'seller',
              target_id: sellerId,
              old_value: { approval_status: sellerData[0].approval_status },
              new_value: { approval_status: newStatus },
              reason: reason || null,
              ip_address: request.headers.get('cf-connecting-ip') || null
            })
          });
        } catch (_) {}
        
        return json({ success: true, status: newStatus }, corsHeaders);
      }

      // ─── Admin: Pending Sellers List (ADMIN ONLY) ───
      if (path === '/api/admin/sellers/pending' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        
        const reqRoleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: getServiceHeaders() });
        const reqRoleData = await reqRoleResp.json();
        if (!['ADMIN', 'SUPER_ADMIN'].includes(reqRoleData[0]?.role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?approval_status=eq.pending&order=created_at.desc', { headers: getServiceHeaders() });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Checkout (AUTH REQUIRED + PER-USER RATE LIMIT) ───
      if (path === '/api/checkout' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        if (await checkUserRateLimit(user.id)) return json({ error: 'Too many requests. Please wait.' }, { status: 429, ...corsHeaders });

        const body = await request.json();
        const idempotencyKey = request.headers.get('Idempotency-Key') || `checkout:${user.id}:${Date.now()}`;

        // Basic validation
        if (!body.items?.length) return json({ error: 'Cart is empty' }, { status: 400, ...corsHeaders });
        
        // Use service role for atomic checkout RPC (BUG-001, BUG-003, BUG-004 FIX)
        try {
          const orderNo = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          
          const rpcResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/rpc/process_checkout', {
            method: 'POST',
            headers: getServiceHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              p_user_id: user.id,
              p_seller_id: body.seller_id || null,
              p_order_no: orderNo,
              p_total_amount: body.total,
              p_shipping_fee: body.shipping_fee || 0,
              p_payment_method: body.payment_method || 'wallet',
              p_shipping_address: body.address || {},
              p_notes: body.notes || '',
              p_idempotency_key: idempotencyKey,
              p_items: body.items // {product_id, quantity, price, name}
            })
          });

          const result = await rpcResp.json();
          if (result.success) {
            return json({ order_id: result.order_id, order_no: orderNo, is_duplicate: result.is_duplicate }, corsHeaders);
          } else {
            return json({ error: result.error || 'Checkout failed' }, { status: 400, ...corsHeaders });
          }
        } catch (e) {
          return handleError(e);
        }
      }

      // ─── Orders (AUTH REQUIRED) ───
      if ((path === '/api/orders' || path === '/api/user/orders') && method === 'GET') {
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });

        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        let q = 'select=*,order_items(*,products(name,images))&order=created_at.desc&user_id=eq.' + user.id;
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/orders?' + q, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Cron daily (TOKEN REQUIRED) ───
      if (path === '/api/cron/daily' && method === 'POST') {
        const cronToken = request.headers.get('X-Cron-Token');
        if (!cronToken || cronToken !== env.CRON_JOB_TOKEN) {
          return json({ error: 'Invalid cron token' }, { status: 403, ...corsHeaders });
        }
        return json({ status: 'executed', timestamp: new Date().toISOString() }, corsHeaders);
      }

      // ─── Send Email (AUTH REQUIRED) ───
      if (path === '/api/email/send' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        if (await checkUserRateLimit(user.id)) return json({ error: 'Too many requests' }, { status: 429, ...corsHeaders });

        const { to, subject, html, type } = await request.json();
        if (!to || !subject || !html) return json({ error: 'Missing required fields: to, subject, html' }, { status: 400, ...corsHeaders });

        // Only allow sending to own email (prevent abuse)
        const h = getServiceHeaders();
        const userResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=email&id=eq.' + user.id, { headers: h });
        const userData = await userResp.json();
        const userEmail = userData[0]?.email;
        if (!userEmail || userEmail !== to) {
          return json({ error: 'Can only send emails to your own address' }, { status: 403, ...corsHeaders });
        }

        try {
          const resendResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + env.RESEND_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: env.BREVO_FROM_EMAIL || 'noreply@alliancehub.com',
              to: [to],
              subject,
              html
            })
          });

          if (!resendResp.ok) {
            const errText = await resendResp.text();
            console.error('Resend API error:', errText);
            return json({ error: 'Failed to send email' }, { status: 500, ...corsHeaders });
          }

          const result = await resendResp.json();
          return json({ success: true, id: result.id }, corsHeaders);
        } catch (e) {
          return handleError(e);
        }
      }

      // ─── Payment Webhook (Gateway → Server) ───
      if (path === '/api/webhook/payment' && method === 'POST') {
        try {
          const gateway = url.searchParams.get('gateway') || 'unknown';
          const body = await request.json();
          const signature = request.headers.get('X-Webhook-Signature') || request.headers.get('X-Signature') || '';

          // Find payment by transaction ID
          const txnId = body.transaction_id || body.orderId || body.id;
          if (!txnId) return json({ error: 'Missing transaction reference' }, { status: 400, ...corsHeaders });

          const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
          const payResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payments?select=id,order_id,status,method&transaction_id=eq.' + txnId, { headers: h });
          const payments = await payResp.json();
          const payment = payments[0];
          if (!payment) return json({ error: 'Payment not found' }, { status: 404, ...corsHeaders });
          if (payment.status === 'completed') return json({ success: true, processed: false }, corsHeaders);

          // Map gateway status
          const gwStatus = (body.status || body.event || 'unknown').toLowerCase();
          const successStatuses = ['completed', 'confirmed', 'success', 'paid', 'settled'];
          const failedStatuses = ['failed', 'cancelled', 'expired', 'error', 'rejected'];
          let newStatus = 'pending';
          if (successStatuses.includes(gwStatus)) newStatus = 'completed';
          else if (failedStatuses.includes(gwStatus)) newStatus = 'failed';

          // Update payment
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payments?id=eq.' + payment.id, {
            method: 'PATCH', headers: h,
            body: JSON.stringify({
              status: newStatus,
              verified_at: newStatus === 'completed' ? new Date().toISOString() : null,
              metadata: { webhook_at: new Date().toISOString(), gateway, gwStatus }
            })
          });

          // Update order if completed
          if (newStatus === 'completed' && payment.order_id) {
            await fetch(env.VITE_SUPABASE_URL + '/rest/v1/orders?id=eq.' + payment.order_id, {
              method: 'PATCH', headers: h,
              body: JSON.stringify({ payment_status: 'paid', status: 'paid' })
            });
          }

          return json({ success: true, processed: true, status: newStatus }, corsHeaders);
        } catch (e) { return handleError(e); }
      }

      // ─── Admin: System Params (ADMIN ONLY) ───
      if (path === '/api/admin/system-params' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        // Check admin role (use service role key)
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, {
          headers: getServiceHeaders()
        });
        const roleData = await roleResp.json();
        if (!roleData[0] || !['ADMIN', 'SUPER_ADMIN'].includes(roleData[0].role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/system_params?order=code', { headers: getServiceHeaders() });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: All Orders (ADMIN ONLY) ───
      if (path === '/api/admin/orders' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, {
          headers: getServiceHeaders()
        });
        const roleData = await roleResp.json();
        if (!roleData[0] || !['ADMIN', 'SUPER_ADMIN'].includes(roleData[0].role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/orders?select=*,order_items(*,products(name,images))&order=created_at.desc&limit=' + limit, { headers: getServiceHeaders() });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: All Users (ADMIN ONLY) ───
      if (path === '/api/admin/users' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, {
          headers: getServiceHeaders()
        });
        const roleData = await roleResp.json();
        if (!roleData[0] || !['ADMIN', 'SUPER_ADMIN'].includes(roleData[0].role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=id,email,username,role,created_at&order=created_at.desc&limit=' + limit, { headers: getServiceHeaders() });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: Change User Role (ADMIN ONLY + AUDIT) ───
      if (path === '/api/admin/change-role' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const { userId, newRole, reason } = await request.json();
        if (!validateUUID(userId)) return json({ error: 'Invalid User ID' }, { status: 400, ...corsHeaders });
        if (!['MEMBER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(newRole)) {
          return json({ error: 'Invalid role' }, { status: 400, ...corsHeaders });
        }

        const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
        
        // Fetch requester's role for authorization
        const reqRoleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: getServiceHeaders() });
        const reqRoleData = await reqRoleResp.json();
        const reqRole = reqRoleData[0]?.role || 'MEMBER';
        
        // Only ADMIN or SUPER_ADMIN can change roles
        if (!['ADMIN', 'SUPER_ADMIN'].includes(reqRole)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        
        // Only SUPER_ADMIN can assign SUPER_ADMIN role
        if (newRole === 'SUPER_ADMIN' && reqRole !== 'SUPER_ADMIN') {
          return json({ error: 'Only SUPER_ADMIN can assign SUPER_ADMIN role' }, { status: 403, ...corsHeaders });
        }
        
        // Cannot change own role
        if (userId === _u.id) {
          return json({ error: 'Cannot change your own role' }, { status: 400, ...corsHeaders });
        }
        
        // Get old role for audit
        const oldRoleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + userId, { headers: h });
        const oldRoleData = await oldRoleResp.json();
        const oldRole = oldRoleData[0]?.role;
        
        // Update role
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?id=eq.' + userId, {
          method: 'PATCH',
          headers: h,
          body: JSON.stringify({ role: newRole })
        });
        
        // Audit log (best effort, don't fail if table doesn't exist)
        try {
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/audit_logs', {
            method: 'POST',
            headers: h,
            body: JSON.stringify({
              actor_id: _u.id,
              action: 'role_change',
              target_type: 'user',
              target_id: userId,
              old_value: { role: oldRole },
              new_value: { role: newRole },
              reason: reason || 'No reason provided',
              ip_address: request.headers.get('cf-connecting-ip') || null
            })
          });
        } catch (_) { /* audit_logs table may not exist yet */ }
        
        return json({ success: true, oldRole, newRole }, corsHeaders);
      }

      // ─── Submit Review (AUTH REQUIRED + VALIDATION) ───
      if (path === '/api/review' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        if (await checkUserRateLimit(user.id)) return json({ error: 'Too many requests' }, { status: 429, ...corsHeaders });
        
        // BUG-002 FIX: Use consistent service headers
        const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
        const body = await request.json();
        const { product_id, rating, comment, images } = body;
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) return json({ error: 'Rating must be 1-5' }, { status: 400, ...corsHeaders });
        if (!comment || comment.length < 20) return json({ error: 'Review must be at least 20 characters' }, { status: 400, ...corsHeaders });
        
        // Check user has delivered order for this product
        const orderCheck = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/orders?user_id=eq.' + user.id + '&status=eq.delivered&select=id,order_items(product_id)&limit=5', { headers: h });
        const orders = await orderCheck.json();
        const hasPurchased = orders.some(o => o.order_items?.some(i => i.product_id === product_id));
        if (!hasPurchased) return json({ error: 'You can only review products you have purchased and received' }, { status: 403, ...corsHeaders });
        
        // Check for duplicate review
        const dupCheck = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/evaluations?user_id=eq.' + user.id + '&product_id=eq.' + product_id + '&select=id', { headers: h });
        const existing = await dupCheck.json();
        if (existing.length > 0) return json({ error: 'You have already reviewed this product' }, { status: 400, ...corsHeaders });
        
        // Check daily review limit (max 5 per day)
        const today = new Date().toISOString().split('T')[0];
        const dailyCheck = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/evaluations?user_id=eq.' + user.id + '&created_at=gte.' + today + '&select=id', { headers: h });
        const dailyCount = (await dailyCheck.json()).length;
        if (dailyCount >= 5) return json({ error: 'Maximum 5 reviews per day' }, { status: 429, ...corsHeaders });
        
        // Create review
        const reviewResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/evaluations', {
          method: 'POST', headers: h,
          body: JSON.stringify({ user_id: user.id, product_id, rating, comment, images: images || [] })
        });
        const review = (await reviewResp.json())[0];
        
        // Calculate review commission
        const reviewSettings = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/platform_settings?key=eq.review_commission&select=value', { headers: h });
        const settings = (await reviewSettings.json())[0]?.value || { base: 0.10, photo_bonus: 0.05, high_rating_bonus: 0.05, max: 0.30 };
        let commission = settings.base;
        if (images?.length > 0) commission += settings.photo_bonus;
        if (rating >= 4) commission += settings.high_rating_bonus;
        commission = Math.min(commission, settings.max);
        
        // Get product seller_id for commission
        const prodInfo = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=seller_id&id=eq.' + product_id, { headers: h });
        const sellerId = (await prodInfo.json())[0]?.seller_id;
        
        if (sellerId) {
          // Create commission record (held for 7 days)
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/commissions', {
            method: 'POST', headers: h,
            body: JSON.stringify({
              seller_id: sellerId, type: 'review', amount: commission,
              status: 'held', hold_until: new Date(Date.now() + 7 * 86400000).toISOString()
            })
          });
        }
        
        // Create validation record
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/review_validations', {
          method: 'POST', headers: h,
          body: JSON.stringify({
            review_id: review?.id, user_id: user.id, product_id,
            order_id: orders[0]?.id,
            ip_address: request.headers.get('cf-connecting-ip') || null,
            commission_status: 'held'
          })
        });
        
        return json({ success: true, review, commission_earned: commission }, corsHeaders);
      }

      // ─── Seller: Set Product Markup (AUTH REQUIRED) ───
      if (path === '/api/seller/markup' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
        
        // Verify seller
        const sellerResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?user_id=eq.' + user.id + '&select=id,approval_status', { headers: h });
        const seller = (await sellerResp.json())[0];
        if (!seller || seller.approval_status !== 'approved') return json({ error: 'Approved seller account required' }, { status: 403, ...corsHeaders });
        
        const { product_id, custom_price } = await request.json();
        
        // Get product price range
        const prodResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=id,price,min_seller_price,max_seller_price&id=eq.' + product_id, { headers: h });
        const product = (await prodResp.json())[0];
        if (!product) return json({ error: 'Product not found' }, { status: 404, ...corsHeaders });
        
        // Validate price range
        const minPrice = product.min_seller_price || product.price;
        const maxPrice = product.max_seller_price || product.price * 3;
        if (custom_price < minPrice || custom_price > maxPrice) {
          return json({ error: 'Price must be between $' + minPrice + ' and $' + maxPrice }, { status: 400, ...corsHeaders });
        }
        
        // Upsert seller product
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_products', {
          method: 'POST', headers: h,
          body: JSON.stringify({ seller_id: seller.id, product_id, custom_price })
        });
        
        return json({ success: true, price: custom_price, min: minPrice, max: maxPrice }, corsHeaders);
      }

      // ─── Seller: View Wallet (AUTH REQUIRED) ───
      if (path === '/api/seller/wallet' && method === 'GET') {
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = getServiceHeaders();
        const sellerResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?user_id=eq.' + user.id + '&select=id', { headers: h });
        const seller = (await sellerResp.json())[0];
        if (!seller) return json({ error: 'Seller account required' }, { status: 403, ...corsHeaders });
        
        const walletResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + seller.id, { headers: h });
        const wallet = (await walletResp.json())[0] || { balance: 0, pending_balance: 0, total_earned: 0, total_withdrawn: 0 };
        
        const commResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/commissions?seller_id=eq.' + seller.id + '&order=created_at.desc&limit=20', { headers: h });
        const commissions = await commResp.json();
        
        return json({ wallet, commissions }, corsHeaders);
      }

      // ─── Seller: Request Payout (AUTH REQUIRED) ───
      if (path === '/api/seller/payout' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = getServiceHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
        const sellerResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?user_id=eq.' + user.id + '&select=id', { headers: h });
        const seller = (await sellerResp.json())[0];
        if (!seller) return json({ error: 'Seller account required' }, { status: 403, ...corsHeaders });
        
        const walletResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + seller.id + '&select=balance', { headers: h });
        const wallet = (await walletResp.json())[0];
        const { amount, method: payMethod, account_details } = await request.json();
        
        // Validate
        if (!wallet || wallet.balance < amount) return json({ error: 'Insufficient balance' }, { status: 400, ...corsHeaders });
        const limits = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/platform_settings?key=eq.withdrawal_limits&select=value', { headers: h });
        const limitData = (await limits.json())[0]?.value || { min: 10, max_daily: 1000 };
        if (amount < limitData.min) return json({ error: 'Minimum withdrawal: $' + limitData.min }, { status: 400, ...corsHeaders });
        
        // Create payout request
        const payoutResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payouts', {
          method: 'POST', headers: h,
          body: JSON.stringify({ seller_id: seller.id, amount, method: payMethod, account_details, status: 'pending' })
        });
        const payoutData = await payoutResp.json();
        
        // Deduct from wallet (with optimistic concurrency check)
        const walletPatchResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + seller.id, {
          method: 'PATCH', headers: h,
          body: JSON.stringify({ balance: wallet.balance - amount })
        });
        
        // Rollback: if wallet deduction fails, delete the payout record
        if (!walletPatchResp.ok) {
          const payoutId = payoutData?.[0]?.id;
          if (payoutId) {
            await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payouts?id=eq.' + payoutId, {
              method: 'DELETE', headers: h
            });
          }
          return json({ error: 'Failed to deduct from wallet. Payout cancelled.' }, { status: 500, ...corsHeaders });
        }
        
        return json({ success: true, remaining_balance: wallet.balance - amount }, corsHeaders);
      }

      // ─── Admin: View All Commissions (ADMIN ONLY) ───
      if (path === '/api/admin/commissions' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: getServiceHeaders() });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = getServiceHeaders();
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const status = url.searchParams.get('status') || '';
        let q = 'select=*,sellers(name,store_name)&order=created_at.desc&limit=' + limit;
        if (status) q += '&status=eq.' + status;
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/commissions?' + q, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: Approve Commission (ADMIN ONLY) ───
      if (path === '/api/admin/commission/approve' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: getServiceHeaders() });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = getServiceHeaders({ 'Content-Type': 'application/json' });
        const { commission_id, action } = await request.json();
        
        if (!['approve', 'cancel'].includes(action)) return json({ error: 'Action must be approve or cancel' }, { status: 400, ...corsHeaders });
        
        const newStatus = action === 'approve' ? 'approved' : 'cancelled';
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/commissions?id=eq.' + commission_id, {
          method: 'PATCH', headers: h,
          body: JSON.stringify({ status: newStatus, approved_by: _u.id, approved_at: new Date().toISOString() })
        });
        
        // If approved, add to seller wallet
        if (action === 'approve') {
          const commResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/commissions?select=seller_id,amount&id=eq.' + commission_id, { headers: h });
          const comm = (await commResp.json())[0];
          if (comm) {
            const walletResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + comm.seller_id + '&select=balance,total_earned', { headers: h });
            const wallet = (await walletResp.json())[0];
            if (wallet) {
              await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + comm.seller_id, {
                method: 'PATCH', headers: h,
                body: JSON.stringify({ balance: wallet.balance + comm.amount, total_earned: wallet.total_earned + comm.amount })
              });
            } else {
              await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets', {
                method: 'POST', headers: h,
                body: JSON.stringify({ seller_id: comm.seller_id, balance: comm.amount, total_earned: comm.amount })
              });
            }
          }
        }
        
        return json({ success: true, status: newStatus }, corsHeaders);
      }

      // ─── Admin: View Payouts (ADMIN ONLY) ───
      if (path === '/api/admin/payouts' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: getServiceHeaders() });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = getServiceHeaders();
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payouts?select=*,sellers(name,store_name)&order=created_at.desc&limit=50', { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: Process Payout (ADMIN ONLY) ───
      if (path === '/api/admin/payout/process' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: getServiceHeaders() });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = getServiceHeaders({ 'Content-Type': 'application/json' });
        const { payout_id, action, notes } = await request.json();
        
        if (!['complete', 'reject'].includes(action)) return json({ error: 'Action must be complete or reject' }, { status: 400, ...corsHeaders });
        
        const newStatus = action === 'complete' ? 'completed' : 'rejected';
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payouts?id=eq.' + payout_id, {
          method: 'PATCH', headers: h,
          body: JSON.stringify({ status: newStatus, processed_by: _u.id, processed_at: new Date().toISOString(), notes })
        });
        
        // If rejected, refund to wallet
        if (action === 'reject') {
          const payoutResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payouts?select=seller_id,amount&id=eq.' + payout_id, { headers: h });
          const payout = (await payoutResp.json())[0];
          if (payout) {
            const walletResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + payout.seller_id + '&select=balance', { headers: h });
            const wallet = (await walletResp.json())[0];
            if (wallet) {
              await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + payout.seller_id, {
                method: 'PATCH', headers: h,
                body: JSON.stringify({ balance: wallet.balance + payout.amount })
              });
            }
          }
        }
        
        return json({ success: true, status: newStatus }, corsHeaders);
      }

      return json({ error: 'Not found' }, { status: 404, ...corsHeaders });
    } catch (err) {
      // Structured error logging (no sensitive data in response)
      const errorId = Date.now().toString(36);
      console.error(JSON.stringify({ errorId, message: err.message, path, method, timestamp: new Date().toISOString() }));
      console.error('Error [' + errorId + ']:', err.message); return json({ error: 'Internal server error', errorId }, { status: 500, ...corsHeaders });
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetch('https://alliancehub-api.absolutus-aeternus.workers.dev/api/health'));
  }
};


// CSRF Token generator (used in /api/health)
function generateCSRFToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}


function json(data, headers = {}) {
  const { status = 200, ...rest } = headers;
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...rest } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const allowedOrigins = (env.ALLOWED_ORIGINS || 'https://alliancehub.dpdns.org,https://alliancehub.pages.dev,http://localhost:3000').split(',').map(s => s.trim());
    const origin = request.headers.get('Origin');
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'https://alliancehub.dpdns.org',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Token, X-API-Key',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // Required secrets check
    const requiredSecrets = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingSecrets = requiredSecrets.filter(k => !env[k]);
    if (missingSecrets.length > 0) {
      return json({ error: 'Server misconfiguration: missing secrets', missing: missingSecrets }, { status: 500 });
    }

    // Rate Limiting via Upstash Redis (persistent, fallback to memory)
    // OPTIMIZATION: In-memory rate limiting (saves Upstash commands)
    // Only use Upstash for distributed rate limiting if needed
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
          const resp = await fetch(env.VITE_SUPABASE_URL + '/auth/v1/user', {
            headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token }
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
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
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
          const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
          const logKey = 'ip_log_' + Date.now();
          const spBody = JSON.stringify({ code: logKey, value: JSON.stringify(record), description: 'IP Log' });
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/system_params', { method: 'POST', headers: h, body: spBody });
          return json({ ok: true, ip: ip }, corsHeaders);
        } catch (e) { return json({ error: e.message }, { status: 500, ...corsHeaders }); }
      }
            if (path === '/api/health') {
        const _csrf = generateCSRFToken(); return json({ status: 'ok', timestamp: new Date().toISOString(), storage: 'backblaze-b2', version: '2.2' }, { ...corsHeaders, 'Set-Cookie': 'csrf=' + _csrf + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600' });
      }

      // ─── B2 File proxy ───
      if (path.startsWith('/api/file/')) {
        const fileName = path.replace('/api/file/', '');
        const b2Auth = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
          headers: { 'Authorization': 'Basic ' + btoa(env.B2_KEY_ID + ':' + env.B2_APPLICATION_KEY) }
        });
        const authData = await b2Auth.json();
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
        const search = url.searchParams.get('search');
        const sortParam = url.searchParams.get('sort') || 'newest';
        const allowedSorts = ['newest', 'price', 'sales', 'rating'];
        const sort = allowedSorts.includes(sortParam) ? sortParam : 'newest';
        const rawLimit = parseInt(url.searchParams.get('limit') || '40');
        const limit = isNaN(rawLimit) ? 40 : Math.min(Math.max(rawLimit, 1), 100);
        let q = 'select=*,sellers(name,store_name,logo)&limit=' + limit;
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
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?slug=eq.' + encodeURIComponent(slug) + '&select=*,sellers(*)', { headers: h });
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
        let q = 'select=*';
        if (recommended) q += '&is_recommended=eq.true';
        q += '&limit=20';
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?' + q, { headers: h });
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
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=*,sellers(name,store_name,logo)&order=sales_count.desc&limit=20', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/categories?order=sort_order', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?is_recommended=eq.true&limit=10', { headers: h }).then(r => r.json()),
        ]);
        return json({ products, categories, sellers }, corsHeaders);
      }

      // ─── Seller Registration (AUTH REQUIRED) ───
      if (path === '/api/seller/register' && method === 'POST') {
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
        
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
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
        
        // Verify admin role
        const reqRoleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: h });
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
        
        // Update seller approval status
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?id=eq.' + sellerId, {
          method: 'PATCH',
          headers: h,
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
            headers: h,
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
        
        const reqRoleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: h });
        const reqRoleData = await reqRoleResp.json();
        if (!['ADMIN', 'SUPER_ADMIN'].includes(reqRoleData[0]?.role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?approval_status=eq.pending&order=created_at.desc', { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Checkout (AUTH REQUIRED + PER-USER RATE LIMIT) ───
      if (path === '/api/checkout' && method === 'POST') {
        if (!verifyCSRFToken(request)) return json({ error: 'Invalid CSRF token' }, { status: 403, ...corsHeaders });
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        if (await checkUserRateLimit(user.id)) return json({ error: 'Too many requests. Please wait.' }, { status: 429, ...corsHeaders });

        const body = await request.json();
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
        const orderNo = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        
        // BUG #6 FIX: Validate stock before checkout
        if (body.items?.length) {
          for (const item of body.items) {
            const prodResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=id,stock,name&id=eq.' + item.product_id, {
              headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY }
            });
            const prods = await prodResp.json();
            const product = prods[0];
            if (!product) {
              return json({ error: 'Product not found: ' + item.product_id }, { status: 400, ...corsHeaders });
            }
            if (product.stock !== null && product.stock < item.quantity) {
              return json({ error: 'Insufficient stock for ' + (product.name || item.product_id) + '. Available: ' + product.stock + ', Requested: ' + item.quantity }, { status: 400, ...corsHeaders });
            }
          }
        }

        // SECURITY FIX: Calculate total server-side (never trust client)
        let serverTotal = 0;
        const validatedItems = [];
        if (body.items?.length) {
          for (const item of body.items) {
            const prodResp2 = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=id,price,stock,name&id=eq.' + item.product_id, {
              headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY }
            });
            const prod = (await prodResp2.json())[0];
            if (!prod) return json({ error: 'Product not found: ' + item.product_id }, { status: 400, ...corsHeaders });
            if (prod.stock !== null && prod.stock < item.quantity) {
              return json({ error: 'Insufficient stock for ' + prod.name }, { status: 400, ...corsHeaders });
            }
            serverTotal += prod.price * item.quantity;
            validatedItems.push({ product_id: prod.id, quantity: item.quantity, price: prod.price, name: prod.name });
          }
        }
        // Reject if client total doesn't match server total (price manipulation attempt)
        if (body.total && Math.abs(body.total - serverTotal) > 0.01) {
          return json({ error: 'Price mismatch. Expected: $' + serverTotal.toFixed(2) }, { status: 400, ...corsHeaders });
        }

        const order = {
          user_id: user.id,
          order_no: orderNo,
          status: 'pending',
          total_amount: serverTotal,
          shipping_address: JSON.stringify(body.address),
          payment_method: body.payment_method || 'wallet',
        };
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/orders', {
          method: 'POST', headers: h, body: JSON.stringify(order)
        });
        const orderData = await resp.json();
        if (validatedItems.length) {
          const items = validatedItems.map(i => ({
            order_id: orderData[0]?.id,
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
          }));
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/order_items', {
            method: 'POST', headers: h, body: JSON.stringify(items)
          });
          // FIX: Decrement stock AFTER successful order (using validated items)
          for (const _item of validatedItems) {
            try {
              const _cr = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=stock&id=eq.' + _item.product_id, {
                headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY }
              });
              const _cp = await _cr.json();
              if (_cp[0]?.stock !== null) {
                await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?id=eq.' + _item.product_id, {
                  method: 'PATCH',
                  headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                  body: JSON.stringify({ stock: Math.max(0, _cp[0].stock - _item.quantity) })
                });
              }
            } catch (e) { console.warn('Stock decrement error:', e.message); }
          }
        }
        // Commission calculation after successful order
        if (orderData[0]?.id && validatedItems.length) {
          try {
            const commSettings = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/platform_settings?key=eq.commission_rates&select=value', { headers: h });
            const rates = (await commSettings.json())[0]?.value || { default: 0.05 };
            
            for (const item of validatedItems) {
              const prodDetail = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=seller_id,cost_price,platform_commission_rate&id=eq.' + item.product_id, { headers: h });
              const prod = (await prodDetail.json())[0];
              if (prod?.seller_id) {
                const cogs = prod.cost_price || 0;
                const markup = item.price - cogs;
                const rate = prod.platform_commission_rate || rates.default || 0.05;
                const platformFee = cogs * rate;
                const sellerCommission = Math.max(0, markup - platformFee);
                
                await fetch(env.VITE_SUPABASE_URL + '/rest/v1/commissions', {
                  method: 'POST', headers: h,
                  body: JSON.stringify({
                    seller_id: prod.seller_id,
                    order_id: orderData[0].id,
                    type: 'sale',
                    amount: sellerCommission,
                    status: 'pending'
                  })
                });
              }
            }
          } catch (commErr) { console.warn('Commission calc error:', commErr.message); }
        }

        return json({ order: orderData[0], order_no: orderNo }, corsHeaders);
      }

      // ─── Orders (AUTH REQUIRED) ───
      if (path === '/api/orders' && method === 'GET') {
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

      
      // ─── Admin: System Params (ADMIN ONLY) ───
      if (path === '/api/admin/system-params' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        // Check admin role
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, {
          headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY }
        });
        const roleData = await roleResp.json();
        if (!roleData[0] || !['ADMIN', 'SUPER_ADMIN'].includes(roleData[0].role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/system_params?order=code', { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: All Orders (ADMIN ONLY) ───
      if (path === '/api/admin/orders' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, {
          headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY }
        });
        const roleData = await roleResp.json();
        if (!roleData[0] || !['ADMIN', 'SUPER_ADMIN'].includes(roleData[0].role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/orders?select=*,order_items(*,products(name,images))&order=created_at.desc&limit=' + limit, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: All Users (ADMIN ONLY) ───
      if (path === '/api/admin/users' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, {
          headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY }
        });
        const roleData = await roleResp.json();
        if (!roleData[0] || !['ADMIN', 'SUPER_ADMIN'].includes(roleData[0].role)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=id,email,username,role,created_at&order=created_at.desc&limit=' + limit, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: Change User Role (ADMIN ONLY + AUDIT) ───
      if (path === '/api/admin/change-role' && method === 'POST') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
        
        // Verify requester is ADMIN or SUPER_ADMIN
        const reqRoleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: h });
        const reqRoleData = await reqRoleResp.json();
        const reqRole = reqRoleData[0]?.role;
        
        if (!['ADMIN', 'SUPER_ADMIN'].includes(reqRole)) {
          return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        }
        
        const { userId, newRole, reason } = await request.json();
        
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
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        if (await checkUserRateLimit(user.id)) return json({ error: 'Too many requests' }, { status: 429, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
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
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
        
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
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY };
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
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
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
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payouts', {
          method: 'POST', headers: h,
          body: JSON.stringify({ seller_id: seller.id, amount, method: payMethod, account_details, status: 'pending' })
        });
        
        // Deduct from wallet
        await fetch(env.VITE_SUPABASE_URL + '/rest/v1/seller_wallets?seller_id=eq.' + seller.id, {
          method: 'PATCH', headers: h,
          body: JSON.stringify({ balance: wallet.balance - amount })
        });
        
        return json({ success: true, remaining_balance: wallet.balance - amount }, corsHeaders);
      }

      // ─── Admin: View All Commissions (ADMIN ONLY) ───
      if (path === '/api/admin/commissions' && method === 'GET') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY } });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY };
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const status = url.searchParams.get('status') || '';
        let q = 'select=*,sellers(name,store_name)&order=created_at.desc&limit=' + limit;
        if (status) q += '&status=eq.' + status;
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/commissions?' + q, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: Approve Commission (ADMIN ONLY) ───
      if (path === '/api/admin/commission/approve' && method === 'POST') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY } });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
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
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY } });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY };
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/payouts?select=*,sellers(name,store_name)&order=created_at.desc&limit=50', { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      // ─── Admin: Process Payout (ADMIN ONLY) ───
      if (path === '/api/admin/payout/process' && method === 'POST') {
        const _u = await verifyAuth(request);
        if (!_u) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });
        const roleResp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/users?select=role&id=eq.' + _u.id, { headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY } });
        if (!['ADMIN', 'SUPER_ADMIN'].includes((await roleResp.json())[0]?.role)) return json({ error: 'Admin access required' }, { status: 403, ...corsHeaders });
        
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': '***' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
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


// CSRF Token helpers
function generateCSRFToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function verifyCSRFToken(request) {
  const method = request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;
  const token = request.headers.get('X-CSRF-Token') || '';
  const cookie = (request.headers.get('Cookie') || '').match(/csrf=([^;]+)/);
  if (!token || !cookie) return false;
  return token === cookie[1];
}


function json(data, headers = {}) {
  const { status = 200, ...rest } = headers;
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...rest } });
}

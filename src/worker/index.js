export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const allowedOrigins = ['https://alliancehub.dpdns.org', 'https://alliancehub.pages.dev', 'http://localhost:3000'];
    const origin = request.headers.get('Origin');
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'https://alliancehub.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Token, X-API-Key',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

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

      // ─── Health ───
      if (path === '/api/health') {
        return json({ status: 'ok', timestamp: new Date().toISOString(), storage: 'backblaze-b2', version: '2.1' }, corsHeaders);
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

      // ─── Products ───
      if (path === '/api/products' && method === 'GET') {
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const sort = url.searchParams.get('sort') || 'newest';
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '40'), 100);
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
        const query = url.searchParams.get('q') || '';
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
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const [products, categories, sellers] = await Promise.all([
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=*,sellers(name,store_name,logo)&order=sales_count.desc&limit=20', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/categories?order=sort_order', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?is_recommended=eq.true&limit=10', { headers: h }).then(r => r.json()),
        ]);
        return json({ products, categories, sellers }, corsHeaders);
      }

      // ─── Checkout (AUTH REQUIRED) ───
      if (path === '/api/checkout' && method === 'POST') {
        const user = await verifyAuth(request);
        if (!user) return json({ error: 'Authentication required' }, { status: 401, ...corsHeaders });

        const body = await request.json();
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
        const orderNo = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const order = {
          user_id: user.id,
          order_no: orderNo,
          status: 'pending',
          total_amount: body.total,
          shipping_address: JSON.stringify(body.address),
          payment_method: body.payment_method || 'wallet',
        };
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/orders', {
          method: 'POST', headers: h, body: JSON.stringify(order)
        });
        const orderData = await resp.json();
        if (body.items?.length) {
          const items = body.items.map(i => ({
            order_id: orderData[0]?.id,
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
          }));
          await fetch(env.VITE_SUPABASE_URL + '/rest/v1/order_items', {
            method: 'POST', headers: h, body: JSON.stringify(items)
          });
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

      return json({ error: 'Not found' }, { status: 404, ...corsHeaders });
    } catch (err) {
      console.error('Worker error:', err);
      return json({ error: 'Internal server error' }, { status: 500, ...corsHeaders });
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetch('https://alliancehub-api.absolutus-aeternus.workers.dev/api/health'));
  }
};

function json(data, headers = {}) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...headers } });
}

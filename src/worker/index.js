export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Token',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
      if (path === '/api/health') {
        return json({ status: 'ok', timestamp: new Date().toISOString(), storage: 'backblaze-b2' }, corsHeaders);
      }

      if (path.startsWith('/api/file/')) {
        const fileName = path.replace('/api/file/', '');
        const creds = btoa(env.B2_KEY_ID + ':' + env.B2_APPLICATION_KEY);
        const b2Auth = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
          headers: { 'Authorization': 'Basic ' + creds }
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

      if (path === '/api/upload/presign' && method === 'POST') {
        const body = await request.json();
        const fileName = 'products/' + Date.now() + '-' + body.filename;
        const creds = btoa(env.B2_KEY_ID + ':' + env.B2_APPLICATION_KEY);
        const b2Auth = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
          headers: { 'Authorization': 'Basic ' + creds }
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

      if (path === '/api/products' && method === 'GET') {
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const sort = url.searchParams.get('sort') || 'newest';
        const limit = url.searchParams.get('limit') || '40';
        let q = 'select=*,sellers(name,store_name,logo)&limit=' + limit;
        if (category) q += '&category_id=eq.' + category;
        if (search) q += '&name=ilike.*' + search + '*';
        if (sort === 'price') q += '&order=price.asc';
        else if (sort === 'sales') q += '&order=sales_count.desc';
        else q += '&order=created_at.desc';
        const resp = await fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?' + q, { headers: h });
        return json({ data: await resp.json() }, corsHeaders);
      }

      if (path === '/api/dashboard' && method === 'GET') {
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY };
        const [products, categories, sellers] = await Promise.all([
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/products?select=*,sellers(name,store_name,logo)&order=sales_count.desc&limit=20', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/categories?order=sort_order', { headers: h }).then(r => r.json()),
          fetch(env.VITE_SUPABASE_URL + '/rest/v1/sellers?is_recommended=eq.true&limit=10', { headers: h }).then(r => r.json()),
        ]);
        return json({ products, categories, sellers }, corsHeaders);
      }

      if (path === '/api/cron/daily' && method === 'POST') {
        return json({ status: 'executed', timestamp: new Date().toISOString() }, corsHeaders);
      }

      return json({ error: 'Not found', path }, { status: 404, ...corsHeaders });
    } catch (err) {
      return json({ error: err.message }, { status: 500, ...corsHeaders });
    }
  },

  // Cron trigger handler - Cloudflare memanggil ini sesuai jadwal
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDailyCron(env));
  }
};

async function runDailyCron(env) {
  try {
    // Health check
    await fetch('https://alliancehub-api.absolutus-aeternus.workers.dev/api/health');
    
    // Bisa tambah logic lain di sini:
    // - Cleanup expired sessions
    // - Sync data
    // - Send email digest
  } catch (err) {
    console.error('Cron error:', err);
  }
}

function json(data, headers = {}) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...headers } });
}

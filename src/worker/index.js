export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
      // Health check
      if (path === '/api/health') {
        return json({ status: 'ok', timestamp: new Date().toISOString() }, corsHeaders);
      }

      // Products (from Supabase)
      if (path === '/api/products' && method === 'GET') {
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const anonKey = env.VITE_SUPABASE_ANON_KEY;
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const sort = url.searchParams.get('sort') || 'newest';
        const limit = url.searchParams.get('limit') || '40';

        let query = `select=*,sellers(name,store_name,logo)&limit=${limit}`;
        if (category) query += `&category_id=eq.${category}`;
        if (search) query += `&name=ilike.*${search}*`;
        if (sort === 'price') query += '&order=price.asc';
        else if (sort === 'sales') query += '&order=sales_count.desc';
        else query += '&order=created_at.desc';

        const resp = await fetch(`${supabaseUrl}/rest/v1/products?${query}`, {
          headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
        });
        const data = await resp.json();
        return json({ data }, corsHeaders);
      }

      // Product detail
      if (path.startsWith('/api/product/') && method === 'GET') {
        const slug = path.split('/api/product/')[1];
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const anonKey = env.VITE_SUPABASE_ANON_KEY;
        const resp = await fetch(`${supabaseUrl}/rest/v1/products?slug=eq.${slug}&select=*,sellers(*)`, {
          headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
        });
        const data = await resp.json();
        return json({ data: data[0] || null }, corsHeaders);
      }

      // Dashboard batch
      if (path === '/api/dashboard' && method === 'GET') {
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const anonKey = env.VITE_SUPABASE_ANON_KEY;
        const [products, categories, sellers] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/products?select=*,sellers(name,store_name,logo)&order=sales_count.desc&limit=20`, {
            headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
          }).then(r => r.json()),
          fetch(`${supabaseUrl}/rest/v1/categories?order=sort_order`, {
            headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
          }).then(r => r.json()),
          fetch(`${supabaseUrl}/rest/v1/sellers?is_recommended=eq.true&limit=10`, {
            headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
          }).then(r => r.json()),
        ]);
        return json({ products, categories, sellers }, corsHeaders);
      }

      // Presigned URL for R2 upload
      if (path === '/api/upload/presign' && method === 'POST') {
        const body = await request.json();
        const key = `products/${Date.now()}-${body.filename}`;
        // R2 presigned URL generation would go here
        return json({ key, url: `${env.VITE_R2_PUBLIC_URL}/${key}` }, corsHeaders);
      }

      // Cron daily endpoint
      if (path === '/api/cron/daily' && method === 'POST') {
        const token = request.headers.get('X-Cron-Token');
        if (token !== env.CRON_JOB_TOKEN) {
          return json({ error: 'Unauthorized' }, { status: 401, ...corsHeaders });
        }
        return json({ status: 'cron executed', timestamp: new Date().toISOString() }, corsHeaders);
      }

      // Catch all
      return json({ error: 'Not found', path }, { status: 404, ...corsHeaders });
    } catch (err) {
      return json({ error: err.message }, { status: 500, ...corsHeaders });
    }
  }
};

function json(data, headers = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

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
      // Health
      if (path === '/api/health') {
        return json({ status: 'ok', timestamp: new Date().toISOString(), storage: 'backblaze-b2', bucket: env.B2_BUCKET_NAME }, corsHeaders);
      }

      // Products
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
        return json({ data: await resp.json() }, corsHeaders);
      }

      // Product detail
      if (path.startsWith('/api/product/') && method === 'GET') {
        const slug = path.split('/api/product/')[1];
        const resp = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/products?slug=eq.${slug}&select=*,sellers(*)`, {
          headers: { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}` }
        });
        const data = await resp.json();
        return json({ data: data[0] || null }, corsHeaders);
      }

      // Dashboard
      if (path === '/api/dashboard' && method === 'GET') {
        const h = { 'apikey': env.VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}` };
        const [products, categories, sellers] = await Promise.all([
          fetch(`${env.VITE_SUPABASE_URL}/rest/v1/products?select=*,sellers(name,store_name,logo)&order=sales_count.desc&limit=20`, { headers: h }).then(r => r.json()),
          fetch(`${env.VITE_SUPABASE_URL}/rest/v1/categories?order=sort_order`, { headers: h }).then(r => r.json()),
          fetch(`${env.VITE_SUPABASE_URL}/rest/v1/sellers?is_recommended=eq.true&limit=10`, { headers: h }).then(r => r.json()),
        ]);
        return json({ products, categories, sellers }, corsHeaders);
      }

      // B2 Upload presign
      if (path === '/api/upload/presign' && method === 'POST') {
        const body = await request.json();
        const key = `products/${Date.now()}-${body.filename}`;
        const publicUrl = `https://f005.backblazeb2.com/${env.B2_BUCKET_NAME}/${key}`;
        return json({ key, url: publicUrl }, corsHeaders);
      }

      // Cron daily
      if (path === '/api/cron/daily' && method === 'POST') {
        const token = request.headers.get('X-Cron-Token');
        if (token !== env.CRON_JOB_TOKEN) return json({ error: 'Unauthorized' }, { status: 401, ...corsHeaders });
        return json({ status: 'executed', timestamp: new Date().toISOString() }, corsHeaders);
      }

      return json({ error: 'Not found', path }, { status: 404, ...corsHeaders });
    } catch (err) {
      return json({ error: err.message }, { status: 500, ...corsHeaders });
    }
  }
};
function json(data, headers = {}) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...headers } });
}

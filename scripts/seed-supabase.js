// Seed script for Supabase - 27 sellers + products
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read keys from .env file
const envContent = readFileSync('.env', 'utf8')
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match ? match[1].trim() : ''
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY')

console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseKey.length)

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

const sellers = [
  { store_name: "Equatorial Market", category: "electronics" },
  { store_name: "Archipelago Store", category: "electronics" },
  { store_name: "Apex Tropics", category: "electronics" },
  { store_name: "Pristine Equator", category: "electronics" },
  { store_name: "Horizon Niche", category: "fashion" },
  { store_name: "Loom & Leaf", category: "fashion" },
  { store_name: "Vivid Archipelago", category: "fashion" },
  { store_name: "Meridian Home", category: "home-living" },
  { store_name: "Hearth & Hull", category: "home-living" },
  { store_name: "Tropical Living", category: "home-living" },
  { store_name: "Zenith Tropics", category: "beauty" },
  { store_name: "Java Aroma", category: "beauty" },
  { store_name: "Bloom & Basin", category: "beauty" },
  { store_name: "Urban Tropics", category: "sports" },
  { store_name: "Canopy & Co", category: "sports" },
  { store_name: "Solstice Shop", category: "sports" },
  { store_name: "Oasis Supply", category: "toys-games" },
  { store_name: "Equinox Finds", category: "toys-games" },
  { store_name: "Delta Traders", category: "automotive" },
  { store_name: "Island Forge", category: "automotive" },
  { store_name: "Noble Spice", category: "health" },
  { store_name: "Tropical Harvest", category: "health" },
  { store_name: "Spice Route", category: "books" },
  { store_name: "Kiln & Kettle", category: "jewelry" },
  { store_name: "Craft & Current", category: "jewelry" },
  { store_name: "Emerald Bay Goods", category: "bags" },
  { store_name: "Coastal Studio", category: "pet-supplies" },
]

// Get actual category IDs from database
const { data: dbCategories } = await supabase.from('categories').select('id, slug')
const catIdMap = {}
;(dbCategories || []).forEach(c => { catIdMap[c.slug || c.name?.toLowerCase()] = c.id })
console.log('Category IDs:', catIdMap)

// Get actual seller columns
const { data: existingSeller } = await supabase.from('sellers').select('*').limit(1)
const sellerCols = existingSeller?.[0] ? Object.keys(existingSeller[0]) : []
console.log('Seller columns:', sellerCols)

// Get actual product columns
const { data: existingProduct } = await supabase.from('products').select('*').limit(1)
const productCols = existingProduct?.[0] ? Object.keys(existingProduct[0]) : []
console.log('Product columns:', productCols)

async function seed() {
  console.log('\nLoading products data...')
  const productsData = JSON.parse(readFileSync('scripts/products-data.json', 'utf8'))

  // Step 1: Insert sellers
  console.log('\n=== Inserting 27 sellers ===')
  const sellerMap = {}

  for (let i = 0; i < sellers.length; i++) {
    const s = sellers[i]
    const sid = `b${String(i+1).padStart(7,'0')}-0000-0000-0000-${String(i+1).padStart(12,'0')}`
    const rating = Math.round((4.0 + (i % 10) * 0.1) * 10) / 10
    const followers = 500 + (i * 347) % 9500

    // Build insert data matching actual schema
    const insertData = {
      id: sid,
      name: s.store_name,
      store_name: s.store_name,
      description: `Premium ${s.category.replace('-', ' ')} store offering quality products with fast worldwide shipping.`,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.store_name)}&background=fe2c55&color=fff&size=128&bold=true`,
      rating,
      followers,
      goods_count: 0,
      is_recommended: i < 15,
      status: 'active',
    }

    const { data, error } = await supabase
      .from('sellers')
      .upsert(insertData, { onConflict: 'id' })
      .select()

    if (error) {
      console.log(`  ✗ ${s.store_name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${s.store_name} (${s.category})`)
      sellerMap[s.store_name] = sid
    }
  }

  // Step 2: Insert products
  console.log('\n=== Inserting products ===')
  let totalProducts = 0

  for (const s of sellers) {
    const cat = s.category
    const prods = productsData[cat] || []
    const sellersInCat = sellers.filter(x => x.category === cat)
    const sellerPos = sellersInCat.indexOf(s)
    const chunkSize = Math.max(1, Math.floor(prods.length / sellersInCat.length))
    const start = sellerPos * chunkSize
    const end = sellerPos < sellersInCat.length - 1 ? start + chunkSize : prods.length
    const myProds = prods.slice(start, end)

    for (const p of myProds) {
      const pid = `c${String(totalProducts + 1).padStart(7,'0')}-0000-0000-0000-${String(totalProducts + 1).padStart(12,'0')}`
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)
      const goodsId = `AH-${String(totalProducts + 1).padStart(6, '0')}`
      const catId = catIdMap[cat] || Object.values(catIdMap)[0]

      const insertData = {
        id: pid,
        goods_id: goodsId,
        name: p.name,
        slug,
        description: p.description || '',
        price: p.price,
        original_price: p.original_price || Math.round(p.price * 1.3 * 100) / 100,
        discount: p.discount || 0,
        stock: p.stock || 200,
        sales_count: 50 + (totalProducts * 73) % 5000,
        rating: p.rating || 4.0,
        review_count: p.review_count || 100,
        category_id: catId,
        seller_id: sellerMap[s.store_name],
        images: p.images && p.images.length > 0 ? p.images : [`https://picsum.photos/seed/${slug}/400/400`],
        is_active: true,
        is_recommended: totalProducts % 3 === 0,
        status: 'active',
        specs: {},
      }

      const { error } = await supabase
        .from('products')
        .upsert(insertData, { onConflict: 'id' })
        .select()

      if (error) {
        console.log(`  ✗ ${p.name.slice(0, 40)}: ${error.message}`)
      } else {
        totalProducts++
      }
    }
    console.log(`  ✓ ${s.store_name}: ${myProds.length} products`)
  }

  // Step 3: Update seller goods_count
  console.log('\n=== Updating seller product counts ===')
  for (const s of sellers) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerMap[s.store_name])

    await supabase
      .from('sellers')
      .update({ goods_count: count || 0 })
      .eq('id', sellerMap[s.store_name])
  }

  console.log(`\n✅ Done! ${Object.keys(sellerMap).length} sellers, ${totalProducts} products`)
}

seed().catch(console.error)

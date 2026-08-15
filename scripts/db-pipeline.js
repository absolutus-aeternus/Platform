#!/usr/bin/env node
/**
 * AllianceHub Database Pipeline
 * Usage: SUPABASE_URL=url SUPABASE_KEY=key node scripts/db-pipeline.js
 */
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PRODUCTS = [
  { name: 'Wireless Bluetooth Earbuds Pro ANC', desc: 'Active noise cancelling, 30h battery, IPX5 waterproof', price: 29.99, orig: 59.99, disc: 50, stock: 500, sales: 15234, rating: 4.8, reviews: 234, cat: 'Electronics' },
  { name: 'Smart Watch Ultra Fitness Tracker', desc: 'Heart rate, SpO2, GPS, IP68 waterproof', price: 45.99, orig: 89.99, disc: 49, stock: 300, sales: 8921, rating: 4.6, reviews: 156, cat: 'Electronics' },
  { name: 'Portable Power Bank 20000mAh', desc: 'Fast charging USB-C PD 65W, LED display', price: 19.99, orig: 39.99, disc: 50, stock: 1000, sales: 23456, rating: 4.7, reviews: 412, cat: 'Electronics' },
  { name: 'Mechanical Gaming Keyboard RGB', desc: 'Hot-swappable switches, per-key RGB, aluminum frame', price: 35.99, orig: 69.99, disc: 49, stock: 250, sales: 11234, rating: 4.9, reviews: 189, cat: 'Electronics' },
  { name: 'Korean Skincare Set 5-Piece', desc: 'Toner, essence, cream, serum, cleanser', price: 34.99, orig: 69.99, disc: 50, stock: 150, sales: 41234, rating: 4.9, reviews: 567, cat: 'Beauty' },
  { name: 'Summer Floral Print Maxi Dress', desc: 'Elegant casual beach wear, V-neck, chiffon', price: 22.99, orig: 45.99, disc: 50, stock: 200, sales: 18765, rating: 4.7, reviews: 321, cat: 'Fashion' },
  { name: 'Yoga Mat Non-Slip 6mm', desc: 'Extra thick, TPE eco-friendly, with carry strap', price: 19.99, orig: 39.99, disc: 50, stock: 400, sales: 14567, rating: 4.6, reviews: 234, cat: 'Sports' },
  { name: 'Scented Soy Candle Set', desc: 'Aromatherapy relaxation, 6 scents, gift box', price: 18.99, orig: 36.99, disc: 49, stock: 300, sales: 8765, rating: 4.7, reviews: 145, cat: 'Home & Living' },
  { name: 'Collagen Peptides Powder 500g', desc: 'Unflavored, grass-fed, hydrolyzed', price: 22.99, orig: 45.99, disc: 50, stock: 300, sales: 9876, rating: 4.6, reviews: 156, cat: 'Health' },
  { name: 'Pet Automatic Feeder Timer', desc: 'Programmable, 4L capacity, voice recording', price: 28.99, orig: 57.99, disc: 50, stock: 200, sales: 6543, rating: 4.4, reviews: 98, cat: 'Pet Supplies' },
]

async function run() {
  console.log('🚀 Database Pipeline\n')

  const { count } = await supabase.from('products').select('id', { count: 'exact', head: true })
  console.log(`Current products: ${count || 0}`)

  if ((count || 0) < 10) {
    console.log('Inserting products...')
    const { data: seller } = await supabase.from('sellers').select('id').limit(1).maybeSingle()
    let ok = 0
    for (const p of PRODUCTS) {
      const { data: cat } = await supabase.from('categories').select('id').eq('name', p.cat).maybeSingle()
      const { error } = await supabase.from('products').insert({
        goods_id: `SKU${Date.now()}${ok}`, name: p.name, description: p.desc,
        price: p.price, original_price: p.orig, discount: p.disc,
        stock: p.stock, sales_count: p.sales, rating: p.rating,
        review_count: p.reviews, category_id: cat?.id, seller_id: seller?.id,
        images: [`https://picsum.photos/seed/prod${ok}/400/400`],
        is_recommended: p.sales > 10000, is_active: true,
      })
      if (!error) ok++
    }
    console.log(`✅ Inserted ${ok} products`)
  }

  const { count: final } = await supabase.from('products').select('id', { count: 'exact', head: true })
  console.log(`\nFinal products: ${final || 0}`)
  console.log('🎉 Done!')
}

run().catch(console.error)

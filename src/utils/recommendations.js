// ==================== RECOMMENDATION ENGINE ====================
import { supabase } from '@/services/supabase'

export async function getPersonalizedRecommendations(limit = 12) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Get user's order history to find preferred categories
      const { data: orders } = await supabase
        .from('orders')
        .select('order_items(product_id)')
        .eq('user_id', user.id)
        .limit(10)
      
      // Get popular products as fallback
      const { data: popular } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sales_count', { ascending: false })
        .limit(limit)
      
      return popular || []
    }
    
    // Not logged in: return popular products
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sales_count', { ascending: false })
      .limit(limit)
    
    return data || []
  } catch (e) {
    console.error('Recommendations error:', e)
    return []
  }
}

export async function getSimilarProducts(productId, limit = 8) {
  try {
    // Get current product's category
    const { data: product } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', productId)
      .single()
    
    if (!product) return []
    
    // Get products in same category
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', productId)
      .order('sales_count', { ascending: false })
      .limit(limit)
    
    return data || []
  } catch (e) {
    console.error('Similar products error:', e)
    return []
  }
}

export async function getFrequentlyBoughtTogether(productId, limit = 4) {
  try {
    // Find orders containing this product
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('product_id', productId)
      .limit(50)
    
    if (!orderItems?.length) return []
    
    const orderIds = orderItems.map(i => i.order_id)
    
    // Find other products in those orders
    const { data: otherItems } = await supabase
      .from('order_items')
      .select('product_id, products(*)')
      .in('order_id', orderIds)
      .neq('product_id', productId)
      .limit(limit * 3)
    
    // Count frequency and return top items
    const freq = {}
    ;(otherItems || []).forEach(item => {
      freq[item.product_id] = (freq[item.product_id] || 0) + 1
    })
    
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => otherItems.find(i => i.product_id === id)?.products)
      .filter(Boolean)
    
    return sorted
  } catch (e) {
    console.error('Frequently bought together error:', e)
    return []
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// R2 image URL helper
export function getR2ImageUrl(key, width) {
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL
  if (!publicUrl) return key
  let url = `${publicUrl}/${key}`
  if (width) url += `?width=${width}&format=webp`
  return url
}

// ─── Auth ───
export const signUp = (email, password) => supabase.auth.signUp({ email, password })
export const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
export const signOut = () => supabase.auth.signOut()
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
export const resetPassword = (email) =>
  supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/#/login-password-reset` })

// ─── Products ───
export const fetchProducts = async (params = {}) => {
  let query = supabase.from('products').select('*, sellers(name, store_name, logo)')
  if (params.category) query = query.eq('category_id', params.category)
  if (params.search) query = query.ilike('name', `%${params.search}%`)
  if (params.sort === 'price') query = query.order('price', { ascending: true })
  if (params.sort === 'sales') query = query.order('sales_count', { ascending: false })
  if (params.sort === 'newest') query = query.order('created_at', { ascending: false })
  const { data, error } = await query.limit(params.limit || 40)
  return { data: data || [], error }
}

export const fetchProductById = async (id) => {
  // Try by UUID id first, fallback to slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data, error } = await supabase
    .from('products').select('*, sellers(id, name, store_name, user_id, description, logo, rating)')
    .eq(isUUID ? 'id' : 'slug', id).maybeSingle()
  if (!data && !isUUID) {
    // Also try by id in case slug format matches a UUID
    const { data: data2, error: error2 } = await supabase
      .from('products').select('*, sellers(id, name, store_name, user_id, description, logo, rating)')
      .eq('id', id).maybeSingle()
    return { data: data2, error: error2 }
  }
  return { data, error }
}

// ─── Categories ───
export const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  return { data: data || [], error }
}

// ─── Sellers ───
export const fetchSellers = async (params = {}) => {
  let query = supabase.from('sellers').select('*')
  if (params.recommended) query = query.eq('is_recommended', true)
  if (params.search) query = query.ilike('name', `%${params.search}%`)
  const { data, error } = await query.limit(params.limit || 20)
  return { data: data || [], error }
}

export const fetchSellerById = async (id) => {
  const { data, error } = await supabase.from('sellers').select('*, products(count)').eq('id', id).single()
  return { data, error }
}

// ─── Cart ───
export const fetchCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items').select('*, products(*)').eq('user_id', userId)
  return { data: data || [], error }
}

export const addToCart = async (userId, productId, quantity = 1) => {
  const { data: existing } = await supabase
    .from('cart_items').select('id, quantity').eq('user_id', userId).eq('product_id', productId).maybeSingle()
  if (existing) {
    return supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id).select()
  }
  return supabase.from('cart_items').insert({ user_id: userId, product_id: productId, quantity }).select()
}

export const updateCartQuantity = async (cartItemId, quantity) => {
  if (quantity <= 0) {
    return supabase.from('cart_items').delete().eq('id', cartItemId)
  }
  return supabase.from('cart_items').update({ quantity }).eq('id', cartItemId).select()
}

export const removeFromCart = async (cartItemId) => {
  return supabase.from('cart_items').delete().eq('id', cartItemId)
}

export const clearCart = async (userId) => {
  return supabase.from('cart_items').delete().eq('user_id', userId)
}

// ─── Orders ───
export const createOrder = async (orderData) => {
  const { data, error } = await supabase.from('orders').insert(orderData).select().single()
  return { data, error }
}

export const createOrderItems = async (items) => {
  return supabase.from('order_items').insert(items).select()
}

export const fetchOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders').select('*, order_items(*, products(name, images))').eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export const fetchOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders').select('*, order_items(*, products(name, images, price))').eq('id', orderId).single()
  return { data, error }
}

// ─── Addresses ───
export const fetchAddresses = async (userId) => {
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false })
  return { data: data || [], error }
}

export const createAddress = async (addressData) => {
  return supabase.from('addresses').insert(addressData).select().single()
}

// ─── Favorites ───
export const fetchFavorites = async (userId) => {
  const { data, error } = await supabase.from('favorites').select('*, products(*)').eq('user_id', userId)
  return { data: data || [], error }
}

export const toggleFavorite = async (userId, productId) => {
  const { data: existing } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('product_id', productId).maybeSingle()
  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id)
    return { action: 'removed', error }
  }
  const { error } = await supabase.from('favorites').insert({ user_id: userId, product_id: productId })
  return { action: 'added', error }
}

export const checkIsFavorite = async (userId, productId) => {
  const { data } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('product_id', productId).maybeSingle()
  return !!data
}

// ─── Reviews ───
export const fetchReviews = async (productId) => {
  const { data, error } = await supabase
    .from('evaluations').select('*, users(email, username)').eq('product_id', productId).order('created_at', { ascending: false })
  return { data: data || [], error }
}

export const createReview = async (reviewData) => {
  return supabase.from('evaluations').insert(reviewData).select().single()
}

export const createEvaluation = createReview
export const fetchEvaluations = fetchReviews

// ─── Flash Sales ───
export const fetchFlashSales = async () => {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('flash_sales').select('*, products(*)').lte('start_time', now).gte('end_time', now)
  return { data: data || [], error }
}

// ─── Notifications ───
export const fetchNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
  return { data: data || [], error }
}

// ─── User Profile ───
export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
  return { data, error }
}

export const updateUserProfile = async (userId, updates) => {
  return supabase.from('users').update(updates).eq('id', userId).select().single()
}

// ─── Wallet ───
export const fetchWallet = async (userId) => {
  const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single()
  return { data, error }
}

// ─── Chat ───
export const fetchChatMessages = async (userId, sellerId) => {
  const { data, error } = await supabase
    .from('chat_messages').select('*')
    .or(`and(sender_id.eq.${userId},seller_id.eq.${sellerId}),and(receiver_id.eq.${userId},seller_id.eq.${sellerId})`)
    .order('created_at').limit(100)
  return { data: data || [], error }
}

export const sendMessage = async (messageData) => {
  return supabase.from('chat_messages').insert(messageData).select().single()
}

// ─── Banners ───
export const fetchBanners = async () => {
  const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order')
  const normalized = (data || []).map(b => ({ ...b, image: b.image_url || b.image || '' }))
  return { data: normalized, error }
}

// ─── Search ───
export const searchProducts = async (keyword, filters = {}) => {
  let query = supabase.from('products').select('*, sellers(name)')
  if (keyword) query = query.ilike('name', `%${keyword}%`)
  if (filters.category) query = query.eq('category_id', filters.category)
  if (filters.minPrice) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.sort === 'price') query = query.order('price')
  if (filters.sort === 'sales') query = query.order('sales_count', { ascending: false })
  const { data, error } = await query.limit(filters.limit || 40)
  return { data: data || [], error }
}

// ─── Blockchain Channels ───
export const fetchBlockchainChannels = async () => {
  const { data, error } = await supabase.from('blockchain_channels').select('*').eq('is_active', true)
  return { data: data || [], error }
}

// ─── Wallet Transactions ───
export const createRecharge = async (rechargeData) => {
  return supabase.from('recharges').insert(rechargeData).select().single()
}

export const fetchRecharges = async (userId) => {
  const { data, error } = await supabase.from('recharges').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return { data: data || [], error }
}

export const createWithdrawal = async (withdrawalData) => {
  return supabase.from('withdrawals').insert(withdrawalData).select().single()
}

export const fetchWithdrawals = async (userId) => {
  const { data, error } = await supabase.from('withdrawals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return { data: data || [], error }
}

// ─── Seller Info ───
export const fetchSellerInfo = async (sellerId) => {
  const { data, error } = await supabase.from('sellers').select('*').eq('id', sellerId).single()
  return { data, error }
}

// ─── System Params ───
export const fetchSystemParam = async (code) => {
  const { data, error } = await supabase.from('system_params').select('value').eq('code', code).maybeSingle()
  return { data: data?.value, error }
}

// ─── Order Logs ───
export const logOrderActivity = async (orderId, action, details) => {
  return supabase.from('order_logs').insert({ order_id: orderId, action, details })
}

// ─── Lotteries ───
export const fetchLotteries = async () => {
  const { data, error } = await supabase.from('lotteries').select('*').eq('is_active', true)
  return { data: data || [], error }
}

// ─── Subscribers ───
export const subscribe = async (email, userId) => {
  return supabase.from('subscribers').upsert({ email, user_id: userId })
}

// ─── Top Sellers ───
export const fetchTopSellers = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('id, name, store_name, logo, description, rating, is_recommended')
      .eq('approval_status', 'approved')
      .order('rating', { ascending: false })
      .limit(limit)
    if (error) throw error
    // Fetch follower counts
    const sellersWithCounts = await Promise.all(
      (data || []).map(async (seller) => {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
        return { ...seller, follower_count: count || 0 }
      })
    )
    return { data: sellersWithCounts.sort((a, b) => b.follower_count - a.follower_count), error: null }
  } catch (e) {
    console.error('fetchTopSellers error:', e)
    return { data: [], error: e.message }
  }
}

// ─── Follow / Unfollow Seller ───
export const followSeller = async (userId, sellerId) => {
  try {
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('seller_id', sellerId)
      .maybeSingle()
    if (existing) return { action: 'already_following', error: null }
    const { error } = await supabase
      .from('follows')
      .insert({ user_id: userId, seller_id: sellerId })
    return { action: 'followed', error }
  } catch (e) {
    console.error('followSeller error:', e)
    return { action: null, error: e.message }
  }
}

export const unfollowSeller = async (userId, sellerId) => {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('user_id', userId)
      .eq('seller_id', sellerId)
    return { action: 'unfollowed', error }
  } catch (e) {
    console.error('unfollowSeller error:', e)
    return { action: null, error: e.message }
  }
}

export const isFollowingSeller = async (userId, sellerId) => {
  try {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('seller_id', sellerId)
      .maybeSingle()
    return !!data
  } catch (e) {
    return false
  }
}

export const fetchFollowedSellers = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('seller_id, sellers(id, name, store_name, logo, rating)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data: data || [], error: null }
  } catch (e) {
    console.error('fetchFollowedSellers error:', e)
    return { data: [], error: e.message }
  }
}

// ─── Wishlist ───
export const fetchWishlist = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id, product_id, created_at, products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data: data || [], error: null }
  } catch (e) {
    console.error('fetchWishlist error:', e)
    return { data: [], error: e.message }
  }
}

export const toggleWishlist = async (userId, productId) => {
  try {
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()
    if (existing) {
      const { error } = await supabase.from('wishlists').delete().eq('id', existing.id)
      return { action: 'removed', error }
    }
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId })
    return { action: 'added', error }
  } catch (e) {
    console.error('toggleWishlist error:', e)
    return { action: null, error: e.message }
  }
}

export const isInWishlist = async (userId, productId) => {
  try {
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()
    return !!data
  } catch (e) {
    return false
  }
}

// ─── Coupons ───
export const validateCoupon = async (code, orderTotal) => {
  try {
    const { data, error } = await supabase
      .rpc('validate_coupon', { p_code: code.toUpperCase(), p_order_total: orderTotal })
    if (error) throw error
    const result = data?.[0]
    if (!result?.valid) return { valid: false, error: result?.error_msg || 'Invalid coupon' }
    return {
      valid: true,
      coupon_id: result.coupon_id,
      discount_type: result.discount_type,
      discount_value: result.discount_value,
      discount_amount: result.discount_amount
    }
  } catch (e) {
    console.error('validateCoupon error:', e)
    return { valid: false, error: e.message }
  }
}

// ─── Shipping Estimate ───
export const fetchShippingEstimate = async (sellerId, region = 'domestic') => {
  try {
    let query = supabase
      .from('shipping_rates')
      .select('id, courier, service, rate, estimated_days, region')
      .eq('is_active', true)
      .eq('region', region)
    if (sellerId) {
      query = query.or(`seller_id.eq.${sellerId},seller_id.is.null`)
    } else {
      query = query.is('seller_id', null)
    }
    const { data, error } = await query.order('rate', { ascending: true })
    if (error) throw error
    return { data: data || [], error: null }
  } catch (e) {
    console.error('fetchShippingEstimate error:', e)
    return { data: [], error: e.message }
  }
}

// ─── Product Variants ───
export const fetchProductVariants = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, name, sku, price, stock, attributes')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return { data: data || [], error: null }
  } catch (e) {
    console.error('fetchProductVariants error:', e)
    return { data: [], error: e.message }
  }
}

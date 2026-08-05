import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mfzmdvymqqnrzyrtcmlnn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mem1kdnltcXFucnpyeXRjcm1sbm4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NTk3MTE5MCwiZXhwIjoyMTAxNTI1MTkwfQ.W66Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helpers
export const fetchProducts = async (params = {}) => {
  let query = supabase.from('products').select('*, sellers(name)')
  
  if (params.category) query = query.eq('category_id', params.category)
  if (params.search) query = query.ilike('name', `%${params.search}%`)
  if (params.sort === 'price') query = query.order('price', { ascending: true })
  if (params.sort === 'sales') query = query.order('sales_count', { ascending: false })
  
  const { data, error } = await query.limit(params.limit || 20)
  return { data, error }
}

export const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  return { data, error }
}

export const fetchSellers = async () => {
  const { data, error } = await supabase.from('sellers').select('*').eq('is_recommended', true)
  return { data, error }
}

export const fetchCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId)
  return { data, error }
}

export const addToCart = async (userId, productId, quantity = 1) => {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({ user_id: userId, product_id: productId, quantity })
  return { data, error }
}

export const removeFromCart = async (userId, productId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  return { error }
}

export const fetchAddresses = async (userId) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
  return { data, error }
}

export const fetchOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
  return { data, error }
}

export const fetchWallet = async (userId) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const fetchChatMessages = async (userId) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at')
  return { data, error }
}

export const sendMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(messageData)
  return { data, error }
}

export const fetchFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, products(*)')
    .eq('user_id', userId)
  return { data, error }
}

export const toggleFavorite = async (userId, productId) => {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()
  
  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id)
    return { action: 'removed', error }
  } else {
    const { error } = await supabase.from('favorites').insert({ user_id: userId, product_id: productId })
    return { action: 'added', error }
  }
}

export const fetchNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const fetchBanners = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return { data, error }
}

export const fetchBlockchainChannels = async () => {
  const { data, error } = await supabase
    .from('blockchain_channels')
    .select('*')
    .eq('is_active', true)
  return { data, error }
}

export const fetchSystemParam = async (code) => {
  const { data, error } = await supabase
    .from('system_params')
    .select('value')
    .eq('code', code)
    .single()
  return { data: data?.value, error }
}

// Additional service functions

export const createEvaluation = async (evaluationData) => {
  const { data, error } = await supabase.from('evaluations').insert(evaluationData)
  return { data, error }
}

export const fetchEvaluations = async (productId) => {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*, users(email)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const subscribe = async (email, userId) => {
  const { data, error } = await supabase.from('subscribers').upsert({ email, user_id: userId })
  return { data, error }
}

export const createWithdrawal = async (withdrawalData) => {
  const { data, error } = await supabase.from('withdrawals').insert(withdrawalData)
  return { data, error }
}

export const fetchWithdrawals = async (userId) => {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createRecharge = async (rechargeData) => {
  const { data, error } = await supabase.from('recharges').insert(rechargeData)
  return { data, error }
}

export const fetchRecharges = async (userId) => {
  const { data, error } = await supabase
    .from('recharges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  return { data, error }
}

export const fetchOrderDetail = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), users(email)')
    .eq('id', orderId)
    .single()
  return { data, error }
}

export const logOrderActivity = async (orderId, action, details) => {
  const { data, error } = await supabase.from('order_logs').insert({
    order_id: orderId,
    action,
    details
  })
  return { data, error }
}

export const fetchLotteries = async () => {
  const { data, error } = await supabase
    .from('lotteries')
    .select('*')
    .eq('is_active', true)
  return { data, error }
}

export const updateUserActivity = async (userId, ip, userAgent) => {
  const { data, error } = await supabase.from('user_activity').upsert({
    user_id: userId,
    last_active: new Date().toISOString(),
    ip_address: ip,
    user_agent: userAgent
  })
  return { data, error }
}

export const fetchSellerInfo = async (sellerId) => {
  const { data, error } = await supabase
    .from('sellers')
    .select('*, products(count)')
    .eq('id', sellerId)
    .single()
  return { data, error }
}

export const searchProducts = async (keyword, filters = {}) => {
  let query = supabase.from('products').select('*, sellers(name)')
  if (keyword) query = query.ilike('name', `%${keyword}%`)
  if (filters.category) query = query.eq('category_id', filters.category)
  if (filters.minPrice) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.sort === 'price') query = query.order('price')
  if (filters.sort === 'sales') query = query.order('sales_count', { ascending: false })
  const { data, error } = await query.limit(filters.limit || 20)
  return { data, error }
}

export const searchSellers = async (keyword) => {
  let query = supabase.from('sellers').select('*')
  if (keyword) query = query.ilike('name', `%${keyword}%`)
  const { data, error } = await query.limit(20)
  return { data, error }
}

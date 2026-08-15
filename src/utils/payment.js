// ==================== PAYMENT SERVICE ====================
import { supabase } from '@/services/supabase'

export const PAYMENT_METHODS = [
  { id: 'binance', name: 'Binance Pay', icon: 'fab fa-bitcoin', color: '#F0B90B', type: 'crypto' },
  { id: 'okx', name: 'OKX', icon: 'fas fa-exchange-alt', color: '#00C4B3', type: 'crypto' },
  { id: 'coinbase', name: 'Coinbase', icon: 'fas fa-coins', color: '#0052FF', type: 'crypto' },
  { id: 'metamask', name: 'MetaMask', icon: 'fab fa-ethereum', color: '#F6851B', type: 'crypto' },
  { id: 'kucoin', name: 'KuCoin', icon: 'fas fa-chart-line', color: '#23AFDA', type: 'crypto' },
  { id: 'kraken', name: 'Kraken', icon: 'fas fa-water', color: '#7B61FF', type: 'crypto' },
  { id: 'bitfinex', name: 'Bitfinex', icon: 'fas fa-link', color: '#16B979', type: 'crypto' },
  { id: 'huobi', name: 'Huobi', icon: 'fas fa-fire', color: '#1B6BF0', type: 'crypto' },
]

export function getPaymentMethods() {
  return PAYMENT_METHODS
}

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find(m => m.id === id) || PAYMENT_METHODS[0]
}

export async function processPayment(orderId, amount, method) {
  try {
    // Record payment in database
    const { data, error } = await supabase.from('payments').insert({
      order_id: orderId,
      amount,
      method: method,
      status: 'pending',
      transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    }).select().single()

    if (error) throw error

    // Update order payment status
    await supabase.from('orders').update({
      payment_method: method,
      payment_status: 'paid',
      status: 'paid'
    }).eq('id', orderId)

    return { success: true, payment: data }
  } catch (e) {
    console.error('Payment error:', e)
    return { success: false, error: e.message }
  }
}

export async function getPaymentHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(order_no, total_amount)')
      .in('order_id', 
        (await supabase.from('orders').select('id').eq('user_id', userId)).data?.map(o => o.id) || []
      )
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Payment history error:', e)
    return []
  }
}

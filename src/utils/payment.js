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

// ==================== PAYMENT GATEWAY INTEGRATION STUBS ====================
// These functions provide the interface for integrating with external payment
// gateways (Binance Pay, OKX, Coinbase, MetaMask, etc.).
// Implement each gateway's SDK/API calls in the respective sections.

/**
 * Initiate a payment with the selected gateway.
 * @param {string} orderId - Internal order ID
 * @param {number} amount - Payment amount in USD
 * @param {string} method - Payment method ID (e.g., 'binance', 'okx', 'metamask')
 * @returns {Promise<{success: boolean, paymentUrl?: string, paymentId?: string, error?: string}>}
 */
export async function initiatePayment(orderId, amount, method) {
  try {
    // Record pending payment
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const { data: payment, error } = await supabase.from('payments').insert({
      order_id: orderId,
      amount,
      method,
      status: 'pending',
      transaction_id: transactionId,
      metadata: { initiated_at: new Date().toISOString() }
    }).select().single()

    if (error) throw error

    // Gateway-specific initiation
    // TODO: Replace stubs with real gateway SDK calls
    let paymentUrl = null
    let gatewayPaymentId = null

    switch (method) {
      case 'binance':
        // TODO: Binance Pay API — create merchant order
        // const binanceResp = await binancePay.createOrder({ ... })
        paymentUrl = null // Will be set after gateway integration
        break

      case 'okx':
        // TODO: OKX API — create payment
        paymentUrl = null
        break

      case 'coinbase':
        // TODO: Coinbase Commerce — create charge
        paymentUrl = null
        break

      case 'metamask':
        // MetaMask: client-side transaction, no server URL needed
        // Return contract/recipient details for the client to initiate
        paymentUrl = null
        break

      case 'kucoin':
      case 'kraken':
      case 'bitfinex':
      case 'huobi':
        // TODO: Implement other gateway integrations
        paymentUrl = null
        break

      default:
        return { success: false, error: `Unsupported payment method: ${method}` }
    }

    return {
      success: true,
      paymentId: payment.id,
      transactionId,
      paymentUrl,
      gatewayPaymentId
    }
  } catch (e) {
    console.error('initiatePayment error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Verify a payment status with the gateway.
 * @param {string} paymentId - Internal payment record ID
 * @returns {Promise<{success: boolean, status?: string, verified?: boolean, error?: string}>}
 */
export async function verifyPayment(paymentId) {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
 .select('*, orders(id, status)')
      .eq('id', paymentId)
      .single()

    if (error || !payment) return { success: false, error: 'Payment not found' }

    // Already confirmed
    if (payment.status === 'completed') {
      return { success: true, status: 'completed', verified: true }
    }

    // Gateway-specific verification
    // TODO: Replace stubs with real gateway API calls
    let gatewayStatus = 'pending'

    switch (payment.method) {
      case 'binance':
        // TODO: Query Binance Pay order status
        // const status = await binancePay.queryOrder({ ... })
        gatewayStatus = 'pending'
        break

      case 'okx':
        // TODO: Query OKX payment status
        gatewayStatus = 'pending'
        break

      case 'coinbase':
        // TODO: Query Coinbase Commerce charge status
        gatewayStatus = 'pending'
        break

      case 'metamask':
        // MetaMask: verify on-chain transaction
        // TODO: Verify transaction hash on blockchain
        gatewayStatus = 'pending'
        break

      default:
        gatewayStatus = 'pending'
    }

    // Update payment status if gateway confirms
    if (gatewayStatus === 'completed' || gatewayStatus === 'confirmed') {
      await supabase.from('payments').update({
        status: 'completed',
        verified_at: new Date().toISOString()
      }).eq('id', paymentId)

      // Update order status
      if (payment.order_id) {
        await supabase.from('orders').update({
          payment_status: 'paid',
          status: 'paid'
        }).eq('id', payment.order_id)
      }
    }

    return { success: true, status: gatewayStatus, verified: gatewayStatus === 'completed' }
  } catch (e) {
    console.error('verifyPayment error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Handle payment callback/webhook from gateway.
 * @param {object} callbackData - Raw callback payload from the payment gateway
 * @returns {Promise<{success: boolean, processed?: boolean, error?: string}>}
 */
export async function handlePaymentCallback(callbackData) {
  try {
    // Extract transaction reference from callback
    const transactionId = callbackData.transaction_id || callbackData.orderId || callbackData.id
    const status = callbackData.status || callbackData.event || 'unknown'

    if (!transactionId) {
      return { success: false, error: 'Missing transaction reference in callback' }
    }

    // Find the payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, order_id, status, method')
      .eq('transaction_id', transactionId)
      .single()

    if (error || !payment) {
      console.warn('Payment not found for callback:', transactionId)
      return { success: false, error: 'Payment not found' }
    }

    // Skip if already processed
    if (payment.status === 'completed') {
      return { success: true, processed: false, error: 'Already processed' }
    }

    // Map gateway status to internal status
    let internalStatus = 'pending'
    const successStatuses = ['completed', 'confirmed', 'success', 'paid', 'SETTLED']
    const failedStatuses = ['failed', 'cancelled', 'expired', 'error', 'REJECTED']

    if (successStatuses.includes(status)) {
      internalStatus = 'completed'
    } else if (failedStatuses.includes(status)) {
      internalStatus = 'failed'
    }

    // Update payment
    await supabase.from('payments').update({
      status: internalStatus,
      verified_at: internalStatus === 'completed' ? new Date().toISOString() : null,
      metadata: { callback_received_at: new Date().toISOString(), gateway_status: status }
    }).eq('id', payment.id)

    // Update order on successful payment
    if (internalStatus === 'completed' && payment.order_id) {
      await supabase.from('orders').update({
        payment_status: 'paid',
        status: 'paid'
      }).eq('id', payment.order_id)
    }

    return { success: true, processed: true, status: internalStatus }
  } catch (e) {
    console.error('handlePaymentCallback error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Get available payment methods with their current status.
 * @returns {Array} List of available payment methods
 */
export function getAvailablePaymentMethods() {
  return PAYMENT_METHODS.map(m => ({
    ...m,
    available: true, // TODO: Check gateway availability
    minAmount: m.type === 'crypto' ? 1 : 5,
    maxAmount: 10000,
    processingTime: m.type === 'crypto' ? '~10-30 min' : 'Instant'
  }))
}

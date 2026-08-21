// ==================== PAYMENT SERVICE ====================
// Payment flow: Initiate → User Pays → Webhook Confirms → Order Updated
// NEVER auto-mark as paid without gateway verification

import { supabase } from '@/services/supabase'
import { apiFetch } from '@/utils/csrf'

export const PAYMENT_METHODS = [
  { id: 'binance', name: 'Binance Pay', icon: 'fab fa-bitcoin', color: '#F0B90B', type: 'crypto', available: true },
  { id: 'okx', name: 'OKX', icon: 'fas fa-exchange-alt', color: '#00C4B3', type: 'crypto', available: true },
  { id: 'coinbase', name: 'Coinbase', icon: 'fas fa-coins', color: '#0052FF', type: 'crypto', available: true },
  { id: 'metamask', name: 'MetaMask', icon: 'fab fa-ethereum', color: '#F6851B', type: 'crypto', available: true },
  { id: 'wallet', name: 'Wallet Balance', icon: 'fas fa-wallet', color: '#4CAF50', type: 'wallet', available: true },
]

export function getPaymentMethods() {
  return PAYMENT_METHODS
}

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find(m => m.id === id) || PAYMENT_METHODS[0]
}

/**
 * Initiate a payment — creates a pending payment record.
 * Does NOT mark order as paid. That happens only after webhook verification.
 * 
 * @param {string} orderId - Internal order ID
 * @param {number} amount - Payment amount in USD
 * @param {string} method - Payment method ID
 * @returns {Promise<{success: boolean, paymentId?: string, paymentUrl?: string, error?: string}>}
 */
export async function initiatePayment(orderId, amount, method) {
  try {
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Record pending payment
    const { data: payment, error } = await supabase.from('payments').insert({
      order_id: orderId,
      amount,
      method,
      status: 'pending',
      transaction_id: transactionId,
      metadata: {
        initiated_at: new Date().toISOString(),
        gateway: method
      }
    }).select().single()

    if (error) throw error

    // For wallet payments, process immediately (internal balance)
    if (method === 'wallet') {
      return await processWalletPayment(orderId, amount, payment.id)
    }

    // For external gateways, return payment details for user to complete
    // The actual gateway integration happens server-side or via redirect
    return {
      success: true,
      paymentId: payment.id,
      transactionId,
      status: 'pending',
      message: 'Please complete payment using the selected method.'
    }
  } catch (e) {
    console.error('initiatePayment error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Process wallet payment — deduct from user's wallet balance.
 * This is the only method that can complete immediately (internal system).
 */
async function processWalletPayment(orderId, amount, paymentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Check wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet || wallet.balance < amount) {
      // Mark payment as failed
      await supabase.from('payments').update({
        status: 'failed',
        metadata: { error: 'Insufficient balance', attempted_at: new Date().toISOString() }
      }).eq('id', paymentId)

      return { success: false, error: 'Insufficient wallet balance' }
    }

    // Deduct from wallet
    const { error: deductError } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance - amount })
      .eq('id', wallet.id)

    if (deductError) throw deductError

    // Mark payment as completed
    await supabase.from('payments').update({
      status: 'completed',
      verified_at: new Date().toISOString(),
      metadata: { method: 'wallet', completed_at: new Date().toISOString() }
    }).eq('id', paymentId)

    // Update order status
    await supabase.from('orders').update({
      payment_method: 'wallet',
      payment_status: 'paid',
      status: 'paid'
    }).eq('id', orderId)

    return { success: true, paymentId, status: 'completed' }
  } catch (e) {
    console.error('processWalletPayment error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Verify payment status — checks with the gateway.
 * Called by webhook or manual verification.
 * 
 * @param {string} paymentId - Internal payment record ID
 * @returns {Promise<{success: boolean, status?: string, verified?: boolean}>}
 */
export async function verifyPayment(paymentId) {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, orders(id, status)')
      .eq('id', paymentId)
      .single()

    if (error || !payment) return { success: false, error: 'Payment not found' }
    if (payment.status === 'completed') return { success: true, status: 'completed', verified: true }

    // For external gateways, verification happens via webhook
    // This function returns current status for polling
    return {
      success: true,
      status: payment.status,
      verified: payment.status === 'completed',
      method: payment.method
    }
  } catch (e) {
    console.error('verifyPayment error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Handle payment webhook callback from gateway.
 * This is the ONLY way external payments should be marked as completed.
 * 
 * @param {string} gateway - Gateway name ('binance', 'okx', 'coinbase', etc.)
 * @param {object} payload - Raw webhook payload
 * @param {string} signature - Webhook signature for verification
 * @returns {Promise<{success: boolean, processed?: boolean}>}
 */
export async function handlePaymentWebhook(gateway, payload, signature) {
  try {
    // Verify webhook signature (gateway-specific)
    const isValid = await verifyWebhookSignature(gateway, payload, signature)
    if (!isValid) return { success: false, error: 'Invalid webhook signature' }

    const transactionId = payload.transaction_id || payload.orderId || payload.id
    const status = payload.status || payload.event || 'unknown'

    if (!transactionId) return { success: false, error: 'Missing transaction reference' }

    // Find payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, order_id, status, method')
      .eq('transaction_id', transactionId)
      .single()

    if (error || !payment) return { success: false, error: 'Payment not found' }
    if (payment.status === 'completed') return { success: true, processed: false }

    // Map gateway status to internal status
    const successStatuses = ['completed', 'confirmed', 'success', 'paid', 'SETTLED']
    const failedStatuses = ['failed', 'cancelled', 'expired', 'error', 'REJECTED']

    let internalStatus = 'pending'
    if (successStatuses.includes(status)) internalStatus = 'completed'
    else if (failedStatuses.includes(status)) internalStatus = 'failed'

    // Update payment
    await supabase.from('payments').update({
      status: internalStatus,
      verified_at: internalStatus === 'completed' ? new Date().toISOString() : null,
      metadata: {
        webhook_received_at: new Date().toISOString(),
        gateway_status: status,
        gateway
      }
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
    console.error('handlePaymentWebhook error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Verify webhook signature (gateway-specific)
 */
async function verifyWebhookSignature(gateway, payload, signature) {
  // TODO: Implement per-gateway signature verification
  // For now, log and accept (INSECURE — implement before production)
  console.warn(`[Payment] Webhook signature verification not implemented for ${gateway}`)
  return true
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId) {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)

    if (!orders?.length) return []

    const orderIds = orders.map(o => o.id)
    const { data: payments } = await supabase
      .from('payments')
      .select('*, orders(order_no, total_amount)')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false })

    return payments || []
  } catch (e) {
    console.error('getPaymentHistory error:', e)
    return []
  }
}

/**
 * Get available payment methods with current status
 */
export function getAvailablePaymentMethods() {
  return PAYMENT_METHODS.map(m => ({
    ...m,
    minAmount: m.type === 'wallet' ? 0.01 : 1,
    maxAmount: 10000,
    processingTime: m.type === 'wallet' ? 'Instant' : '~10-30 min'
  }))
}

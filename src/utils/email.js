// ==================== EMAIL SERVICE ====================
// Sends emails via Cloudflare Worker → Resend API
// API key is stored securely in Worker environment, never exposed to client

import { supabase } from '@/services/supabase'
import { apiFetch } from '@/utils/csrf'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev'

/**
 * Send an email via the worker API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendEmail(to, subject, html) {
  try {
    const resp = await apiFetch('/api/email/send', {
      method: 'POST',
      body: JSON.stringify({ to, subject, html })
    })
    const data = await resp.json()
    if (!resp.ok) return { success: false, error: data.error }
    return { success: true, id: data.id }
  } catch (e) {
    console.error('sendEmail error:', e)
    return { success: false, error: e.message }
  }
}

export async function sendOrderConfirmation(orderId) {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (!order) return { success: false, error: 'Order not found' }

    const { data: user } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', order.user_id)
      .single()

    if (!user?.email) return { success: false, error: 'User email not found' }

    const itemsList = (order.order_items || []).map(item => 
      `<li>${item.products?.name || 'Product'} × ${item.quantity} — $${item.price}</li>`
    ).join('')

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Hi ${user.username || 'there'},</p>
        <p>Your order <strong>#${order.order_no}</strong> has been placed successfully!</p>
        <h3>Order Details:</h3>
        <ul>${itemsList}</ul>
        <p><strong>Total: $${order.total_amount}</strong></p>
        <p>Status: ${order.status}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">AllianceHub — Your Global Marketplace</p>
      </div>
    `

    return await sendEmail(user.email, `Order #${order.order_no} Confirmed — AllianceHub`, html)
  } catch (e) {
    console.error('Send order confirmation error:', e)
    return { success: false, error: e.message }
  }
}

export async function sendShippingNotification(orderId, trackingNumber, carrier) {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('user_id, order_no')
      .eq('id', orderId)
      .single()

    if (!order) return { success: false }

    const { data: user } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', order.user_id)
      .single()

    if (!user?.email) return { success: false }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Order Has Shipped! 🚚</h2>
        <p>Hi ${user.username || 'there'},</p>
        <p>Your order <strong>#${order.order_no}</strong> is on its way!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Carrier:</strong> ${carrier}</p>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        </div>
        <p>You can track your package using the tracking number above.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">AllianceHub — Your Global Marketplace</p>
      </div>
    `

    return await sendEmail(user.email, `Order #${order.order_no} Shipped — AllianceHub`, html)
  } catch (e) {
    console.error('Send shipping notification error:', e)
    return { success: false }
  }
}

export async function sendPasswordReset(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/login-password-reset`
    })

    if (error) throw error
    return { success: true }
  } catch (e) {
    console.error('Send password reset error:', e)
    return { success: false, error: e.message }
  }
}

export async function sendWelcomeEmail(userId) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single()

    if (!user?.email) return { success: false }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to AllianceHub! 🎉</h2>
        <p>Hi ${user.username || 'there'},</p>
        <p>Your account has been created successfully. Here's what you can do:</p>
        <ul>
          <li>Browse thousands of products from global sellers</li>
          <li>Track your orders in real-time</li>
          <li>Earn rewards through reviews and referrals</li>
          <li>Become a seller and reach customers worldwide</li>
        </ul>
        <p>Start shopping now!</p>
        <a href="${window.location.origin}" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0;">Visit AllianceHub</a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">AllianceHub — Your Global Marketplace</p>
      </div>
    `

    return await sendEmail(user.email, 'Welcome to AllianceHub! 🎉', html)
  } catch (e) {
    console.error('Send welcome email error:', e)
    return { success: false, error: e.message }
  }
}

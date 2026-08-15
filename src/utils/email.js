// ==================== EMAIL SERVICE ====================
import { supabase } from '@/services/supabase'

export async function sendOrderConfirmation(orderId) {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (!order) return { success: false, error: 'Order not found' }

    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', order.user_id)
      .single()

    if (!user?.email) return { success: false, error: 'User email not found' }

    // In production, call Supabase Edge Function or email API
    console.log(`[Email] Order confirmation sent to ${user.email} for order ${order.order_no}`)
    
    return { success: true }
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
      .select('email')
      .eq('id', order.user_id)
      .single()

    if (!user?.email) return { success: false }

    console.log(`[Email] Shipping notification sent to ${user.email} - Tracking: ${trackingNumber}`)
    
    return { success: true }
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

    console.log(`[Email] Welcome email sent to ${user.email}`)
    
    return { success: true }
  } catch (e) {
    console.error('Send welcome email error:', e)
    return { success: false }
  }
}

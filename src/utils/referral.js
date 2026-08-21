// ==================== REFERRAL SERVICE ====================
import { supabase } from '@/services/supabase'

export async function generateReferralCode(userId) {
  try {
    // Check if user already has a code
    const { data: existing } = await supabase
      .from('referrals')
      .select('code')
      .eq('user_id', userId)
      .single()

    if (existing) return existing.code

    // Generate new code
    const code = 'AH-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await supabase.from('referrals').insert({
      user_id: userId,
      code,
      type: 'referral',
    })

    if (error) throw error
    return code
  } catch (e) {
    console.error('Generate referral code error:', e)
    return null
  }
}

export async function applyReferralCode(userId, code) {
  try {
    // Find the referral
    const { data: referral } = await supabase
      .from('referrals')
      .select('id, user_id')
      .eq('code', code.toUpperCase())
      .single()

    if (!referral) return { success: false, error: 'Invalid referral code' }
    if (referral.user_id === userId) return { success: false, error: 'Cannot use your own referral code' }

    // Check if already used
    const { data: existing } = await supabase
      .from('referral_uses')
      .select('id')
      .eq('referred_id', userId)
      .single()

    if (existing) return { success: false, error: 'You have already used a referral code' }

    // Record the referral use
    const { error } = await supabase.from('referral_uses').insert({
      referrer_id: referral.user_id,
      referred_id: userId,
      code: code.toUpperCase(),
      status: 'completed',
      reward_amount: 5.00,
      completed_at: new Date().toISOString()
    })

    if (error) throw error

    // Add reward to referrer's wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', referral.user_id)
      .single()

    if (wallet) {
      await supabase.from('wallets').update({
        balance: parseFloat(wallet.balance || 0) + 5.00
      }).eq('id', wallet.id)
    }

    // Add coins to referred user (profiles table was renamed to users in migration 011)
    // Note: coins column may not exist — use system_params or wallet instead
    try {
      const { data: referredWallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', userId)
        .single()
      if (referredWallet) {
        await supabase.from('wallets').update({
          balance: parseFloat(referredWallet.balance || 0) + 100
        }).eq('id', referredWallet.id)
      }
    } catch (e) {
      console.warn('Failed to add referral coins:', e.message)
    }

    return { success: true, reward: 5.00 }
  } catch (e) {
    console.error('Apply referral code error:', e)
    return { success: false, error: e.message }
  }
}

export async function getReferralStats(userId) {
  try {
    const { data: referrals } = await supabase
      .from('referral_uses')
      .select('*')
      .eq('referrer_id', userId)
      .eq('status', 'completed')

    const totalEarned = (referrals || []).reduce((sum, r) => sum + parseFloat(r.reward_amount || 0), 0)

    return {
      totalReferrals: referrals?.length || 0,
      totalEarned,
      referrals: referrals || []
    }
  } catch (e) {
    console.error('Referral stats error:', e)
    return { totalReferrals: 0, totalEarned: 0, referrals: [] }
  }
}

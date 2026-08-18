/**
 * useFeatureFlags — Read feature flags from system_params
 * 
 * Super Admin can control which features are enabled/disabled
 * for Admin panel and global platform.
 * 
 * Usage:
 *   const { isEnabled, loadFlags, flags } = useFeatureFlags()
 *   if (isEnabled('admin_products_manage')) { ... }
 */

import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

const flags = ref({})
const loaded = ref(false)
const loading = ref(false)

// Default flag values (fallback if DB is empty)
const DEFAULTS = {
  // Global flags
  maintenance_mode: false,
  registration_open: true,
  guest_checkout: false,
  dark_mode: false,
  chat_enabled: true,
  reviews_enabled: true,
  flash_sales: true,
  algolia_search: true,
  push_notifications: true,
  clarity_tracking: true,

  // Admin restriction flags (Super Admin controls these)
  admin_products_manage: true,
  admin_products_create: true,
  admin_products_delete: true,
  admin_orders_manage: true,
  admin_orders_refund: true,
  admin_sellers_approve: true,
  admin_categories_manage: true,
  admin_banners_manage: true,
  admin_coupons_manage: true,
  admin_wallets_view: true,
  admin_withdrawals_process: true,
  admin_chat_access: true,
  admin_reports_view: true,
  admin_notifications_send: true,
  admin_customers_view: true,
  admin_transactions_view: true,
  admin_recharges_manage: true,
  admin_scraper_access: true,
  admin_logs_view: true,
  admin_blockchain_view: true,
  admin_settings_manage: true,
}

export function useFeatureFlags() {
  const loadFlags = async () => {
    if (loaded.value || loading.value) return
    loading.value = true
    
    try {
      const { data } = await supabase
        .from('system_params')
        .select('code, value')
        .like('code', 'flag_%')
      
      if (data) {
        const result = {}
        data.forEach(p => {
          const key = p.code.replace('flag_', '')
          result[key] = p.value === 'true'
        })
        // Merge with defaults
        flags.value = { ...DEFAULTS, ...result }
      } else {
        flags.value = { ...DEFAULTS }
      }
      loaded.value = true
    } catch (e) {
      console.warn('[FeatureFlags] Load failed, using defaults:', e.message)
      flags.value = { ...DEFAULTS }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const isEnabled = (key) => {
    return flags.value[key] !== false // default to true if not set
  }

  const isDisabled = (key) => {
    return flags.value[key] === false
  }

  const setFlag = async (key, value) => {
    flags.value[key] = value
    try {
      await supabase
        .from('system_params')
        .upsert({ code: 'flag_' + key, value: String(value) }, { onConflict: 'code' })
    } catch (e) {
      console.error('[FeatureFlags] Save failed:', e.message)
    }
  }

  // Get all admin restriction flags
  const adminRestrictions = computed(() => {
    const restrictions = {}
    for (const [key, value] of Object.entries(flags.value)) {
      if (key.startsWith('admin_')) {
        restrictions[key] = value
      }
    }
    return restrictions
  })

  // Check if admin has access to specific feature
  const adminCan = (feature) => {
    return isEnabled('admin_' + feature)
  }

  return {
    flags,
    loaded,
    loading,
    loadFlags,
    isEnabled,
    isDisabled,
    setFlag,
    adminRestrictions,
    adminCan,
  }
}

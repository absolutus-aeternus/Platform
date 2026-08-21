<template>
  <div class="page-wrapper">
  <div v-if="loading" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--brand-primary, #FF9900)"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="sa-page">
    <div class="sa-header">
      <h1><i class="fas fa-flag"></i> Feature Flags</h1>
      <button class="btn-primary" @click="saveFlags"><i class="fas fa-save"></i> Save Changes</button>
    </div>

    <div class="section-card">
      <div class="flag-list">
        <div class="flag-item" v-for="flag in flags" :key="flag.key">
          <div class="flag-info">
            <div class="flag-name">{{ flag.label }}</div>
            <div class="flag-desc">{{ flag.description }}</div>
          </div>
          <button :class="flag.enabled ? 'toggle-on' : 'toggle-off'" @click="flag.enabled = !flag.enabled">
            {{ flag.enabled ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { ref, onMounted } from 'vue'
const loading = ref(true)
import { supabase } from '@/services/supabase'

const flags = ref([
  { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Show maintenance page to all users', enabled: false },
  { key: 'registration_open', label: 'Open Registration', description: 'Allow new user registration', enabled: true },
  { key: 'guest_checkout', label: 'Guest Checkout', description: 'Allow checkout without account', enabled: false },
  { key: 'dark_mode', label: 'Dark Mode', description: 'Enable dark mode toggle', enabled: false },
  { key: 'chat_enabled', label: 'Live Chat', description: 'Enable buyer-seller chat', enabled: true },
  { key: 'reviews_enabled', label: 'Product Reviews', description: 'Allow product reviews', enabled: true },
  { key: 'flash_sales', label: 'Flash Sales', description: 'Enable flash sale feature', enabled: true },
  { key: 'algolia_search', label: 'Algolia Search', description: 'Use Algolia for search', enabled: true },
  { key: 'push_notifications', label: 'Push Notifications', description: 'OneSignal web push', enabled: true },
  { key: 'clarity_tracking', label: 'MS Clarity', description: 'Microsoft Clarity analytics', enabled: true },
])

const loadFlags = async () => {
  try {
    const { data } = await supabase.from('system_params').select('*').like('code', 'flag_%')
    if (data) {
      data.forEach(p => {
        const f = flags.value.find(f => 'flag_' + f.key === p.code)
        if (f) f.enabled = p.value === 'true'
      })
    }
  loading.value = false
  } catch (e) { console.error('Feature flags error:', e) }
}

const saveFlags = async () => {
  for (const f of flags.value) {
    await supabase.from('system_params').upsert({ code: 'flag_' + f.key, value: String(f.enabled) }, { onConflict: 'code' })
  }
  window.__toast?.show('Feature flags saved!', 'success')
}

onMounted(loadFlags)
</template>

</script>

<style scoped>
header { z-index: 2; }
.sa-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
.sa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.sa-header h1 { font-size: 24px; color: #1a1a2e; display: flex; align-items: center; gap: 10px; }
.section-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.flag-list { display: flex; flex-direction: column; gap: 4px; }
.flag-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-radius: 8px; background: #f8f9fa; }
.flag-name { font-weight: 600; font-size: 14px; color: #1a1a2e; }
.flag-desc { font-size: 12px; color: #888; margin-top: 2px; }
.toggle-on { padding: 8px 20px; border: none; border-radius: 20px; background: #00b894; color: #fff; font-weight: 700; cursor: pointer; }
.toggle-off { padding: 8px 20px; border: none; border-radius: 20px; background: #ddd; color: #666; font-weight: 700; cursor: pointer; }
.btn-primary { padding: 10px 20px; background: #6c5ce7; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
@media (max-width: 768px) {
  .sa-page { padding: 16px; }
  .sa-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .sa-header h1 { font-size: 20px; }
  .flag-item { flex-direction: column; align-items: flex-start; gap: 10px; padding: 12px; }
  .flag-name { font-size: 13px; }
}
</style>
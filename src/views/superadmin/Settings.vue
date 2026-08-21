<template>
  <div class="page-wrapper">
  <div v-if="loading" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--brand-primary, #FF9900)"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="sa-page">
    <div class="sa-header">
      <h1><i class="fas fa-cogs"></i> System Settings</h1>
      <button class="btn-primary" @click="saveSettings"><i class="fas fa-save"></i> Save All</button>
    </div>

    <div class="settings-grid">
      <!-- General -->
      <div class="section-card">
        <h3><i class="fas fa-globe"></i> General</h3>
        <div class="form-group"><label>Site Name</label><input v-model="settings.siteName"></div>
        <div class="form-group"><label>Site URL</label><input v-model="settings.siteUrl"></div>
        <div class="form-group"><label>Support Email</label><input v-model="settings.supportEmail"></div>
        <div class="form-group"><label>Default Language</label>
          <select v-model="settings.language"><option>English</option><option>Indonesia</option><option>中文</option></select>
        </div>
      </div>

      <!-- Maintenance -->
      <div class="section-card">
        <h3><i class="fas fa-tools"></i> Maintenance</h3>
        <div class="toggle-group">
          <label>Maintenance Mode</label>
          <button :class="settings.maintenance ? 'toggle-on' : 'toggle-off'" @click="settings.maintenance = !settings.maintenance">
            {{ settings.maintenance ? 'ON' : 'OFF' }}
          </button>
        </div>
        <div class="toggle-group">
          <label>Registration Open</label>
          <button :class="settings.registration ? 'toggle-on' : 'toggle-off'" @click="settings.registration = !settings.registration">
            {{ settings.registration ? 'ON' : 'OFF' }}
          </button>
        </div>
        <div class="toggle-group">
          <label>Guest Browsing</label>
          <button :class="settings.guestBrowsing ? 'toggle-on' : 'toggle-off'" @click="settings.guestBrowsing = !settings.guestBrowsing">
            {{ settings.guestBrowsing ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>

      <!-- Limits -->
      <div class="section-card">
        <h3><i class="fas fa-sliders-h"></i> Limits</h3>
        <div class="form-group"><label>Max Products per Seller</label><input v-model.number="settings.maxProducts" type="number"></div>
        <div class="form-group"><label>Max Upload Size (MB)</label><input v-model.number="settings.maxUpload" type="number"></div>
        <div class="form-group"><label>Rate Limit (req/min)</label><input v-model.number="settings.rateLimit" type="number"></div>
      </div>

      <!-- SEO -->
      <div class="section-card">
        <h3><i class="fas fa-search"></i> SEO</h3>
        <div class="form-group"><label>Meta Title</label><input v-model="settings.metaTitle"></div>
        <div class="form-group"><label>Meta Description</label><textarea v-model="settings.metaDescription" rows="3"></textarea></div>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { ref, onMounted } from 'vue'
const loading = ref(true)
import { supabase } from '@/services/supabase'

const settings = ref({
  siteName: 'AllianceHub', siteUrl: 'https://alliancehub.dpdns.org',
  supportEmail: 'support@alliancehub.com', language: 'English',
  maintenance: false, registration: true, guestBrowsing: true,
  maxProducts: 1000, maxUpload: 10, rateLimit: 60,
  metaTitle: 'AllianceHub - Partner Global Dropshippers',
  metaDescription: 'Your one-stop dropshipping marketplace'
})

const loadSettings = async () => {
  const { data } = await supabase.from('system_params').select('*')
  if (data) {
    data.forEach(p => {
      if (p.code && p.value) {
        try { settings.value[p.code] = JSON.parse(p.value) } catch { settings.value[p.code] = p.value }
      }
    })
  }
  loading.value = false
}

const saveSettings = async () => {
  for (const [k, v] of Object.entries(settings.value)) {
    await supabase.from('system_params').upsert({ code: k, value: JSON.stringify(v) }, { onConflict: 'code' })
  }
  window.__toast?.show('Settings saved!', 'success')
}

onMounted(loadSettings)
</template>

</script>

<style scoped>
header { z-index: 2; }
.sa-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
.sa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.sa-header h1 { font-size: 24px; color: #1a1a2e; display: flex; align-items: center; gap: 10px; }
.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
.section-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.section-card h3 { font-size: 16px; color: #1a1a2e; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section-card h3 i { color: #6c5ce7; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; margin-bottom: 4px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.toggle-group { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.toggle-group label { font-size: 14px; color: #444; }
.toggle-on { padding: 6px 16px; border: none; border-radius: 20px; background: #00b894; color: #fff; font-weight: 700; cursor: pointer; }
.toggle-off { padding: 6px 16px; border: none; border-radius: 20px; background: #ddd; color: #666; font-weight: 700; cursor: pointer; }
.btn-primary { padding: 10px 20px; background: #6c5ce7; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }

@media (max-width: 768px) {
  .sa-page { padding: 16px; }
  .sa-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .sa-header h1 { font-size: 20px; }
  .settings-grid { grid-template-columns: 1fr; }
  .section-card { padding: 16px; }
  .form-group input, .form-group select, .form-group textarea { font-size: 16px; }
}
@media (max-width: 480px) {
  .sa-page { padding: 12px; }
  .sa-header h1 { font-size: 18px; }
  .toggle-group { flex-direction: column; gap: 8px; align-items: flex-start; }
}
</style>
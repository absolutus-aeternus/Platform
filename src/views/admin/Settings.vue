<template>
  <div class="page-wrapper">
  <div class="admin-settings">
    <div class="page-header"><h1>System Settings</h1><button class="btn-save" @click="saveSettings" :disabled="saving">{{ saving ? 'Saving...' : 'Save All Settings' }}</button></div>
    <div class="settings-grid">
      <div class="settings-section">
        <h2><i class="fas fa-store"></i> General</h2>
        <div class="form-group"><label>Site Name</label><input v-model="settings.siteName" placeholder="ALLIANCEHUB"></div>
        <div class="form-group"><label>Customer Service URL</label><input v-model="settings.customerServiceUrl" placeholder="https://..."></div>
        <div class="form-group"><label>Seller Application URL</label><input v-model="settings.sellerApplyUrl" placeholder="https://..."></div>
        <div class="form-group"><label>Max Items Per Order</label><input v-model.number="settings.maxItems" type="number"></div>
      </div>
      <div class="settings-section">
        <h2><i class="fas fa-credit-card"></i> Payment</h2>
        <div class="form-group"><label>USDT Rate</label><input v-model.number="settings.usdtRate" type="number" step="0.01"></div>
        <div class="form-group"><label>Min Recharge ($)</label><input v-model.number="settings.minRecharge" type="number"></div>
        <div class="form-group"><label>Min Withdraw ($)</label><input v-model.number="settings.minWithdraw" type="number"></div>
        <div class="form-group"><label>Withdraw URL</label><input v-model="settings.withdrawUrl" placeholder="https://..."></div>
      </div>
      <div class="settings-section">
        <h2><i class="fas fa-toggle-on"></i> Features</h2>
        <div class="form-group"><label class="toggle-label"><input type="checkbox" v-model="settings.chatEnabled"><span class="toggle-text">Enable Live Chat</span></label></div>
        <div class="form-group"><label class="toggle-label"><input type="checkbox" v-model="settings.lotteryEnabled"><span class="toggle-text">Enable Lottery/Rewards</span></label></div>
        <div class="form-group"><label class="toggle-label"><input type="checkbox" v-model="settings.subscribeEnabled"><span class="toggle-text">Enable Newsletter</span></label></div>
        <div class="form-group"><label class="toggle-label"><input type="checkbox" v-model="settings.creditEnabled"><span class="toggle-text">Enable Credit/Loan Service</span></label></div>
      </div>
    </div>
    <div v-if="saved" class="save-toast"><i class="fas fa-check-circle"></i> Settings saved successfully!</div>
  </div>
  </div>
</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const saving = ref(false)
const saved = ref(false)
const settings = ref({
  siteName: 'ALLIANCEHUB', customerServiceUrl: '', sellerApplyUrl: '', maxItems: 999,
  usdtRate: 1.00, minRecharge: 10, minWithdraw: 50, withdrawUrl: '',
  chatEnabled: true, lotteryEnabled: true, subscribeEnabled: true, creditEnabled: true
})

onMounted(async () => {
  const codes = ['customer_service_url','mall_max_goods_number_in_order','seller_apply_url','recharge_url','withdraw_url','usdt_rate','min_recharge','min_withdraw','lottery_enabled','chat_enabled','subscribe_enabled']
  try { const { data } = await supabase.from('system_params').select('code,value').in('code', codes)
  const map = {}; (data || []).forEach(p => { map[p.code] = p.value })
  settings.value.customerServiceUrl = map.customer_service_url || ''
  settings.value.maxItems = parseInt(map.mall_max_goods_number_in_order) || 999
  settings.value.sellerApplyUrl = map.seller_apply_url || ''
  settings.value.withdrawUrl = map.withdraw_url || ''
  settings.value.usdtRate = parseFloat(map.usdt_rate) || 1
  settings.value.minRecharge = parseFloat(map.min_recharge) || 10
  settings.value.minWithdraw = parseFloat(map.min_withdraw) || 50
  settings.value.chatEnabled = map.chat_enabled !== 'false'
  settings.value.lotteryEnabled = map.lottery_enabled !== 'false'
  settings.value.subscribeEnabled = map.subscribe_enabled !== 'false'
  loading.value = false
  } catch(e) { console.warn('Settings load error:', e) }
})

const saveSettings = async () => {
  saving.value = true
  const updates = [
    { code: 'customer_service_url', value: settings.value.customerServiceUrl },
    { code: 'mall_max_goods_number_in_order', value: String(settings.value.maxItems) },
    { code: 'seller_apply_url', value: settings.value.sellerApplyUrl },
    { code: 'withdraw_url', value: settings.value.withdrawUrl },
    { code: 'usdt_rate', value: String(settings.value.usdtRate) },
    { code: 'min_recharge', value: String(settings.value.minRecharge) },
    { code: 'min_withdraw', value: String(settings.value.minWithdraw) },
    { code: 'chat_enabled', value: String(settings.value.chatEnabled) },
    { code: 'lottery_enabled', value: String(settings.value.lotteryEnabled) },
    { code: 'subscribe_enabled', value: String(settings.value.subscribeEnabled) }
  ]
  for (const u of updates) {
  loading.value = false
    try { await supabase.from('system_params').upsert({ code: u.code, value: u.value }, { onConflict: 'code' }) } catch(_e) { console.error('Settings.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  }
  saving.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 3000)
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.btn-save { padding: 12px 24px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-save:disabled { background: #ccc; }
.settings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.settings-section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.settings-section h2 { margin: 0 0 20px; font-size: 16px; color: #333; display: flex; align-items: center; gap: 10px; }
.settings-section h2 i { color: var(--brand-primary, #FF9900); }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input[type="text"], .form-group input[type="number"] { width: 100%; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; box-sizing: border-box; font-size: 14px; transition: border-color 0.2s; }
.form-group input:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.toggle-label { display: flex !important; align-items: center; gap: 10px; cursor: pointer; }
.toggle-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--brand-primary, #FF9900); }
.toggle-text { font-weight: 500; font-size: 14px; }
.save-toast { position: fixed; bottom: 30px; right: 30px; background: var(--success, #067D62); color: #fff; padding: 14px 24px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; z-index: 800; animation: slideIn 0.3s ease; }
@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .filters { flex-direction: column; gap: 0.5rem; }
  .filters input, .filters select { width: 100%; }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .card { padding: 1rem; }
  .modal { width: 95vw; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>

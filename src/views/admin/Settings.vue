<template>
  <div class="admin-settings">
    <h1>System Settings</h1>
    <div class="settings-grid">
      <div class="settings-section">
        <h2>General</h2>
        <div class="form-group"><label>Site Name</label><input v-model="settings.siteName" placeholder="TikTok Shop"></div>
        <div class="form-group"><label>Customer Service URL</label><input v-model="settings.customerServiceUrl" placeholder="https://..."></div>
        <div class="form-group"><label>Max Items Per Order</label><input v-model.number="settings.maxItems" type="number"></div>
      </div>
      <div class="settings-section">
        <h2>Payment</h2>
        <div class="form-group"><label>USDT Rate</label><input v-model.number="settings.usdtRate" type="number" step="0.01"></div>
        <div class="form-group"><label>Min Recharge ($)</label><input v-model.number="settings.minRecharge" type="number"></div>
        <div class="form-group"><label>Min Withdraw ($)</label><input v-model.number="settings.minWithdraw" type="number"></div>
      </div>
      <div class="settings-section">
        <h2>Features</h2>
        <div class="form-group"><label><input type="checkbox" v-model="settings.chatEnabled"> Enable Live Chat</label></div>
        <div class="form-group"><label><input type="checkbox" v-model="settings.lotteryEnabled"> Enable Lottery</label></div>
        <div class="form-group"><label><input type="checkbox" v-model="settings.subscribeEnabled"> Enable Newsletter</label></div>
      </div>
    </div>
    <button class="btn-save" @click="saveSettings">Save Settings</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const settings = ref({
  siteName: 'TikTok Shop', customerServiceUrl: '', maxItems: 999,
  usdtRate: 1.00, minRecharge: 10, minWithdraw: 50,
  chatEnabled: true, lotteryEnabled: true, subscribeEnabled: true
})
const saveSettings = () => alert('Settings saved!')
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.settings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px; }
.settings-section { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.settings-section h2 { margin-bottom: 15px; font-size: 16px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; }
.form-group input[type="text"], .form-group input[type="number"] { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 13px; }
.form-group input[type="checkbox"] { margin-right: 5px; }
.btn-save { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
</style>

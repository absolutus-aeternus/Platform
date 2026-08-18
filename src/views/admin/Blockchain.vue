<template>
  <div class="admin-blockchain">
    <div class="page-header"><h1>Blockchain Channels</h1><button class="btn-add" @click="openModal()"><i class="fas fa-plus"></i> Add Channel</button></div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="channel-grid">
      <div v-for="ch in channels" :key="ch.id" class="channel-card" :class="{ inactive: !ch.is_active }">
        <div class="channel-icon" :style="{ background: coinColor(ch.coin) }">{{ ch.coin[0] }}</div>
        <h3>{{ ch.coin }}</h3>
        <p class="network">{{ ch.blockchain_name }}</p>
        <div class="channel-details">
          <div class="detail"><label>Fee</label><span>{{ ch.fee }}%</span></div>
          <div class="detail"><label>Min</label><span>${{ ch.recharge_limit_min || 1 }}</span></div>
          <div class="detail"><label>Max</label><span>${{ (ch.recharge_limit_max || 9999999).toLocaleString() }}</span></div>
        </div>
        <span class="status" :class="ch.is_active ? 'active' : 'inactive'">{{ ch.is_active ? 'Active' : 'Inactive' }}</span>
        <div class="channel-actions">
          <button class="btn-sm" @click="openModal(ch)"><i class="fas fa-edit"></i></button>
          <button class="btn-sm" @click="toggleActive(ch)"><i :class="ch.is_active ? 'fas fa-pause' : 'fas fa-play'"></i></button>
          <button class="btn-sm btn-danger" @click="deleteChannel(ch)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div v-if="channels.length === 0" class="empty-card"><i class="fas fa-link"></i><p>No blockchain channels</p></div>
    </div>
    <BaseModal v-model="showModal" :title="editing ? 'Edit Channel' : 'Add Channel'" size="lg">
      <form @submit.prevent="saveChannel">
        <div class="form-row">
          <div class="form-group"><label>Coin *</label><select v-model="form.coin"><option value="USDT">USDT</option><option value="USDC">USDC</option><option value="BTC">BTC</option><option value="ETH">ETH</option></select></div>
          <div class="form-group"><label>Network *</label><select v-model="form.blockchain_name"><option value="TRC20">TRC20</option><option value="ERC20">ERC20</option><option value="Bitcoin">Bitcoin</option><option value="Ethereum">Ethereum</option></select></div>
        </div>
        <div class="form-group"><label>Wallet Address</label><input v-model="form.address" placeholder="Contact customer service"></div>
        <div class="form-row">
          <div class="form-group"><label>Fee (%)</label><input v-model.number="form.fee" type="number" step="0.01" min="0"></div>
          <div class="form-group"><label>Min ($)</label><input v-model.number="form.recharge_limit_min" type="number" min="1"></div>
          <div class="form-group"><label>Max ($)</label><input v-model.number="form.recharge_limit_max" type="number" min="1"></div>
        </div>
        <div class="form-group"><label><input type="checkbox" v-model="form.is_active"> Active</label></div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="showModal = false">Cancel</button>
          <button type="submit" class="btn-save" :disabled="saving" aria-label="Save">{{ saving ? "Saving..." : "Save" }}</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import BaseModal from '@/components/base/BaseModal.vue'

const loading = ref(true)
const saving = ref(false)
const channels = ref([])
const showModal = ref(false)
const editing = ref(null)
const form = ref({ coin: 'USDT', blockchain_name: 'TRC20', address: '', fee: 1, recharge_limit_min: 1, recharge_limit_max: 9999999, is_active: true })

const coinColor = (c) => ({ USDT: '#26a17b', USDC: '#2775ca', BTC: '#f7931a', ETH: '#627eea' }[c] || 'var(--brand-primary, #FF9900)')

const load = async () => {
  try {
    loading.value = true
    const { data } = await supabase.from('blockchain_channels').select('*').order('coin')
    channels.value = data || []
  } catch (e) { console.error('Blockchain load error:', e) }
  loading.value = false
}
const openModal = (ch) => {
  editing.value = ch || null
  form.value = ch ? { ...ch } : { coin: 'USDT', blockchain_name: 'TRC20', address: '', fee: 1, recharge_limit_min: 1, recharge_limit_max: 9999999, is_active: true }
  showModal.value = true
}
const saveChannel = async () => {
  saving.value = true
  if (editing.value) await supabase.from('blockchain_channels').update(form.value).eq('id', editing.value.id)
  else await supabase.from('blockchain_channels').insert(form.value)
  showModal.value = false; await load()
  saving.value = false
}
const toggleActive = async (ch) => { await supabase.from('blockchain_channels').update({ is_active: !ch.is_active }).eq('id', ch.id); await load() }
  saving.value = false
const deleteChannel = async (ch) => { if (!confirm('Delete channel?')) return; await supabase.from('blockchain_channels').delete().eq('id', ch.id); await load() }
  saving.value = false
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-add { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.channel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
.channel-card { background: #fff; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.3s; }
.channel-card.inactive { opacity: 0.6; }
.channel-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: #fff; margin: 0 auto 12px; }
.channel-card h3 { margin: 0 0 4px; font-size: 18px; }
.network { color: #999; font-size: 13px; margin-bottom: 15px; }
.channel-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 15px; }
.detail label { display: block; font-size: 11px; color: #999; margin-bottom: 2px; }
.detail span { font-size: 13px; font-weight: 600; }
.status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-bottom: 15px; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
.channel-actions { display: flex; gap: 8px; justify-content: center; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-danger:hover { border-color: var(--error, #CC0C39); color: var(--error, #CC0C39); }
.empty-card { grid-column: 1 / -1; text-align: center; padding: 60px; background: #fff; border-radius: 12px; color: #999; }
.empty-card i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 500px; max-width: 90vw; }
.modal h2 { margin: 0 0 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
.form-group input[type="checkbox"] { width: auto; margin-right: 6px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>

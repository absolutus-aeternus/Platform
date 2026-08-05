<template>
  <div class="recharge">
    <h1>Recharge Wallet</h1>
    <div class="recharge-form">
      <div class="channels">
        <div v-for="ch in channels" :key="ch.id" class="channel-card" :class="{ active: selected === ch.id }" @click="selected = ch.id">
          <h3>{{ ch.coin }}</h3>
          <p>{{ ch.blockchain_name }}</p>
          <p>Fee: {{ ch.fee }}%</p>
        </div>
      </div>
      <div class="form-group">
        <label>Amount (USD)</label>
        <input v-model.number="amount" type="number" min="1" placeholder="Enter amount">
      </div>
      <div class="form-group">
        <label>Wallet Address</label>
        <input :value="selectedChannel?.address || 'Select a channel'" disabled>
      </div>
      <button class="btn-submit" @click="submitRecharge" :disabled="!amount || !selected">Submit Recharge</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchBlockchainChannels } from '@/services/supabase'

const channels = ref([])
const selected = ref('')
const amount = ref(0)

const selectedChannel = computed(() => channels.value.find(c => c.id === selected.value))

onMounted(async () => {
  const { data } = await fetchBlockchainChannels()
  channels.value = data || []
})

const submitRecharge = () => {
  alert('Recharge request submitted! Please send payment to the wallet address.')
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.recharge-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.channels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
.channel-card { padding: 15px; border: 2px solid #ddd; border-radius: 8px; text-align: center; cursor: pointer; }
.channel-card.active { border-color: #fe2c55; background: #fff5f5; }
.channel-card h3 { margin-bottom: 5px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-submit { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
.btn-submit:disabled { background: #ccc; }
</style>

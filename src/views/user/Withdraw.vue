<template>
  <div class="withdraw">
    <h1>Withdraw Funds</h1>
    <div class="withdraw-form">
      <div class="balance">Available: ${{ balance }}</div>
      <div class="form-group">
        <label>Amount (USD)</label>
        <input v-model.number="amount" type="number" :min="50" placeholder="Minimum $50">
      </div>
      <div class="form-group">
        <label>Withdrawal Address</label>
        <input v-model="address" placeholder="Your crypto wallet address">
      </div>
      <div class="form-group">
        <label>Network</label>
        <select v-model="network">
          <option value="ERC20">ERC20</option>
          <option value="TRC20">TRC20</option>
        </select>
      </div>
      <button class="btn-submit" @click="submitWithdraw" :disabled="amount < 50 || !address">Submit Withdrawal</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { fetchWallet } from '@/services/supabase'

const userStore = useUserStore()
const balance = ref('0.00')
const amount = ref(0)
const address = ref('')
const network = ref('ERC20')

onMounted(async () => {
  if (userStore.supabaseUser) {
    const { data } = await fetchWallet(userStore.supabaseUser.id)
    balance.value = data?.balance || '0.00'
  }
})

const submitWithdraw = () => {
  alert('Withdrawal request submitted! Processing may take 24-48 hours.')
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.withdraw-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.balance { background: #f8f8f8; padding: 15px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: 700; color: #fe2c55; margin-bottom: 25px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-submit { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
.btn-submit:disabled { background: #ccc; }
</style>

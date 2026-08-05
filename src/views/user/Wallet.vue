<template>
  <div class="wallet">
    <h1>My Wallet</h1>
    <div class="balance-card">
      <h2>Balance</h2>
      <div class="balance">${{ balance }}</div>
      <div class="actions">
        <button class="btn-recharge">Recharge</button>
        <button class="btn-withdraw">Withdraw</button>
      </div>
    </div>
    <div class="wallet-info">
      <div class="info-item">
        <span>Rebate</span>
        <span>${{ rebate }}</span>
      </div>
      <div class="info-item">
        <span>Frozen</span>
        <span>${{ frozen }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const balance = ref('0.00')
const rebate = ref('0.00')
const frozen = ref('0.00')
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.balance-card { background: linear-gradient(135deg, #fe2c55 0%, #ff6b81 100%); color: #fff; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
.balance-card h2 { opacity: 0.8; margin-bottom: 10px; }
.balance { font-size: 36px; font-weight: 700; margin-bottom: 20px; }
.actions { display: flex; gap: 10px; }
.btn-recharge, .btn-withdraw { padding: 10px 25px; border-radius: 25px; font-size: 14px; cursor: pointer; }
.btn-recharge { background: #fff; color: #fe2c55; border: none; }
.btn-withdraw { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.5); }
.wallet-info { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.info-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
</style>

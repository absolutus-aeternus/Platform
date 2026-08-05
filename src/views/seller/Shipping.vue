<template>
  <div class="shipping">
    <h1>Shipping</h1>
    <div class="section">
      <h2>Shipping Settings</h2>
      <div class="form-group">
        <label>Default Shipping Method</label>
        <select v-model="shippingMethod">
          <option value="standard">Standard Shipping</option>
          <option value="express">Express Shipping</option>
          <option value="free">Free Shipping</option>
        </select>
      </div>
      <div class="form-group">
        <label>Processing Time</label>
        <select v-model="processingTime">
          <option value="1">1 business day</option>
          <option value="2">2 business days</option>
          <option value="3">3 business days</option>
          <option value="5">5 business days</option>
        </select>
      </div>
      <button class="btn-save">Save Settings</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const shippingMethod = ref('standard')
const processingTime = ref('2')
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); max-width: 500px; }
.section h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group select { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; }
.btn-save { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
</style>

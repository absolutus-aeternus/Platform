<template>
  <div class="coupons">
    <h1>Coupons</h1>
    <button class="btn-add" @click="showAdd = true">+ Create Coupon</button>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="coupons.length === 0" class="empty">No coupons yet</div>
    <div v-else class="coupon-grid">
      <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
        <div class="coupon-value">{{ coupon.discount }}{{ coupon.type === 'percent' ? '%' : '$' }} OFF</div>
        <p>{{ coupon.code }}</p>
        <p class="coupon-expiry">Expires: {{ coupon.expiry }}</p>
      </div>
    </div>
    
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h2>Create Coupon</h2>
        <form @submit.prevent="createCoupon">
          <div class="form-group">
            <label>Code</label>
            <input v-model="newCoupon.code" required placeholder="e.g. SAVE20">
          </div>
          <div class="form-group">
            <label>Discount</label>
            <input v-model.number="newCoupon.discount" type="number" required>
          </div>
          <div class="form-group">
            <label>Type</label>
            <select v-model="newCoupon.type">
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAdd = false">Cancel</button>
            <button type="submit" class="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const coupons = ref([])
const loading = ref(false)
const showAdd = ref(false)
const newCoupon = ref({ code: '', discount: 0, type: 'percent', expiry: '2026-12-31' })

const createCoupon = () => {
  coupons.value.push({ ...newCoupon.value, id: Date.now() })
  showAdd.value = false
  newCoupon.value = { code: '', discount: 0, type: 'percent', expiry: '2026-12-31' }
}
</script>

<style scoped>
h1 { margin-bottom: 25px; display: inline-block; }
.btn-add { float: right; padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.loading, .empty { text-align: center; padding: 40px; color: #999; clear: both; }
.coupon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; clear: both; }
.coupon-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); border-left: 4px solid #fe2c55; }
.coupon-value { font-size: 24px; font-weight: 700; color: #fe2c55; margin-bottom: 10px; }
.coupon-expiry { color: #999; font-size: 12px; margin-top: 10px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; padding: 30px; border-radius: 12px; width: 400px; }
.modal h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.modal-actions button { padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.btn-primary { background: #fe2c55; color: #fff; border: none; }
</style>

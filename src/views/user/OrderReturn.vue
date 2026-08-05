<template>
  <div class="order-return">
    <h1>Return Request</h1>
    <div class="return-form">
      <div class="form-group">
        <label>Order #</label>
        <input :value="orderId" disabled>
      </div>
      <div class="form-group">
        <label>Reason</label>
        <select v-model="reason">
          <option value="">Select reason</option>
          <option value="defective">Defective product</option>
          <option value="wrong">Wrong item received</option>
          <option value="not_as_described">Not as described</option>
          <option value="changed_mind">Changed mind</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="description" placeholder="Describe the issue..."></textarea>
      </div>
      <button class="btn-submit" @click="submitReturn" :disabled="!reason">Submit Return Request</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const router = useRouter()
const orderId = route.query.order || ''
const reason = ref('')
const description = ref('')

const submitReturn = async () => {
  await supabase.from('orders').update({ status: 'return_requested' }).eq('id', orderId)
  alert('Return request submitted!')
  router.push('/user/orders')
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.return-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-group textarea { height: 100px; resize: vertical; }
.btn-submit { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.btn-submit:disabled { background: #ccc; }
</style>

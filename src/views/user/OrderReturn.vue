<template>
  <div class="page-wrapper">
  <div class="order-return">
    <div class="page-header"><h1>Return Request</h1></div>
    <div class="return-container">
      <div class="return-form">
        <div class="section">
          <h2>Order Information</h2>
          <div class="form-group"><label>Order #</label><input :value="orderId" disabled></div>
        </div>
        <div class="section">
          <h2>Return Details</h2>
          <div class="form-group"><label>Reason for Return *</label>
            <select v-model="reason" required><option value="">Select a reason</option><option value="defective">Defective product</option><option value="wrong">Wrong item received</option><option value="not_as_described">Not as described</option><option value="damaged">Damaged during shipping</option><option value="changed_mind">Changed mind</option><option value="other">Other</option></select>
          </div>
          <div class="form-group"><label>Description *</label><textarea v-model="description" placeholder="Please describe the issue in detail..." rows="5" required></textarea></div>
          <div class="form-group"><label>Photos (optional)</label><p class="hint">Upload photos of the issue to speed up processing</p><div class="upload-area"><i class="fas fa-cloud-upload-alt"></i><p>Click or drag to upload</p></div></div>
        </div>
        <div class="section">
          <h2>Return Method</h2>
          <div class="return-options">
            <label class="return-option" :class="{ active: returnMethod === 'refund' }"><input type="radio" v-model="returnMethod" value="refund"><div><strong>Full Refund</strong><p>Return the item for a full refund</p></div></label>
            <label class="return-option" :class="{ active: returnMethod === 'exchange' }"><input type="radio" v-model="returnMethod" value="exchange"><div><strong>Exchange</strong><p>Exchange for the same or similar item</p></div></label>
            <label class="return-option" :class="{ active: returnMethod === 'partial' }"><input type="radio" v-model="returnMethod" value="partial"><div><strong>Partial Refund</strong><p>Keep the item with a partial refund</p></div></label>
          </div>
        </div>
        <button class="btn-submit" @click="submitReturn" :disabled="!reason || !description">Submit Return Request</button>
      </div>
      <div class="return-info">
        <h3><i class="fas fa-info-circle"></i> Return Policy</h3>
        <ul>
          <li>Returns must be initiated within 7 days of delivery</li>
          <li>Items must be in original condition</li>
          <li>Refunds are processed within 3-5 business days</li>
          <li>Return shipping costs may apply</li>
        </ul>
      </div>
    </div>
  </div>
  </div>

</template>
</template>


<script setup>
import { ref } from 'vue'
const loading = ref(true)
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const router = useRouter()
const orderId = route.query.order || ''
const reason = ref('')
const description = ref('')
const returnMethod = ref('refund')

const submitReturn = async () => {
  if (!orderId) return window.__toast?.show('No order selected')
  loading.value = false
  try { await supabase.from('orders').update({ status: 'return_requested', notes: `Return: ${reason.value} - ${description.value}` }).eq('id', orderId) } catch(_e) { console.error('OrderReturn.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  window.__toast?.show('Return request submitted successfully!')
  router.push('/user/orders')
}


</script>

<style scoped>
header { z-index: 2; }
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.return-container { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
.return-form { }
.section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; }
.section h2 { margin: 0 0 18px; font-size: 16px; color: #333; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; box-sizing: border-box; font-size: 14px; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.form-group textarea { resize: vertical; }
.hint { font-size: 12px; color: #999; margin: 4px 0 10px; }
.upload-area { border: 2px dashed #ddd; border-radius: 8px; padding: 30px; text-align: center; cursor: pointer; transition: all 0.2s; }
.upload-area:hover { border-color: var(--brand-primary, #FF9900); background: #fff8f0; }
.upload-area i { font-size: 32px; color: #ddd; margin-bottom: 10px; display: block; }
.upload-area p { color: #999; font-size: 13px; margin: 0; }
.return-options { display: flex; flex-direction: column; gap: 10px; }
.return-option { display: flex; align-items: flex-start; gap: 12px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.return-option.active { border-color: var(--brand-primary, #FF9900); background: #fff8f0; }
.return-option input { margin-top: 3px; }
.return-option strong { display: block; font-size: 14px; margin-bottom: 3px; }
.return-option p { margin: 0; font-size: 12px; color: #999; }
.btn-submit { width: 100%; padding: 14px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; }
.btn-submit:disabled { background: #ccc; }
.return-info { position: sticky; top: 100px; }
.return-info h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 15px; font-size: 15px; }
.return-info h3 i { color: var(--brand-primary, #FF9900); }
.return-info ul { list-style: none; padding: 0; }
.return-info li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #666; padding-left: 20px; position: relative; }
.return-info li::before { content: '•'; position: absolute; left: 0; color: var(--brand-primary, #FF9900); font-weight: bold; }
@media (max-width: 768px) {
  .return-container { grid-template-columns: 1fr; }
  .order-header { flex-direction: column; gap: 8px; }
}
</style>

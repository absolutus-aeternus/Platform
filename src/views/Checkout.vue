<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Checkout</h1>
      
      <div v-if="userStore.cart.length === 0" class="empty">
        <p>Your cart is empty</p>
        <router-link to="/" class="btn-primary">Continue Shopping</router-link>
      </div>
      
      <div v-else class="checkout-grid">
        <div class="checkout-main">
          <div class="section">
            <h2>Shipping Address</h2>
            <div v-if="addresses.length === 0" class="no-address">
              <p>No address found. Please add one in your profile.</p>
              <router-link to="/user/addresses" class="btn-link">Add Address</router-link>
            </div>
            <div v-else class="address-card">
              <p><strong>{{ selectedAddress.contacts }}</strong></p>
              <p>{{ selectedAddress.phone }}</p>
              <p>{{ selectedAddress.address }}, {{ selectedAddress.city }}, {{ selectedAddress.province }}, {{ selectedAddress.country }} {{ selectedAddress.postcode }}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Order Items</h2>
            <div v-for="item in userStore.cart" :key="item.id" class="order-item">
              <div class="item-img">{{ (item.products?.name || item.name || 'P')[0] }}</div>
              <div class="item-info">
                <h4>{{ item.products?.name || item.name || 'Product' }}</h4>
                <p>Qty: {{ item.quantity }}</p>
              </div>
              <div class="item-price">${{ ((item.products?.price || item.price || 0) * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Payment Method</h2>
            <div class="payment-options">
              <label v-for="method in paymentMethods" :key="method" class="payment-option">
                <input type="radio" v-model="selectedPayment" :value="method">
                <span>{{ method }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="checkout-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${{ subtotal }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ subtotal }}</span>
          </div>
          <div v-if="error" class="checkout-error">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>
          <button class="btn-place-order" @click="placeOrder" :disabled="ordering || addresses.length === 0">
            {{ ordering ? 'Placing Order...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>

<!-- Loading State -->
<div v-if="loading" class="empty-state"><div class="loading-spinner"></div><p>Loading...</p></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase, fetchAddresses } from '@/services/supabase'

const router = useRouter()
const userStore = useUserStore()

const addresses = ref([])
const selectedAddress = ref({})
const paymentMethods = ['Binance', 'Huobi', 'OKX', 'Coinbase', 'MetaMask', 'KuCoin']
const selectedPayment = ref('Binance')
const ordering = ref(false)
const error = ref(null)

const subtotal = computed(() => {
  return userStore.cart.reduce((sum, item) => {
    const price = item.products?.price || item.price || 0
    return sum + price * item.quantity
  }, 0).toFixed(2)
})

onMounted(async () => {
  if (userStore.supabaseUser) {
    const { data } = await fetchAddresses(userStore.supabaseUser.id)
    addresses.value = data || []
    if (addresses.value.length > 0) {
      selectedAddress.value = addresses.value.find(a => a.is_default) || addresses.value[0]
    }
  }
})

const validateOrder = () => {
  if (!userStore.supabaseUser) {
    error.value = 'Please login to place an order'
    return false
  }
  if (addresses.value.length === 0) {
    error.value = 'Please add a shipping address'
    return false
  }
  if (!selectedAddress.value?.address) {
    error.value = 'Please select a shipping address'
    return false
  }
  if (userStore.cart.length === 0) {
    error.value = 'Your cart is empty'
    return false
  }
  if (parseFloat(subtotal.value) <= 0) {
    error.value = 'Invalid order total'
    return false
  }
  error.value = null
  return true
}

const placeOrder = async () => {
  if (!validateOrder()) return
  
  ordering.value = true
  error.value = null
  
  try {
    const token = userStore.token
    if (!token) throw new Error('Authentication required')

    // Use Worker API (with auth verification)
    const resp = await fetch(`${import.meta.env.VITE_WORKER_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        total: parseFloat(subtotal.value),
        address: selectedAddress.value,
        payment_method: selectedPayment.value,
        items: userStore.cart.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.products?.price || item.price || 0
        }))
      })
    })

    const result = await resp.json()
    
    if (!resp.ok) {
      throw new Error(result.error || 'Failed to place order')
    }

    // Clear local cart
    await userStore.clearCart()
    
    window.__toast?.show('Order placed successfully!', 'success')
    router.push('/user/orders')
  } catch (e) {
    error.value = e.message || 'Failed to place order'
    window.__toast?.show(error.value, 'error')
  }
  ordering.value = false
}
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px; }
.page-title { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
.checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
.checkout-form { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.checkout-summary { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: all 0.3s ease; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #ee4d2d; box-shadow: 0 0 0 3px rgba(238,77,45,0.1); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.btn-place-order { width: 100%; padding: 14px; background: #ee4d2d; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-place-order:hover { background: #d73211; transform: translateY(-1px); }
.btn-place-order:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.checkout-error { background: #fff5f5; color: #ff4757; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-size: 14px; }
.summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
.summary-total { font-weight: 700; font-size: 18px; color: #ee4d2d; border-bottom: none; }
@media (max-width: 768px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .checkout-summary { position: static; }
  .form-row { grid-template-columns: 1fr; }
  .page-title { font-size: 1.25rem; }
}
@media (max-width: 480px) {
  .container { padding: 0 8px; }
  .checkout-form, .checkout-summary { padding: 16px; }
  .page-title { font-size: 1.1rem; }
  .btn-place-order { font-size: 14px; }
}
</style>

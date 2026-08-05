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
          <button class="btn-place-order" @click="placeOrder" :disabled="ordering || addresses.length === 0">
            {{ ordering ? 'Placing Order...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase, fetchAddresses, createOrder } from '@/services/supabase'

const router = useRouter()
const userStore = useUserStore()

const addresses = ref([])
const selectedAddress = ref({})
const paymentMethods = ['Binance', 'Huobi', 'OKX', 'Coinbase', 'MetaMask', 'KuCoin']
const selectedPayment = ref('Binance')
const ordering = ref(false)

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

const placeOrder = async () => {
  if (!userStore.supabaseUser || addresses.value.length === 0) return
  
  ordering.value = true
  try {
    const orderNo = 'ORD-' + Date.now()
    const orderData = {
      order_no: orderNo,
      user_id: userStore.supabaseUser.id,
      total_amount: parseFloat(subtotal.value),
      status: 'pending',
      payment_method: selectedPayment.value,
      payment_status: 'unpaid',
      shipping_address: selectedAddress.value
    }
    
    const { data: order, error } = await createOrder(orderData)
    if (error) throw error
    
    // Create order items
    for (const item of userStore.cart) {
      const price = item.products?.price || item.price || 0
      await supabase.from('order_items').insert({
        order_id: order[0].id,
        product_id: item.product_id || item.id,
        product_name: item.products?.name || item.name,
        product_price: price,
        quantity: item.quantity,
        total_price: price * item.quantity
      })
    }
    
    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', userStore.supabaseUser.id)
    userStore.clearCart()
    
    alert('Order placed successfully!')
    router.push('/user/orders')
  } catch (e) {
    alert('Failed to place order: ' + e.message)
  }
  ordering.value = false
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
.empty { text-align: center; padding: 60px 0; }
.btn-primary { background: #fe2c55; color: #fff; padding: 12px 30px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 15px; }
.checkout-grid { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
.section { background: #fff; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.section h2 { font-size: 18px; margin-bottom: 15px; }
.no-address { text-align: center; padding: 20px; }
.btn-link { color: #fe2c55; text-decoration: none; }
.address-card { padding: 15px; background: #f8f8f8; border-radius: 8px; }
.order-item { display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
.item-img { width: 60px; height: 60px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #ccc; border-radius: 4px; }
.item-info { flex: 1; }
.item-info h4 { font-size: 14px; margin-bottom: 5px; }
.item-price { font-weight: 600; color: #fe2c55; }
.payment-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.payment-option { display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
.payment-option input { margin: 0; }
.checkout-summary { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: sticky; top: 100px; }
.checkout-summary h2 { margin-bottom: 20px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
.summary-row.total { font-size: 18px; font-weight: 700; color: #fe2c55; border-top: 1px solid #eee; padding-top: 15px; }
.btn-place-order { width: 100%; padding: 14px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 15px; }
.btn-place-order:disabled { background: #ccc; cursor: not-allowed; }
</style>

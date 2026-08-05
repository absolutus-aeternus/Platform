<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Checkout</h1>
      
      <div class="checkout-grid">
        <div class="checkout-main">
          <div class="section">
            <h2>Shipping Address</h2>
            <div class="address-card">
              <p><strong>{{ address.contacts }}</strong></p>
              <p>{{ address.phone }}</p>
              <p>{{ address.address }}, {{ address.city }}, {{ address.province }}, {{ address.country }} {{ address.postcode }}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Order Items</h2>
            <div v-for="item in userStore.cart" :key="item.id" class="order-item">
              <div class="item-img">{{ item.name[0] }}</div>
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p>Qty: {{ item.quantity }}</p>
              </div>
              <div class="item-price">${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</div>
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
          <button class="btn-place-order" @click="placeOrder">
            Place Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const address = ref({
  contacts: 'Ibu kartini',
  phone: '62|81234567890',
  address: 'Jalan konoha 99',
  city: 'Kota Makassar',
  province: 'Sulawesi Selatan',
  country: 'Indonesia',
  postcode: '88909'
})

const paymentMethods = ['Binance', 'Huobi', 'OKX', 'Coinbase', 'MetaMask', 'KuCoin']
const selectedPayment = ref('Binance')

const subtotal = computed(() => {
  return userStore.cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2)
})

const placeOrder = () => {
  alert('Order placed successfully!')
  userStore.clearCart()
  router.push('/user/orders')
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
.checkout-grid { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
.section { background: #fff; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.section h2 { font-size: 18px; margin-bottom: 15px; }
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
</style>

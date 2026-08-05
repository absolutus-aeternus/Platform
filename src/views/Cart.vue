<template>
  <div class="cart-page">
    <div class="container">
      <h1>Shopping Cart</h1>
      
      <div v-if="userStore.cart.length === 0" class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <router-link to="/" class="btn-primary">Continue Shopping</router-link>
      </div>
      
      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in userStore.cart" :key="item.id" class="cart-item">
            <div class="item-image">
              <div class="img-placeholder">{{ item.name[0] }}</div>
            </div>
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <div class="item-price">${{ item.price }}</div>
            </div>
            <div class="item-quantity">
              <button @click="updateQuantity(item, -1)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item, 1)">+</button>
            </div>
            <div class="item-total">${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</div>
            <button class="btn-remove" @click="userStore.removeFromCart(item.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="cart-summary">
          <h3>Order Summary</h3>
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
          <button class="btn-checkout" @click="$router.push('/checkout')">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const subtotal = computed(() => {
  return userStore.cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2)
})

const updateQuantity = (item, delta) => {
  item.quantity += delta
  if (item.quantity < 1) {
    userStore.removeFromCart(item.id)
  }
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
.empty-cart { text-align: center; padding: 60px 0; }
.empty-cart i { font-size: 60px; color: #ddd; margin-bottom: 20px; }
.btn-primary { background: #fe2c55; color: #fff; padding: 12px 30px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 15px; }
.cart-content { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
.cart-item { display: flex; align-items: center; gap: 20px; padding: 20px; background: #fff; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.img-placeholder { width: 80px; height: 80px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #ccc; border-radius: 4px; }
.item-info { flex: 1; }
.item-info h3 { font-size: 14px; margin-bottom: 8px; }
.item-price { color: #fe2c55; font-weight: 600; }
.item-quantity { display: flex; align-items: center; gap: 10px; }
.item-quantity button { width: 30px; height: 30px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer; border-radius: 4px; }
.item-total { font-weight: 600; min-width: 80px; text-align: right; }
.btn-remove { background: none; border: none; color: #999; cursor: pointer; }
.btn-remove:hover { color: #ff4757; }
.cart-summary { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: sticky; top: 100px; }
.cart-summary h3 { margin-bottom: 20px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
.summary-row.total { font-size: 18px; font-weight: 700; color: #fe2c55; border-top: 1px solid #eee; padding-top: 15px; }
.btn-checkout { width: 100%; padding: 14px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 15px; }
</style>

<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title"><i class="fas fa-shopping-cart"></i> Shopping Cart</h1>

      <div v-if="!userStore.isLoggedIn" class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <p>Please login to view your cart</p>
        <router-link to="/login" class="btn-primary">Login</router-link>
      </div>

      <div v-else-if="userStore.cart.length === 0" class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <router-link to="/" class="btn-primary">Continue Shopping</router-link>
      </div>

      <div v-else class="cart-layout">
        <!-- Cart Items -->
        <div class="cart-items">
          <div class="cart-header">
            <label class="select-all"><input type="checkbox" v-model="selectAll"> Select All</label>
            <span class="col-product">Product</span>
            <span class="col-price">Price</span>
            <span class="col-qty">Quantity</span>
            <span class="col-total">Total</span>
            <span class="col-action">Action</span>
          </div>

          <div v-for="item in userStore.cart" :key="item.id" class="cart-item">
            <label class="item-check"><input type="checkbox" v-model="item.selected"></label>
            <div class="item-product" @click="$router.push(`/product/${item.product_id || item.id}`)">
              <div class="item-img">
                <img v-if="item.products?.images?.[0]" :src="item.products.images[0]" :alt="item.products?.name">
                <div v-else class="img-placeholder">{{ (item.products?.name || '?')[0] }}</div>
              </div>
              <div class="item-name">{{ item.products?.name || 'Product' }}</div>
            </div>
            <div class="item-price">${{ item.products?.price || 0 }}</div>
            <div class="item-qty">
              <button @click="changeQty(item, -1)" :disabled="item.quantity <= 1">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="changeQty(item, 1)">+</button>
            </div>
            <div class="item-total">${{ ((item.products?.price || 0) * item.quantity).toFixed(2) }}</div>
            <button class="item-remove" @click="removeItem(item.id)"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>

        <!-- Summary -->
        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal ({{ userStore.cartCount }} items)</span>
            <span>${{ userStore.cartTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span class="free-ship">Free</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ userStore.cartTotal.toFixed(2) }}</span>
          </div>
          <button class="btn-checkout" @click="$router.push('/checkout')">
            Proceed to Checkout
          </button>
          <router-link to="/" class="continue-shopping">← Continue Shopping</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const selectAll = ref(true)

const changeQty = async (item, delta) => {
  const newQty = item.quantity + delta
  if (newQty < 1) await userStore.removeFromCart(item.id)
  else await userStore.updateItemQuantity(item.id, newQty)
}

const removeItem = async (id) => { await userStore.removeFromCart(id) }
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #222; }
.page-title i { color: var(--primary, #ee4d2d); }
.empty-state { text-align: center; padding: 80px 0; color: #999; }
.empty-state i { font-size: 64px; color: #ddd; margin-bottom: 16px; display: block; }
.empty-state p { margin-bottom: 20px; font-size: 16px; }
.cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
.cart-items { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.cart-header { display: grid; grid-template-columns: 40px 1fr 100px 120px 100px 60px; align-items: center; padding: 12px 16px; background: #f8f9fa; font-size: 13px; color: #666; font-weight: 600; border-bottom: 1px solid #eee; }
.cart-item { display: grid; grid-template-columns: 40px 1fr 100px 120px 100px 60px; align-items: center; padding: 16px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s; }
.cart-item:hover { background: #fafafa; }
.item-check input, .select-all input { accent-color: var(--primary, #ee4d2d); }
.item-product { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.item-img { width: 64px; height: 64px; border-radius: 4px; overflow: hidden; flex-shrink: 0; background: #f8f8f8; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #ddd; }
.item-name { font-size: 13px; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-price { font-size: 14px; color: var(--primary, #ee4d2d); font-weight: 600; }
.item-qty { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; width: fit-content; }
.item-qty button { width: 32px; height: 32px; border: none; background: #f8f8f8; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.item-qty button:hover:not(:disabled) { background: #eee; }
.item-qty button:disabled { color: #ccc; cursor: not-allowed; }
.item-qty span { width: 40px; text-align: center; font-size: 14px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; line-height: 32px; }
.item-total { font-size: 14px; font-weight: 700; color: var(--primary, #ee4d2d); }
.item-remove { background: none; border: none; color: #999; cursor: pointer; padding: 8px; font-size: 14px; transition: color 0.2s; }
.item-remove:hover { color: #ff4757; }
.cart-summary { background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); position: sticky; top: 80px; height: fit-content; }
.cart-summary h3 { font-size: 18px; margin-bottom: 20px; color: #222; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #666; }
.summary-row.total { font-size: 18px; font-weight: 700; color: var(--primary, #ee4d2d); border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px; }
.free-ship { color: #28a745; font-weight: 600; }
.btn-checkout { width: 100%; padding: 14px; background: var(--primary, #ee4d2d); color: #fff; border: none; border-radius: 4px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 16px; transition: all 0.2s; }
.btn-checkout:hover { background: var(--primary-dark, #d73211); }
.continue-shopping { display: block; text-align: center; margin-top: 16px; font-size: 13px; color: #999; text-decoration: none; }
.continue-shopping:hover { color: var(--primary, #ee4d2d); }
@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
  .cart-header { display: none; }
  .cart-item { grid-template-columns: 30px 1fr; gap: 12px; padding: 16px 12px; }
  .item-product { grid-column: 1 / -1; }
  .item-price, .item-qty, .item-total { font-size: 13px; }
  .item-remove { grid-column: 2; justify-self: end; }
  .cart-summary { position: static; }
}
</style>

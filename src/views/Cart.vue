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
                <img loading="lazy" v-if="item.products?.images?.[0]" :src="item.products.images[0]" :alt="item.products?.name">
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
          <button class="btn-checkout" @click="$router.push('/checkout')" aria-label="Proceed to checkout">
            Proceed to Checkout
          </button>
          <router-link to="/" class="continue-shopping">← Continue Shopping</router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="empty-state"><div class="loading-spinner"></div><p>Loading...</p></div>
  </div>
</template>


<script setup>
import { ref, watch } from "vue"
import { useUserStore } from '@/store/user'

const loading = ref(false)
const userStore = useUserStore()
const selectAll = ref(true)

// Initialize all items as selected
userStore.cart.forEach(item => { item.selected = true })

// Watch selectAll to toggle all items
watch(selectAll, (val) => {
  userStore.cart.forEach(item => { item.selected = val })
})

const changeQty = async (item, delta) => {
  try {
    const newQty = item.quantity + delta
    if (newQty < 1) await userStore.removeFromCart(item.id)
    else await userStore.updateItemQuantity(item.id, newQty)
  } catch (e) { console.warn('Cart: changeQty failed:', e.message); window.__toast?.show('Failed to update quantity', 'error') }
}

const removeItem = async (id) => {
  try { await userStore.removeFromCart(id) }
  catch (e) { console.warn('Cart: removeItem failed:', e.message); window.__toast?.show('Failed to remove item', 'error') }
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #222; }
.page-title i { color: var(--brand-primary, #FF9900); }
.empty-state { text-align: center; padding: 80px 0; color: #999; }
.empty-state i { font-size: 64px; color: #ddd; margin-bottom: 16px; display: block; }
.empty-state p { margin-bottom: 20px; font-size: 16px; }
.cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
.cart-items { background: var(--bg-card, #fff); border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.cart-header { display: grid; grid-template-columns: 40px 1fr 100px 120px 100px 60px; align-items: center; padding: 12px 16px; background: var(--neutral-100, #f8f9fa); font-size: 13px; color: var(--text-secondary, #666); font-weight: 600; border-bottom: 1px solid var(--border-light, #eee); }
.cart-item { display: grid; grid-template-columns: 40px 1fr 100px 120px 100px 60px; align-items: center; padding: 16px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s; }
.cart-item:hover { background: #fafafa; }
.item-check input, .select-all input { accent-color: var(--brand-primary, #FF9900); }
.item-product { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.item-img { width: 64px; height: 64px; border-radius: 4px; overflow: hidden; flex-shrink: 0; background: var(--neutral-100, #f8f8f8); }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #ddd; }
.item-name { font-size: 13px; color: var(--text-primary, #333); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-price { font-size: 14px; color: var(--brand-primary, #FF9900); font-weight: 600; }
.item-qty { display: flex; align-items: center; border: 1px solid var(--border, #ddd); border-radius: 4px; overflow: hidden; width: fit-content; }
.item-qty button { width: 32px; height: 32px; border: none; background: var(--neutral-100, #f8f8f8); cursor: pointer; font-size: 14px; transition: all 0.2s; }
.item-qty button:hover:not(:disabled) { background: #eee; }
.item-qty button:disabled { color: #ccc; cursor: not-allowed; }
.item-qty span { width: 40px; text-align: center; font-size: 14px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; line-height: 32px; }
.item-total { font-size: 14px; font-weight: 700; color: var(--brand-primary, #FF9900); }
.item-remove { background: none; border: none; color: #999; cursor: pointer; padding: 8px; font-size: 14px; transition: color 0.2s; }
.item-remove:hover { color: #ff4757; }
.cart-summary { background: var(--bg-card, #fff); border-radius: 8px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); position: sticky; top: 80px; height: fit-content; }
.cart-summary h3 { font-size: 18px; margin-bottom: 20px; color: #222; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #666; }
.summary-row.total { font-size: 18px; font-weight: 700; color: var(--brand-primary, #FF9900); border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px; }
.free-ship { color: var(--success, #067D62); font-weight: 600; }
.btn-checkout { width: 100%; padding: 14px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 16px; transition: all 0.2s; }
.btn-checkout:hover { background: var(--brand-primary-hover, #E68A00); }
.continue-shopping { display: block; text-align: center; margin-top: 16px; font-size: 13px; color: #999; text-decoration: none; }
.continue-shopping:hover { color: var(--brand-primary, #FF9900); }
@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
  .cart-header { display: none; }
  .cart-item { grid-template-columns: 30px auto 1fr; gap: 10px; padding: 12px; }
  .item-check { grid-row: 1; }
  .item-product { grid-column: 2 / -1; display: flex; gap: 10px; align-items: center; }
  .item-img { width: 56px; height: 56px; }
  .item-name { font-size: 13px; }
  .item-price { grid-column: 2; font-size: 13px; }
  .item-qty { grid-column: 2; }
  .item-total { grid-column: 2; font-size: 13px; font-weight: 700; }
  .item-remove { grid-column: 3; grid-row: 1; justify-self: end; align-self: start; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; }
  .cart-summary { position: static; }
  .page-title { font-size: 18px; }
  .btn-checkout { min-height: 48px; font-size: 15px; }
}
@media (max-width: 480px) {
  .cart-item { grid-template-columns: 1fr; gap: 8px; padding: 12px 8px; }
  .item-check { display: none; }
  .item-product { grid-column: 1; }
  .item-price { font-size: 13px; }
  .item-total { font-size: 13px; font-weight: 700; }
  .item-remove { grid-column: 1; justify-self: end; }
  .item-qty button { width: 36px; height: 36px; font-size: 14px; } /* 36px touch target */
  .item-qty span { width: 40px; font-size: 13px; line-height: 36px; }
  .item-qty { min-height: 36px; }
}
</style>

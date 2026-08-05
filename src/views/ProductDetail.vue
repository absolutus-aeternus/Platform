<template>
  <div class="product-detail">
    <div class="container">
      <div class="product-grid">
        <div class="product-images">
          <div class="main-image">
            <div class="img-placeholder">{{ product.name?.[0] || 'P' }}</div>
          </div>
        </div>
        
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <div class="price-row">
            <span class="price">${{ product.price }}</span>
            <span class="original-price">${{ product.originalPrice }}</span>
            <span class="discount">-{{ product.discount }}%</span>
          </div>
          <div class="sales-info">
            <span>Sold {{ product.sales }}</span>
            <span>{{ product.rating }} Rating</span>
          </div>
          
          <div class="quantity-row">
            <span>Quantity:</span>
            <div class="quantity-control">
              <button @click="quantity > 1 && quantity--">-</button>
              <input v-model.number="quantity" type="number" min="1">
              <button @click="quantity++">+</button>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn-cart" @click="addToCart">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="btn-buy" @click="buyNow">
              Buy Now
            </button>
          </div>
          
          <div class="store-info">
            <div class="store-avatar">{{ product.store?.[0] || 'S' }}</div>
            <div>
              <h4>{{ product.store }}</h4>
              <p>{{ product.storeProducts }} Products</p>
            </div>
            <button class="btn-visit">Visit Store</button>
          </div>
        </div>
      </div>
      
      <div class="product-tabs">
        <button :class="{ active: tab === 'detail' }" @click="tab = 'detail'">Product Details</button>
        <button :class="{ active: tab === 'reviews' }" @click="tab = 'reviews'">Reviews</button>
      </div>
      
      <div class="tab-content">
        <div v-if="tab === 'detail'" class="detail-content">
          <h3>Product Description</h3>
          <p>{{ product.description }}</p>
        </div>
        <div v-if="tab === 'reviews'" class="reviews-content">
          <p>No reviews yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tab = ref('detail')
const quantity = ref(1)

const product = ref({
  id: route.params.id,
  name: 'COOFANDY Mens Shawl Collar Long Cardigan Knit Ruffle Fashion Sweater Drape Cape',
  price: '34.60',
  originalPrice: '69.20',
  discount: 50,
  sales: '26,042',
  rating: '4.8',
  store: 'Dw專賣',
  storeProducts: 195,
  description: 'Premium quality men\'s cardigan with elegant shawl collar design. Made from high-quality knit material for comfort and durability. Perfect for casual and formal occasions.'
})

const addToCart = () => {
  userStore.addToCart({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    quantity: quantity.value
  })
  alert('Added to cart!')
}

const buyNow = () => {
  addToCart()
  router.push('/checkout')
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.img-placeholder { height: 400px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 80px; color: #ccc; border-radius: 8px; }
.product-info h1 { font-size: 20px; margin-bottom: 15px; }
.price-row { margin-bottom: 15px; }
.price { font-size: 28px; color: #fe2c55; font-weight: 700; }
.original-price { text-decoration: line-through; color: #999; margin-left: 10px; }
.discount { background: #fe2c55; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
.sales-info { color: #666; font-size: 14px; margin-bottom: 20px; }
.sales-info span { margin-right: 20px; }
.quantity-row { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
.quantity-control { display: flex; border: 1px solid #ddd; border-radius: 4px; }
.quantity-control button { width: 35px; height: 35px; border: none; background: #f5f5f5; cursor: pointer; }
.quantity-control input { width: 50px; text-align: center; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
.action-buttons { display: flex; gap: 15px; margin-bottom: 30px; }
.btn-cart { flex: 1; padding: 14px; background: #ff6b81; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.btn-buy { flex: 1; padding: 14px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.store-info { display: flex; align-items: center; gap: 15px; padding: 20px; background: #f8f8f8; border-radius: 8px; }
.store-avatar { width: 50px; height: 50px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.btn-visit { margin-left: auto; padding: 8px 20px; border: 1px solid #fe2c55; color: #fe2c55; background: none; border-radius: 4px; cursor: pointer; }
.product-tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 20px; }
.product-tabs button { padding: 12px 25px; background: none; border: none; font-size: 16px; cursor: pointer; color: #666; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.product-tabs button.active { color: #fe2c55; border-bottom-color: #fe2c55; }
.detail-content, .reviews-content { padding: 20px; }
</style>

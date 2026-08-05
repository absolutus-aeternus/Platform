<template>
  <div class="product-detail">
    <div class="container">
      <div v-if="loading" class="loading">Loading product...</div>
      <div v-else-if="!product" class="not-found">Product not found</div>
      <template v-else>
        <div class="product-grid">
          <div class="product-images">
            <div class="main-image">
              <div class="img-placeholder">{{ product.name[0] }}</div>
            </div>
          </div>
          
          <div class="product-info">
            <h1>{{ product.name }}</h1>
            <div class="price-row">
              <span class="price">${{ product.price }}</span>
              <span v-if="product.original_price" class="original-price">${{ product.original_price }}</span>
              <span v-if="product.discount" class="discount">-{{ product.discount }}%</span>
            </div>
            <div class="sales-info">
              <span>Sold {{ product.sales_count || 0 }}</span>
              <span>{{ product.rating || 0 }} Rating</span>
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
              <button class="btn-cart" @click="addToCart" :disabled="adding">
                <i class="fas fa-shopping-cart"></i> {{ adding ? 'Adding...' : 'Add to Cart' }}
              </button>
              <button class="btn-buy" @click="buyNow">Buy Now</button>
            </div>
            
            <div v-if="product.sellers" class="store-info">
              <div class="store-avatar">{{ product.sellers?.name?.[0] || 'S' }}</div>
              <div>
                <h4>{{ product.sellers?.name || 'Store' }}</h4>
                <p>{{ product.sellers?.goods_count || 0 }} Products</p>
              </div>
              <button class="btn-visit" @click="$router.push(`/store/${product.seller_id}`)">Visit Store</button>
              <button class="btn-chat" @click="chatWithSeller"><i class="fas fa-comments"></i> Chat</button>
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
            <p>{{ product.description || 'No description available.' }}</p>
          </div>
          <div v-if="tab === 'reviews'" class="reviews-content">
            <p>No reviews yet.</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const setChatSeller = inject('setChatSeller')

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tab = ref('detail')
const quantity = ref(1)
const product = ref(null)
const loading = ref(true)
const adding = ref(false)

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, sellers(name, goods_count)')
      .eq('id', route.params.id)
      .single()
    
    if (error) throw error
    product.value = data
  } catch (e) {
    console.error('Failed to load product:', e)
  } finally {
    loading.value = false
  }
})

const addToCart = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  adding.value = true
  try {
    await userStore.addToCart({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      quantity: quantity.value
    })
    alert('Added to cart!')
  } catch (e) {
    alert('Failed to add to cart')
  } finally {
    adding.value = false
  }
}

const buyNow = async () => {
  await addToCart()
  router.push('/checkout')
}

const chatWithSeller = () => {
  if (product.value?.sellers) {
    setChatSeller(product.value.seller_id, product.value.sellers.name)
  }
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.loading, .not-found { text-align: center; padding: 60px 0; color: #999; }
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
.btn-cart:disabled { background: #ccc; cursor: not-allowed; }
.btn-buy { flex: 1; padding: 14px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.store-info { display: flex; align-items: center; gap: 15px; padding: 20px; background: #f8f8f8; border-radius: 8px; }
.store-avatar { width: 50px; height: 50px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.btn-visit { padding: 8px 20px; border: 1px solid #fe2c55; color: #fe2c55; background: none; border-radius: 4px; cursor: pointer; }
.btn-chat { padding: 8px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; }
.product-tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 20px; }
.product-tabs button { padding: 12px 25px; background: none; border: none; font-size: 16px; cursor: pointer; color: #666; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.product-tabs button.active { color: #fe2c55; border-bottom-color: #fe2c55; }
.detail-content, .reviews-content { padding: 20px; }
</style>

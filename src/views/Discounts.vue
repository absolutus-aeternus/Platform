<template>
  <div class="discounts-page">
    <div class="container">
      <h1>🔥 Hot Deals</h1>
      <div v-if="loading" class="loading">Loading deals...</div>
      <div v-else-if="products.length === 0" class="empty">No deals available</div>
      <div v-else class="product-grid">
        <FlashSaleCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchProducts } from '@/services/supabase'
import FlashSaleCard from '@/components/product/FlashSaleCard.vue'

const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await fetchProducts({ limit: 12, sort: 'sales' })
    const allData = data || []
    products.value = allData.filter(p => p.discount > 0)
    if (products.value.length === 0) {
      products.value = allData
    }
  } catch (e) {
    console.error('Failed to load deals:', e)
  }
  loading.value = false
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card:hover { transform: translateY(-3px); }
.discount-badge { position: absolute; top: 10px; left: 10px; background: var(--brand-primary, var(--brand-primary, #FF9900)); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; z-index: 1; }
.img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price-row { margin-bottom: 5px; }
.price { color: var(--brand-primary, var(--brand-primary, #FF9900)); font-size: 18px; font-weight: 700; }
.original { color: #999; text-decoration: line-through; font-size: 13px; margin-left: 8px; }
.product-sales { color: #999; font-size: 12px; }
@media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } h1 { font-size: 1.25rem; } .img-placeholder { height: 150px; font-size: 36px; } .product-info { padding: 10px; } .product-info h3 { font-size: 13px; } .price { font-size: 16px; } }
@media (max-width: 480px) { .product-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } .img-placeholder { height: 120px; font-size: 28px; } .product-info { padding: 8px; } .product-info h3 { font-size: 12px; } .price { font-size: 14px; } }
</style>

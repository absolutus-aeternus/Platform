<template>
  <div class="page-wrapper">
  <div class="scraper-page">
    <div class="page-header">
      <h1><i class="fas fa-spider"></i> Product Scraper</h1>
      <p>Import products from any e-commerce URL. Paste a link and we'll extract all product details.</p>
    </div>

    <!-- URL Input -->
    <div class="scraper-input-section">
      <div class="url-input-wrapper">
        <div class="input-group">
          <i class="fas fa-link"></i>
          <input 
            v-model="url" 
            type="url" 
            placeholder="Paste product URL (Amazon, AliExpress, eBay, Walmart, etc.)"
            @keydown.enter="scrapeUrl"
            :disabled="loading"
          >
          <button class="btn-scrape" @click="scrapeUrl" :disabled="!url || loading">
            <i class="fas fa-spinner fa-spin" v-if="loading"></i>
            <i class="fas fa-download" v-else></i>
            {{ loading ? 'Scraping...' : 'Scrape' }}
          </button>
        </div>
        <div class="supported-sites">
          <span class="site-tag" v-for="site in supportedSites" :key="site">
            <i :class="site.icon"></i> {{ site.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Batch Import -->
    <div class="batch-section">
      <h3><i class="fas fa-layer-group"></i> Batch Import</h3>
      <textarea 
        v-model="batchUrls" 
        placeholder="Paste multiple URLs (one per line) for batch import..."
        rows="4"
      ></textarea>
      <button class="btn-batch" @click="batchScrape" :disabled="!batchUrls || loading">
        <i class="fas fa-upload"></i> Import All
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loader">
        <div class="loader-spinner"></div>
        <p>Scraping product data...</p>
        <p class="loader-sub">Extracting name, price, images, reviews, specifications...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-section">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="error = ''" class="btn-dismiss">Dismiss</button>
    </div>

    <!-- Scraped Product Preview -->
    <div v-if="scrapedProduct" class="preview-section">
      <div class="preview-header">
        <h2><i class="fas fa-box-open"></i> Scraped Product</h2>
        <div class="preview-actions">
          <button class="btn-save" @click="saveToSupabase" :disabled="saving">
            <i class="fas fa-spinner fa-spin" v-if="saving"></i>
            <i class="fas fa-database" v-else></i>
            {{ saving ? 'Saving...' : 'Save to Database' }}
          </button>
          <button class="btn-secondary" @click="editProduct">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-secondary" @click="scrapedProduct = null">
            <i class="fas fa-times"></i> Clear
          </button>
        </div>
      </div>

      <div class="preview-grid">
        <!-- Images -->
        <div class="preview-images">
          <div class="main-image">
            <img loading="lazy" :src="scrapedProduct.images?.[0] || '/placeholder.png'" :alt="scrapedProduct.name">
          </div>
          <div class="image-thumbs" v-if="scrapedProduct.images?.length > 1">
            <img loading="lazy"
              v-for="(img, i) in scrapedProduct.images.slice(0, 6)" 
              :key="i" 
              :src="img" :alt="(scrapedProduct.name || 'Product') + ' image ' + (i+1)" 
              :class="{ active: selectedImage === i }"
              @click="selectedImage = i"
            >
          </div>
        </div>

        <!-- Details -->
        <div class="preview-details">
          <div class="detail-row">
            <label>Name</label>
            <input v-model="scrapedProduct.name" class="detail-input">
          </div>
          <div class="detail-row">
            <label>Price (USD)</label>
            <input v-model.number="scrapedProduct.price" type="number" step="0.01" class="detail-input">
          </div>
          <div class="detail-row">
            <label>Original Price</label>
            <input v-model.number="scrapedProduct.originalPrice" type="number" step="0.01" class="detail-input">
          </div>
          <div class="detail-row">
            <label>Category</label>
            <select v-model="scrapedProduct.categoryId" class="detail-input">
              <option value="">Select category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.name }}</option>
            </select>
          </div>
          <div class="detail-row">
            <label>Rating</label>
            <input v-model.number="scrapedProduct.rating" type="number" step="0.1" min="0" max="5" class="detail-input">
          </div>
          <div class="detail-row">
            <label>Reviews Count</label>
            <input v-model.number="scrapedProduct.reviewCount" type="number" class="detail-input">
          </div>
          <div class="detail-row full">
            <label>Description</label>
            <textarea v-model="scrapedProduct.description" class="detail-input" rows="4"></textarea>
          </div>
          <div class="detail-row full">
            <label>Specifications</label>
            <div class="specs-grid">
              <div v-for="(val, key) in scrapedProduct.specs" :key="key" class="spec-item">
                <span class="spec-key">{{ key }}</span>
                <span class="spec-val">{{ val }}</span>
              </div>
            </div>
          </div>
          <div class="detail-row">
            <label>Source</label>
            <span class="source-badge">{{ scrapedProduct.marketplace }}</span>
            <a :href="scrapedProduct.url" target="_blank" rel="noopener" class="source-link">
              <i class="fas fa-external-link-alt"></i> View Original
            </a>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div v-if="scrapedProduct.reviews?.length" class="reviews-section">
        <h3><i class="fas fa-comments"></i> Reviews ({{ scrapedProduct.reviews.length }})</h3>
        <div class="reviews-grid">
          <div v-for="(review, i) in scrapedProduct.reviews" :key="i" class="review-card">
            <div class="review-header">
              <span class="review-author">{{ review.author || 'Anonymous' }}</span>
              <div class="review-rating">
                <i v-for="n in 5" :key="n" class="fas fa-star" :style="{ color: n <= review.rating ? '#f59e0b' : '#e2e8f0' }"></i>
              </div>
              <span class="review-date">{{ review.date }}</span>
            </div>
            <p class="review-text">{{ review.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Scraping History -->
    <div v-if="history.length" class="history-section">
      <h3><i class="fas fa-history"></i> Recent Scrapes</h3>
      <div class="history-grid">
        <div v-for="(item, i) in history" :key="i" class="history-card" @click="scrapedProduct = item">
          <img loading="lazy" :src="item.images?.[0] || '/placeholder.png'" :alt="item.name">
          <div class="history-info">
            <h4>{{ item.name?.substring(0, 40) }}...</h4>
            <p>${{ item.price }} · {{ item.marketplace }}</p>
          </div>
          <span class="history-badge" :class="item.saved ? 'saved' : 'pending'">
            {{ item.saved ? 'Saved' : 'Pending' }}
          </span>
        </div>
      </div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { scrapeProduct } from '@/services/scraper'

const url = ref('')
const batchUrls = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const scrapedProduct = ref(null)
const selectedImage = ref(0)
const categories = ref([])
const history = ref([])

const supportedSites = [
  { name: 'Amazon', icon: 'fab fa-amazon' },
  { name: 'AliExpress', icon: 'fas fa-globe' },
  { name: 'eBay', icon: 'fab fa-ebay' },
  { name: 'Walmart', icon: 'fas fa-store' },
  { name: 'Target', icon: 'fas fa-bullseye' },
  { name: 'Best Buy', icon: 'fas fa-laptop' },
  { name: 'Any URL', icon: 'fas fa-link' },
]

onMounted(async () => {
  const { data } = await supabase.from('categories').select('id, name, icon').order('sort_order')
  if (data) categories.value = data
})

const scrapeUrl = async () => {
  if (!url.value) return
  loading.value = true
  error.value = ''
  scrapedProduct.value = null

  try {
    // Call server-side scraper API
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.value })
    })
    
    const result = await response.json()
    
    if (result.success) {
      scrapedProduct.value = {
        ...result.product,
        categoryId: categories.value[0]?.id || '',
        saved: false
      }
      history.value.unshift(scrapedProduct.value)
      if (history.value.length > 20) history.value.pop()
    } else {
      error.value = result.error || 'Failed to scrape product'
    }
  } catch (e) {
    // If API not available, try client-side scraping
    try {
      const result = await scrapeProduct(url.value)
      if (result.success) {
        scrapedProduct.value = {
          ...result.product,
          categoryId: categories.value[0]?.id || '',
          saved: false
        }
        history.value.unshift(scrapedProduct.value)
      } else {
        error.value = result.error
      }
    } catch (e2) {
      error.value = 'Scraping failed: ' + e.message
    }
  }
  
  loading.value = false
}

const batchScrape = async () => {
  const urls = batchUrls.value.split('\n').filter(u => u.trim())
  if (!urls.length) return
  
  loading.value = true
  error.value = ''
  
  for (const u of urls) {
    url.value = u.trim()
    await scrapeUrl()
  }
  
  batchUrls.value = ''
  loading.value = false
}

const saveToSupabase = async () => {
  if (!scrapedProduct.value) return
  saving.value = true
  
  try {
    const p = scrapedProduct.value
    const { error: err } = await supabase.from('products').insert({
      
      name: p.name,
      description: p.description?.substring(0, 500) || '',
      price: p.price || 0,
      original_price: p.originalPrice || p.price || 0,
      sales_count: p.reviewCount || 0,
      rating: p.rating || 4.5,
      images: p.images || [],
      status: 'active',
      stock: 999,
      category_id: p.categoryId || categories.value[0]?.id,
    })
    
    if (err) throw err
    
    scrapedProduct.value.saved = true
    window.__toast?.show('Product saved!', 'success')
  } catch (e) {
    error.value = 'Failed to save: ' + e.message
  }
  
  saving.value = false
}

const editProduct = () => {
  // Enable inline editing (already enabled via v-model)
}


</script>

<style scoped>
header { z-index: 2; }
.scraper-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
.page-header h1 i { color: var(--brand-primary, #FF9900); margin-right: 8px; }
.page-header p { color: #666; font-size: 15px; }

.scraper-input-section { background: #fff; padding: 32px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
.url-input-wrapper { max-width: 800px; }
.input-group { display: flex; align-items: center; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; transition: border-color 0.2s; }
.input-group:focus-within { border-color: var(--brand-primary, #FF9900); }
.input-group i { padding: 0 16px; color: #999; font-size: 18px; }
.input-group input { flex: 1; padding: 16px 0; border: none; font-size: 15px; outline: none; }
.btn-scrape { padding: 16px 32px; background: linear-gradient(135deg, var(--brand-primary, #FF9900), #ff6b81); color: #fff; border: none; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
.btn-scrape:hover { filter: brightness(1.1); }
.btn-scrape:disabled { opacity: 0.5; cursor: not-allowed; }
.supported-sites { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.site-tag { background: #f0f0f0; padding: 4px 12px; border-radius: 20px; font-size: 12px; color: #666; display: flex; align-items: center; gap: 4px; }

.batch-section { background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
.batch-section h3 { margin-bottom: 12px; font-size: 16px; }
.batch-section textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box; }
.btn-batch { margin-top: 12px; padding: 10px 24px; background: #1a1a2e; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }

.loading-section { text-align: center; padding: 60px; }
.loader-spinner { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: var(--brand-primary, #FF9900); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loader p { font-size: 16px; font-weight: 600; }
.loader-sub { color: #999; font-size: 14px; }

.error-section { background: #f8d7da; padding: 16px 20px; border-radius: 10px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: #721c24; }
.btn-dismiss { margin-left: auto; background: none; border: 1px solid #721c24; padding: 4px 12px; border-radius: 6px; cursor: pointer; color: #721c24; }

.preview-section { background: #fff; padding: 32px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
.preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.preview-header h2 { font-size: 20px; }
.preview-actions { display: flex; gap: 8px; }
.btn-save { padding: 10px 20px; background: linear-gradient(135deg, var(--success, #067D62), #20c997); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-secondary { padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }

.preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.preview-images .main-image { background: #f8f8f8; border-radius: 12px; overflow: hidden; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
.preview-images .main-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
.image-thumbs { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; }
.image-thumbs img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid transparent; cursor: pointer; }
.image-thumbs img.active { border-color: var(--brand-primary, #FF9900); }

.detail-row { margin-bottom: 16px; }
.detail-row.full { grid-column: 1 / -1; }
.detail-row label { display: block; font-weight: 600; font-size: 13px; color: #666; margin-bottom: 4px; }
.detail-input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.detail-input:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
textarea.detail-input { resize: vertical; font-family: inherit; }
select.detail-input { cursor: pointer; }
.source-badge { background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; text-transform: capitalize; }
.source-link { margin-left: 8px; color: var(--brand-primary, #FF9900); font-size: 13px; }

.specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.spec-item { display: flex; gap: 8px; font-size: 13px; padding: 8px; background: #f8f8f8; border-radius: 6px; }
.spec-key { font-weight: 600; color: #666; min-width: 100px; }
.spec-val { color: #333; }

.reviews-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
.reviews-section h3 { margin-bottom: 16px; }
.reviews-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.review-card { background: #f8f8f8; padding: 16px; border-radius: 10px; }
.review-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.review-author { font-weight: 600; font-size: 14px; }
.review-rating i { font-size: 12px; }
.review-date { font-size: 12px; color: #999; margin-left: auto; }
.review-text { font-size: 13px; color: #555; line-height: 1.5; }

.history-section { background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.history-section h3 { margin-bottom: 16px; }
.history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
.history-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f8f8; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.history-card:hover { background: #f0f0f0; }
.history-card img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
.history-info { flex: 1; }
.history-info h4 { font-size: 13px; margin-bottom: 2px; }
.history-info p { font-size: 12px; color: #999; }
.history-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; }
.history-badge.saved { background: #d1fae5; color: #065f46; }
.history-badge.pending { background: #fef3c7; color: #92400e; }

@media (max-width: 768px) {
  .preview-grid { grid-template-columns: 1fr; }
  .reviews-grid { grid-template-columns: 1fr; }
  .specs-grid { grid-template-columns: 1fr; }
  .input-group { flex-direction: column; }
  .btn-scrape { width: 100%; justify-content: center; }
}
</style>

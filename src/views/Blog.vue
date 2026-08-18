<template>
  <div class="blog-page">
    <div class="container">
      <h1><i class="fas fa-newspaper"></i> Blog & Guides</h1>
      <p class="subtitle">Tips, tutorials, and updates from AllianceHub</p>

      <div class="blog-grid">
        <div class="blog-card featured" v-if="posts.length">
          <div class="blog-img" :style="{ background: posts[0].gradient }"><i :class="posts[0].icon"></i></div>
          <div class="blog-body">
            <span class="blog-tag">{{ posts[0].tag }}</span>
            <h2>{{ posts[0].title }}</h2>
            <p>{{ posts[0].excerpt }}</p>
            <div class="blog-meta"><span><i class="fas fa-clock"></i> {{ posts[0].date }}</span><span><i class="fas fa-eye"></i> {{ posts[0].views }}</span></div>
          </div>
        </div>

        <div class="blog-list">
          <div class="blog-card" v-for="post in posts.slice(1)" :key="post.id">
            <div class="blog-img small" :style="{ background: post.gradient }"><i :class="post.icon"></i></div>
            <div class="blog-body">
              <span class="blog-tag">{{ post.tag }}</span>
              <h3>{{ post.title }}</h3>
              <p>{{ post.excerpt }}</p>
              <div class="blog-meta"><span><i class="fas fa-clock"></i> {{ post.date }}</span><span><i class="fas fa-eye"></i> {{ post.views }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="categories-section">
        <h2>Browse by Category</h2>
        <div class="cat-tags">
          <span class="cat-tag" v-for="cat in categories" :key="cat" @click="selectedCat = selectedCat === cat ? '' : cat" :class="{ active: selectedCat === cat }">{{ cat }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const selectedCat = ref('')
const categories = ['Shopping Tips', 'Seller Guide', 'Product Reviews', 'Tutorials', 'Industry News', 'Promotions']
const posts = [
  { id: 1, title: 'How to Find the Best Deals on AllianceHub', excerpt: 'Discover insider tips for finding the lowest prices, using flash sales, and stacking coupons for maximum savings.', tag: 'Shopping Tips', date: 'Aug 10, 2026', views: '2.3K', icon: 'fas fa-tags', gradient: 'linear-gradient(135deg, var(--brand-primary, var(--brand-primary, #FF9900)), var(--brand-primary-hover, #E68A00))' },
  { id: 2, title: 'Complete Guide to Starting Your Online Store', excerpt: 'Everything you need to know about becoming a seller on AllianceHub, from registration to your first sale.', tag: 'Seller Guide', date: 'Aug 8, 2026', views: '1.8K', icon: 'fas fa-store', gradient: 'linear-gradient(135deg, var(--brand-accent, var(--brand-accent, #007185)), #00a0c4)' },
  { id: 3, title: 'Top 10 Electronics Under $50', excerpt: 'Our curated list of the best budget electronics available on the platform with real user reviews.', tag: 'Product Reviews', date: 'Aug 5, 2026', views: '3.1K', icon: 'fas fa-laptop', gradient: 'linear-gradient(135deg, #067D62, #00a07a)' },
  { id: 4, title: 'Understanding Crypto Payments', excerpt: 'A beginner-friendly guide to using cryptocurrency for online shopping on AllianceHub.', tag: 'Tutorials', date: 'Aug 3, 2026', views: '1.5K', icon: 'fab fa-bitcoin', gradient: 'linear-gradient(135deg, #F0B90B, #e6a800)' },
  { id: 5, title: 'Summer Sale: Up to 70% Off', excerpt: 'Our biggest sale of the season is here. Thousands of products at incredible prices.', tag: 'Promotions', date: 'Aug 1, 2026', views: '5.2K', icon: 'fas fa-fire', gradient: 'linear-gradient(135deg, #CC0C39, #ff4757)' },
  { id: 6, title: 'Shipping & Delivery: What You Need to Know', excerpt: 'Complete guide to shipping options, tracking, and delivery times for all regions.', tag: 'Tutorials', date: 'Jul 28, 2026', views: '980', icon: 'fas fa-truck', gradient: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' },
]
</script>

<style scoped>
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
.subtitle { color: var(--text-secondary); margin-bottom: 2rem; }
h2 { font-size: 1.125rem; margin: 2rem 0 1rem; }
.blog-card { background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); transition: all 0.2s; cursor: pointer; }
.blog-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.blog-card.featured { display: grid; grid-template-columns: 1fr 1fr; }
.blog-card.featured .blog-img { min-height: 250px; }
.blog-img { height: 160px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); font-size: 3rem; }
.blog-img.small { height: 120px; font-size: 2rem; }
.blog-body { padding: 1.25rem; }
.blog-tag { font-size: 0.6875rem; color: var(--brand-primary); font-weight: 600; text-transform: uppercase; }
.blog-body h2 { font-size: 1.25rem; margin: 0.375rem 0 0.5rem; }
.blog-body h3 { font-size: 0.9375rem; margin: 0.375rem 0 0.5rem; }
.blog-body p { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; margin: 0 0 0.75rem; }
.blog-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: var(--text-muted); }
.blog-meta i { margin-right: 0.25rem; }
.blog-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }
.blog-list .blog-card { display: flex; flex-direction: column; }
.cat-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.cat-tag { padding: 0.375rem 0.875rem; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-full); font-size: 0.8125rem; cursor: pointer; transition: all 0.15s; }
.cat-tag.active, .cat-tag:hover { background: var(--brand-primary); color: #fff; border-color: var(--brand-primary); }
@media (max-width: 768px) { .blog-card.featured { grid-template-columns: 1fr; } .blog-list { grid-template-columns: 1fr; } }
</style>

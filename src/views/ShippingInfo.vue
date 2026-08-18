<template>
  <div class="shipping-page">
    <div class="container">
      <h1><i class="fas fa-truck"></i> Shipping Information</h1>

      <div class="info-cards">
        <div class="info-card">
          <i class="fas fa-gift" style="color:var(--brand-primary, var(--brand-primary, #FF9900))"></i>
          <h3>Free Shipping</h3>
          <p>On orders over $30. Standard delivery 7-14 business days.</p>
        </div>
        <div class="info-card">
          <i class="fas fa-bolt" style="color:var(--brand-accent, var(--brand-accent, #007185))"></i>
          <h3>Express Delivery</h3>
          <p>2-3 business days. Available for most locations worldwide.</p>
        </div>
        <div class="info-card">
          <i class="fas fa-undo" style="color:#067D62"></i>
          <h3>Easy Returns</h3>
          <p>7-day return policy. Hassle-free returns on most items.</p>
        </div>
      </div>

      <div class="rates-section">
        <h2>Shipping Rates</h2>
        <table class="rates-table">
          <thead>
            <tr><th>Method</th><th>Delivery Time</th><th>Cost</th><th>Free Above</th><th>Tracking</th></tr>
          </thead>
          <tbody>
            <tr><td>Economy</td><td>7-14 days</td><td>Free</td><td>$30</td><td><i class="fas fa-check" style="color:var(--success, #067D62)"></i></td></tr>
            <tr><td>Standard</td><td>5-7 days</td><td>$4.99</td><td>$50</td><td><i class="fas fa-check" style="color:var(--success, #067D62)"></i></td></tr>
            <tr><td>Express</td><td>2-3 days</td><td>$12.99</td><td>$100</td><td><i class="fas fa-check" style="color:var(--success, #067D62)"></i></td></tr>
            <tr><td>Next Day</td><td>1 day</td><td>$24.99</td><td>-</td><td><i class="fas fa-check" style="color:var(--success, #067D62)"></i></td></tr>
          </tbody>
        </table>
      </div>

      <div class="carriers-section">
        <h2>Our Shipping Partners</h2>
        <div class="carriers-grid">
          <div class="carrier-card" v-for="carrier in carriers" :key="carrier.name">
            <i :class="carrier.icon" :style="{ color: carrier.color }"></i>
            <span>{{ carrier.name }}</span>
          </div>
        </div>
      </div>

      <div class="faq-section">
        <h2>Shipping FAQ</h2>
        <div class="faq-item" v-for="(faq, i) in faqs" :key="i" @click="openFaq = openFaq === i ? -1 : i">
          <div class="faq-q"><span>{{ faq.q }}</span><i :class="openFaq === i ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i></div>
          <div v-if="openFaq === i" class="faq-a">{{ faq.a }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const openFaq = ref(-1)
const carriers = [
  { name: 'FedEx', icon: 'fas fa-box', color: '#4D148C' },
  { name: 'UPS', icon: 'fas fa-box', color: '#351C15' },
  { name: 'DHL', icon: 'fas fa-box', color: '#FFCC00' },
  { name: 'USPS', icon: 'fas fa-box', color: '#333366' },
  { name: 'J&T Express', icon: 'fas fa-box', color: '#E60012' },
  { name: 'JNE', icon: 'fas fa-box', color: '#CC0000' },
]
const faqs = [
  { q: 'Do you ship internationally?', a: 'Yes, we ship to 50+ countries worldwide. Shipping rates and delivery times vary by destination.' },
  { q: 'How can I track my order?', a: 'Once your order is shipped, you will receive a tracking number. Use our Track Order page to check the status.' },
  { q: 'What if my package is lost?', a: 'Contact our customer service within 30 days of the expected delivery date. We will investigate and provide a full refund if confirmed lost.' },
  { q: 'Can I change my shipping address after ordering?', a: 'You can change the address within 1 hour of placing the order. After that, please contact customer service.' },
]
</script>

<style scoped>
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
h2 { font-size: 1.125rem; margin: 2rem 0 1rem; }
.info-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
.info-card { background: #fff; padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); text-align: center; }
.info-card i { font-size: 2rem; margin-bottom: 0.75rem; }
.info-card h3 { font-size: 0.9375rem; margin-bottom: 0.5rem; }
.info-card p { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
.rates-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); }
.rates-table th, .rates-table td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 0.8125rem; }
.rates-table th { background: #f8f9fa; font-weight: 600; color: var(--text-secondary); }
.carriers-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
.carrier-card { background: #fff; padding: 1.25rem; border-radius: var(--radius-md); box-shadow: var(--shadow-xs); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.carrier-card i { font-size: 1.5rem; }
.carrier-card span { font-size: 0.75rem; font-weight: 600; }
.faq-item { background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-xs); margin-bottom: 0.5rem; cursor: pointer; }
.faq-q { display: flex; justify-content: space-between; padding: 1rem 1.25rem; font-weight: 600; font-size: 0.875rem; }
.faq-q i { color: var(--text-muted); font-size: 0.75rem; }
.faq-a { padding: 0 1.25rem 1rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; }
@media (max-width: 768px) { .info-cards { grid-template-columns: 1fr; } .carriers-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 480px) { .carriers-grid { grid-template-columns: repeat(2, 1fr); } }
</style>

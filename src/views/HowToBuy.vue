<template><div class="page-wrapper">
  <div class="how-to-buy-page">
    <div class="container">
      <h1><i class="fas fa-shopping-basket"></i> How to Buy</h1>
      <p class="subtitle">Follow these simple steps to start shopping on AllianceHub</p>

      <div class="steps-grid">
        <div class="step-card" v-for="(step, i) in steps" :key="i">
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-icon" :style="{ background: step.color }"><i :class="step.icon"></i></div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </div>
      </div>

      <div class="tips-section">
        <h2><i class="fas fa-lightbulb"></i> Shopping Tips</h2>
        <div class="tips-grid">
          <div class="tip-card" v-for="tip in tips" :key="tip.title">
            <i :class="tip.icon" :style="{ color: tip.color }"></i>
            <div>
              <h4>{{ tip.title }}</h4>
              <p>{{ tip.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="faq-section">
        <h2><i class="fas fa-question-circle"></i> Frequently Asked Questions</h2>
        <div class="faq-list">
          <div class="faq-item" v-for="(faq, i) in faqs" :key="i" @click="openFaq = openFaq === i ? -1 : i">
            <div class="faq-question"><span>{{ faq.q }}</span><i :class="openFaq === i ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i></div>
            <div v-if="openFaq === i" class="faq-answer">{{ faq.a }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { ref } from 'vue'

const openFaq = ref(-1)

const steps = [
  { icon: 'fas fa-user-plus', title: 'Create Account', desc: 'Sign up for free with your email. Verify your account to unlock all features.', color: 'var(--brand-primary, #FF9900)' },
  { icon: 'fas fa-search', title: 'Browse Products', desc: 'Explore millions of products across 20+ categories. Use filters to find exactly what you need.', color: 'var(--brand-accent, #007185)' },
  { icon: 'fas fa-cart-plus', title: 'Add to Cart', desc: 'Found something you like? Add it to your cart. You can continue shopping or checkout.', color: '#067D62' },
  { icon: 'fas fa-credit-card', title: 'Checkout & Pay', desc: 'Enter your shipping address and choose a payment method. We support crypto payments.', color: '#CC0C39' },
  { icon: 'fas fa-truck', title: 'Track Delivery', desc: 'Track your order in real-time. Get notifications at every step from warehouse to your door.', color: '#6c5ce7' },
  { icon: 'fas fa-star', title: 'Rate & Review', desc: 'Share your experience! Rate products and help other buyers make informed decisions.', color: 'var(--brand-primary, #FF9900)' },
]

const tips = [
  { icon: 'fas fa-shield-alt', title: 'Buy from Verified Sellers', desc: 'Look for the verified badge on seller profiles for guaranteed quality.', color: 'var(--brand-accent, #007185)' },
  { icon: 'fas fa-tags', title: 'Use Flash Sales', desc: 'Check the Flash Sale section for limited-time deals with up to 70% off.', color: '#CC0C39' },
  { icon: 'fas fa-heart', title: 'Save to Wishlist', desc: 'Add items to your wishlist and get notified when prices drop.', color: 'var(--brand-primary, #FF9900)' },
  { icon: 'fas fa-comments', title: 'Chat with Sellers', desc: 'Ask questions about products directly to sellers before buying.', color: '#067D62' },
  { icon: 'fas fa-undo', title: 'Know the Return Policy', desc: 'Most items have a 7-day return guarantee. Check product details for specifics.', color: '#6c5ce7' },
  { icon: 'fas fa-wallet', title: 'Use Wallet for Faster Checkout', desc: 'Top up your wallet for instant payments without entering details every time.', color: 'var(--brand-primary, #FF9900)' },
]

const faqs = [
  { q: 'Is it safe to shop on AllianceHub?', a: 'Yes! All transactions are encrypted and we use secure payment gateways. Your data is protected with industry-standard security.' },
  { q: 'What payment methods are accepted?', a: 'We accept cryptocurrency payments including Binance, OKX, Coinbase, MetaMask, KuCoin, Kraken, and more.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5-14 business days. Express shipping is available for 2-3 day delivery. Free shipping on orders over $30.' },
  { q: 'Can I return a product?', a: 'Yes, most products have a 7-day return policy. Contact the seller or our customer service to initiate a return.' },
  { q: 'How do I track my order?', a: 'Go to Track Order page and enter your order number. You will see real-time updates on your shipment status.' },
  { q: 'How do I become a seller?', a: 'Click "Sell on AllianceHub" in the top bar or visit our Merchant Settled page to apply. Approval takes 1-3 business days.' },
]</template>

<script setup>
import { ref } from 'vue'

const openFaq = ref(-1)

const steps = [
  { icon: 'fas fa-user-plus', title: 'Create Account', desc: 'Sign up for free with your email. Verify your account to unlock all features.', color: 'var(--brand-primary, #FF9900)' },
  { icon: 'fas fa-search', title: 'Browse Products', desc: 'Explore millions of products across 20+ categories. Use filters to find exactly what you need.', color: 'var(--brand-accent, #007185)' },
  { icon: 'fas fa-cart-plus', title: 'Add to Cart', desc: 'Found something you like? Add it to your cart. You can continue shopping or checkout.', color: '#067D62' },
  { icon: 'fas fa-credit-card', title: 'Checkout & Pay', desc: 'Enter your shipping address and choose a payment method. We support crypto payments.', color: '#CC0C39' },
  { icon: 'fas fa-truck', title: 'Track Delivery', desc: 'Track your order in real-time. Get notifications at every step from warehouse to your door.', color: '#6c5ce7' },
  { icon: 'fas fa-star', title: 'Rate & Review', desc: 'Share your experience! Rate products and help other buyers make informed decisions.', color: 'var(--brand-primary, #FF9900)' },
]

const tips = [
  { icon: 'fas fa-shield-alt', title: 'Buy from Verified Sellers', desc: 'Look for the verified badge on seller profiles for guaranteed quality.', color: 'var(--brand-accent, #007185)' },
  { icon: 'fas fa-tags', title: 'Use Flash Sales', desc: 'Check the Flash Sale section for limited-time deals with up to 70% off.', color: '#CC0C39' },
  { icon: 'fas fa-heart', title: 'Save to Wishlist', desc: 'Add items to your wishlist and get notified when prices drop.', color: 'var(--brand-primary, #FF9900)' },
  { icon: 'fas fa-comments', title: 'Chat with Sellers', desc: 'Ask questions about products directly to sellers before buying.', color: '#067D62' },
  { icon: 'fas fa-undo', title: 'Know the Return Policy', desc: 'Most items have a 7-day return guarantee. Check product details for specifics.', color: '#6c5ce7' },
  { icon: 'fas fa-wallet', title: 'Use Wallet for Faster Checkout', desc: 'Top up your wallet for instant payments without entering details every time.', color: 'var(--brand-primary, #FF9900)' },
]

const faqs = [
  { q: 'Is it safe to shop on AllianceHub?', a: 'Yes! All transactions are encrypted and we use secure payment gateways. Your data is protected with industry-standard security.' },
  { q: 'What payment methods are accepted?', a: 'We accept cryptocurrency payments including Binance, OKX, Coinbase, MetaMask, KuCoin, Kraken, and more.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5-14 business days. Express shipping is available for 2-3 day delivery. Free shipping on orders over $30.' },
  { q: 'Can I return a product?', a: 'Yes, most products have a 7-day return policy. Contact the seller or our customer service to initiate a return.' },
  { q: 'How do I track my order?', a: 'Go to Track Order page and enter your order number. You will see real-time updates on your shipment status.' },
  { q: 'How do I become a seller?', a: 'Click "Sell on AllianceHub" in the top bar or visit our Merchant Settled page to apply. Approval takes 1-3 business days.' },
]
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
.subtitle { color: var(--text-secondary); margin-bottom: 2rem; }
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 3rem; }
.step-card { background: #fff; padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); text-align: center; position: relative; transition: all 0.2s; }
.step-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.step-number { position: absolute; top: -8px; left: -8px; width: 28px; height: 28px; background: var(--brand-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; }
.step-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #fff; font-size: 1.25rem; }
.step-card h3 { font-size: 0.9375rem; margin-bottom: 0.5rem; }
.step-card p { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; }
.tips-section, .faq-section { margin-bottom: 2.5rem; }
.tips-section h2, .faq-section h2 { font-size: 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
.tips-section h2 i { color: var(--brand-primary, #FF9900); }
.faq-section h2 i { color: var(--brand-primary); }
.tips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.tip-card { display: flex; gap: 1rem; padding: 1rem; background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-xs); }
.tip-card i { font-size: 1.5rem; flex-shrink: 0; margin-top: 0.125rem; }
.tip-card h4 { font-size: 0.875rem; margin-bottom: 0.25rem; }
.tip-card p { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
.faq-list { display: flex; flex-direction: column; gap: 0.5rem; }
.faq-item { background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-xs); cursor: pointer; }
.faq-question { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; font-weight: 600; font-size: 0.875rem; }
.faq-question i { color: var(--text-muted); font-size: 0.75rem; }
.faq-answer { padding: 0 1.25rem 1rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; }
@media (max-width: 768px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } .tips-grid { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .steps-grid { grid-template-columns: 1fr; } }
</style>

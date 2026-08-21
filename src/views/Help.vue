<template>
  <div class="container" style="padding:40px 20px;max-width:800px">
    <h1 style="margin-bottom:30px"><i class="fas fa-question-circle" style="color:var(--brand-primary, #FF9900)"></i> Help Center</h1>
    <div style="background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div v-for="(faq, i) in faqs" :key="i" style="margin-bottom:16px;border-bottom:1px solid #f0f0f0;padding-bottom:16px">
        <h3 style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:15px" @click="faq.open = !faq.open">
          {{ faq.q }}
          <i :class="faq.open ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" style="font-size:12px;color:#999"></i>
        </h3>
        <p v-if="faq.open" style="margin-top:10px;color:#666;line-height:1.8;font-size:14px">{{ faq.a }}</p>
      </div>
      <div style="margin-top:30px;text-align:center">
        <p style="color:#999;margin-bottom:12px">Can't find what you're looking for?</p>
        <router-link to="/customer-service" class="btn-primary" style="padding:12px 30px;border-radius:8px;text-decoration:none;display:inline-flex;align-items:center;gap:8px"><i class="fas fa-headset"></i> Contact Support</router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="empty-state"><div class="loading-spinner"></div><p>Loading...</p></div>
  </div>
</template>
</template>


<script setup>
import { ref } from "vue"
const loading = ref(false)
const faqs = ref([
  { q: 'How do I become a seller?', a: 'Click "Seller Centre" in the top navigation, then register your store. No inventory needed — list products from our catalog and we handle fulfillment.', open: false },
  { q: 'How does pricing work?', a: 'Products have base prices. Your seller level determines your discount — from 0% (Bronze) to 20% (Diamond). Level up by completing more orders.', open: false },
  { q: 'How do I get paid?', a: 'Earnings go to your AllianceHub wallet. Withdraw via bank transfer or crypto (USDT/BTC/ETH). Minimum withdrawal is $50.', open: false },
  { q: 'What is the Rating Plus program?', a: 'Earn commissions by rating products. Register through live chat, receive tasks, complete ratings, and withdraw earnings.', open: false },
  { q: 'How do I return a product?', a: 'Go to your order history, select the order, and click "Request Return". Returns are accepted within 7 days of delivery.', open: false },
  { q: 'How do I contact support?', a: 'Use the live chat widget (bottom-right corner), visit the Customer Service page, or email support@alliancehub.com.', open: false },
  { q: 'What payment methods are accepted?', a: 'We accept crypto payments: USDT (TRC20/ERC20), BTC, ETH, and more. Recharge your wallet first, then use wallet balance for purchases.', open: false },
  { q: 'How do I track my order?', a: 'Go to My Orders, click on the order, and view the logistics timeline. You\'ll see real-time updates on shipping status.', open: false },
])
</script>

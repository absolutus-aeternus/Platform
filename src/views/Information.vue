<template>
  <div class="page-wrapper">
  <div>
    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton-shimmer skeleton-hero"></div>
      <div class="skeleton-content">
        <div class="skeleton-shimmer skeleton-title"></div>
        <div class="skeleton-shimmer skeleton-text"></div>
        <div class="skeleton-shimmer skeleton-text short"></div>
      </div>
    </div>
    <div v-else>
    <section class="info-hero">
      <div class="container">
        <h1 class="info-hero-title">ALLIANCEHUB</h1>
        <p class="info-hero-sub">Partner Global Dropshippers</p>
        <p class="info-hero-desc">One Hub. All Marketplaces. Unlimited Supply.</p>
      </div>
    </section>
    <section class="container info-content">
      <div class="info-card">
        <h2 style="margin-bottom:20px">About AllianceHub</h2>
        <p style="margin-bottom:16px">AllianceHub is a global dropshipping platform connecting sellers with unlimited product sources from worldwide marketplaces. Founded in 2020, we serve sellers in 112+ countries.</p>
        <h3 style="margin:24px 0 12px">Our Mission</h3>
        <p style="margin-bottom:16px">To empower entrepreneurs to build successful online stores without the burden of inventory management.</p>
        <h3 style="margin:24px 0 12px">Why AllianceHub?</h3>
        <ul style="padding-left:20px"><li>Zero inventory — list and sell immediately</li><li>Automatic pricing by seller level</li><li>Global fulfillment to 112+ countries</li><li>24/7 live chat support</li><li>Secure payments in USD</li><li>Rating program for extra earnings</li></ul>
        <h3 style="margin:24px 0 12px">Contact</h3>
        <p>Email: support@alliancehub.com</p>
        <p>Live Chat: Available 24/7 via the chat widget</p>
      </div>
    </section>
    </div>
  </div>
  </div>

<script setup>
import { ref, onMounted } from 'vue'
const loading = ref(true)
onMounted(() => { loading.value = false })
</script>

<style scoped>
.info-hero { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 80px 0; text-align: center; }
.info-hero-title { font-size: 42px; font-weight: 900; margin-bottom: 16px; }
.info-hero-sub { font-size: 20px; opacity: 0.9; }
.info-hero-desc { font-size: 16px; opacity: 0.7; margin-top: 8px; }
.info-content { padding: 60px 20px; max-width: 800px; }
.info-card { background: white; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; line-height: 1.8; }
@media (max-width: 768px) {
  .info-hero { padding: 40px 0; }
  .info-hero-title { font-size: 28px; }
  .info-hero-sub { font-size: 16px; }
  .info-hero-desc { font-size: 14px; }
  .info-content { padding: 20px 12px; }
  .info-card { padding: 20px; }
}
@media (max-width: 480px) {
  .info-hero-title { font-size: 22px; }
  .info-card { padding: 16px; }
}
.skeleton-wrapper { padding: 0; }
.skeleton-hero { height: 200px; width: 100%; margin-bottom: 0; }
.skeleton-content { max-width: 800px; margin: 0 auto; padding: 60px 20px; }
.skeleton-title { height: 28px; width: 250px; border-radius: 6px; margin-bottom: 20px; }
.skeleton-text { height: 16px; width: 100%; border-radius: 4px; margin-bottom: 12px; }
.skeleton-text.short { width: 60%; }
.skeleton-shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
</template>

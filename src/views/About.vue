<template>
  <div class="page-wrapper">
  <div>
    <section style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:60px 0;text-align:center">
      <div class="container">
        <h1 style="font-size:36px;font-weight:900;margin-bottom:12px">ALLIANCEHUB</h1>
        <p style="font-size:18px;opacity:0.9">Partner Global Dropshippers</p>
        <p style="font-size:14px;opacity:0.7;margin-top:8px">One Hub. All Marketplaces. Unlimited Supply.</p>
      </div>
    </section>
    <section class="container" style="padding:40px 20px;max-width:800px">
      <div style="background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);line-height:1.8">
        <h2 style="margin-bottom:16px">About AllianceHub</h2>
        <p style="margin-bottom:16px">AllianceHub is a global dropshipping platform connecting sellers with unlimited product sources from worldwide marketplaces. Founded in 2020, we serve sellers in 112+ countries with a catalog of products across every category.</p>
        <h3 style="margin:24px 0 12px">Our Mission</h3>
        <p style="margin-bottom:16px">To empower entrepreneurs to build successful online stores without the burden of inventory management. We believe everyone deserves the opportunity to start an e-commerce business with minimal risk.</p>
        <h3 style="margin:24px 0 12px">Why AllianceHub?</h3>
        <ul style="padding-left:20px;margin-bottom:16px">
          <li>Zero inventory — list and sell immediately</li>
          <li>Automatic pricing based on your seller level (up to 20% discount)</li>
          <li>Global fulfillment to 112+ countries</li>
          <li>24/7 live chat support</li>
          <li>Secure payments in USD via crypto</li>
          <li>Rating Plus program for extra earnings</li>
          <li>Mobile-first responsive design</li>
        </ul>
        <h3 style="margin:24px 0 12px">Contact</h3>
        <p>Email: support@alliancehub.com</p>
        <p>Live Chat: Available 24/7 via the chat widget</p>
        <div style="margin-top:24px;display:flex;gap:12px">
          <router-link to="/register" class="btn-primary" style="padding:12px 24px;border-radius:8px;text-decoration:none"><i class="fas fa-rocket"></i> Start Selling</router-link>
          <router-link to="/customer-service" class="btn-primary" style="padding:12px 24px;border-radius:8px;text-decoration:none;background:#fff;color:var(--brand-primary, #FF9900);border:1px solid var(--brand-primary, #FF9900)"><i class="fas fa-headset"></i> Contact Support</router-link>
        </div>
      </div>
    </section>
  </div>
  </div>
</template>

<script setup>
// Static page — no data loading needed
</script>


<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>


@media (max-width: 768px) {
  .page-wrapper, .about-container, .help-container, .terms-container, .policy-container {
    padding: 1rem !important;
    max-width: 100% !important;
  }
}
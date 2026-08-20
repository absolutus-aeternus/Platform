<template><div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:800px">
    <h2 style="margin-bottom:24px"><i class="fas fa-life-ring" style="color:var(--brand-primary, #FF9900)"></i> Support Center</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
      <router-link to="/customer-service" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;text-decoration:none;color:#333">
        <i class="fas fa-headset" style="font-size:32px;color:var(--brand-primary, #FF9900);margin-bottom:8px"></i>
        <h3>Contact Us</h3>
      </router-link>
      <router-link to="/help" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;text-decoration:none;color:#333">
        <i class="fas fa-question-circle" style="font-size:32px;color:var(--brand-primary, #FF9900);margin-bottom:8px"></i>
        <h3>FAQ</h3>
      </router-link>
      <router-link to="/complaint" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;text-decoration:none;color:#333">
        <i class="fas fa-exclamation-triangle" style="font-size:32px;color:var(--brand-primary, #FF9900);margin-bottom:8px"></i>
        <h3>Complaints</h3>
      </router-link>
      <router-link to="/returns" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;text-decoration:none;color:#333">
        <i class="fas fa-undo" style="font-size:32px;color:var(--brand-primary, #FF9900);margin-bottom:8px"></i>
        <h3>Returns</h3>
      </router-link>
      <router-link to="/terms" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;text-decoration:none;color:#333">
        <i class="fas fa-file-contract" style="font-size:32px;color:var(--brand-primary, #FF9900);margin-bottom:8px"></i>
        <h3>Terms</h3>
      </router-link>
      <router-link to="/privacy" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;text-decoration:none;color:#333">
        <i class="fas fa-shield-alt" style="font-size:32px;color:var(--brand-primary, #FF9900);margin-bottom:8px"></i>
        <h3>Privacy</h3>
      </router-link>
    </div>
  </div>
  </div>
<script setup></template>

<script setup></template>

</script>

<style scoped>
@media (max-width: 768px) {
  div[style*="grid-template-columns:repeat(3,1fr)"] { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
}
@media (max-width: 480px) {
  div[style*="grid-template-columns:repeat(3,1fr)"] { grid-template-columns: 1fr !important; }
}
</style>

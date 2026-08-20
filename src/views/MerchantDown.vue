<template>
  <div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:600px;text-align:center">
    <div style="background:#fff;padding:48px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="width:80px;height:80px;background:#fef3c7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px"><i class="fas fa-tools" style="font-size:40px;color:#d97706"></i></div>
      <h1 style="font-size:24px;font-weight:800;margin-bottom:12px">Under Maintenance</h1>
      <p style="color:#64748b;margin-bottom:24px">The seller centre is currently under maintenance. Please try again later.</p>
      <router-link to="/" class="btn-primary" style="padding:12px 30px;border-radius:8px;text-decoration:none"><i class="fas fa-home"></i> Back to Home</router-link>
    </div>
  </div>
  </div>


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
</template>

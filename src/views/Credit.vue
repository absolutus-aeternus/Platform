<template>
  <div class="page-wrapper">
  <div class="credit-page">
    <div class="hero">
      <div class="container">
        <h1>Start-up Loans</h1>
        <p>Provide start-up loan and capital turnover services</p>
        <p class="desc">Online loans are a convenient and fast option to solve your financial problems. Our professional team will help you go through the process and clear your doubts anytime.</p>
      </div>
    </div>
    <div class="container">
      <div class="features-grid">
        <div class="feature-card">
          <i class="fas fa-bolt"></i>
          <h3>Fast Approval</h3>
          <p>Get approved within 24 hours</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-percentage"></i>
          <h3>Low Interest</h3>
          <p>Competitive interest rates</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-shield-alt"></i>
          <h3>Secure</h3>
          <p>Your data is protected</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-headset"></i>
          <h3>24/7 Support</h3>
          <p>We're here to help</p>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 60px 0; text-align: center; }
.hero h1 { font-size: 36px; margin-bottom: 15px; }
.hero p { font-size: 18px; opacity: 0.9; }
.desc { max-width: 600px; margin: 15px auto 0; font-size: 14px; opacity: 0.8; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 40px 0; }
.feature-card { background: #fff; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.feature-card i { font-size: 36px; color: #667eea; margin-bottom: 15px; }
.feature-card h3 { margin-bottom: 10px; }
.feature-card p { color: #666; font-size: 14px; }
@media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .features-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 20px 0; } .feature-card { padding: 20px; } .feature-card i { font-size: 28px; } }
@media (max-width: 480px) { .features-grid { grid-template-columns: 1fr; } }
</style>

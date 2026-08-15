<template>
  <div class="container" style="padding:40px 20px;max-width:600px;text-align:center">
    <div style="background:#fff;padding:48px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="width:80px;height:80px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px"><i class="fas fa-check-circle" style="font-size:40px;color:#059669"></i></div>
      <h1 style="font-size:24px;font-weight:800;margin-bottom:12px">Email Bound Successfully!</h1>
      <p style="color:#64748b;margin-bottom:24px">Your email has been linked to your account.</p>
      <router-link to="/user/settings" class="btn-primary" style="padding:12px 30px;border-radius:8px;text-decoration:none"><i class="fas fa-cog"></i> Go to Settings</router-link>
    </div>
  </div>
</template>

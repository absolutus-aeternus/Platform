<template>
  <div class="settings">
    <h1>Settings</h1>
    <div class="settings-form">
      <div class="form-group">
        <label>Email</label>
        <input type="email" :value="email" disabled>
      </div>
      <div class="form-group">
        <label>Change Password</label>
        <input type="password" placeholder="New password">
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm new password">
      </div>
      <button class="btn-save">Save Changes</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const email = ref('Panas.dingin@gmail.com')
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.settings-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.btn-save { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
</style>

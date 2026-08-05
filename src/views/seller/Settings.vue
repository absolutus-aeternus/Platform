<template>
  <div class="seller-settings">
    <h1>Store Settings</h1>
    <div class="settings-form">
      <div class="form-group">
        <label>Store Name</label>
        <input v-model="storeName" placeholder="Your store name">
      </div>
      <div class="form-group">
        <label>Store Description</label>
        <textarea v-model="storeDesc" placeholder="Describe your store..."></textarea>
      </div>
      <div class="form-group">
        <label>Contact Email</label>
        <input v-model="contactEmail" type="email" placeholder="contact@store.com">
      </div>
      <div class="form-group">
        <label>Store Logo</label>
        <input type="file" accept="image/*">
      </div>
      <button class="btn-save" @click="saveSettings">Save Settings</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const storeName = ref('')
const storeDesc = ref('')
const contactEmail = ref('')

const saveSettings = () => {
  alert('Settings saved!')
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.settings-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-group textarea { height: 100px; resize: vertical; }
.btn-save { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
</style>

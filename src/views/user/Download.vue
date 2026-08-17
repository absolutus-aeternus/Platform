<template>
  <div class="user-download">
    <div class="page-header"><h1>Downloads</h1></div>
    <div v-if="downloads.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-download"></i></div>
      <h2>No Downloads Yet</h2>
      <p>Your digital purchases and downloads will appear here.</p>
      <router-link to="/" class="btn-primary">Browse Products</router-link>
    </div>
    <div v-else class="download-list">
      <div v-for="dl in downloads" :key="dl.id" class="download-card">
        <div class="dl-icon"><i class="fas fa-file-download"></i></div>
        <div class="dl-info">
          <h3>{{ dl.name }}</h3>
          <p>{{ dl.size }} • Purchased {{ new Date(dl.date).toLocaleDateString() }}</p>
        </div>
        <button class="btn-download" @click="downloadFile(dl)"><i class="fas fa-download"></i> Download</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const downloads = ref([])

const downloadFile = (dl) => {
  if (dl.url) {
    window.open(dl.url, '_blank')
  } else {
    window.__toast?.show('Download link not available', 'error')
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { width: 100px; height: 100px; background: #f8f9fa; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.empty-icon i { font-size: 40px; color: #ddd; }
.empty-state h2 { margin: 0 0 10px; font-size: 20px; color: #333; }
.empty-state p { color: #999; margin-bottom: 25px; }
.btn-primary { padding: 12px 30px; background: #FF9900; color: #fff; border-radius: 25px; text-decoration: none; display: inline-block; font-weight: 600; }
.download-list { display: flex; flex-direction: column; gap: 12px; }
.download-card { display: flex; align-items: center; gap: 15px; padding: 18px 20px; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.dl-icon { width: 48px; height: 48px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #FF9900; }
.dl-info { flex: 1; }
.dl-info h3 { margin: 0 0 4px; font-size: 14px; }
.dl-info p { margin: 0; font-size: 12px; color: #999; }
.btn-download { padding: 8px 16px; background: #FF9900; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
</style>

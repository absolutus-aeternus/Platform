<template>
  <div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:600px">
    <h2 style="margin-bottom:24px"><i class="fas fa-globe"></i> Language</h2>
    <div style="background:white;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <div v-for="lang in languages" :key="lang.code" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:all 0.2s" :style="{ background: current === lang.code ? '#fff7ed' : '' }" @click="setLang(lang.code)">
        <div style="display:flex;align-items:center;gap:12px"><span style="font-size:24px">{{ lang.flag }}</span><span style="font-weight:600">{{ lang.name }}</span></div>
        <i v-if="current === lang.code" class="fas fa-check-circle" style="color:#ff6b35;font-size:20px"></i>
      </div>
    </div>
  </div>
  </div>
<script setup>
import { ref, onMounted } from 'vue'
const current = ref(localStorage.getItem('lang') || 'en')
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
]
const setLang = (code) => { current.value = code; localStorage.setItem('lang', code); location.reload() }
</template>

</script>


<style scoped>
body, html { overflow-x: hidden; }
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>


@media (max-width: 768px) {
  .page-wrapper, .about-container, .help-container, .terms-container, .policy-container {
    padding: 1rem !important;
    max-width: 100% !important;
  }
}
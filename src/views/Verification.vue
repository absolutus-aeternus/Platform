<template><div class="page-wrapper">
  <div class="verification-page">
    <div class="bg-video"></div>
    <div class="content">
      <div class="logo"><img loading="lazy" src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img-verify" /></div>
      <div class="white-box">
        <h1>Your business starts with ALLIANCEHUB</h1>
        <p>What are you waiting for?</p>
      </div>
      <div class="black-box">
        <button @click="enterSite" class="btn-enter">Click To Enter</button>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const enterSite = () => {
  localStorage.setItem('verified', 'true')
  router.push('/')
}</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const enterSite = () => {
  localStorage.setItem('verified', 'true')
  router.push('/')
}
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.verification-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); position: relative; overflow: hidden; }
.bg-video { position: absolute; inset: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'); opacity: 0.5; }
.content { position: relative; z-index: 1; text-align: center; }
.logo { font-size: 36px; font-weight: 800; color: var(--brand-primary, #FF9900); margin-bottom: 30px; }
.logo-img-verify { height: 3rem; width: auto; object-fit: contain; }
.white-box { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 12px; padding: 30px; margin-bottom: 20px; }
.white-box h1 { color: #fff; font-size: 28px; margin-bottom: 10px; }
.white-box p { color: rgba(255,255,255,0.7); }
.black-box { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 25px; }
.btn-enter { background: var(--brand-primary, #FF9900); color: #fff; border: none; padding: 15px 40px; font-size: 18px; border-radius: 25px; cursor: pointer; transition: all 0.3s; }
.btn-enter:hover { background: #e6254d; transform: scale(1.05); }

img { max-width: 100%; height: auto; }
</style>

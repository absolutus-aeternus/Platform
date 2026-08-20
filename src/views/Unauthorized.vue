<template>
  <div class="page-wrapper">
  <div class="unauthorized-page">
    <div class="unauthorized-card">
      <div class="unauthorized-icon">
        <i class="fas fa-shield-alt"></i>
      </div>
      <h1 class="unauthorized-code">403</h1>
      <h2 class="unauthorized-title">Access Denied</h2>
      <p class="unauthorized-message">
        You don't have permission to access this page.
        <span v-if="requiredRole">
          This area requires <strong>{{ requiredRole }}</strong> access.
        </span>
      </p>
      <div class="unauthorized-actions">
        <BaseButton variant="primary" icon="fas fa-home" @click="goHome">
          Go to Dashboard
        </BaseButton>
        <BaseButton variant="secondary" icon="fas fa-arrow-left" @click="goBack">
          Go Back
        </BaseButton>
      </div>
      <p class="unauthorized-help">
        If you believe this is an error, please contact support.
      </p>
    </div>
  </div>
  </div>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const { userRole, getRedirectForRole } = useAuth()

const requiredRole = computed(() => route.query.required || null)

function goHome() {
  const dashboard = getRedirectForRole(userRole.value)
  router.push(dashboard)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    goHome()
  }
}
</template>

</script>

<style scoped>
.unauthorized-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.unauthorized-card {
  text-align: center;
  max-width: 480px;
  padding: 48px 32px;
  background: var(--white, #fff);
  border-radius: var(--radius-xl, 16px);
  border: 1px solid var(--neutral-200, #E7E7E7);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
}
.unauthorized-icon {
  width: 80px; height: 80px;
  margin: 0 auto 24px;
  background: var(--error-bg, #FEE2E9);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 36px;
  color: var(--error, #CC0C39);
}
.unauthorized-code {
  font-size: 64px;
  font-weight: 800;
  color: var(--neutral-200, #E7E7E7);
  margin: 0;
  line-height: 1;
}
.unauthorized-title {
  font-size: var(--text-2xl, 24px);
  font-weight: 700;
  color: var(--neutral-900, #0F1111);
  margin: 8px 0 16px;
}
.unauthorized-message {
  font-size: var(--text-base, 14px);
  color: var(--neutral-600, #666);
  line-height: 1.6;
  margin-bottom: 32px;
}
.unauthorized-message strong {
  color: var(--brand-primary-hover, #E68A00);
}
.unauthorized-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}
.unauthorized-help {
  font-size: var(--text-xs, 12px);
  color: var(--neutral-500, #888);
}

@media (max-width: 639px) {
  .unauthorized-card { padding: 32px 20px; }
  .unauthorized-icon { width: 64px; height: 64px; font-size: 28px; }
  .unauthorized-code { font-size: 48px; }
  .unauthorized-actions { flex-direction: column; }
}
</style>

<template>
  <div class="component-wrapper">
  <div class="stat-card" :style="{ '--accent': color }">
    <div class="stat-card__icon">
      <i :class="icon"></i>
    </div>
    <div class="stat-card__content">
      <div class="stat-card__label">{{ label }}</div>
      <div class="stat-card__value">{{ value }}</div>
      <div class="stat-card__change" v-if="change">
        <span :class="changeType === 'up' ? 'stat-card__change--up' : 'stat-card__change--down'">
          <i :class="changeType === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ change }}
        </span>
        <span class="stat-card__change-period" v-if="period">{{ period }}</span>
      </div>
      <div class="stat-card__alert" v-if="alert">
        <i class="fas fa-exclamation-triangle"></i> {{ alert }}
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  change: { type: String, default: '' },
  changeType: { type: String, default: 'up', validator: v => ['up', 'down'].includes(v) },
  period: { type: String, default: '' },
  alert: { type: String, default: '' },
  color: { type: String, default: '#007185' }
})
</script>

<style scoped>
.stat-card {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  transition: box-shadow var(--ease-normal, 0.2s ease);
  border: 1px solid var(--neutral-200, #E7E7E7);
}
.stat-card:hover {
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
}

.stat-card__icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-md, 8px);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-card__content { flex: 1; min-width: 0; }
.stat-card__label {
  font-size: var(--text-sm, 13px);
  color: var(--neutral-600, #666);
  margin-bottom: 4px;
}
.stat-card__value {
  font-size: var(--text-2xl, 24px);
  font-weight: 700;
  color: var(--neutral-900, #0F1111);
  line-height: 1.2;
  margin-bottom: 4px;
}
.stat-card__change {
  font-size: var(--text-xs, 12px);
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-card__change--up { color: var(--success, #067D62); font-weight: 600; }
.stat-card__change--down { color: var(--error, #CC0C39); font-weight: 600; }
.stat-card__change-period { color: var(--neutral-500, #888); }
.stat-card__alert {
  font-size: var(--text-xs, 12px);
  color: var(--warning, #B45309);
  font-weight: 500;
  margin-top: 4px;
}
.stat-card__alert i { margin-right: 4px; }

/* Responsive */
@media (max-width: 639px) {
  .stat-card { padding: 14px; gap: 12px; }
  .stat-card__icon { width: 40px; height: 40px; font-size: 18px; }
  .stat-card__value { font-size: 20px; }
}
</style>

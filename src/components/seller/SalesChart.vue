<template>
  <div class="sales-chart">
    <div class="sales-chart__header">
      <h3 class="sales-chart__title">{{ title }}</h3>
      <div class="sales-chart__controls">
        <button
          v-for="range in ranges"
          :key="range"
          :class="['sales-chart__range-btn', { active: activeRange === range }]"
          @click="$emit('range-change', range)"
        >{{ range }}</button>
      </div>
    </div>
    <div class="sales-chart__body">
      <div class="sales-chart__bars">
        <div
          v-for="(item, i) in data"
          :key="i"
          class="sales-chart__bar-wrap"
        >
          <div
            class="sales-chart__bar"
            :style="{ height: getBarHeight(item.value) + '%' }"
            :title="`${item.label}: ${item.value}`"
          >
            <span class="sales-chart__bar-tooltip">${{ formatValue(item.value) }}</span>
          </div>
          <span class="sales-chart__bar-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>

</template>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Sales Overview' },
  data: { type: Array, default: () => [] },
  ranges: { type: Array, default: () => ['7D', '30D', '90D'] },
  activeRange: { type: String, default: '30D' }
})
defineEmits(['range-change'])

const maxValue = computed(() => {
  return Math.max(...props.data.map(d => d.value), 1)
})

function getBarHeight(value) {
  return Math.max(5, (value / maxValue.value) * 100)
}

function formatValue(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
  if (v >= 1000) return (v / 1000).toFixed(0) + 'K'
  return v.toString()
}


</script>

<style scoped>
.sales-chart {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  border: 1px solid var(--neutral-200, #E7E7E7);
}
.sales-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.sales-chart__title {
  font-size: var(--text-md, 16px);
  font-weight: 600;
  margin: 0;
}
.sales-chart__controls { display: flex; gap: 4px; }
.sales-chart__range-btn {
  padding: 4px 12px;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-sm, 6px);
  background: var(--white, #fff);
  font-size: var(--text-xs, 12px);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--ease-fast, 0.15s ease);
  color: var(--neutral-700, #565959);
}
.sales-chart__range-btn.active {
  background: var(--brand-accent, #007185);
  color: var(--white, #fff);
  border-color: var(--brand-accent, #007185);
}

.sales-chart__body { min-height: 200px; }
.sales-chart__bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 200px;
  padding-bottom: 28px;
  position: relative;
}
.sales-chart__bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  position: relative;
}
.sales-chart__bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(to top, var(--brand-accent, #007185), var(--brand-accent-hover, #005F6B));
  border-radius: var(--radius-xs, 4px) var(--radius-xs, 4px) 0 0;
  transition: height 0.5s ease;
  position: relative;
  cursor: pointer;
  min-height: 4px;
}
.sales-chart__bar:hover {
  opacity: 0.85;
}
.sales-chart__bar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--neutral-900, #0F1111);
  color: var(--white, #fff);
  padding: 2px 6px;
  border-radius: var(--radius-xs, 4px);
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--ease-fast, 0.15s ease);
  margin-bottom: 4px;
}
.sales-chart__bar:hover .sales-chart__bar-tooltip { opacity: 1; }
.sales-chart__bar-label {
  position: absolute;
  bottom: -24px;
  font-size: 10px;
  color: var(--neutral-500, #888);
  white-space: nowrap;
}

@media (max-width: 639px) {
  .sales-chart { padding: 14px; }
  .sales-chart__bars { height: 150px; }
  .sales-chart__title { font-size: 14px; }
}
</style>

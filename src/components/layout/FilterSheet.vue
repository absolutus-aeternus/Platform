<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="filter-sheet__backdrop" @click.self="$emit('update:modelValue', false)">
        <div class="filter-sheet">
          <div class="filter-sheet__handle"></div>
          <div class="filter-sheet__header">
            <h3>Filters</h3>
            <button class="filter-sheet__close" @click="$emit('update:modelValue', false)">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="filter-sheet__body">
            <div class="filter-sheet__section" v-for="section in sections" :key="section.key">
              <h4 class="filter-sheet__title">{{ section.label }}</h4>
              <!-- Checkbox as horizontal scrollable chips (mobile-first) -->
              <template v-if="section.type === 'checkbox'">
                <div class="filter-sheet__chips">
                  <button
                    v-for="opt in section.options"
                    :key="opt.value"
                    class="filter-sheet__chip"
                    :class="{ 'filter-sheet__chip--active': isSelected(section.key, opt.value) }"
                    @click="toggleFilter(section.key, opt.value)"
                    role="checkbox"
                    :aria-checked="isSelected(section.key, opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </template>
</transition>
</teleport>
</div>
              <!-- Price range -->
              <template v-else-if="section.type === 'range'">
                <div class="filter-sheet__range">
                  <input type="number" :value="getRangeMin(section.key)" @input="setRangeMin(section.key, $event.target.value)" placeholder="Min" />
                  <span>—</span>
                  <input type="number" :value="getRangeMax(section.key)" @input="setRangeMax(section.key, $event.target.value)" placeholder="Max" />
                </div>
              </div>
              <!-- Toggle -->
              <template v-else-if="section.type === 'toggle'">
                <label v-for="opt in section.options" :key="opt.value" class="filter-sheet__toggle">
                  <span>{{ opt.label }}</span>
                  <input type="checkbox" :checked="isSelected(section.key, opt.value)" @change="toggleFilter(section.key, opt.value)" />
                  <span class="filter-sheet__toggle-track"></span>
                </label>
        </div>
              
          <div class="filter-sheet__footer">
            <button class="filter-sheet__reset" @click="clearAll">Reset</button>
            <button class="filter-sheet__apply" @click="$emit('update:modelValue', false)">
              Apply{{ activeCount > 0 ? ` (${activeCount})` : '' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
</template>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  sections: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'update:filters'])

function isSelected(key, value) {
  const current = props.filters[key]
  if (Array.isArray(current)) return current.includes(value)
  return current === value
}

function toggleFilter(key, value) {
  const updated = { ...props.filters }
  const arr = Array.isArray(updated[key]) ? [...updated[key]] : []
  const idx = arr.indexOf(value)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(value)
  updated[key] = arr
  emit('update:filters', updated)
}

function getRangeMin(key) { return props.filters[key]?.min ?? '' }
function getRangeMax(key) { return props.filters[key]?.max ?? '' }
function setRangeMin(key, val) {
  emit('update:filters', { ...props.filters, [key]: { ...props.filters[key], min: val ? Number(val) : undefined } })
}
function setRangeMax(key, val) {
  emit('update:filters', { ...props.filters, [key]: { ...props.filters[key], max: val ? Number(val) : undefined } })
}

const activeCount = computed(() => {
  return Object.values(props.filters).reduce((sum, v) => {
    if (Array.isArray(v)) return sum + v.length
    return sum
  }, 0)
})

function clearAll() {
  const cleared = {}
  props.sections.forEach(s => { cleared[s.key] = [] })
  emit('update:filters', cleared)
}
</script>

<style scoped>
.filter-sheet__backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop, 700);
}
.filter-sheet {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--white, #fff);
  border-radius: var(--radius-xl, 16px) var(--radius-xl, 16px) 0 0;
  max-height: 85vh;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl, 0 -4px 24px rgba(0,0,0,0.15));
}
.filter-sheet__handle {
  width: 32px; height: 4px;
  background: var(--neutral-300, #D5D9D9);
  border-radius: 2px;
  margin: 8px auto 0;
}
.filter-sheet__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--neutral-200, #E7E7E7);
}
.filter-sheet__header h3 { margin: 0; font-size: var(--text-md, 16px); }
.filter-sheet__close {
  background: none; border: none;
  font-size: 18px; color: var(--neutral-500, #888);
  cursor: pointer; padding: 4px;
}

.filter-sheet__body {
  flex: 1; overflow-y: auto;
  padding: 16px;
}
.filter-sheet__section { margin-bottom: 20px; }
.filter-sheet__title {
  font-size: var(--text-base, 14px); font-weight: 600;
  margin: 0 0 10px;
}

/* ── Horizontal Scrollable Chips ── */
.filter-sheet__chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  /* Hide scrollbar but keep scroll */
  scrollbar-width: none;
}
.filter-sheet__chips::-webkit-scrollbar { display: none; }

.filter-sheet__chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-full, 9999px);
  background: var(--white, #fff);
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  color: var(--neutral-700, #565959);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--ease-fast, 0.15s ease);
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.filter-sheet__chip:hover {
  border-color: var(--brand-primary, #FF9900);
  color: var(--brand-primary-hover, #E68A00);
}
.filter-sheet__chip--active {
  background: var(--brand-primary-light, #FFF4E6);
  border-color: var(--brand-primary, #FF9900);
  color: var(--brand-primary-hover, #E68A00);
  font-weight: 600;
}

.filter-sheet__range { display: flex; align-items: center; gap: 8px; }
.filter-sheet__range input {
  flex: 1; padding: 10px 12px;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-md, 8px);
  font-size: 16px;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.filter-sheet__range input:focus { outline: none; border-color: var(--brand-accent, #007185); }

.filter-sheet__toggle {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0;
  font-size: var(--text-base, 14px);
  cursor: pointer;
}
.filter-sheet__toggle input { display: none; }
.filter-sheet__toggle-track {
  width: 44px; height: 24px;
  background: var(--neutral-300, #D5D9D9);
  border-radius: 12px;
  position: relative;
  transition: background var(--ease-fast, 0.15s ease);
}
.filter-sheet__toggle-track::after {
  content: '';
  width: 20px; height: 20px;
  background: var(--white, #fff);
  border-radius: 50%;
  position: absolute; top: 2px; left: 2px;
  transition: transform var(--ease-fast, 0.15s ease);
}
.filter-sheet__toggle input:checked + .filter-sheet__toggle-track { background: var(--brand-accent, #007185); }
.filter-sheet__toggle input:checked + .filter-sheet__toggle-track::after { transform: translateX(20px); }

.filter-sheet__footer {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
  display: flex; gap: 12px;
  border-top: 1px solid var(--neutral-200, #E7E7E7);
}
.filter-sheet__reset {
  flex: 0 0 auto;
  padding: 12px 24px;
  background: none;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-md, 8px);
  font-weight: 600; font-size: var(--text-base, 14px);
  cursor: pointer;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.filter-sheet__apply {
  flex: 1;
  padding: 12px;
  background: var(--brand-primary-hover, #E68A00);
  color: var(--white, #fff);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-weight: 600; font-size: var(--text-base, 14px);
  cursor: pointer;
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* Transition */
.sheet-enter-active { transition: opacity 0.2s ease; }
.sheet-leave-active { transition: opacity 0.15s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-active .filter-sheet { animation: sheet-up 0.3s ease; }
.sheet-leave-active .filter-sheet { animation: sheet-down 0.2s ease; }
@keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes sheet-down { from { transform: translateY(0); } to { transform: translateY(100%); } }

/* Desktop: hidden */
@media (min-width: 768px) {
  .filter-sheet__backdrop { display: none; }
}
</style>

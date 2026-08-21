<template>
  <aside class="filter-sidebar" :class="{ 'filter-sidebar--sticky': sticky }">
    <div class="filter-sidebar__inner">
      <div class="filter-sidebar__section" v-for="section in sections" :key="section.key">
        <h4 class="filter-sidebar__title" @click="toggleSection(section.key)">
          {{ section.label }}
          <i class="fas" :class="collapsed[section.key] ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
        </h4>
        <div v-show="!collapsed[section.key]" class="filter-sidebar__content">
          <!-- Checkbox list -->
          <template v-if="section.type === 'checkbox'">
            <label v-for="opt in section.options" :key="opt.value" class="filter-sidebar__check">
              <input type="checkbox" :value="opt.value" :checked="isSelected(section.key, opt.value)" @change="toggleFilter(section.key, opt.value)" />
              <span class="filter-sidebar__check-label">{{ opt.label }}</span>
              <span v-if="opt.count !== undefined" class="filter-sidebar__count">{{ opt.count }}</span>
            </label>
          </template>
          <!-- Price range -->
          <template v-else-if="section.type === 'range'">
            <div class="filter-sidebar__range">
              <input type="number" :value="getRangeMin(section.key)" @input="setRangeMin(section.key, $event.target.value)" placeholder="Min" class="filter-sidebar__range-input" />
              <span class="filter-sidebar__range-sep">—</span>
              <input type="number" :value="getRangeMax(section.key)" @input="setRangeMax(section.key, $event.target.value)" placeholder="Max" class="filter-sidebar__range-input" />
            </div>
          </template>
          <!-- Rating -->
          <template v-else-if="section.type === 'rating'">
            <button v-for="stars in [5,4,3,2,1]" :key="stars" class="filter-sidebar__rating" :class="{ active: isSelected(section.key, stars) }" @click="toggleFilter(section.key, stars)">
              <i v-for="i in 5" :key="i" :class="i <= stars ? 'fas fa-star' : 'far fa-star'"></i>
              <span>& up</span>
            </button>
          </template>
          <!-- Toggle -->
          <template v-else-if="section.type === 'toggle'">
            <label v-for="opt in section.options" :key="opt.value" class="filter-sidebar__toggle">
              <span>{{ opt.label }}</span>
              <input type="checkbox" :checked="isSelected(section.key, opt.value)" @change="toggleFilter(section.key, opt.value)" />
              <span class="filter-sidebar__toggle-track"></span>
            </label>
          </template>
        </div>
      </div>

      <button v-if="hasActiveFilters" class="filter-sidebar__clear" @click="clearAll">
        <i class="fas fa-times"></i> Clear All Filters
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  sections: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  sticky: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const collapsed = reactive({})

function toggleSection(key) {
  collapsed[key] = !collapsed[key]
}

function isSelected(key, value) {
  const current = props.modelValue[key]
  if (Array.isArray(current)) return current.includes(value)
  return current === value
}

function toggleFilter(key, value) {
  const updated = { ...props.modelValue }
  const arr = Array.isArray(updated[key]) ? [...updated[key]] : []
  const idx = arr.indexOf(value)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(value)
  updated[key] = arr
  emit('update:modelValue', updated)
}

function getRangeMin(key) { return props.modelValue[key]?.min ?? '' }
function getRangeMax(key) { return props.modelValue[key]?.max ?? '' }
function setRangeMin(key, val) {
  emit('update:modelValue', { ...props.modelValue, [key]: { ...props.modelValue[key], min: val ? Number(val) : undefined } })
}
function setRangeMax(key, val) {
  emit('update:modelValue', { ...props.modelValue, [key]: { ...props.modelValue[key], max: val ? Number(val) : undefined } })
}

const hasActiveFilters = computed(() => {
  return Object.values(props.modelValue).some(v => {
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'object' && v !== null) return v.min !== undefined || v.max !== undefined
    return v !== undefined && v !== null && v !== ''
  })
})

function clearAll() {
  const cleared = {}
  props.sections.forEach(s => { cleared[s.key] = [] })
  emit('update:modelValue', cleared)
}
</script>

<style scoped>
.filter-sidebar {
  width: 220px;
  flex-shrink: 0;
}
.filter-sidebar--sticky {
  position: sticky;
  top: 80px;
  height: fit-content;
}
.filter-sidebar__inner {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.filter-sidebar__section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--neutral-100, #F5F5F5);
}
.filter-sidebar__section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.filter-sidebar__title {
  font-size: var(--text-sm, 13px);
  font-weight: 600;
  color: var(--neutral-900, #0F1111);
  margin: 0 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}
.filter-sidebar__title i { font-size: 10px; color: var(--neutral-400, #aaa); }

.filter-sidebar__check {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
  font-size: var(--text-sm, 13px);
  color: var(--neutral-700, #565959);
}
.filter-sidebar__check input { accent-color: var(--brand-primary, #FF9900); }
.filter-sidebar__check-label { flex: 1; }
.filter-sidebar__count { font-size: 11px; color: var(--neutral-400, #aaa); }

.filter-sidebar__range { display: flex; align-items: center; gap: 8px; }
.filter-sidebar__range-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-sm, 4px);
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}
.filter-sidebar__range-sep { color: var(--neutral-400, #aaa); font-size: 12px; }

.filter-sidebar__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--neutral-600, #666);
}
.filter-sidebar__rating i { color: var(--brand-primary, #FF9900); font-size: 12px; }
.filter-sidebar__rating.active { color: var(--neutral-900, #0F1111); font-weight: 600; }

.filter-sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  cursor: pointer;
  font-size: var(--text-sm, 13px);
}
.filter-sidebar__toggle input { display: none; }
.filter-sidebar__toggle-track {
  width: 36px; height: 20px;
  background: var(--neutral-300, #D5D9D9);
  border-radius: 10px;
  position: relative;
  transition: background 0.15s;
}
.filter-sidebar__toggle-track::after {
  content: '';
  width: 16px; height: 16px;
  background: var(--white, #fff);
  border-radius: 50%;
  position: absolute; top: 2px; left: 2px;
  transition: transform 0.15s;
}
.filter-sidebar__toggle input:checked + .filter-sidebar__toggle-track { background: var(--brand-accent, #007185); }
.filter-sidebar__toggle input:checked + .filter-sidebar__toggle-track::after { transform: translateX(16px); }

.filter-sidebar__clear {
  width: 100%;
  padding: 8px;
  background: none;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-md, 8px);
  font-size: 12px;
  font-weight: 500;
  color: var(--neutral-600, #666);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s;
}
.filter-sidebar__clear:hover { border-color: var(--error, #CC0C39); color: var(--error, #CC0C39); }

/* Mobile: hide (use FilterSheet instead) */
@media (max-width: 767px) {
  .filter-sidebar { display: none; }
}
</style>

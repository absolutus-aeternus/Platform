<template>
  <nav class="dynamic-nav" :class="{ 'dynamic-nav--vertical': vertical }">
    <template v-for="item in filteredItems" :key="item.path || item.label">
      <!-- Regular link -->
      <router-link
        v-if="!item.children"
        :to="item.path"
        class="dynamic-nav__item"
        :class="{ 'dynamic-nav__item--active': isActive(item) }"
      >
        <i v-if="item.icon" :class="item.icon" class="dynamic-nav__icon"></i>
        <span class="dynamic-nav__label">{{ item.label }}</span>
        <span v-if="item.badge" class="dynamic-nav__badge">{{ item.badge }}</span>
      </router-link>

      <!-- Group with children -->
      <div v-else class="dynamic-nav__group">
        <div class="dynamic-nav__group-header" @click="toggleGroup(item.label)">
          <i v-if="item.icon" :class="item.icon" class="dynamic-nav__icon"></i>
          <span class="dynamic-nav__label">{{ item.label }}</span>
          <i class="fas dynamic-nav__chevron" :class="expandedGroups[item.label] ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
        </div>
        <div v-show="expandedGroups[item.label]" class="dynamic-nav__children">
          <router-link
            v-for="child in filterItems(item.children)"
            :key="child.path"
            :to="child.path"
            class="dynamic-nav__child"
            :class="{ 'dynamic-nav__child--active': isActive(child) }"
          >
            <i v-if="child.icon" :class="child.icon" class="dynamic-nav__icon-sm"></i>
            <span>{{ child.label }}</span>
          </router-link>
        </div>
      </div>
    </template>
  </nav>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  items: { type: Array, required: true },
  vertical: { type: Boolean, default: false }
})

const route = useRoute()
const { hasRole, hasPermission, hasRoleLevel, filterNav } = useAuth()
const expandedGroups = reactive({})

const filteredItems = computed(() => filterNav(props.items))

function filterItems(items) {
  return filterNav(items)
}

function isActive(item) {
  return route.path === item.path || route.path.startsWith(item.path + '/')
}

function toggleGroup(label) {
  expandedGroups[label] = !expandedGroups[label]
}
</script>

<style scoped>
.dynamic-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}
.dynamic-nav--vertical {
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
}

.dynamic-nav__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md, 8px);
  text-decoration: none;
  color: var(--neutral-700, #565959);
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  transition: all var(--ease-fast, 0.15s ease);
  white-space: nowrap;
}
.dynamic-nav__item:hover {
  background: var(--neutral-100, #F5F5F5);
  color: var(--neutral-900, #0F1111);
}
.dynamic-nav__item--active {
  background: var(--brand-primary-light, #FFF4E6);
  color: var(--brand-primary-hover, #E68A00);
  font-weight: 600;
}

.dynamic-nav__icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
.dynamic-nav__icon-sm { font-size: 12px; width: 16px; text-align: center; flex-shrink: 0; }

.dynamic-nav__badge {
  background: var(--error, #CC0C39);
  color: var(--white, #fff);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.dynamic-nav__group { width: 100%; }
.dynamic-nav__group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: var(--neutral-500, #888);
  font-size: var(--text-xs, 12px);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  user-select: none;
}
.dynamic-nav__group-header:hover { color: var(--neutral-700, #565959); }
.dynamic-nav__chevron { margin-left: auto; font-size: 10px; }

.dynamic-nav__children { padding-left: 8px; }
.dynamic-nav__child {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-md, 8px);
  text-decoration: none;
  color: var(--neutral-600, #666);
  font-size: var(--text-sm, 13px);
  transition: all var(--ease-fast, 0.15s ease);
}
.dynamic-nav__child:hover {
  background: var(--neutral-50, #FAFAFA);
  color: var(--neutral-900, #0F1111);
}
.dynamic-nav__child--active {
  background: var(--brand-primary-light, #FFF4E6);
  color: var(--brand-primary-hover, #E68A00);
}

/* Horizontal layout */
.dynamic-nav:not(.dynamic-nav--vertical) .dynamic-nav__item {
  padding: 6px 16px;
}
</style>

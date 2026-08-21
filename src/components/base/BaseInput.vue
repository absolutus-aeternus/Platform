<template>
  <div class="base-input" :class="{ 'base-input--error': error, 'base-input--disabled': disabled }">
    <label v-if="label" class="base-input__label" :for="inputId">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>
    <div class="base-input__wrap" :class="{ 'base-input__wrap--focused': focused }">
      <span v-if="$slots.prefix || prefixIcon" class="base-input__prefix">
        <slot name="prefix">
          <i v-if="prefixIcon" :class="prefixIcon"></i>
        </slot>
      </span>
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        class="base-input__field"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
        @keyup.enter="$emit('enter')"
      />
      <span v-if="modelValue && clearable" class="base-input__clear" @click="$emit('update:modelValue', '')">
        <i class="fas fa-times"></i>
      </span>
      <span v-if="$slots.suffix || suffixIcon" class="base-input__suffix">
        <slot name="suffix">
          <i v-if="suffixIcon" :class="suffixIcon"></i>
        </slot>
      </span>
    </div>
    <div v-if="error || hint" class="base-input__message">
      <span v-if="error" class="base-input__error"><i class="fas fa-exclamation-circle"></i> {{ error }}</span>
      <span v-else-if="hint" class="base-input__hint">{{ hint }}</span>
    </div>
    <div v-if="maxlength && showCount" class="base-input__count">
      {{ (modelValue || '').length }}/{{ maxlength }}
    </div>
  </div>

</template>
</template>


<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  maxlength: { type: [Number, String], default: null },
  showCount: { type: Boolean, default: false },
  prefixIcon: { type: String, default: '' },
  suffixIcon: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  id: { type: String, default: '' }
})
defineEmits(['update:modelValue', 'enter'])

const focused = ref(false)
const inputRef = ref(null)
const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 8)}`)

function focus() { inputRef.value?.focus() }
defineExpose({ focus })


</script>

<style scoped>
.base-input { display: flex; flex-direction: column; gap: 4px; }
.base-input__label {
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  color: var(--neutral-700, #565959);
}
.base-input__required { color: var(--error, #CC0C39); }

.base-input__wrap {
  display: flex; align-items: center;
  border: 2px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-md, 8px);
  background: var(--white, #fff);
  transition: all var(--ease-fast, 0.15s ease);
  overflow: hidden;
}
.base-input__wrap:hover { border-color: var(--neutral-500, #888); }
.base-input__wrap--focused {
  border-color: var(--brand-accent, #007185);
  box-shadow: 0 0 0 3px rgba(0, 113, 133, 0.1);
}
.base-input--error .base-input__wrap {
  border-color: var(--error, #CC0C39);
}
.base-input--error .base-input__wrap--focused {
  box-shadow: 0 0 0 3px rgba(204, 12, 57, 0.1);
}
.base-input--disabled .base-input__wrap {
  background: var(--neutral-100, #F5F5F5);
  opacity: 0.6;
  cursor: not-allowed;
}

.base-input__prefix, .base-input__suffix {
  display: flex; align-items: center; justify-content: center;
  padding: 0 12px;
  color: var(--neutral-500, #888);
  font-size: 14px;
  flex-shrink: 0;
}
.base-input__field {
  flex: 1;
  border: none; outline: none;
  padding: 10px 12px;
  font-size: var(--text-base, 14px);
  font-family: var(--font-sans, 'Inter', sans-serif);
  color: var(--neutral-900, #0F1111);
  background: transparent;
  min-width: 0;
}
.base-input__field::placeholder { color: var(--neutral-400, #AAA); }
.base-input__field:disabled { cursor: not-allowed; }

.base-input__clear {
  display: flex; align-items: center; justify-content: center;
  padding: 0 8px; cursor: pointer;
  color: var(--neutral-400, #AAA);
  font-size: 12px;
}
.base-input__clear:hover { color: var(--neutral-700, #565959); }

.base-input__message {
  font-size: var(--text-xs, 12px);
  display: flex; align-items: center; gap: 4px;
}
.base-input__error { color: var(--error, #CC0C39); }
.base-input__error i { font-size: 11px; }
.base-input__hint { color: var(--neutral-500, #888); }

.base-input__count {
  font-size: var(--text-xs, 12px);
  color: var(--neutral-500, #888);
  text-align: right;
}

/* Mobile: prevent iOS zoom */
@media (max-width: 767px) {
  .base-input__field { font-size: 16px; }
}
</style>

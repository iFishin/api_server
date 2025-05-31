<template>
  <div class="param-input-wrapper">
    <input
      :type="param.schema?.type === 'number' ? 'number' : 'text'"
      :placeholder="param.description"
      :required="param.required"
      v-model="inputValue"
      @input="$emit('update:modelValue', inputValue)"
      class="param-input"
      :step="param.schema?.type === 'number' ? 'any' : undefined"
      :autocomplete="'off'"
    />
    <span class="input-required" :class="{ visible: param.required }">*</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ApiParameter } from '@/types/api'

const props = defineProps<{
  param: ApiParameter
  modelValue: any
}>()
const emit = defineEmits(['update:modelValue', 'change'])

const inputValue = ref(props.modelValue ?? '')

watch(() => props.modelValue, v => inputValue.value = v)
watch(inputValue, v => emit('change', v))
</script>

<style scoped>
.param-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.param-input {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid #90caf9;
  border-radius: 6px;
  font-size: 15px;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}

.param-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px #e3f2fd;
  background: #fff;
}

.input-required {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #d32f2f;
  font-size: 1.2em;
  font-weight: bold;
  user-select: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}

.input-required.visible {
  opacity: 1;
}
</style>
<template>
  <input
    :type="param.schema?.type === 'number' ? 'number' : 'text'"
    :placeholder="param.description"
    :required="param.required"
    v-model="inputValue"
    @input="$emit('update:modelValue', inputValue)"
    class="param-input"
  />
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
.param-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
}
</style>
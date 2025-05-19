<template>
  <MonacoEditor
    :value="modelValue"
    :language="language"
    :options="options"
    class="monaco-editor"
    @update:value="onChange"
  />
</template>

<script setup lang="ts">
import MonacoEditor from 'monaco-editor-vue3'
const props = defineProps<{
  modelValue: string
  language?: string
  options?: Record<string, any>
}>()
const emit = defineEmits(['update:modelValue', 'change'])

const onChange = (val: string) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style scoped>
.monaco-editor {
  width: 100%;
  height: 100%;
}
</style>
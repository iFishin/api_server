<template>
  <pre class="json-viewer">{{ prettyJson }}</pre>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ value: any, expandDepth?: number }>()
const prettyJson = computed(() =>
  typeof props.value === 'string'
    ? props.value
    : JSON.stringify(props.value, null, 2)
)
</script>

<style scoped>
.json-viewer {
  border-radius: 6px;
  padding: 12px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  overflow-x: auto;
}
</style>
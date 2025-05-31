<template>
  <div class="param-detail">
    <div class="param-header">
      <span class="param-name-badge">
        <span class="param-icon">🔑</span>{{ param.name }}
      </span>
      <span v-if="param.required" class="param-required-badge">required</span>
      <span class="param-type-badge">{{ schemaType }}</span>
    </div>
    
    <div v-if="param.description" class="param-description">
      {{ param.description }}
    </div>
    
    <div v-if="example" class="param-example">
      <span class="example-badge">Example:</span> <code>{{ example }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApiParameter } from '@/types/api'

const props = defineProps<{
  param: ApiParameter
}>()

const schemaType = computed(() => {
  const schema = props.param.schema
  if (schema.format) return `${schema.type} (${schema.format})`
  return schema.type
})

const example = computed(() =>
  props.param.schema.example ?? ''
)
</script>

<style scoped>
.param-detail {
  font-family: 'JetBrains Mono', 'Fira Mono', 'Consolas', monospace;
  background: #f8fafc;
  border-radius: 8px;
  padding: 1em 1.2em;
  margin-bottom: 1em;
  border: 1px solid #e0e0e0;
}

.param-header {
  display: flex;
  align-items: center;
  gap: 0.7em;
  margin-bottom: 0.3em;
  flex-wrap: wrap;
}

.param-name-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(90deg, #1976d2 10%, #42a5f5 100%);
  color: #fff;
  font-weight: bold;
  font-size: 1.12em;
  border-radius: 16px;
  padding: 0.18em 1.1em 0.18em 0.8em;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
  letter-spacing: 0.5px;
  border: none;
}

.param-icon {
  margin-right: 0.5em;
  font-size: 1.1em;
}

.param-required-badge {
  display: inline-block;
  background: #ffebee;
  color: #d32f2f;
  border-radius: 12px;
  padding: 0.1em 0.7em;
  font-size: 0.92em;
  font-weight: 500;
  border: 1px solid #ef9a9a;
}

.param-type-badge {
  display: inline-block;
  background: #f3e5f5;
  color: #7b1fa2;
  border-radius: 12px;
  padding: 0.1em 0.7em;
  font-size: 0.92em;
  border: 1px solid #ce93d8;
}

.param-description {
  color: #333;
  margin-bottom: 0.3em;
  margin-left: 0.2em;
  font-size: 0.98em;
}

.param-example {
  margin-top: 0.2em;
  margin-left: 0.2em;
  font-size: 0.97em;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.example-badge {
  display: inline-block;
  background: #e8f5e9;
  color: #388e3c;
  border-radius: 12px;
  padding: 0.1em 0.7em;
  font-size: 0.92em;
  border: 1px solid #a5d6a7;
}
</style>
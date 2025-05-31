<template>
  <div class="schema-viewer">
    <template v-if="schema">
      <div class="schema-entry" :class="schema.type">
        <div class="schema-header">
          <span class="type-icon">{{ typeIcon(schema.type) }}</span>
          <span class="type">{{ schema.type }}</span>
          <span v-if="schema.format" class="format">({{ schema.format }})</span>
          <span v-if="schema.example !== undefined" class="example">示例: <code>{{ schema.example }}</code></span>
        </div>
        <div v-if="schema.type === 'object' && schema.properties" class="schema-properties">
          <div v-for="(prop, key) in schema.properties" :key="key" class="schema-property">
            <div class="property-key">
              <span class="property-name">「{{ key }}」</span>
              <SchemaViewer :schema="prop" />
            </div>
          </div>
        </div>
        <div v-else-if="schema.type === 'array' && schema.items" class="schema-items">
          <div class="array-label">数组项:</div>
          <SchemaViewer :schema="schema.items" />
        </div>
      </div>
    </template>
    <template v-else>
      <span class="empty">无 Schema</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { JSONSchema } from '@/types/api'
defineProps<{ schema?: JSONSchema }>()

function typeIcon(type?: string) {
  switch (type) {
    case 'object': return '🗂️'
    case 'array': return '📚'
    case 'string': return '🔤'
    case 'integer':
    case 'number': return '🔢'
    case 'boolean': return '✔️'
    default: return '❓'
  }
}
</script>

<style scoped>
.schema-viewer {
  font-size: 1em;
  font-family: 'JetBrains Mono', 'Fira Mono', 'Consolas', monospace;
  line-height: 1.7;
}

.schema-entry {
  margin-left: 0.5em;
  border-left: 2px solid #e0e0e0;
  padding-left: 0.7em;
  margin-bottom: 0.5em;
}

.schema-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.2em;
}

.type-icon {
  font-size: 1.1em;
}

.type {
  color: #007bff;
  font-weight: bold;
}

.format {
  color: #888;
}

.example {
  color: #28a745;
  margin-left: 1em;
}

.schema-properties {
  margin-left: 1.2em;
  border-left: 1px dashed #b3c0d1;
  padding-left: 0.7em;
}

.property-key {
  margin-bottom: 0.3em;
}

.property-name {
  color: #b15b00;
  font-weight: 500;
  margin-right: 0.5em;
}

.schema-items {
  margin-left: 1.2em;
  border-left: 1px dashed #b3c0d1;
  padding-left: 0.7em;
}

.array-label {
  color: #6c757d;
  font-size: 0.95em;
  margin-bottom: 0.2em;
}

.empty {
  color: #aaa;
}
</style>
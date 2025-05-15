<template>
  <div class="schema-viewer">
    <template v-if="schema">
      <div class="schema-type">
        <span class="type">{{ schema.type }}</span>
        <span v-if="schema.format" class="format">({{ schema.format }})</span>
        <span v-if="schema.example !== undefined" class="example">示例: <code>{{ schema.example }}</code></span>
      </div>
      <div v-if="schema.properties" class="schema-properties">
        <div v-for="(prop, key) in schema.properties" :key="key" class="schema-property">
          <strong>{{ key }}</strong>:
          <SchemaViewer :schema="prop" />
        </div>
      </div>
      <div v-else-if="schema.items" class="schema-items">
        <span>数组项:</span>
        <SchemaViewer :schema="schema.items" />
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
</script>

<style scoped>
.schema-viewer {
  font-size: 0.98em;
}

.schema-type {
  margin-bottom: 0.3em;
}

.type {
  color: #007bff;
  font-weight: bold;
}

.format {
  color: #888;
  margin-left: 0.5em;
}

.example {
  color: #28a745;
  margin-left: 1em;
}

.schema-properties {
  margin-left: 1em;
}

.schema-property {
  margin-bottom: 0.2em;
}

.schema-items {
  margin-left: 1em;
}

.empty {
  color: #aaa;
}
</style>
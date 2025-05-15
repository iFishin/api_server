<template>
  <div class="param-detail">
    <div class="param-header">
      <span class="param-name">{{ param.name }}</span>
      <span class="param-required" v-if="param.required">required</span>
      <span class="param-type">{{ schemaType }}</span>
    </div>
    
    <div v-if="param.description" class="param-description">
      {{ param.description }}
    </div>
    
    <div v-if="example" class="param-example">
      Example: <code>{{ example }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ApiParameter } from '@/types/api' // Adjust the path as needed

const props = defineProps<{
  param: ApiParameter
}>()

const schemaType = computed(() => {
  const schema = props.param.schema
  if (schema.format) return `${schema.type} (${schema.format})`
  return schema.type
})

const example = computed(() => 
  props.param.schema.example ?? 'No example'
)
</script>
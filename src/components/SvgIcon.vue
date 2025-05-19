<template>
  <span v-html="iconSvg" :class="['svg-icon', name]" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ name: string }>()

const icons: Record<string, string> = {
  copy: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="8" height="8" rx="2"/><path d="M8 2v2M2 8h2M8 14v-2M14 8h-2"/></svg>`,
  link: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 9l-2 2a3 3 0 104.24 4.24l2-2M9 7l2-2a3 3 0 10-4.24-4.24l-2 2"/></svg>`,
  search: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="5"/><path d="M14 14l-3-3"/></svg>`,
  json: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M6 6h4v4H6z"/></svg>`,
  send: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 15l12-7L2 1v6l8 2-8 2z"/></svg>`,
  history: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 3"/></svg>`,
  close: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l8 8M12 4l-8 8"/></svg>`,
  response: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="12" height="8" rx="2"/><path d="M6 8h4"/></svg>`,
  error: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11h.01"/></svg>`,
  warning: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2l6 12H2L8 2z"/><circle cx="8" cy="11" r="1"/><path d="M8 7v2"/></svg>`,
}
const iconSvg = computed(() => icons[props.name] || '')
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
  line-height: 1;
}
</style>
<template>
  <span v-html="iconSvg" :class="['svg-icon', name]" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ name: string }>()

const icons: Record<string, string> = {
  copy: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="4" y="4" width="8" height="8" rx="2"/>
      <path d="M8 2v2M2 8h2M8 14v-2M14 8h-2"/>
    </svg>
  `,
  link: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M7 9l-2 2a3 3 0 104.24 4.24l2-2"/>
      <path d="M9 7l2-2a3 3 0 10-4.24-4.24l-2 2"/>
    </svg>
  `,
  search: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="7" cy="7" r="5"/>
      <path d="M14 14l-3-3"/>
    </svg>
  `,
  json: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="2" width="12" height="12" rx="2"/>
      <path d="M6 6h4v4H6z"/>
    </svg>
  `,
  send: `
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 14L14 8L2 2L4 8L2 14Z" fill="none"/>
    <line x1="4" y1="8" x2="14" y2="8"/>
  </svg>
`,
  history: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 4v4l3 3"/>
    </svg>
  `,
  close: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4l8 8"/>
      <path d="M12 4l-8 8"/>
    </svg>
  `,
  response: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="4" width="12" height="8" rx="2"/>
      <path d="M6 8h4"/>
    </svg>
  `,
  error: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="8" cy="8" r="7"/>
      <path d="M8 5v4"/>
      <path d="M8 11h.01"/>
    </svg>
  `,
  warning: `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 2l6 12H2L8 2z"/>
      <circle cx="8" cy="11" r="1"/>
      <path d="M8 7v2"/>
    </svg>
  `,
}
const iconSvg = computed(() => icons[props.name]?.replace(/\s{2,}/g, ' ').trim() || '')
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
  line-height: 1;
  /* 保证svg居中且不变形 */
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
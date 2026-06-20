<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="ctx-overlay"
      @mousedown="close"
      @contextmenu.prevent="close"
    >
      <div
        class="ctx-menu"
        :style="{ left: x + 'px', top: y + 'px' }"
        @click.stop
        @contextmenu.prevent
      >
        <button
          v-for="(item, i) in items"
          :key="i"
          class="ctx-item"
          :class="{ danger: item.danger }"
          @click="item.action(); close()"
        >
          <i :class="item.icon" class="ctx-icon"></i>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

export interface ContextMenuItem {
  label: string;
  icon: string;
  action: () => void;
  danger?: boolean;
}

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}>();

const emit = defineEmits<{
  close: [];
}>();

function close() {
  emit('close');
}

// 点击 overlay 关闭
</script>

<style scoped>
.ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
}

.ctx-menu {
  position: fixed;
  z-index: 2001;
  min-width: 150px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.ctx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  color: #2c3e50;
  transition: background 0.1s ease;
  font-family: inherit;
  text-align: left;
}

.ctx-item:hover {
  background: rgba(52, 152, 219, 0.1);
}

.ctx-item.danger:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.ctx-icon {
  width: 18px;
  text-align: center;
  font-size: 0.78rem;
  color: #7f8c8d;
}

.ctx-item.danger .ctx-icon {
  color: #e74c3c;
}
</style>

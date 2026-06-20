<template>
  <div
    class="nav-group"
    :class="{ selected }"
    :style="groupStyle"
    @contextmenu.prevent="$emit('context-menu', group, $event)"
  >
    <!-- 标题栏（分组拖拽手柄） -->
    <div class="group-header" @mousedown="startDrag">
      <div class="group-icon" :style="{ background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)` }">
        <i :class="group.icon"></i>
      </div>
      <div class="group-info">
        <h3 class="group-name">{{ group.name }}</h3>
        <span v-if="group.description" class="group-desc">{{ group.description }}</span>
        <span class="group-count">{{ group.tiles.length }} 项</span>
      </div>
    </div>

    <!-- 磁贴列表 — 可拖拽排序 -->
    <div class="group-tiles" :class="`tile-count-${group.tiles.length}`">
      <div
        v-for="(tile, tIdx) in group.tiles"
        :key="tile.id"
        draggable="true"
        @dragstart="(e) => onTileDragStart(e, tIdx)"
        @dragover.prevent="(e) => onTileDragOver(e, tIdx)"
        @drop="(e) => onTileDrop(e, tIdx)"
        @dragend="onTileDragEnd"
        class="tile-sort-wrapper"
        :class="{ 'drag-over': dragOverIndex === tIdx }"
      >
        <AppTile
          :tile="tile"
          :resizable="true"
          @resize="(t, s) => $emit('resize-tile', { group, tile: t, size: s })"
          @context-menu="(t, e) => $emit('context-menu', group, e, t)"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="group.tiles.length === 0" class="empty-tiles" @click.stop="$emit('add-tile', group)">
        <i class="fas fa-plus-circle"></i>
        <span>添加应用</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NavGroup } from '@/types/nav-config';
import AppTile from './AppTile.vue';

const props = defineProps<{
  group: NavGroup;
  selected?: boolean;
  /** 画布当前偏移 */
  canvasOffset: { x: number; y: number };
}>();

const emit = defineEmits<{
  'select': [group: NavGroup];
  'drag-start': [group: NavGroup, event: MouseEvent];
  'add-tile': [group: NavGroup];
  'context-menu': [group: NavGroup, event: MouseEvent, tile?: any];
  'resize-tile': [{ group: NavGroup; tile: any; size: any }];
  'reorder': [{ groupId: string; fromIndex: number; toIndex: number }];
}>();

// ---------- 拖拽排序 ----------
let dragFromIndex = -1;
const dragOverIndex = ref(-1);

function onTileDragStart(e: DragEvent, idx: number) {
  dragFromIndex = idx;
  e.dataTransfer?.setData('text/plain', String(idx));
  (e.target as HTMLElement)?.closest?.('.tile-sort-wrapper')?.classList.add('dragging');
}

function onTileDragOver(e: DragEvent, idx: number) {
  if (idx !== dragFromIndex) {
    dragOverIndex.value = idx;
  }
}

function onTileDrop(e: DragEvent, idx: number) {
  e.preventDefault();
  if (dragFromIndex >= 0 && dragFromIndex !== idx) {
    emit('reorder', { groupId: props.group.id, fromIndex: dragFromIndex, toIndex: idx });
  }
  dragOverIndex.value = -1;
}

function onTileDragEnd(e: DragEvent) {
  (e.target as HTMLElement)?.closest?.('.tile-sort-wrapper')?.classList.remove('dragging');
  dragOverIndex.value = -1;
  dragFromIndex = -1;
}

function select() { emit('select', props.group); }
function startDrag(e: MouseEvent) {
  if (e.button !== 0) return;
  emit('drag-start', props.group, e);
}

const groupStyle = computed(() => {
  const x = props.group.position.x + props.canvasOffset.x;
  const y = props.group.position.y + props.canvasOffset.y;
  return {
    left: `50%`,
    top: `50%`,
    transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0)`,
  };
});
</script>

<style scoped>
.nav-group {
  position: absolute;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 20px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  user-select: none;
}

.nav-group:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.nav-group.selected {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3), 0 12px 40px rgba(0, 0, 0, 0.12);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid color-mix(in srgb, var(--group-color, #3498db) 15%, transparent);
  cursor: grab;
}

.nav-group.selected .group-header {
  cursor: grabbing;
}

.group-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
}

.group-icon i {
  font-size: 1.2rem;
  color: white;
}

.group-info { flex: 1; min-width: 0; }
.group-name { font-size: 0.95rem; font-weight: 700; color: #2c3e50; margin: 0; line-height: 1.2; }
.group-desc { font-size: 0.7rem; color: #7f8c8d; display: block; margin: 2px 0; }
.group-count { font-size: 0.65rem; color: #3498db; font-weight: 600; background: rgba(52,152,219,0.1); padding: 1px 8px; border-radius: 10px; display: inline-block; }

.group-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tile-count-1 { justify-content: center; }

.tile-sort-wrapper {
  transition: transform 0.15s ease;
}
.tile-sort-wrapper.dragging { opacity: 0.4; }
.tile-sort-wrapper.drag-over { transform: translateY(4px); }

.empty-tiles {
  width: 100%;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #bdc3c7;
  cursor: pointer;
  border-radius: 12px;
  border: 2px dashed #dcdde1;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.empty-tiles:hover {
  border-color: #3498db;
  color: #3498db;
}

.empty-tiles i { font-size: 1.5rem; }
.empty-tiles span { font-size: 0.8rem; font-weight: 500; }
</style>

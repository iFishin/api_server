<template>
  <div
    class="nav-group"
    :class="{ selected }"
    :style="groupStyle"
    @mousedown="startDrag"
    @click.stop="select"
  >
    <!-- 标题栏（拖拽手柄） -->
    <div class="group-header" @mousedown="startDrag">
      <div class="group-icon" :style="{ background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)` }">
        <i :class="group.icon"></i>
      </div>
      <div class="group-info">
        <h3 class="group-name">{{ group.name }}</h3>
        <span v-if="group.description" class="group-desc">{{ group.description }}</span>
        <span class="group-count">{{ group.tiles.length }} 项</span>
      </div>

      <!-- 操作按钮 -->
      <div class="group-actions">
        <button class="g-btn" title="编辑分组" @click.stop="$emit('edit', group)"><i class="fas fa-pen"></i></button>
        <button class="g-btn" title="添加应用" @click.stop="$emit('add-tile', group)"><i class="fas fa-plus"></i></button>
        <button class="g-btn g-btn-danger" title="删除分组" @click.stop="$emit('delete', group)"><i class="fas fa-trash"></i></button>
      </div>
    </div>

    <!-- 磁贴列表 -->
    <div class="group-tiles" :class="`tile-count-${group.tiles.length}`">
      <AppTile
        v-for="tile in group.tiles"
        :key="tile.id"
        :tile="tile"
        :editable="true"
        @edit="(t) => $emit('edit-tile', { group, tile: t })"
        @delete="(t) => $emit('delete-tile', { group, tile: t })"
      />

      <!-- 空状态 -->
      <div v-if="group.tiles.length === 0" class="empty-tiles" @click.stop="$emit('add-tile', group)">
        <i class="fas fa-plus-circle"></i>
        <span>添加应用</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NavGroup } from '@/types/nav-config';
import AppTile from './AppTile.vue';

const props = defineProps<{
  group: NavGroup;
  selected?: boolean;
  /** 画布当前偏移，用于计算绝对位置 */
  canvasOffset: { x: number; y: number };
  /** 当前缩放 */
  scale: number;
}>();

const emit = defineEmits<{
  'edit': [group: NavGroup];
  'delete': [group: NavGroup];
  'add-tile': [group: NavGroup];
  'edit-tile': [{ group: NavGroup; tile: any }];
  'delete-tile': [{ group: NavGroup; tile: any }];
  'select': [group: NavGroup];
  'drag-start': [group: NavGroup, event: MouseEvent];
}>();

function select() {
  emit('select', props.group);
}

function startDrag(e: MouseEvent) {
  // 只响应左键
  if (e.button !== 0) return;
  // 传递给父级处理画布级拖拽
  emit('drag-start', props.group, e);
}

const groupStyle = computed(() => {
  // 计算相对于画布视口的位置
  // group.position 是世界坐标，canvasOffset 是画布平移量
  const x = props.group.position.x + props.canvasOffset.x;
  const y = props.group.position.y + props.canvasOffset.y;
  return {
    left: `50%`,
    top: `50%`,
    transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${props.scale})`,
    transformOrigin: '0 0',
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

/* ---- 标题栏 ---- */
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

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

.group-desc {
  font-size: 0.7rem;
  color: #7f8c8d;
  display: block;
  margin: 2px 0;
}

.group-count {
  font-size: 0.65rem;
  color: #3498db;
  font-weight: 600;
  background: rgba(52, 152, 219, 0.1);
  padding: 1px 8px;
  border-radius: 10px;
  display: inline-block;
}

/* ---- 操作按钮 ---- */
.group-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.nav-group:hover .group-actions,
.selected .group-actions {
  opacity: 1;
}

.g-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #2c3e50;
  transition: background 0.15s ease, color 0.15s ease;
}

.g-btn:hover {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.g-btn-danger:hover {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

/* ---- 磁贴网格 ---- */
.group-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 根据数量调整对齐 */
.tile-count-1 { justify-content: center; }

/* ---- 空状态 ---- */
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

.empty-tiles i {
  font-size: 1.5rem;
}

.empty-tiles span {
  font-size: 0.8rem;
  font-weight: 500;
}
</style>

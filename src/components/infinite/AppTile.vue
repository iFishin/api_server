<template>
  <div
    class="app-tile"
    :class="[
      `size-${tile.size}`,
      { 'tile-image': tile.iconType === 'image' && tile.imageUrl, dragging: isDragging }
    ]"
    :style="{ '--tile-color': tile.color }"
    @click.stop="handleClick"
    @dblclick.stop="$emit('edit', tile)"
  >
    <!-- 拖拽手柄（自由磁贴拖动用） -->
    <div
      v-if="draggable"
      class="tile-drag-handle"
      @mousedown.stop="(e) => $emit('drag-start', tile, e)"
    >
      <i class="fas fa-grip-vertical"></i>
    </div>

    <!-- 图标 -->
    <div class="tile-icon">
      <template v-if="tile.iconType === 'image' && tile.imageUrl">
        <img :src="tile.imageUrl" :alt="tile.title" @error="imageError = true" />
      </template>
      <i v-else :class="tile.icon"></i>
    </div>

    <!-- 文字 -->
    <div class="tile-text">
      <span class="tile-title">{{ tile.title }}</span>
      <span v-if="tile.description && tile.size !== 'small'" class="tile-desc">{{ tile.description }}</span>
    </div>

    <!-- 操作层 -->
    <div v-if="editable" class="tile-actions">
      <button class="tile-btn edit" title="编辑" @click.stop="$emit('edit', tile)"><i class="fas fa-pen"></i></button>
      <button class="tile-btn delete" title="删除" @click.stop="$emit('delete', tile)"><i class="fas fa-times"></i></button>
    </div>

    <!-- 伸缩手柄（右下角） -->
    <div
      v-if="resizable"
      class="tile-resize-handle"
      :title="nextSize.label"
      @click.stop="cycleSize"
    >
      <i :class="nextSize.icon"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { AppTile, TileSize } from '@/types/nav-config';

const props = defineProps<{
  tile: AppTile;
  editable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
}>();

const emit = defineEmits<{
  edit: [tile: AppTile];
  delete: [tile: AppTile];
  'drag-start': [tile: AppTile, event: MouseEvent];
  'resize': [tile: AppTile, newSize: TileSize];
}>();

const router = useRouter();
const imageError = ref(false);
const isDragging = ref(false);

const sizeCycle: TileSize[] = ['small', 'medium', 'large'];
function cycleSize() {
  const cur = props.tile.size;
  const idx = sizeCycle.indexOf(cur);
  const next = sizeCycle[(idx + 1) % sizeCycle.length];
  emit('resize', props.tile, next);
}

const nextSize = computed(() => {
  const cur = props.tile.size;
  const idx = sizeCycle.indexOf(cur);
  const next = sizeCycle[(idx + 1) % sizeCycle.length];
  const labels: Record<TileSize, { label: string; icon: string }> = {
    small: { label: '中', icon: 'fas fa-expand' },
    medium: { label: '大', icon: 'fas fa-expand-alt' },
    large: { label: '小', icon: 'fas fa-compress' },
  };
  return labels[next];
});

function handleClick() {
  if (props.tile.url) {
    const isAbsolute = /^https?:\/\//i.test(props.tile.url);
    if (isAbsolute) {
      window.open(props.tile.url, '_blank');
      return;
    }
    router.push(props.tile.url);
    return;
  }
  if (props.tile.route) {
    router.push(props.tile.route);
  }
}
</script>

<style scoped>
.app-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease,
    width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
  text-align: center;
  overflow: visible;
  padding: 10px;
}

.app-tile:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.98);
}

.app-tile.dragging {
  transform: scale(1.08);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  z-index: 100;
}

/* ---- 尺寸变体 ---- */
.size-small {
  min-width: 80px;
  max-width: 80px;
  min-height: 80px;
  max-height: 80px;
}

.size-medium {
  min-width: 130px;
  max-width: 130px;
  min-height: 120px;
  max-height: 120px;
}

.size-large {
  min-width: 260px;
  max-width: 260px;
  min-height: 100px;
  max-height: 100px;
  flex-direction: row;
  padding: 14px;
}

/* ---- 拖拽手柄 ---- */
.tile-drag-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  padding: 4px;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.15s ease;
  color: rgba(0, 0, 0, 0.3);
  z-index: 6;
  border-radius: 6px;
}

.tile-drag-handle:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.6);
}

.app-tile:hover .tile-drag-handle {
  opacity: 1;
}

/* ---- 图标 ---- */
.tile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--tile-color), color-mix(in srgb, var(--tile-color) 75%, black));
  box-shadow: 0 4px 12px color-mix(in srgb, var(--tile-color) 30%, transparent);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.app-tile:hover .tile-icon {
  transform: scale(1.05);
}

.tile-icon i {
  font-size: 1.1rem;
  color: white;
}

.tile-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  padding: 4px;
}

.size-small .tile-icon {
  width: 32px;
  height: 32px;
}

.size-small .tile-icon i {
  font-size: 0.95rem;
}

.size-large .tile-icon {
  width: 42px;
  height: 42px;
}

.size-large .tile-icon i {
  font-size: 1.3rem;
}

/* ---- 文字 ---- */
.tile-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
}

.size-large .tile-text {
  align-items: flex-start;
  flex: 1;
}

.tile-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.size-large .tile-title {
  font-size: 0.9rem;
}

.tile-desc {
  font-size: 0.62rem;
  color: #7f8c8d;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 100%;
}

.size-large .tile-desc {
  font-size: 0.7rem;
}

/* ---- 操作按钮 ---- */
.tile-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 5;
}

.app-tile:hover .tile-actions {
  opacity: 1;
}

.tile-btn {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  color: white;
  transition: background 0.15s ease, transform 0.15s ease;
  background: rgba(0, 0, 0, 0.45);
}

.tile-btn:hover {
  transform: scale(1.15);
}

.tile-btn.edit:hover {
  background: #3498db;
}

.tile-btn.delete:hover {
  background: #e74c3c;
}

/* ---- 伸缩手柄 ---- */
.tile-resize-handle {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
  color: rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  font-size: 0.55rem;
  z-index: 5;
}

.tile-resize-handle:hover {
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.6);
}

.app-tile:hover .tile-resize-handle {
  opacity: 1;
}
</style>

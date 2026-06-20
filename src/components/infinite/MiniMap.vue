<template>
  <div class="mini-map">
    <div class="mini-title"><i class="fas fa-map"></i> 导航地图</div>
    <div class="mini-content" @click="handleClick">
      <!-- 分组缩略 -->
      <div
        v-for="g in groups"
        :key="g.id"
        class="mini-dot"
        :style="{
          left: dotX(g) + '%',
          top: dotY(g) + '%',
          backgroundColor: g.color,
          transform: 'translate(-50%, -50%)',
        }"
        :title="`${g.name} (${g.tiles.length}项)`"
      ></div>
      <!-- 视口指示器 -->
      <div class="mini-viewport" :style="viewportStyle"></div>
      <!-- 中心点 -->
      <div class="mini-center"></div>
    </div>
    <div class="mini-footer">
      位置 ({{ Math.round(panX) }}, {{ Math.round(panY) }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NavGroup } from '@/types/nav-config';

const props = defineProps<{
  groups: NavGroup[];
  panX: number;
  panY: number;
  scale: number;
  viewportWidth: number;
  viewportHeight: number;
}>();

const emit = defineEmits<{
  navigate: [x: number, y: number];
}>();

// 小地图尺寸常量 (CSS 定义)
const MAP_W = 180;
const MAP_H = 120;

// 计算分组范围以决定映射比例
const bounds = computed(() => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  props.groups.forEach((g) => {
    if (g.position.x < minX) minX = g.position.x;
    if (g.position.x > maxX) maxX = g.position.x;
    if (g.position.y < minY) minY = g.position.y;
    if (g.position.y > maxY) maxY = g.position.y;
  });
  // 处理空的情况
  if (!isFinite(minX)) {
    return { minX: -400, maxX: 400, minY: -300, maxY: 300, width: 800, height: 600 };
  }
  // 加边距
  const pad = 100;
  minX -= pad; maxX += pad;
  minY -= pad; maxY += pad;
  const w = Math.max(maxX - minX, 600);
  const h = Math.max(maxY - minY, 400);
  return { minX, maxX, minY, maxY, width: w, height: h };
});

function dotX(g: NavGroup): number {
  return ((g.position.x - bounds.value.minX) / bounds.value.width) * 100;
}
function dotY(g: NavGroup): number {
  return ((g.position.y - bounds.value.minY) / bounds.value.height) * 100;
}

// 视口映射到小地图
const viewportStyle = computed(() => {
  const b = bounds.value;
  const vpLeft = ((-props.panX - b.minX) / b.width) * MAP_W;
  const vpTop = ((-props.panY - b.minY) / b.height) * MAP_H;
  const vpW = (props.viewportWidth / b.width) * MAP_W / props.scale;
  const vpH = (props.viewportHeight / b.height) * MAP_H / props.scale;
  return {
    left: `${vpLeft}px`,
    top: `${vpTop}px`,
    width: `${vpW}px`,
    height: `${vpH}px`,
  };
});

function handleClick(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const pctX = (e.clientX - rect.left) / rect.width;
  const pctY = (e.clientY - rect.top) / rect.height;
  const b = bounds.value;
  const worldX = b.minX + pctX * b.width;
  const worldY = b.minY + pctY * b.height;
  emit('navigate', worldX, worldY);
}
</script>

<style scoped>
.mini-map {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  background: rgba(0, 0, 0, 0.82);
  border-radius: 12px;
  padding: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 20;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.mini-title {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-content {
  position: relative;
  height: 120px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  cursor: crosshair;
  overflow: hidden;
}

/* 分组点 */
.mini-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

/* 视口 */
.mini-viewport {
  position: absolute;
  border: 2px solid rgba(52, 152, 219, 0.7);
  background: rgba(52, 152, 219, 0.12);
  border-radius: 2px;
  pointer-events: none;
}

/* 中心 */
.mini-center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 5px;
  background: rgba(231, 76, 60, 0.85);
  border: 1px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.mini-footer {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.65rem;
  font-family: 'Courier New', monospace;
}
</style>

<template>
  <div class="infinite-nav-container" ref="containerRef">
    <!-- 画布 -->
    <div
      class="infinite-canvas"
      :style="canvasStyle"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @contextmenu.prevent="handleCanvasContext"
      @touchstart.passive="handleTouchStart"
      @touchmove.passive="handleTouchMove"
      @touchend="handleTouchEnd"
      @wheel.prevent="handleWheel"
    >
      <!-- 分组 -->
      <NavGroup
        v-for="g in config.groups"
        :key="g.id"
        :group="g"
        :selected="selectedGroupId === g.id"
        :edit-mode="editMode"
        :canvas-offset="{ x: panX, y: panY }"
        @context-menu="handleGroupContextMenu"
        @drag-start="handleGroupDragStart"
        @add-tile="(grp) => openTileEditor(grp)"
        @edit="openGroupEditor"
        @delete="removeGroup"
        @edit-tile="({ group: grp, tile }) => openTileEditor(grp, tile)"
        @delete-tile="({ group: grp, tile }) => removeTile(grp.id, tile.id)"
        @resize-tile="({ group: grp, tile, size }) => updateTile(grp.id, tile.id, { size })"
        @reorder="handleTileReorder"
      />

      <!-- 自由磁贴 -->
      <div
        v-for="tile in freeTiles"
        :key="tile.id"
        class="free-tile-wrapper"
        :style="freeTileStyle(tile)"
        @mousedown.stop="(e) => handleFreeTileDragStart(tile, e)"
      >
        <AppTile
          :tile="tile"
          :edit-mode="editMode"
          :draggable="true"
          :resizable="true"
          @drag-start="(t: any, e: MouseEvent) => handleFreeTileDragStart(t, e)"
          @resize="(t: any, s: any) => updateFreeTile(t.id, { size: s })"
          @edit="openFreeTileEditor"
          @delete="(t: any) => removeFreeTile(t.id)"
          @context-menu="editMode ? (t: any, e: MouseEvent) => showContextMenu(e, [
            { label: '编辑', icon: 'fas fa-pen', action: () => openFreeTileEditor(t) },
            { label: '删除', icon: 'fas fa-trash', danger: true, action: () => removeFreeTile(t.id) },
            { label: '调整大小', icon: 'fas fa-expand', action: () => { const s = ['small','medium','large']; const c = s.indexOf(t.size); updateFreeTile(t.id, { size: s[(c+1)%3] as any }); } },
          ]) : undefined"
        />
      </div>
    </div>

    <!-- 浮动面板 -->
    <div class="floating-ui">
      <div class="info-panel">
        <div class="coord-line">X {{ Math.round(-panX) }} / Y {{ Math.round(-panY) }}</div>
        <div class="coord-line dim">缩放 {{ (zoom * 100).toFixed(0) }}% / {{ config.groups.length + (freeTiles?.length || 0) }} 项</div>
        <div class="status-line">
          <span v-if="isDragging" class="tag drag">✦ 拖拽</span>
          <span v-else-if="isInertia" class="tag inert">◈ 惯性</span>
          <span v-else class="tag idle">● 就绪</span>
        </div>
      </div>

      <div class="toolbar">
        <button class="tool-btn" :class="{ active: editMode }" title="编辑布局" @click="editMode = !editMode">
          <i class="fas fa-pencil-alt"></i><span>编辑布局</span>
        </button>

        <template v-if="editMode">
          <button class="tool-btn" title="添加分组" @click="openGroupEditor()"><i class="fas fa-layer-group"></i><span>添加分组</span></button>
          <button class="tool-btn" title="添加应用" @click="openFreeTileCreator()"><i class="fas fa-plus-square"></i><span>添加应用</span></button>
          <div class="tool-divider"></div>
        </template>

        <button class="tool-btn" title="回到中心" @click="resetView"><i class="fas fa-home"></i><span>归位</span></button>
        <div class="tool-divider"></div>
        <button class="tool-btn" title="导出配置" @click="exportConfig"><i class="fas fa-file-export"></i></button>
        <button class="tool-btn" title="导入配置" @click="triggerImport"><i class="fas fa-file-import"></i></button>
        <button class="tool-btn" title="重置默认" @click="resetToDefault"><i class="fas fa-undo-alt"></i></button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu v-if="editMode" :visible="ctxVisible" :x="ctxX" :y="ctxY" :items="ctxItems" @close="ctxVisible = false" />

    <!-- 编辑弹窗 -->
    <EditorModal :visible="modalVisible" :is-group="modalIsGroup" :edit-group="editingGroup" :edit-tile="editingTile" @close="closeModal" @save="handleModalSave" />

    <input ref="fileInputRef" type="file" accept=".json" style="display:none" @change="handleFileImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import type { NavGroup as NavGroupType, AppTile as AppTileType } from '@/types/nav-config';
import { useNavConfig } from '@/composables/useNavConfig';
import NavGroup from '@/components/infinite/NavGroup.vue';
import AppTile from '@/components/infinite/AppTile.vue';
import EditorModal from '@/components/infinite/EditorModal.vue';
import ContextMenu from '@/components/infinite/ContextMenu.vue';
import type { ContextMenuItem } from '@/components/infinite/ContextMenu.vue';

const { config, addGroup, updateGroup, removeGroup, addTile, updateTile, removeTile, moveTile, addFreeTile, updateFreeTile, removeFreeTile, exportConfig, loadFromFile, resetToDefault } = useNavConfig();
const freeTiles = computed(() => config.value.freeTiles ?? []);

// DOM
const fileInputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

// ========== PAN (single source: refs, NO plain let vars) ==========
const panX = ref(0);
const panY = ref(0);
const isDragging = ref(false);
let lastX = 0, lastY = 0;

// Drag RAF throttling — batch reactive updates to display frame rate
let rafPending = false;
function syncPan() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    // panX / panY are already updated by mousemove via ix/iy
    rafPending = false;
  });
}

// Internal fast vars (not reactive) updated per mousemove, synced to refs via RAF
let ix = 0, iy = 0;

// ========== INERTIA ==========
const isInertia = ref(false);
let inertiaVx = 0, inertiaVy = 0;
let inertiaRaf: number | null = null;
function stopInertia() { if (inertiaRaf) { cancelAnimationFrame(inertiaRaf); inertiaRaf = null; } isInertia.value = false; }
function startInertia(vx: number, vy: number) {
  stopInertia(); isInertia.value = true;
  const decel = 0.92;
  function tick() {
    inertiaVx *= decel; inertiaVy *= decel;
    if (Math.abs(inertiaVx) < 0.5 && Math.abs(inertiaVy) < 0.5) { isInertia.value = false; return; }
    ix += inertiaVx; iy += inertiaVy;
    panX.value = ix; panY.value = iy;
    inertiaRaf = requestAnimationFrame(tick);
  }
  inertiaRaf = requestAnimationFrame(tick);
}

// ========== ZOOM ==========
const zoom = ref(1);
const MIN_ZOOM = 0.3, MAX_ZOOM = 3;

// ========== CANVAS STYLE (computed uses only reactive refs — FIXES ISSUE 1) ==========
const canvasStyle = computed(() => {
  const z = zoom.value;
  let bg = 'none', bgSize = 'auto';
  if (gridMode.value === 'dots') {
    bg = 'radial-gradient(circle, rgba(52,152,219,0.3) 1.5px, transparent 1.5px)';
    bgSize = `${40 * z}px ${40 * z}px`;
  } else if (gridMode.value === 'lines') {
    bg = 'linear-gradient(rgba(52,152,219,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(52,152,219,0.12) 1px, transparent 1px)';
    bgSize = `${50 * z}px ${50 * z}px, ${50 * z}px ${50 * z}px`;
  }
  return {
    cursor: isDragging.value ? 'grabbing' : 'grab',
    transform: `translate3d(${panX.value}px, ${panY.value}px, 0) scale(${z})`,
    transformOrigin: '0 0',
    backgroundImage: bg,
    backgroundSize: bgSize as string,
    width: '100%', height: '100%',
    position: 'absolute' as const,
    top: 0, left: 0,
  };
});

// ========== EDIT MODE ==========
const editMode = ref(false);

// ========== GRID ==========
const gridMode = ref<'off' | 'dots' | 'lines'>('off');

// ========== CONTEXT MENU ==========
const ctxVisible = ref(false);
const ctxX = ref(0);
const ctxY = ref(0);
const ctxItems = ref<ContextMenuItem[]>([]);
function showContextMenu(e: MouseEvent, items: ContextMenuItem[]) {
  if (!editMode.value) return;
  ctxX.value = e.clientX; ctxY.value = e.clientY; ctxItems.value = items; ctxVisible.value = true;
}

// ========== SELECTION ==========
const selectedGroupId = ref<string | null>(null);

// ========== DRAG — 全局不阻挡 ==========
let dragHistory: { t: number; x: number; y: number }[] = [];

function canDragOnTarget(el: EventTarget | null): boolean {
  if (!el) return true;
  const t = el as HTMLElement;
  // 功能按钮/菜单/弹窗 → 不拖动画布
  if (t.closest('.tool-btn') || t.closest('.ctx-menu') || t.closest('.modal-overlay')) return false;
  // 编辑模式下：分组/磁贴内部不拖动画布（让分组拖拽和磁贴排序优先）
  if (editMode.value && (t.closest('.nav-group') || t.closest('.free-tile-wrapper'))) return false;
  // 编辑模式下的排序手柄 → 拖拽排序，不走画布
  if (t.closest('.tile-drag-handle')) return false;
  // 编辑模式下的编辑按钮 → 不走画布
  if (t.closest('.tile-edit-btn') || t.closest('.tile-del-btn')) return false;
  // 分组标题栏 → 不走画布（交给分组拖拽）
  if (t.closest('.group-header')) return false;
  // 分组标题栏编辑按钮 → 不走画布
  if (t.closest('.g-btn')) return false;
  // 编辑模式下的排序手柄（AppTile 里的）
  if (t.closest('.tile-sort-handle')) return false;
  return true;
}

function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0 && e.button !== 2) return;
  if (!canDragOnTarget(e.target)) return;
  isDragging.value = true;
  lastX = e.clientX; lastY = e.clientY;
  dragHistory = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
  stopInertia();
  selectedGroupId.value = null;
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  ix += dx; iy += dy;
  lastX = e.clientX; lastY = e.clientY;
  dragHistory.push({ t: performance.now(), x: e.clientX, y: e.clientY });
  if (dragHistory.length > 5) dragHistory.shift();
  // RAF-throttled sync to reactive refs
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      panX.value = ix; panY.value = iy;
      rafPending = false;
    });
  }
}

function handleMouseUp() {
  if (isDragging.value && dragHistory.length > 1) {
    const now = performance.now();
    const recent = dragHistory.filter(h => now - h.t < 120);
    if (recent.length >= 2) {
      const f = recent[0], l = recent[recent.length - 1];
      const dt = l.t - f.t;
      if (dt > 0) {
        const vx = ((l.x - f.x) / dt) * 16 * 1.2;
        const vy = ((l.y - f.y) / dt) * 16 * 1.2;
        if (Math.abs(vx) > 1 || Math.abs(vy) > 1) startInertia(vx, vy);
      }
    }
  }
  isDragging.value = false;
  dragHistory = [];
}

// ========== TOUCH ==========
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1 || !canDragOnTarget(e.target)) return;
  isDragging.value = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; stopInertia();
}
function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length !== 1) return;
  ix += e.touches[0].clientX - lastX; iy += e.touches[0].clientY - lastY;
  panX.value = ix; panY.value = iy;
  lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
}
function handleTouchEnd() { isDragging.value = false; }

// ========== WHEEL → ZOOM ==========
function handleWheel(e: WheelEvent) {
  if (e.shiftKey) { ix -= e.deltaY * 0.8; panX.value = ix; return; }
  if (e.ctrlKey || e.metaKey) { iy -= e.deltaY * 0.8; panY.value = iy; return; }
  const old = zoom.value;
  zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, old * (e.deltaY > 0 ? 0.9 : 1 / 0.9)));
}

// ========== GROUP DRAG + COLLISION AVOIDANCE ==========
function getGroupRect(g: NavGroupType) {
  // 估算分组尺寸（px），用于碰撞检测
  const tileCount = g.tiles.length;
  const cols = Math.min(tileCount, 4);
  const rows = Math.ceil(tileCount / 4);
  const tileW = 130, tileH = 120, gap = 10;
  const w = Math.max(200, cols * tileW + (cols - 1) * gap + 32);
  const h = 60 + rows * tileH + (rows - 1) * gap + 32;
  return { x: g.position.x, y: g.position.y, w, h };
}

function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, padding = 20) {
  return !(a.x + a.w + padding < b.x || b.x + b.w + padding < a.x || a.y + a.h + padding < b.y || b.y + b.h + padding < a.y);
}

/** 迭代推开所有重叠分组 */
function pushApartAll() {
  const groups = config.value.groups;
  if (groups.length < 2) return;
  const PADDING = 20, MAX_ITER = 50;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    let anyOverlap = false;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = getGroupRect(groups[i]), b = getGroupRect(groups[j]);
        if (!rectsOverlap(a, b, PADDING)) continue;
        anyOverlap = true;
        const overlapX = Math.min(a.x + a.w + PADDING - b.x, b.x + b.w + PADDING - a.x);
        const overlapY = Math.min(a.y + a.h + PADDING - b.y, b.y + b.h + PADDING - a.y);
        if (overlapX < overlapY) {
          const push = overlapX * 0.5;
          groups[i].position.x -= push;
          groups[j].position.x += push;
        } else {
          const push = overlapY * 0.5;
          groups[i].position.y -= push;
          groups[j].position.y += push;
        }
      }
    }
    if (!anyOverlap) break;
  }
}

function handleGroupDragStart(group: NavGroupType, e: MouseEvent) {
  if (!editMode.value) return;
  let ox = e.clientX, oy = e.clientY;
  const others = config.value.groups.filter(g => g.id !== group.id);
  selectedGroupId.value = group.id;
  function onMove(ev: MouseEvent) {
    const dx = (ev.clientX - ox) / zoom.value;
    const dy = (ev.clientY - oy) / zoom.value;
    ox = ev.clientX; oy = ev.clientY;
    group.position.x += dx; group.position.y += dy;
    // 碰撞检测：推开重叠的分组
    const rectA = getGroupRect(group);
    for (const other of others) {
      const rectB = getGroupRect(other);
      if (rectsOverlap(rectA, rectB)) {
        // 计算推开方向
        const overlapX = Math.min(rectA.x + rectA.w - rectB.x, rectB.x + rectB.w - rectA.x);
        const overlapY = Math.min(rectA.y + rectA.h - rectB.y, rectB.y + rectB.h - rectA.y);
        if (overlapX < overlapY) {
          group.position.x += (rectA.x < rectB.x ? -1 : 1) * overlapX * 0.5;
          other.position.x += (rectA.x < rectB.x ? 1 : -1) * overlapX * 0.5;
        } else {
          group.position.y += (rectA.y < rectB.y ? -1 : 1) * overlapY * 0.5;
          other.position.y += (rectA.y < rectB.y ? 1 : -1) * overlapY * 0.5;
        }
      }
    }
  }
  function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ========== FREE TILE DRAG ==========
const freeTileDragId = ref<string | null>(null);
function handleFreeTileDragStart(tile: AppTileType, e: MouseEvent) {
  if (e.button !== 0 || !editMode.value) return;
  freeTileDragId.value = tile.id;
  let ox = e.clientX, oy = e.clientY;
  function onMove(ev: MouseEvent) {
    const dx = (ev.clientX - ox) / zoom.value;
    const dy = (ev.clientY - oy) / zoom.value;
    ox = ev.clientX; oy = ev.clientY;
    if (tile.position) { tile.position.x += dx; tile.position.y += dy; }
  }
  function onUp() { freeTileDragId.value = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function freeTileStyle(tile: AppTileType): Record<string, string> {
  if (!tile.position) return { display: 'none' };
  return { position: 'absolute', left: `${tile.position.x}px`, top: `${tile.position.y}px`, zIndex: freeTileDragId.value === tile.id ? '100' : '2' };
}

// ========== TILE REORDER ==========
function handleTileReorder(payload: { groupId: string; fromIndex: number; toIndex: number }) {
  moveTile(payload.groupId, payload.fromIndex, payload.toIndex);
}

// ========== CONTEXT MENU HANDLERS ==========
function handleCanvasContext(e: MouseEvent) {
  if (!editMode.value) return;
  if ((e.target as HTMLElement).closest('.nav-group') || (e.target as HTMLElement).closest('.free-tile-wrapper')) return;
  showContextMenu(e, [
    { label: '添加分组', icon: 'fas fa-layer-group', action: () => openGroupEditor() },
    { label: '添加应用', icon: 'fas fa-plus-square', action: () => openFreeTileCreator() },
  ]);
}

function handleGroupContextMenu(group: NavGroupType, e: MouseEvent, tile?: any) {
  if (!editMode.value) return;
  if (tile) {
    showContextMenu(e, [
      { label: '编辑', icon: 'fas fa-pen', action: () => openTileEditor(group, tile) },
      { label: '删除', icon: 'fas fa-trash', danger: true, action: () => removeTile(group.id, tile.id) },
      { label: '调整大小', icon: 'fas fa-expand', action: () => { const s = ['small','medium','large']; const c = s.indexOf(tile.size); updateTile(group.id, tile.id, { size: s[(c+1)%3] as any }); } },
    ]);
  } else {
    showContextMenu(e, [
      { label: '编辑分组', icon: 'fas fa-pen', action: () => openGroupEditor(group) },
      { label: '添加应用', icon: 'fas fa-plus-square', action: () => openTileEditor(group) },
      { label: '删除分组', icon: 'fas fa-trash', danger: true, action: () => removeGroup(group.id) },
    ]);
  }
}

// ========== MODAL ==========
const modalVisible = ref(false);
const modalIsGroup = ref(true);
const editingGroup = ref<NavGroupType | null>(null);
const editingTile = ref<AppTileType | null>(null);
let modalTargetGroupId: string | null = null;
let modalIsNewFreeTile = false;

function openGroupEditor(group?: NavGroupType) { modalIsGroup.value = true; editingGroup.value = group ?? null; editingTile.value = null; modalTargetGroupId = null; modalIsNewFreeTile = false; modalVisible.value = true; }
function openFreeTileCreator() { modalIsGroup.value = false; editingGroup.value = null; editingTile.value = null; modalTargetGroupId = null; modalIsNewFreeTile = true; modalVisible.value = true; }
function openFreeTileEditor(tile?: AppTileType) { modalIsGroup.value = false; editingGroup.value = null; editingTile.value = tile ?? null; modalTargetGroupId = null; modalIsNewFreeTile = false; modalVisible.value = true; }
function openTileEditor(group: NavGroupType, tile?: AppTileType) { modalIsGroup.value = false; modalTargetGroupId = group.id; editingGroup.value = null; editingTile.value = tile ?? null; modalIsNewFreeTile = false; modalVisible.value = true; }
function closeModal() { modalVisible.value = false; editingGroup.value = null; editingTile.value = null; }

function handleModalSave(data: Record<string, any>) {
  if (modalIsGroup.value) {
    if (editingGroup.value) updateGroup(editingGroup.value.id, { name: data.name, description: data.description || '', icon: data.icon, color: data.color });
    else addGroup({ name: data.name, description: data.description || '', position: { x: -ix + (Math.random() - 0.5) * 120 / zoom.value, y: -iy + (Math.random() - 0.5) * 120 / zoom.value }, icon: data.icon, color: data.color });
  } else if (modalIsNewFreeTile) {
    addFreeTile({ title: data.title, description: data.description, url: data.url, route: data.route, icon: data.icon, iconType: data.iconType, color: data.color, size: data.size }, { x: -ix + (Math.random() - 0.5) * 200 / zoom.value, y: -iy + (Math.random() - 0.5) * 150 / zoom.value });
  } else if (modalTargetGroupId) {
    if (editingTile.value) updateTile(modalTargetGroupId, editingTile.value.id, { title: data.title, description: data.description, url: data.url, route: data.route, icon: data.icon, iconType: data.iconType, color: data.color, size: data.size });
    else addTile(modalTargetGroupId, { title: data.title, description: data.description, url: data.url, route: data.route, icon: data.icon, iconType: data.iconType, color: data.color, size: data.size });
  } else if (editingTile.value) {
    updateFreeTile(editingTile.value.id, { title: data.title, description: data.description, url: data.url, route: data.route, icon: data.icon, iconType: data.iconType, color: data.color, size: data.size });
  }
  closeModal();
  pushApartAll();
}

// ========== NAVIGATION ==========
function resetView() { stopInertia(); zoom.value = 1; animatePanTo(0, 0); }
function animatePanTo(tx: number, ty: number) {
  const sx = ix, sy = iy, d = 400, t0 = performance.now();
  function frame(t: number) { const p = Math.min((t - t0) / d, 1); ix = sx + (tx - sx) * (1 - Math.pow(1 - p, 3)); iy = sy + (ty - sy) * (1 - Math.pow(1 - p, 3)); panX.value = ix; panY.value = iy; if (p < 1) requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
}

// ========== IMPORT/EXPORT ==========
function triggerImport() { fileInputRef.value?.click(); }
function handleFileImport(e: Event) { const input = e.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; loadFromFile(file).then(ok => { if (!ok) alert('无效的配置文件'); input.value = ''; }); }

// ========== KEYBOARD ==========
function handleKeyDown(e: KeyboardEvent) {
  const step = 50 / zoom.value;
  switch (e.key) {
    case 'ArrowLeft': ix += step; panX.value = ix; e.preventDefault(); break;
    case 'ArrowRight': ix -= step; panX.value = ix; e.preventDefault(); break;
    case 'ArrowUp': iy += step; panY.value = iy; e.preventDefault(); break;
    case 'ArrowDown': iy -= step; panY.value = iy; e.preventDefault(); break;
    case 'Home': resetView(); e.preventDefault(); break;
    case 'Escape': ctxVisible.value = false; closeModal(); selectedGroupId.value = null; break;
    case 'Delete': case 'Backspace': if (selectedGroupId.value && !modalVisible.value) { removeGroup(selectedGroupId.value); selectedGroupId.value = null; } break;
  }
}

// ========== LIFECYCLE ==========
let pushTimer: ReturnType<typeof setTimeout> | null = null;
watch(() => config.value.groups.map(g => g.tiles.length), () => {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(pushApartAll, 100);
}, { immediate: true, deep: false });

onMounted(() => { document.addEventListener('keydown', handleKeyDown); });
onUnmounted(() => { document.removeEventListener('keydown', handleKeyDown); stopInertia(); if (pushTimer) clearTimeout(pushTimer); });
</script>

<style scoped>
.infinite-nav-container {
  position: relative; width: 100vw; height: 100vh; overflow: hidden;
  background: transparent;
}
.infinite-canvas { will-change: transform; backface-visibility: hidden; }

.floating-ui { position: absolute; top: 0; left: 0; right: 0; pointer-events: none; z-index: 10; }

.info-panel {
  position: absolute; top: 16px; left: 16px;
  background: rgba(0, 0, 0, 0.65); color: white; padding: 10px 14px;
  border-radius: 10px; font-family: 'Courier New', monospace;
  backdrop-filter: blur(10px); pointer-events: auto; line-height: 1.6;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
.coord-line { font-size: 0.82rem; font-weight: 600; }
.coord-line.dim { font-size: 0.68rem; opacity: 0.65; }
.status-line { font-size: 0.72rem; }
.tag { font-weight: 600; }
.tag.idle { color: #10b981; }
.tag.drag { color: #f59e0b; }
.tag.inert { color: #3b82f6; }

.toolbar {
  position: absolute; top: 16px; right: 16px;
  display: flex; flex-direction: column; gap: 5px; pointer-events: auto;
}
.tool-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border: none; border-radius: 10px;
  background: rgba(255, 255, 255, 0.85); cursor: pointer;
  font-size: 0.78rem; font-weight: 500; color: #2c3e50;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(8px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-family: inherit;
}
.tool-btn:hover { background: rgba(255, 255, 255, 0.98); transform: translateX(-3px); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10); }
.tool-btn:active { transform: translateX(-1px) scale(0.97); }
.tool-btn.active { background: rgba(52, 152, 219, 0.85); color: white; box-shadow: 0 4px 14px rgba(52, 152, 219, 0.3); }
.tool-btn i { width: 16px; text-align: center; font-size: 0.85rem; }
.tool-btn span { white-space: nowrap; }
.tool-divider { height: 1px; background: rgba(0, 0, 0, 0.08); margin: 3px 0; }

@media (max-width: 768px) {
  .info-panel { font-size: 0.7rem; padding: 8px 10px; }
  .toolbar { top: auto; bottom: 16px; right: 16px; }
  .tool-btn { padding: 6px 10px; font-size: 0.72rem; }
  .tool-btn span { display: none; }
}
</style>

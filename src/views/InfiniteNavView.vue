<template>
  <div class="infinite-nav-container" ref="containerRef">
    <!-- 画布 -->
    <div
      class="infinite-canvas"
      ref="canvasRef"
      :style="canvasStyle"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @contextmenu.prevent="handleContextMenu"
      @touchstart.passive="handleTouchStart"
      @touchmove.passive="handleTouchMove"
      @touchend="handleTouchEnd"
      @wheel.prevent="handleWheel"
    >
      <!-- 坐标系 -->
      <div v-if="showCoord" class="coord-overlay">
        <div class="axis axis-x"></div>
        <div class="axis axis-y"></div>
        <div class="axis-label label-origin">O (0,0)</div>
        <div class="axis-label label-x">X</div>
        <div class="axis-label label-y">Y</div>
      </div>

      <!-- 分组 -->
      <NavGroup
        v-for="g in config.groups"
        :key="g.id"
        :group="g"
        :selected="selectedGroupId === g.id"
        :canvas-offset="{ x: panX, y: panY }"
        :scale="currentScale"
        @edit="openGroupEditor(g)"
        @delete="removeGroup(g.id)"
        @add-tile="openTileEditor(g)"
        @edit-tile="({ group, tile }) => openTileEditor(group, tile)"
        @delete-tile="({ group, tile }) => removeTile(group.id, tile.id)"
        @select="selectGroup(g.id)"
        @drag-start="handleGroupDragStart"
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
          :editable="true"
          :draggable="true"
          :resizable="true"
          @edit="openFreeTileEditor(tile)"
          @delete="removeFreeTile(tile.id)"
          @resize="(t, s) => updateFreeTile(t.id, { size: s })"
          @drag-start="(t, e) => handleFreeTileDragStart(t, e)"
        />
      </div>
    </div>

    <!-- 浮动控制面板 -->
    <div class="floating-ui">
      <!-- 坐标 + 状态 -->
      <div class="info-panel">
        <div class="coord-line">X {{ Math.round(panX) }} / Y {{ Math.round(panY) }}</div>
        <div class="coord-line dim">缩放 {{ (currentScale * 100).toFixed(0) }}% / {{ config.groups.length + (freeTiles?.length || 0) }} 项</div>
        <div class="status-line">
          <span v-if="isDragging" class="tag drag">✦ 拖拽</span>
          <span v-else-if="isGroupDragging || freeTileDragId" class="tag drag">✦ 移动</span>
          <span v-else-if="isInertia" class="tag inert">◈ 惯性</span>
          <span v-else class="tag idle">● 就绪</span>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <button class="tool-btn" title="添加分组" @click="openGroupEditor()">
          <i class="fas fa-layer-group"></i><span>分组</span>
        </button>
        <button class="tool-btn" title="添加应用" @click="openFreeTileCreator()">
          <i class="fas fa-plus-square"></i><span>应用</span>
        </button>
        <button class="tool-btn" title="回到中心" @click="resetView">
          <i class="fas fa-home"></i><span>归位</span>
        </button>
        <button class="tool-btn" :class="{ active: gridMode !== 'off' }" title="切换网格" @click="cycleGrid">
          <i class="fas fa-th"></i><span>网格</span>
        </button>
        <button class="tool-btn" :class="{ active: showCoord }" title="坐标系" @click="showCoord = !showCoord">
          <i class="fas fa-crosshairs"></i><span>坐标</span>
        </button>
        <button class="tool-btn" :class="{ active: showMiniMap }" title="小地图" @click="showMiniMap = !showMiniMap">
          <i class="fas fa-map"></i><span>地图</span>
        </button>
        <div class="tool-divider"></div>
        <button class="tool-btn" title="导入配置文件" @click="triggerImport">
          <i class="fas fa-file-import"></i>
        </button>
        <button class="tool-btn" title="导出配置文件" @click="exportConfig">
          <i class="fas fa-file-export"></i>
        </button>
        <button class="tool-btn" title="重置为默认" @click="resetToDefault">
          <i class="fas fa-undo-alt"></i>
        </button>
      </div>
    </div>

    <!-- 小地图 -->
    <MiniMap
      v-if="showMiniMap"
      :groups="config.groups"
      :free-tiles="freeTiles"
      :pan-x="panX"
      :pan-y="panY"
      :scale="currentScale"
      :viewport-width="viewport.width"
      :viewport-height="viewport.height"
      @navigate="navigateToPosition"
    />

    <!-- 编辑弹窗 -->
    <EditorModal
      :visible="modalVisible"
      :is-group="modalIsGroup"
      :edit-group="editingGroup"
      :edit-tile="editingTile"
      @close="closeModal"
      @save="handleModalSave"
    />

    <!-- 隐藏文件输入 -->
    <input ref="fileInputRef" type="file" accept=".json" style="display:none" @change="handleFileImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import type { NavGroup as NavGroupType, AppTile as AppTileType } from '@/types/nav-config';
import { useNavConfig } from '@/composables/useNavConfig';
import NavGroup from '@/components/infinite/NavGroup.vue';
import AppTile from '@/components/infinite/AppTile.vue';
import EditorModal from '@/components/infinite/EditorModal.vue';
import MiniMap from '@/components/infinite/MiniMap.vue';

// ---------- composable ----------
const {
  config,
  addGroup, updateGroup, removeGroup,
  addTile, updateTile, removeTile,
  addFreeTile, updateFreeTile, removeFreeTile, moveFreeTile,
  exportConfig, loadFromFile, resetToDefault,
} = useNavConfig();

const freeTiles = computed(() => config.value.freeTiles ?? []);

// ---------- DOM ----------
const containerRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// ---------- viewport ----------
const viewport = reactive({ width: window.innerWidth, height: window.innerHeight });

// ========== PAN ==========
const panX = ref(0);
const panY = ref(0);
let ix = 0, iy = 0;
const isDragging = ref(false);

// ========== INERTIA ==========
const isInertia = ref(false);
let inertiaVx = 0, inertiaVy = 0;
let inertiaRaf: number | null = null;

function startInertia(vx: number, vy: number) {
  stopInertia();
  isInertia.value = true;
  const decel = 0.92;
  const minV = 0.5;
  function tick() {
    inertiaVx *= decel;
    inertiaVy *= decel;
    if (Math.abs(inertiaVx) < minV && Math.abs(inertiaVy) < minV) {
      isInertia.value = false;
      return;
    }
    ix += inertiaVx;
    iy += inertiaVy;
    panX.value = ix;
    panY.value = iy;
    inertiaRaf = requestAnimationFrame(tick);
  }
  inertiaRaf = requestAnimationFrame(tick);
}

function stopInertia() {
  if (inertiaRaf) { cancelAnimationFrame(inertiaRaf); inertiaRaf = null; }
  isInertia.value = false;
}

// ---------- drag state ----------
let lastX = 0, lastY = 0;
let dragHistory: { t: number; x: number; y: number }[] = [];

// ========== ZOOM ==========
const zoomLevel = ref(1);
const currentScale = computed(() => zoomLevel.value);
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

// ========== GRID ==========
const gridMode = ref<'off' | 'dots' | 'lines'>('dots');
function cycleGrid() {
  const modes = ['off', 'dots', 'lines'] as const;
  gridMode.value = modes[(modes.indexOf(gridMode.value) + 1) % modes.length];
}

// ========== OVERLAYS ==========
const showMiniMap = ref(false);
const showCoord = ref(false);

// ========== SELECTION ==========
const selectedGroupId = ref<string | null>(null);
const freeTileDragId = ref<string | null>(null);
function selectGroup(id: string) { selectedGroupId.value = id; }

// ========== MODAL ==========
const modalVisible = ref(false);
const modalIsGroup = ref(true);
const editingGroup = ref<NavGroupType | null>(null);
const editingTile = ref<AppTileType | null>(null);
let modalTargetGroupId: string | null = null;
let modalIsNewFreeTile = false;

function openGroupEditor(group?: NavGroupType) {
  modalIsGroup.value = true;
  editingGroup.value = group ?? null;
  editingTile.value = null;
  modalTargetGroupId = null;
  modalIsNewFreeTile = false;
  modalVisible.value = true;
}

function openTileEditor(group: NavGroupType, tile?: AppTileType) {
  modalIsGroup.value = false;
  modalTargetGroupId = group.id;
  editingGroup.value = null;
  editingTile.value = tile ?? null;
  modalIsNewFreeTile = false;
  modalVisible.value = true;
}

function openFreeTileEditor(tile?: AppTileType) {
  modalIsGroup.value = false;
  modalTargetGroupId = null;
  editingGroup.value = null;
  editingTile.value = tile ?? null;
  modalIsNewFreeTile = tile == null;
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
  editingGroup.value = null;
  editingTile.value = null;
}

function handleModalSave(data: Record<string, any>) {
  if (modalIsGroup.value) {
    if (editingGroup.value) {
      updateGroup(editingGroup.value.id, { name: data.name, description: data.description || '', icon: data.icon, color: data.color });
    } else {
      const pos = { x: -ix + (Math.random() - 0.5) * 120, y: -iy + (Math.random() - 0.5) * 120 };
      addGroup({ name: data.name, description: data.description || '', position: pos, icon: data.icon, color: data.color });
    }
  } else if (modalIsNewFreeTile) {
    const pos = { x: -ix + (Math.random() - 0.5) * 200, y: -iy + (Math.random() - 0.5) * 150 };
    addFreeTile({
      title: data.title, description: data.description, url: data.url, route: data.route,
      icon: data.icon, iconType: data.iconType, color: data.color, size: data.size,
    }, pos);
  } else if (modalTargetGroupId) {
    if (editingTile.value) {
      updateTile(modalTargetGroupId, editingTile.value.id, {
        title: data.title, description: data.description, url: data.url, route: data.route,
        icon: data.icon, iconType: data.iconType, color: data.color, size: data.size,
      });
    } else {
      addTile(modalTargetGroupId, {
        title: data.title, description: data.description, url: data.url, route: data.route,
        icon: data.icon, iconType: data.iconType, color: data.color, size: data.size,
      });
    }
  } else if (editingTile.value) {
    updateFreeTile(editingTile.value.id, {
      title: data.title, description: data.description, url: data.url, route: data.route,
      icon: data.icon, iconType: data.iconType, color: data.color, size: data.size,
    });
  }
  closeModal();
}

// ========== CANVAS STYLE ==========
const canvasStyle = computed(() => {
  let bg = 'none', bgSize = 'auto';
  if (gridMode.value === 'dots') {
    bg = 'radial-gradient(circle, rgba(52,152,219,0.3) 1.5px, transparent 1.5px)';
    bgSize = '40px 40px';
  } else if (gridMode.value === 'lines') {
    bg = 'linear-gradient(rgba(52,152,219,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(52,152,219,0.12) 1px, transparent 1px)';
    bgSize = '50px 50px';
  }
  return { cursor: isDragging.value ? 'grabbing' : 'grab', backgroundImage: bg, backgroundSize: bgSize as string };
});

// ========== MOUSE EVENTS ==========
function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0 && e.button !== 2) return;
  if ((e.target as HTMLElement).closest('.nav-group') || (e.target as HTMLElement).closest('.free-tile-wrapper')) return;
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
  panX.value = ix; panY.value = iy;
  lastX = e.clientX; lastY = e.clientY;
  dragHistory.push({ t: performance.now(), x: e.clientX, y: e.clientY });
  if (dragHistory.length > 5) dragHistory.shift();
}

function handleMouseUp() {
  if (isDragging.value && dragHistory.length > 1) {
    const now = performance.now();
    const recent = dragHistory.filter(h => now - h.t < 120);
    if (recent.length >= 2) {
      const first = recent[0], last = recent[recent.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) {
        const vx = ((last.x - first.x) / dt) * 16 * 1.2;
        const vy = ((last.y - first.y) / dt) * 16 * 1.2;
        if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
          startInertia(vx, vy);
        }
      }
    }
  }
  isDragging.value = false;
  freeTileDragId.value = null;
  dragHistory = [];
}

// ========== GROUP DRAG ==========
function handleGroupDragStart(group: NavGroupType, e: MouseEvent) {
  let ox = e.clientX, oy = e.clientY;
  selectedGroupId.value = group.id;
  function onMove(ev: MouseEvent) {
    const dx = (ev.clientX - ox) / currentScale.value;
    const dy = (ev.clientY - oy) / currentScale.value;
    ox = ev.clientX; oy = ev.clientY;
    const g = config.groups.find(gg => gg.id === group.id);
    if (g) { g.position.x += dx; g.position.y += dy; }
  }
  function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ========== FREE TILE DRAG ==========
function handleFreeTileDragStart(tile: AppTileType, e: MouseEvent) {
  if (e.button !== 0) return;
  freeTileDragId.value = tile.id;
  let ox = e.clientX, oy = e.clientY;
  function onMove(ev: MouseEvent) {
    const dx = (ev.clientX - ox) / currentScale.value;
    const dy = (ev.clientY - oy) / currentScale.value;
    ox = ev.clientX; oy = ev.clientY;
    if (tile.position) {
      tile.position.x += dx;
      tile.position.y += dy;
    }
  }
  function onUp() {
    freeTileDragId.value = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ========== FREE TILE STYLE ==========
function freeTileStyle(tile: AppTileType): Record<string, string> {
  if (!tile.position) return { display: 'none' };
  const x = tile.position.x + panX.value;
  const y = tile.position.y + panY.value;
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${currentScale.value})`,
    transformOrigin: 'center center',
    zIndex: freeTileDragId.value === tile.id ? '100' : '2',
  };
}

// ========== TOUCH ==========
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1 || (e.target as HTMLElement).closest('.nav-group') || (e.target as HTMLElement).closest('.free-tile-wrapper')) return;
  isDragging.value = true;
  lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
  stopInertia();
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
  // Shift = 水平平移, Ctrl/Cmd = 垂直平移
  if (e.shiftKey) {
    ix -= e.deltaY * 0.8;
    panX.value = ix;
    return;
  }
  if (e.ctrlKey || e.metaKey) {
    iy -= e.deltaY * 0.8;
    panY.value = iy;
    return;
  }

  // 以鼠标位置为中心缩放
  const rect = containerRef.value?.getBoundingClientRect();
  if (!rect) return;
  const mx = e.clientX - rect.left - viewport.width / 2;
  const my = e.clientY - rect.top - viewport.height / 2;
  const oldScale = zoomLevel.value;
  const factor = e.deltaY > 0 ? 0.9 : 1 / 0.9;
  const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldScale * factor));
  zoomLevel.value = newScale;
  const actualScale = newScale / oldScale;
  ix = mx - actualScale * (mx - ix);
  iy = my - actualScale * (my - iy);
  panX.value = ix;
  panY.value = iy;
}

// ========== CONTEXT MENU ==========
function handleContextMenu(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.nav-group') && !(e.target as HTMLElement).closest('.free-tile-wrapper')) {
    openFreeTileCreator();
  }
}

// ========== NAVIGATION ==========
function resetView() {
  stopInertia();
  zoomLevel.value = 1;
  animatePanTo(0, 0);
}

function navigateToPosition(x: number, y: number) {
  stopInertia();
  animatePanTo(-x, -y);
}

function animatePanTo(tx: number, ty: number) {
  const sx = ix, sy = iy;
  const d = 400;
  const t0 = performance.now();
  function frame(t: number) {
    const p = Math.min((t - t0) / d, 1);
    const e = 1 - Math.pow(1 - p, 3);
    ix = sx + (tx - sx) * e; iy = sy + (ty - sy) * e;
    panX.value = ix; panY.value = iy;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ========== IMPORT / EXPORT ==========
function triggerImport() { fileInputRef.value?.click(); }
function handleFileImport(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  loadFromFile(file).then(ok => {
    if (!ok) alert('配置文件格式无效');
    input.value = '';
  });
}

// ========== KEYBOARD ==========
function handleKeyDown(e: KeyboardEvent) {
  const step = 50;
  switch (e.key) {
    case 'ArrowLeft': ix += step; panX.value = ix; e.preventDefault(); break;
    case 'ArrowRight': ix -= step; panX.value = ix; e.preventDefault(); break;
    case 'ArrowUp': iy += step; panY.value = iy; e.preventDefault(); break;
    case 'ArrowDown': iy -= step; panY.value = iy; e.preventDefault(); break;
    case 'Home': resetView(); e.preventDefault(); break;
    case 'Escape': closeModal(); selectedGroupId.value = null; break;
    case 'Delete': case 'Backspace':
      if (selectedGroupId.value && !modalVisible.value) {
        removeGroup(selectedGroupId.value);
        selectedGroupId.value = null;
      }
      break;
  }
}

// ========== RESIZE ==========
function updateViewport() {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
}

// ========== LIFECYCLE ==========
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', updateViewport);
});
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', updateViewport);
  stopInertia();
});

defineOptions({ name: 'InfiniteNavView' });
</script>

<style scoped>
.infinite-nav-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
  user-select: none;
}

/* ---- 画布 ---- */
.infinite-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  will-change: transform;
  backface-visibility: hidden;
}

/* ---- 坐标系 ---- */
.coord-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.axis { position: absolute; background: rgba(231, 76, 60, 0.5); }
.axis-x { top: 50%; left: 0; width: 100%; height: 1px; }
.axis-y { left: 50%; top: 0; width: 1px; height: 100%; }
.axis-label {
  position: absolute; color: rgba(231, 76, 60, 0.6);
  font-size: 0.7rem; font-weight: 700; font-family: 'Courier New', monospace;
}
.label-origin { top: calc(50% + 6px); left: calc(50% + 6px); }
.label-x { bottom: 8px; right: 12px; }
.label-y { top: 12px; left: calc(50% + 6px); }

/* ---- 自由磁贴包装 ---- */
.free-tile-wrapper {
  position: absolute;
  top: 0; left: 0;
  z-index: 2;
}

/* ========== 浮动面板 ========== */
.floating-ui { position: absolute; top: 0; left: 0; right: 0; pointer-events: none; z-index: 10; }

/* ---- 信息面板 ---- */
.info-panel {
  position: absolute; top: 16px; left: 16px;
  background: rgba(0, 0, 0, 0.65);
  color: white; padding: 10px 14px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  line-height: 1.6;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.coord-line { font-size: 0.82rem; font-weight: 600; }
.coord-line.dim { font-size: 0.68rem; opacity: 0.65; }
.status-line { font-size: 0.72rem; }

.tag { font-weight: 600; }
.tag.idle { color: #10b981; }
.tag.drag { color: #f59e0b; }
.tag.inert { color: #3b82f6; }

/* ---- 工具栏 ---- */
.toolbar {
  position: absolute; top: 16px; right: 16px;
  display: flex; flex-direction: column; gap: 5px;
  pointer-events: auto;
}

.tool-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 12px;
  border: none; border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-size: 0.78rem; font-weight: 500; color: #2c3e50;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-family: inherit;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.98);
  transform: translateX(-3px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10);
}

.tool-btn:active {
  transform: translateX(-1px) scale(0.97);
}

.tool-btn.active {
  background: rgba(52, 152, 219, 0.85);
  color: white;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.3);
}

.tool-btn i { width: 16px; text-align: center; font-size: 0.85rem; }
.tool-btn span { white-space: nowrap; }

.tool-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 2px 0;
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .info-panel { font-size: 0.7rem; padding: 8px 10px; }
  .toolbar { top: auto; bottom: 16px; right: 16px; }
  .tool-btn { padding: 6px 10px; font-size: 0.72rem; }
  .tool-btn span { display: none; }
}
</style>

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
    </div>

    <!-- 浮动控制 -->
    <div class="floating-ui">
      <!-- 坐标显示 -->
      <div class="info-panel">
        <div class="coord">X: {{ Math.round(panX) }} | Y: {{ Math.round(panY) }}</div>
        <div class="coord small">缩放: {{ (currentScale * 100).toFixed(0) }}%</div>
        <div class="status">
          <span v-if="isDragging" class="dragging">🖱️ 拖拽</span>
          <span v-else-if="isGroupDragging" class="dragging">📦 移动分组</span>
          <span v-else class="idle">😌 静止</span>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <button class="tool-btn" title="添加分组" @click="openGroupEditor()"><i class="fas fa-layer-group"></i><span>分组</span></button>
        <button class="tool-btn" title="回到中心" @click="resetView"><i class="fas fa-home"></i><span>归位</span></button>
        <button class="tool-btn" :class="{ active: showGrid }" title="切换网格" @click="cycleGrid"><i class="fas fa-th"></i><span>网格</span></button>
        <button class="tool-btn" :class="{ active: isZoomed }" title="缩放" @click="toggleZoom"><i class="fas fa-search-plus"></i><span>缩放</span></button>
        <button class="tool-btn" :class="{ active: showMiniMap }" title="小地图" @click="toggleMiniMap"><i class="fas fa-map"></i><span>地图</span></button>
        <button class="tool-btn" title="导入" @click="triggerImport"><i class="fas fa-file-import"></i><span>导入</span></button>
        <button class="tool-btn" title="导出" @click="exportConfig"><i class="fas fa-file-export"></i><span>导出</span></button>
        <button class="tool-btn" title="重置默认" @click="resetToDefault"><i class="fas fa-undo"></i><span>重置</span></button>
      </div>
    </div>

    <!-- 小地图 -->
    <MiniMap
      v-if="showMiniMap"
      :groups="config.groups"
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

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      style="display:none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import type { NavGroup as NavGroupType, AppTile } from '@/types/nav-config';
import { generateId } from '@/types/nav-config';
import { useNavConfig } from '@/composables/useNavConfig';
import NavGroup from '@/components/infinite/NavGroup.vue';
import EditorModal from '@/components/infinite/EditorModal.vue';
import MiniMap from '@/components/infinite/MiniMap.vue';

// ---------- composable ----------
const {
  config,
  addGroup, updateGroup, removeGroup,
  addTile, updateTile, removeTile,
  exportConfig, loadFromFile, resetToDefault,
} = useNavConfig();

// ---------- DOM ----------
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// ---------- viewport ----------
const viewport = reactive({ width: window.innerWidth, height: window.innerHeight });

// ---------- pan ----------
const panX = ref(0);
const panY = ref(0);
let internalX = 0;
let internalY = 0;
const isDragging = ref(false);
const lastPointer = reactive({ x: 0, y: 0 });
const dragButton = ref(-1);

// ---------- group drag ----------
const isGroupDragging = ref(false);
const draggingGroupId = ref<string | null>(null);
const groupDragOffset = reactive({ x: 0, y: 0 });

// ---------- zoom ----------
const isZoomed = ref(false);
const currentScale = computed(() => (isZoomed.value ? 1.5 : 1));

// ---------- grid ----------
const gridMode = ref<'off' | 'dots' | 'lines'>('off');
const showGrid = computed(() => gridMode.value !== 'off');

function cycleGrid() {
  const modes = ['off', 'dots', 'lines'] as const;
  const i = modes.indexOf(gridMode.value);
  gridMode.value = modes[(i + 1) % modes.length];
}

// ---------- mini-map ----------
const showMiniMap = ref(false);
function toggleMiniMap() { showMiniMap.value = !showMiniMap.value; }

// ---------- selection ----------
const selectedGroupId = ref<string | null>(null);
function selectGroup(id: string) { selectedGroupId.value = id; }

// ---------- modal ----------
const modalVisible = ref(false);
const modalIsGroup = ref(true);
const editingGroup = ref<NavGroupType | null>(null);
const editingTile = ref<AppTile | null>(null);
let modalTargetGroupId: string | null = null;

function openGroupEditor(group?: NavGroupType) {
  modalIsGroup.value = true;
  editingGroup.value = group ?? null;
  editingTile.value = null;
  modalVisible.value = true;
}

function openTileEditor(group: NavGroupType, tile?: AppTile) {
  modalIsGroup.value = false;
  modalTargetGroupId = group.id;
  editingGroup.value = null;
  editingTile.value = tile ?? null;
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
      // 编辑
      updateGroup(editingGroup.value.id, {
        name: data.name,
        description: data.description || '',
        icon: data.icon,
        color: data.color,
      });
    } else {
      // 新建—放在画布中心稍偏移
      const centerOffset = () => ({
        x: -panX.value + (Math.random() - 0.5) * 100,
        y: -panY.value + (Math.random() - 0.5) * 100,
      });
      const pos = centerOffset();
      addGroup({
        name: data.name,
        description: data.description || '',
        position: { x: pos.x, y: pos.y },
        icon: data.icon,
        color: data.color,
      });
    }
  } else {
    if (!modalTargetGroupId) return;
    if (editingTile.value) {
      updateTile(modalTargetGroupId, editingTile.value.id, {
        title: data.title,
        description: data.description,
        url: data.url,
        route: data.route,
        icon: data.icon,
        iconType: data.iconType,
        color: data.color,
        size: data.size,
      });
    } else {
      addTile(modalTargetGroupId, {
        title: data.title,
        description: data.description,
        url: data.url,
        route: data.route,
        icon: data.icon,
        iconType: data.iconType,
        color: data.color,
        size: data.size,
      });
    }
  }
  closeModal();
}

// ---------- canvas style ----------
const canvasStyle = computed(() => {
  let bg = 'none';
  let bgSize = 'auto';
  if (gridMode.value === 'dots') {
    bg = 'radial-gradient(circle, rgba(52,152,219,0.35) 1.5px, transparent 1.5px)';
    bgSize = '40px 40px';
  } else if (gridMode.value === 'lines') {
    bg = `
      linear-gradient(rgba(52,152,219,0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52,152,219,0.15) 1px, transparent 1px)
    `;
    bgSize = '50px 50px';
  }
  return {
    cursor: isDragging.value ? 'grabbing' : 'grab',
    backgroundImage: bg,
    backgroundSize: bgSize as string,
  };
});

// ---------- mouse events ----------
function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0 && e.button !== 2) return;
  if ((e.target as HTMLElement).closest('.nav-group')) return; // 让 NavGroup 自己的拖拽处理
  isDragging.value = true;
  dragButton.value = e.button;
  lastPointer.x = e.clientX;
  lastPointer.y = e.clientY;
  selectedGroupId.value = null;
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const dx = e.clientX - lastPointer.x;
  const dy = e.clientY - lastPointer.y;
  internalX += dx;
  internalY += dy;
  panX.value = internalX;
  panY.value = internalY;
  lastPointer.x = e.clientX;
  lastPointer.y = e.clientY;
}

function handleMouseUp() {
  isDragging.value = false;
  isGroupDragging.value = false;
  draggingGroupId.value = null;
  dragButton.value = -1;
}

// ---------- group drag ----------
function handleGroupDragStart(group: NavGroupType, e: MouseEvent) {
  isGroupDragging.value = true;
  draggingGroupId.value = group.id;
  // 记录鼠标相对于分组位置的距离
  groupDragOffset.x = e.clientX;
  groupDragOffset.y = e.clientY;
  selectedGroupId.value = group.id;

  const onMove = (ev: MouseEvent) => {
    if (!isGroupDragging.value || !draggingGroupId.value) return;
    // 转换屏幕位移 → 世界坐标位移
    const dx = (ev.clientX - groupDragOffset.x) / currentScale.value;
    const dy = (ev.clientY - groupDragOffset.y) / currentScale.value;
    groupDragOffset.x = ev.clientX;
    groupDragOffset.y = ev.clientY;
    const g = config.groups.find((gg) => gg.id === draggingGroupId.value);
    if (g) {
      g.position.x += dx;
      g.position.y += dy;
    }
  };
  const onUp = () => {
    isGroupDragging.value = false;
    draggingGroupId.value = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ---------- touch events ----------
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1) return;
  if ((e.target as HTMLElement).closest('.nav-group')) return;
  isDragging.value = true;
  const t = e.touches[0];
  lastPointer.x = t.clientX;
  lastPointer.y = t.clientY;
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length !== 1) return;
  const t = e.touches[0];
  internalX += t.clientX - lastPointer.x;
  internalY += t.clientY - lastPointer.y;
  panX.value = internalX;
  panY.value = internalY;
  lastPointer.x = t.clientX;
  lastPointer.y = t.clientY;
}

function handleTouchEnd() {
  isDragging.value = false;
}

// ---------- wheel ----------
function handleWheel(e: WheelEvent) {
  internalX -= e.deltaX * 0.5;
  internalY -= e.deltaY * 0.5;
  panX.value = internalX;
  panY.value = internalY;
}

// ---------- context menu ----------
function handleContextMenu(e: MouseEvent) {
  // 点击空白处：可以有添加分组快捷菜单
  if (!(e.target as HTMLElement).closest('.nav-group')) {
    openGroupEditor();
  }
}

// ---------- navigation ----------
function resetView() {
  animatePan(0, 0);
}

function navigateToPosition(x: number, y: number) {
  animatePan(-x, -y);
}

function animatePan(targetX: number, targetY: number) {
  const startX = internalX;
  const startY = internalY;
  const duration = 400;
  const t0 = performance.now();
  function frame(t: number) {
    const p = Math.min((t - t0) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    internalX = startX + (targetX - startX) * ease;
    internalY = startY + (targetY - startY) * ease;
    panX.value = internalX;
    panY.value = internalY;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---------- zoom ----------
function toggleZoom() {
  isZoomed.value = !isZoomed.value;
}

// ---------- import / export ----------
function triggerImport() {
  fileInputRef.value?.click();
}

function handleFileImport(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  loadFromFile(file).then((ok) => {
    if (!ok) alert('配置文件格式无效');
    input.value = ''; // 重置
  });
}

// ---------- keyboard ----------
function handleKeyDown(e: KeyboardEvent) {
  const step = isZoomed.value ? 30 : 50;
  switch (e.key) {
    case 'ArrowLeft': internalX += step; panX.value = internalX; e.preventDefault(); break;
    case 'ArrowRight': internalX -= step; panX.value = internalX; e.preventDefault(); break;
    case 'ArrowUp': internalY += step; panY.value = internalY; e.preventDefault(); break;
    case 'ArrowDown': internalY -= step; panY.value = internalY; e.preventDefault(); break;
    case 'Home': resetView(); e.preventDefault(); break;
    case 'Escape': closeModal(); selectedGroupId.value = null; break;
    case 'Delete':
    case 'Backspace':
      if (selectedGroupId.value && !modalVisible.value) {
        removeGroup(selectedGroupId.value);
        selectedGroupId.value = null;
      }
      break;
  }
}

// ---------- resize ----------
function updateViewport() {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
}

// ---------- lifecycle ----------
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', updateViewport);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', updateViewport);
});

defineOptions({ name: 'InfiniteNavView' });
</script>

<style scoped>
.infinite-nav-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
  user-select: none;
}

/* ---- 画布 ---- */
.infinite-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  backface-visibility: hidden;
}

/* ---- 浮动 UI ---- */
.floating-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 10;
}

/* ---- 信息面板 ---- */
.info-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  backdrop-filter: blur(8px);
  pointer-events: auto;
  line-height: 1.5;
}

.coord { font-weight: 600; }
.coord.small { opacity: 0.7; font-size: 0.72rem; }

.status .dragging { color: #ef4444; font-weight: 600; }
.status .idle { color: #10b981; font-weight: 600; }

/* ---- 工具栏 ---- */
.toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: auto;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: #2c3e50;
  transition: all 0.15s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-family: inherit;
}

.tool-btn:hover {
  background: white;
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10);
}

.tool-btn.active {
  background: rgba(52, 152, 219, 0.9);
  color: white;
}

.tool-btn i {
  width: 16px;
  text-align: center;
  font-size: 0.85rem;
}

.tool-btn span {
  white-space: nowrap;
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .info-panel {
    font-size: 0.7rem;
    padding: 8px 10px;
  }

  .toolbar {
    top: auto;
    bottom: 16px;
    right: 16px;
    flex-direction: column;
  }

  .tool-btn {
    padding: 6px 10px;
    font-size: 0.75rem;
  }

  .tool-btn span {
    display: none;
  }
}
</style>

import { ref, watch, readonly, type Ref } from 'vue';
import {
  type NavConfig,
  type NavGroup,
  type AppTile,
  type TileSize,
  generateId,
  createEmptyConfig,
  createDefaultConfig,
} from '@/types/nav-config';

const STORAGE_KEY = 'infinite-nav-config';

/** 从 localStorage 读取配置 */
function loadConfig(): NavConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NavConfig;
  } catch {
    return null;
  }
}

/** 写入 localStorage */
function saveConfig(config: NavConfig): void {
  config.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** 下载 JSON 文件 */
function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- composable ----------

export function useNavConfig() {
  const config: Ref<NavConfig> = ref(loadConfig() ?? createDefaultConfig());

  // 自动保存到 localStorage
  watch(config, (val) => saveConfig(val), { deep: true });

  // -------- 分组 CRUD --------

  function addGroup(group: Omit<NavGroup, 'id' | 'tiles'>): NavGroup {
    const newGroup: NavGroup = { ...group, id: generateId(), tiles: [] };
    config.value.groups.push(newGroup);
    return newGroup;
  }

  function updateGroup(id: string, patch: Partial<Omit<NavGroup, 'id' | 'tiles'>>): void {
    const group = config.value.groups.find((g) => g.id === id);
    if (group) Object.assign(group, patch);
  }

  function removeGroup(id: string): void {
    config.value.groups = config.value.groups.filter((g) => g.id !== id);
  }

  /** 重新排序分组 */
  function reorderGroups(fromIndex: number, toIndex: number): void {
    const groups = config.value.groups;
    const [moved] = groups.splice(fromIndex, 1);
    groups.splice(toIndex, 0, moved);
  }

  // -------- 磁贴 CRUD --------

  function addTile(groupId: string, tile: Omit<AppTile, 'id'>): AppTile | null {
    const group = config.value.groups.find((g) => g.id === groupId);
    if (!group) return null;
    const newTile: AppTile = { ...tile, id: generateId() };
    group.tiles.push(newTile);
    return newTile;
  }

  function updateTile(groupId: string, tileId: string, patch: Partial<Omit<AppTile, 'id'>>): void {
    const group = config.value.groups.find((g) => g.id === groupId);
    if (!group) return;
    const tile = group.tiles.find((t) => t.id === tileId);
    if (tile) Object.assign(tile, patch);
  }

  function removeTile(groupId: string, tileId: string): void {
    const group = config.value.groups.find((g) => g.id === groupId);
    if (group) group.tiles = group.tiles.filter((t) => t.id !== tileId);
  }

  /** 在分组内移动磁贴 */
  function moveTile(groupId: string, fromIndex: number, toIndex: number): void {
    const group = config.value.groups.find((g) => g.id === groupId);
    if (!group) return;
    const [moved] = group.tiles.splice(fromIndex, 1);
    group.tiles.splice(toIndex, 0, moved);
  }

  // -------- 导入 / 导出 / 重置 --------

  function exportConfig(): void {
    downloadJson(config.value, `nav-config-${new Date().toISOString().slice(0, 10)}.json`);
  }

  function importConfig(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as NavConfig;
      if (!Array.isArray(parsed.groups)) return false;
      config.value = parsed;
      return true;
    } catch {
      return false;
    }
  }

  function resetToDefault(): void {
    config.value = createDefaultConfig();
  }

  /** 检查并加载本地文件（从 <input type="file"> 读取） */
  function loadFromFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const ok = importConfig(reader.result as string);
        resolve(ok);
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }

  return {
    config: readonly(config) as Ref<NavConfig>,

    // groups
    addGroup,
    updateGroup,
    removeGroup,
    reorderGroups,

    // tiles
    addTile,
    updateTile,
    removeTile,
    moveTile,

    // io
    exportConfig,
    importConfig,
    loadFromFile,
    resetToDefault,
  };
}

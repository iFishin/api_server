<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>{{ isGroup ? (editing ? '编辑分组' : '新建分组') : (editing ? '编辑应用' : '添加应用') }}</h3>
          <button class="modal-close" @click="$emit('close')"><i class="fas fa-times"></i></button>
        </div>

        <div class="modal-body">
          <!-- 分组表单 -->
          <template v-if="isGroup">
            <label>
              <span>名称</span>
              <input v-model="form.name" type="text" placeholder="分组名称" maxlength="20" />
            </label>
            <label>
              <span>描述</span>
              <input v-model="form.description" type="text" placeholder="简短描述（可选）" maxlength="50" />
            </label>
            <label>
              <span>图标（FontAwesome class）</span>
              <input v-model="form.icon" type="text" placeholder="fas fa-folder" />
            </label>
            <label>
              <span>主题色</span>
              <div class="color-row">
                <input v-model="form.color" type="color" class="color-picker" />
                <input v-model="form.color" type="text" placeholder="#3498db" class="color-text" />
              </div>
            </label>
          </template>

          <!-- 磁贴表单 -->
          <template v-else>
            <label>
              <span>标题</span>
              <input v-model="form.title" type="text" placeholder="应用名称" maxlength="30" />
            </label>
            <label>
              <span>描述</span>
              <input v-model="form.description" type="text" placeholder="简短描述（可选）" maxlength="60" />
            </label>
            <label>
              <span>外部链接 URL</span>
              <input v-model="form.url" type="text" placeholder="https://example.com 或 /internal-path" />
            </label>
            <label class="checkbox-label">
              <input v-model="useRoute" type="checkbox" />
              <span>使用内部路由（代替外部URL）</span>
            </label>
            <label v-if="useRoute">
              <span>内部路由路径</span>
              <input v-model="form.route" type="text" placeholder="/http-api" />
            </label>
            <label>
              <span>图标</span>
              <div class="icon-row">
                <select v-model="form.iconType" class="icon-type-select">
                  <option value="fontawesome">FontAwesome</option>
                  <option value="image">图片 URL</option>
                </select>
                <input
                  v-model="form.icon"
                  type="text"
                  :placeholder="form.iconType === 'fontawesome' ? 'fas fa-globe' : 'https://...'"
                />
              </div>
            </label>
            <label>
              <span>主题色</span>
              <div class="color-row">
                <input v-model="form.color" type="color" class="color-picker" />
                <input v-model="form.color" type="text" placeholder="#3498db" class="color-text" />
              </div>
            </label>
            <label>
              <span>尺寸</span>
              <div class="size-options">
                <button
                  v-for="s in sizeOptions"
                  :key="s.value"
                  class="size-btn"
                  :class="{ active: form.size === s.value }"
                  @click="form.size = s.value"
                >
                  <i :class="s.icon"></i>
                  <span>{{ s.label }}</span>
                </button>
              </div>
            </label>
          </template>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn btn-primary" :disabled="!canSave" @click="handleSave">
            <i class="fas fa-check"></i>
            {{ editing ? '保存修改' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import type { NavGroup, AppTile, TileSize, TileIconType } from '@/types/nav-config';

interface Props {
  visible: boolean;
  isGroup: boolean;
  /** 编辑模式：传入已有数据 */
  editGroup?: NavGroup | null;
  editTile?: AppTile | null;
}

const props = withDefaults(defineProps<Props>(), { isGroup: false });

const emit = defineEmits<{
  close: [];
  save: [data: Record<string, any>];
}>();

const useRoute = ref(false);
const sizeOptions = [
  { value: 'small' as TileSize, label: '小', icon: 'fas fa-square' },
  { value: 'medium' as TileSize, label: '中', icon: 'fas fa-stop' },
  { value: 'large' as TileSize, label: '大', icon: 'fas fa-arrows-alt-h' },
];

const defaultGroupForm = () => ({
  name: '',
  description: '',
  icon: 'fas fa-folder',
  color: '#3498db',
});

const defaultTileForm = () => ({
  title: '',
  description: '',
  url: '',
  route: '',
  icon: 'fas fa-globe',
  iconType: 'fontawesome' as TileIconType,
  color: '#3498db',
  size: 'medium' as TileSize,
});

const form = reactive<Record<string, any>>({ ...defaultGroupForm() });

// 重置表单
watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    useRoute.value = false;
    if (props.isGroup && props.editGroup) {
      Object.assign(form, { name: props.editGroup.name, description: props.editGroup.description || '', icon: props.editGroup.icon, color: props.editGroup.color });
    } else if (!props.isGroup && props.editTile) {
      Object.assign(form, { title: props.editTile.title, description: props.editTile.description || '', url: props.editTile.url || '', route: props.editTile.route || '', icon: props.editTile.icon, iconType: props.editTile.iconType, color: props.editTile.color, size: props.editTile.size });
      if (props.editTile.route) useRoute.value = true;
    } else {
      Object.assign(form, props.isGroup ? defaultGroupForm() : defaultTileForm());
    }
  },
);

const editing = computed(() => props.isGroup ? !!props.editGroup : !!props.editTile);

const canSave = computed(() => {
  if (props.isGroup) return form.name.trim().length > 0;
  return form.title.trim().length > 0;
});

function handleSave() {
  if (!canSave.value) return;
  emit('save', { ...form });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-panel {
  background: white;
  border-radius: 16px;
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #2c3e50;
}

.modal-close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  transition: background 0.15s ease, color 0.15s ease;
}

.modal-close:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.modal-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label span {
  font-size: 0.78rem;
  font-weight: 600;
  color: #555;
}

input[type="text"],
input[type="url"],
select {
  padding: 8px 10px;
  border: 1px solid #dcdde1;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.15s ease;
  font-family: inherit;
}

input[type="text"]:focus,
input[type="url"]:focus,
select:focus {
  border-color: #3498db;
}

.color-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-picker {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: none;
}

.color-text {
  flex: 1;
}

.icon-row {
  display: flex;
  gap: 8px;
}

.icon-type-select {
  width: 130px;
  flex-shrink: 0;
}

.icon-row input {
  flex: 1;
}

.size-options {
  display: flex;
  gap: 8px;
}

.size-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: 2px solid #dcdde1;
  border-radius: 10px;
  background: none;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.size-btn:hover {
  border-color: #95a5a6;
}

.size-btn.active {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.08);
}

.size-btn i {
  font-size: 1rem;
  color: #2c3e50;
}

.size-btn span {
  font-size: 0.7rem;
  color: #7f8c8d;
}

.checkbox-label {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 18px;
}

.btn {
  padding: 8px 18px;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  font-family: inherit;
}

.btn:active {
  transform: scale(0.97);
}

.btn-cancel {
  background: rgba(0, 0, 0, 0.06);
  color: #555;
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.10);
}

.btn-primary {
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

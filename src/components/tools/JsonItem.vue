<template>
  <div class="json-item-container">
    <!-- 字符串类型 -->
    <div v-if="dataType === 'string'" class="value-editor string-editor">
      <input 
        :value="data" 
        @input="updateValue(($event.target as HTMLInputElement).value)"
        class="value-input"
        placeholder="输入字符串值"
      />
    </div>
    
    <!-- 数字类型 -->
    <div v-else-if="dataType === 'number'" class="value-editor number-editor">
      <input 
        type="number" 
        :value="data" 
        @input="updateValue(Number(($event.target as HTMLInputElement).value))"
        class="value-input"
        placeholder="输入数字"
      />
    </div>
    
    <!-- 布尔类型 -->
    <div v-else-if="dataType === 'boolean'" class="value-editor boolean-editor">
      <label class="checkbox-container">
        <input 
          type="checkbox" 
          :checked="data" 
          @change="updateValue(($event.target as HTMLInputElement).checked)"
          class="checkbox-input"
        />
        <span class="checkbox-label">{{ data ? 'True' : 'False' }}</span>
      </label>
    </div>
    
    <!-- Null类型 -->
    <div v-else-if="dataType === 'null'" class="value-editor null-editor">
      <span class="null-value">null</span>
      <select @change="changeType($event)" class="type-selector">
        <option value="null">Null</option>
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="object">Object</option>
        <option value="array">Array</option>
      </select>
    </div>
    
    <!-- 对象类型 -->
    <div v-else-if="dataType === 'object'" class="value-editor object-editor">
      <div class="object-header">
        <span class="object-label">对象 ({{ Object.keys(data).length }} 个属性)</span>
        <div class="object-actions">
          <button @click="addProperty" class="btn-small">
            <i class="fas fa-plus"></i> 添加属性
          </button>
          <button @click="toggleCollapsed" class="btn-small">
            <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-down'"></i>
          </button>
        </div>
      </div>
      
      <div v-if="!collapsed" class="object-content">
        <div 
          v-for="(value, key) in data" 
          :key="String(key)"
          class="property-item"
        >
          <div class="property-header">
            <input 
              :value="String(key)" 
              @blur="renameProperty(String(key), ($event.target as HTMLInputElement)?.value || '')"
              class="property-key"
              placeholder="属性名"
            />
            <span class="property-type" :class="getTypeClass(value)">
              {{ getDataType(value) }}
            </span>
            <button @click="deleteProperty(String(key))" class="btn-icon delete">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="property-value">
            <json-item 
              :data="value" 
              :path="[...path, String(key)]"
              @update="(newPath, newValue) => $emit('update', newPath, newValue)"
              @delete="(newPath) => $emit('delete', newPath)"
              @add="(newPath, type) => $emit('add', newPath, type)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数组类型 -->
    <div v-else-if="dataType === 'array'" class="value-editor array-editor">
      <div class="array-header">
        <span class="array-label">数组 ({{ data.length }} 个元素)</span>
        <div class="array-actions">
          <select @change="addArrayItem($event)" class="type-selector small">
            <option value="">添加元素...</option>
            <option value="string">字符串</option>
            <option value="number">数字</option>
            <option value="boolean">布尔值</option>
            <option value="object">对象</option>
            <option value="array">数组</option>
          </select>
          <button @click="toggleCollapsed" class="btn-small">
            <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-down'"></i>
          </button>
        </div>
      </div>
      
      <div v-if="!collapsed" class="array-content">
        <div 
          v-for="(item, index) in data" 
          :key="index"
          class="array-item"
        >
          <div class="array-item-header">
            <span class="array-index">[{{ index }}]</span>
            <span class="item-type" :class="getTypeClass(item)">
              {{ getDataType(item) }}
            </span>
            <button @click="deleteArrayItem(index)" class="btn-icon delete">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="array-item-value">
            <json-item 
              :data="item" 
              :path="[...path, index.toString()]"
              @update="(newPath, newValue) => $emit('update', newPath, newValue)"
              @delete="(newPath) => $emit('delete', newPath)"
              @add="(newPath, type) => $emit('add', newPath, type)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  data: any;
  path: (string | number)[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [path: (string | number)[], value: any];
  delete: [path: (string | number)[]];
  add: [path: (string | number)[], type: string];
}>();

const collapsed = ref(false);

const dataType = computed(() => {
  if (props.data === null) return 'null';
  if (Array.isArray(props.data)) return 'array';
  return typeof props.data;
});

const updateValue = (value: any) => {
  emit('update', props.path, value);
};

const changeType = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newType = target.value;
  let newValue: any;
  
  switch (newType) {
    case 'string':
      newValue = '';
      break;
    case 'number':
      newValue = 0;
      break;
    case 'boolean':
      newValue = false;
      break;
    case 'object':
      newValue = {};
      break;
    case 'array':
      newValue = [];
      break;
    default:
      newValue = null;
  }
  
  emit('update', props.path, newValue);
};

const addProperty = () => {
  const newKey = `newProperty${Object.keys(props.data).length + 1}`;
  const newData = { ...props.data };
  newData[newKey] = '';
  emit('update', props.path, newData);
};

const renameProperty = (oldKey: string, newKey: string) => {
  if (oldKey === newKey || !newKey) return;
  
  const newData = { ...props.data };
  newData[newKey] = newData[oldKey];
  delete newData[oldKey];
  emit('update', props.path, newData);
};

const deleteProperty = (key: string) => {
  if (confirm(`确定要删除属性 "${key}" 吗？`)) {
    const newData = { ...props.data };
    delete newData[key];
    emit('update', props.path, newData);
  }
};

const addArrayItem = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const type = target.value;
  if (!type) return;
  
  let newValue: any;
  switch (type) {
    case 'string':
      newValue = '';
      break;
    case 'number':
      newValue = 0;
      break;
    case 'boolean':
      newValue = false;
      break;
    case 'object':
      newValue = {};
      break;
    case 'array':
      newValue = [];
      break;
  }
  
  const newArray = [...props.data, newValue];
  emit('update', props.path, newArray);
  target.value = '';
};

const deleteArrayItem = (index: number) => {
  if (confirm(`确定要删除第 ${index + 1} 个元素吗？`)) {
    const newArray = [...props.data];
    newArray.splice(index, 1);
    emit('update', props.path, newArray);
  }
};

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};

const getDataType = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const getTypeClass = (value: any): string => {
  const type = getDataType(value);
  return `type-${type}`;
};
</script>

<style scoped>
.json-item-container {
  padding: 0.5rem;
}

.value-editor {
  margin-bottom: 0.5rem;
}

.value-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
}

.value-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.boolean-editor {
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  font-weight: 500;
  color: #374151;
}

.null-editor {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.null-value {
  color: #9ca3af;
  font-style: italic;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.type-selector {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.75rem;
}

.type-selector.small {
  font-size: 0.7rem;
}

.object-editor,
.array-editor {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.object-header,
.array-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.object-label,
.array-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.object-actions,
.array-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.object-content,
.array-content {
  padding: 0.5rem;
}

.property-item,
.array-item {
  margin-bottom: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.property-header,
.array-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.property-key {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
}

.property-type,
.item-type {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.array-index {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 500;
  color: #6b7280;
}

.property-value,
.array-item-value {
  padding: 0.5rem;
  background: white;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon.delete {
  background: #fef2f2;
  color: #dc2626;
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

/* 类型样式 */
.type-string { background: #dbeafe; color: #1d4ed8; }
.type-number { background: #dcfce7; color: #166534; }
.type-boolean { background: #fef3c7; color: #92400e; }
.type-object { background: #f3e8ff; color: #7c3aed; }
.type-array { background: #fce7f3; color: #be185d; }
.type-null { background: #f1f5f9; color: #475569; }
</style>

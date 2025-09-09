<template>
  <div class="enhanced-value-editor">
    <!-- 简单值编辑器（字符串、数字、布尔值） -->
    <div v-if="dataType === 'string' || dataType === 'number' || dataType === 'boolean'" class="editor simple-value-editor">
      <div class="value-row-inline">
        <div class="value-inline-field">
          <span class="value-inline-label">类型</span>
          <span class="type-badge" :class="getTypeClass(data)">
            {{ dataType.toUpperCase() }}
          </span>
        </div>
        <div class="value-inline-field value-content">
          <span class="value-inline-label">值</span>
          <!-- 字符串输入 -->
          <textarea 
            v-if="dataType === 'string'"
            :value="data" 
            @input="updateValue(($event.target as HTMLTextAreaElement).value)"
            class="inline-textarea"
            placeholder="输入字符串值"
            rows="2"
          />
          <!-- 数字输入 -->
          <input 
            v-else-if="dataType === 'number'"
            type="number" 
            :value="data" 
            @input="updateValue(Number(($event.target as HTMLInputElement).value))"
            class="inline-number-input"
            placeholder="输入数字"
            step="any"
          />
          <!-- 布尔值选择 -->
          <div v-else-if="dataType === 'boolean'" class="inline-boolean-toggle">
            <label class="inline-toggle-option" :class="{ active: data === true }">
              <input 
                type="radio" 
                :checked="data === true" 
                @change="updateValue(true)"
              />
              <span class="inline-toggle-label true">True</span>
            </label>
            <label class="inline-toggle-option" :class="{ active: data === false }">
              <input 
                type="radio" 
                :checked="data === false" 
                @change="updateValue(false)"
              />
              <span class="inline-toggle-label false">False</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 对象编辑器 -->
    <div v-else-if="dataType === 'object'" class="editor object-editor">
      <div class="object-summary">
        <span class="summary-text">对象包含 {{ Object.keys(data).length }} 个属性</span>
        <button @click="addProperty" class="btn-add-property">
          <i class="fas fa-plus"></i> 添加属性
        </button>
      </div>
      
      <div class="object-properties">
        <div 
          v-for="(value, key) in data" 
          :key="String(key)"
          class="property-row-inline"
        >
          <div class="property-inline-field">
            <span class="property-inline-label">键名</span>
            <input 
              :value="String(key)" 
              @blur="renameProperty(String(key), ($event.target as HTMLInputElement)?.value || '')"
              class="property-key-inline"
              placeholder="属性名"
            />
          </div>
          <div class="property-inline-field">
            <span class="property-inline-label">类型</span>
            <select 
              :value="getDataType(value)"
              @change="changePropertyType(String(key), ($event.target as HTMLSelectElement).value)"
              class="property-type-select"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="object">Object</option>
              <option value="array">Array</option>
              <option value="null">Null</option>
            </select>
          </div>
          <div class="property-inline-field" v-if="!isComplexType(value)">
            <span class="property-inline-label">值</span>
            <compact-value-input 
              :value="value"
              :type="getDataType(value)"
              @update="(newValue) => updatePropertyValue(String(key), newValue)"
              class="property-value-inline"
            />
          </div>
          <button @click="deleteProperty(String(key))" class="btn-delete-property-inline">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        
        <!-- 复杂类型的详细编辑（展开在下方） -->
        <template 
          v-for="(val, key) in data" 
          :key="`${String(key)}-detail`"
        >
          <div 
            v-if="getDataType(val) === 'object' || getDataType(val) === 'array'"
            class="property-detail"
          >
            <div class="property-detail-header">
              <span class="property-detail-title">{{ String(key) }} 详细编辑</span>
            </div>
            <enhanced-value-editor 
              :data="val" 
              :path="[...path, String(key)]"
              @update="(newPath, newValue) => $emit('update', newPath, newValue)"
            />
          </div>
        </template>
      </div>
    </div>
    
    <!-- 数组编辑器 -->
    <div v-else-if="dataType === 'array'" class="editor array-editor">
      <div class="array-summary">
        <span class="summary-text">数组包含 {{ data.length }} 个元素</span>
        <select @change="addArrayItem($event)" class="array-add-select">
          <option value="">添加元素...</option>
          <option value="string">字符串</option>
          <option value="number">数字</option>
          <option value="boolean">布尔值</option>
          <option value="object">对象</option>
          <option value="array">数组</option>
        </select>
      </div>
      
      <div class="array-items">
        <div 
          v-for="(item, index) in data" 
          :key="index"
          class="array-item-row-inline"
        >
          <div class="array-inline-field">
            <span class="array-inline-label">索引</span>
            <span class="array-index-compact">[{{ index }}]</span>
          </div>
          <div class="array-inline-field">
            <span class="array-inline-label">类型</span>
            <span class="type-badge small" :class="getTypeClass(item)">
              {{ getDataType(item).toUpperCase() }}
            </span>
          </div>
          <div class="array-inline-field array-value-field" v-if="!isComplexType(item)">
            <span class="array-inline-label">值</span>
            <compact-value-input 
              :value="item"
              :type="getDataType(item)"
              @update="(newValue) => updateArrayItem(index, newValue)"
              class="array-value-inline"
            />
          </div>
          <button @click="deleteArrayItem(index)" class="btn-delete-array-inline">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        
        <!-- 复杂类型的详细编辑（展开在下方） -->
        <template 
          v-for="(item, index) in data" 
          :key="`${index}-detail`"
        >
          <div 
            v-if="isComplexType(item)"
            class="array-item-detail"
          >
            <div class="array-detail-header">
              <span class="array-detail-title">[{{ index }}] {{ getDataType(item).toUpperCase() }} 详细编辑</span>
            </div>
            <enhanced-value-editor 
              :data="item" 
              :path="[...path, index.toString()]"
              @update="(newPath, newValue) => $emit('update', newPath, newValue)"
            />
          </div>
        </template>
      </div>
    </div>
    
    <!-- 空值编辑器 -->
    <div v-else class="editor null-editor">
      <div class="value-row-inline">
        <div class="value-inline-field">
          <span class="value-inline-label">类型</span>
          <span class="type-badge type-null">NULL</span>
        </div>
        <div class="value-inline-field">
          <span class="value-inline-label">值</span>
          <span class="null-value-inline">null</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CompactValueInput from './CompactValueInput.vue';

interface Props {
  data: any;
  path: (string | number)[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [path: (string | number)[], value: any];
}>();

const dataType = computed(() => {
  if (props.data === null) return 'null';
  if (Array.isArray(props.data)) return 'array';
  return typeof props.data;
});

const updateValue = (value: any) => {
  emit('update', props.path, value);
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

const updateArrayItem = (index: number, newValue: any) => {
  const newArray = [...props.data];
  newArray[index] = newValue;
  emit('update', props.path, newArray);
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

// 新增的方法
const isComplexType = (value: any): boolean => {
  const type = getDataType(value);
  return type === 'object' || type === 'array';
};

const changePropertyType = (key: string, newType: string) => {
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
  
  const newData = { ...props.data };
  newData[key] = newValue;
  emit('update', props.path, newData);
};

const updatePropertyValue = (key: string, newValue: any) => {
  const newData = { ...props.data };
  newData[key] = newValue;
  emit('update', props.path, newData);
};
</script>

<style scoped>
.enhanced-value-editor {
  width: 100%;
}

.editor {
  width: 100%;
}

/* 简单值编辑器的一行布局 */
.simple-value-editor .value-row-inline {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.value-inline-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.value-inline-field:first-child {
  flex: 0 0 auto;
  min-width: 80px;
}

.value-inline-field.value-content {
  flex: 1;
  min-width: 200px;
  align-items: flex-start;
}

.value-inline-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  min-width: 30px;
}

.inline-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 60px;
  line-height: 1.4;
}

.inline-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.inline-number-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
}

.inline-number-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.inline-boolean-toggle {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow: hidden;
  min-width: 120px;
}

.inline-toggle-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
  font-size: 0.875rem;
}

.inline-toggle-option input {
  display: none;
}

.inline-toggle-option.active {
  background: #3b82f6;
  color: white;
}

.inline-toggle-label.true {
  color: #10b981;
  font-weight: 600;
}

.inline-toggle-label.false {
  color: #ef4444;
  font-weight: 600;
}

.inline-toggle-option.active .inline-toggle-label {
  color: white;
}

/* 数组编辑器的一行布局 */
.array-item-row-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.array-inline-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.array-inline-field:first-child {
  flex: 0 0 auto;
  min-width: 80px;
}

.array-inline-field:nth-child(2) {
  flex: 0 0 auto;
  min-width: 80px;
}

.array-inline-field.array-value-field {
  flex: 1;
  min-width: 150px;
}

.array-inline-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  min-width: 30px;
}

.array-index-compact {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 600;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  background: #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.array-value-inline {
  width: 100%;
}

.btn-delete-array-inline {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  color: #dc2626;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.btn-delete-array-inline:hover {
  background: #fee2e2;
}

.array-item-detail {
  margin: 0.75rem 0;
  padding: 1rem;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.array-detail-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.array-detail-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Fira Code', 'Consolas', monospace;
}

/* null值的一行布局 */
.null-value-inline {
  color: #9ca3af;
  font-style: italic;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 500;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

/* 类型徽章样式优化 */
.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-badge.small {
  font-size: 0.625rem;
  padding: 0.2rem 0.4rem;
}

/* 字符串编辑器 */
/* 对象编辑器 */
.object-summary,
.array-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.summary-text {
  font-weight: 500;
  color: #374151;
}

.btn-add-property,
.array-add-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.btn-add-property:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.object-properties,
.array-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 新的一行内布局样式 */
.property-row-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.property-inline-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.property-inline-field:first-child {
  flex: 0 0 auto;
  min-width: 120px;
}

.property-inline-field:nth-child(2) {
  flex: 0 0 auto;
  min-width: 100px;
}

.property-inline-field:nth-child(3) {
  flex: 1;
  min-width: 150px;
}

.property-inline-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  min-width: 30px;
}

.property-key-inline,
.property-type-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s;
  min-width: 0;
  flex: 1;
}

.property-key-inline:focus,
.property-type-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.property-key-inline {
  font-family: 'Fira Code', 'Consolas', monospace;
}

.property-type-select {
  background: white;
  cursor: pointer;
}

.property-value-inline {
  width: 100%;
}

.btn-delete-property-inline {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  color: #dc2626;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.btn-delete-property-inline:hover {
  background: #fee2e2;
}

.property-detail {
  margin: 0.75rem 0;
  padding: 1rem;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.property-detail-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.property-detail-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.property-key-section,
.array-index-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.property-key-input {
  flex: 1;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
}

.array-index {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 600;
  color: #6b7280;
  min-width: 60px;
}

.btn-delete-property,
.btn-delete-item {
  padding: 0.25rem;
  border: none;
  border-radius: 4px;
  background: #fef2f2;
  color: #dc2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  transition: all 0.2s;
}

.btn-delete-property:hover,
.btn-delete-item:hover {
  background: #fee2e2;
}

.property-value-section,
.array-value-section {
  padding: 0.75rem;
  background: white;
}

.property-type,
.item-type {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

/* 空值编辑器 */
/* 类型样式 */
.type-string { background: #dbeafe; color: #1d4ed8; }
.type-number { background: #dcfce7; color: #166534; }
.type-boolean { background: #fef3c7; color: #92400e; }
.type-object { background: #f3e8ff; color: #7c3aed; }
.type-array { background: #fce7f3; color: #be185d; }
.type-null { background: #f1f5f9; color: #475569; }

/* 响应式布局 */
@media (max-width: 1024px) {
  .property-row-inline,
  .array-item-row-inline,
  .value-row-inline {
    flex-direction: column;
    align-items: stretch;
  }
  
  .property-inline-field,
  .array-inline-field,
  .value-inline-field {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .property-inline-field:first-child,
  .property-inline-field:nth-child(2),
  .property-inline-field:nth-child(3),
  .array-inline-field:first-child,
  .array-inline-field:nth-child(2),
  .array-inline-field.array-value-field,
  .value-inline-field:first-child,
  .value-inline-field.value-content {
    flex: none;
    min-width: auto;
  }
  
  .property-inline-label,
  .array-inline-label,
  .value-inline-label {
    align-self: flex-start;
  }
  
  .btn-delete-property-inline,
  .btn-delete-array-inline {
    align-self: flex-end;
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .property-row-inline,
  .array-item-row-inline,
  .value-row-inline {
    gap: 0.75rem;
    padding: 0.5rem;
  }
  
  .inline-textarea {
    min-height: 40px;
  }
}

@media (max-width: 1024px) {
  .property-row-inline {
    flex-direction: column;
    align-items: stretch;
  }
  
  .property-inline-field {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .property-inline-field:first-child,
  .property-inline-field:nth-child(2),
  .property-inline-field:nth-child(3) {
    flex: none;
    min-width: auto;
  }
  
  .property-inline-label {
    align-self: flex-start;
  }
  
  .btn-delete-property-inline {
    align-self: flex-end;
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .property-row-inline {
    gap: 0.75rem;
    padding: 0.5rem;
  }
}
</style>

<template>
  <div class="json-editor">
    <div class="editor-layout">
      <!-- 左侧文件选择和操作区域 -->
      <div class="file-section">
        <div class="section-header">
          <div class="actions">
            <button @click="loadFile" class="btn btn-primary" title="加载文件 (Ctrl+O)">
              <i class="fas fa-folder-open"></i> 加载文件
            </button>
            <button @click="saveFile" class="btn btn-success" :disabled="!currentFile || !hasChanges" title="保存文件 (Ctrl+S)">
              <i class="fas fa-save"></i> 保存
            </button>
            <button @click="createNewFile" class="btn btn-secondary" title="新建文件 (Ctrl+N)">
              <i class="fas fa-plus"></i> 新建
            </button>
          </div>
        </div>
        
        <div class="file-info" v-if="currentFile">
          <div class="file-path">
            <i class="fas fa-file-code"></i>
            <span>{{ currentFile }}</span>
          </div>
          <div class="file-status" :class="{ 'has-changes': hasChanges }">
            <i :class="hasChanges ? 'fas fa-circle' : 'fas fa-check-circle'"></i>
            <span>{{ hasChanges ? '有未保存的更改' : '已保存' }}</span>
          </div>
        </div>

        <!-- 结构概览 -->
        <div class="structure-overview" v-if="jsonData">
          <h4>结构概览</h4>
          <div class="structure-tree">
            <div 
              v-for="(key, index) in sortableKeys" 
              :key="key" 
              class="tree-item-container"
            >
              <!-- 主要键项 -->
              <div 
                class="tree-item" 
                :class="{ 'selected': selectedKey === key && selectedPath.length <= 1 }"
                @click="selectKey(key)"
                draggable="true"
                @dragstart="onDragStart(key, $event)"
                @dragover="onDragOver(key, $event)"
                @dragleave="onDragLeave"
                @drop="onDrop(key, $event)"
                @dragend="onDragEnd"
              >
                <div class="drag-handle">
                  <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="tree-content">
                  <i class="fas fa-chevron-right tree-icon" :class="{ 'expanded': expandedKeys.has(key) }" @click.stop="toggleExpand(key)"></i>
                  <span class="key-name">{{ key }}</span>
                  <span class="type-badge" :class="getTypeClass(jsonData[key])">
                    {{ getDataType(jsonData[key]) }}
                    <span v-if="getDataType(jsonData[key]) === 'object' && getObjectFirstProperty(jsonData[key])" class="first-property">
                      · {{ getObjectFirstProperty(jsonData[key]) }}
                    </span>
                  </span>
                  <span v-if="getDataType(jsonData[key]) === 'array'" class="item-count">[{{ jsonData[key].length }}]</span>
                  <span v-else-if="getDataType(jsonData[key]) === 'object'" class="item-count">{{ '{' + Object.keys(jsonData[key]).length + '}' }}</span>
                </div>
                <div class="tree-actions">
                  <button @click.stop="duplicateKey(key)" class="btn-tree-action" title="复制">
                    <i class="fas fa-copy"></i>
                  </button>
                  <button @click.stop="deleteItem(key)" class="btn-tree-action delete" title="删除">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <!-- 展开的子结构 - 放在主项下方 -->
              <div v-if="expandedKeys.has(key)" class="tree-children">
                <!-- 对象子项 -->
                <div v-if="getDataType(jsonData[key]) === 'object'" class="child-section">
                  <div class="child-header">
                    <span class="child-label">对象属性</span>
                    <button @click="addObjectProperty(key)" class="btn-add-child">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <div class="child-list">
                    <div 
                      v-for="(childKey, childIndex) in Object.keys(jsonData[key])" 
                      :key="childKey" 
                      class="child-item"
                      :class="{ 'selected': isPathSelected([key, childKey]) }"
                      draggable="true"
                      @dragstart="onChildDragStart(key, childKey, $event)"
                      @dragover="onChildDragOver(key, childKey, $event)"
                      @drop="onChildDrop(key, childKey, $event)"
                      @click="selectNestedKey([key, childKey])"
                    >
                      <div class="child-drag-handle">
                        <i class="fas fa-grip-lines"></i>
                      </div>
                      <div class="child-content">
                        <i class="fas fa-key child-icon"></i>
                        <span class="child-key">{{ childKey }}</span>
                        <span class="type-badge small" :class="getTypeClass(jsonData[key][childKey])">
                          {{ getDataType(jsonData[key][childKey]) }}
                          <span v-if="getDataType(jsonData[key][childKey]) === 'object' && getObjectFirstProperty(jsonData[key][childKey])" class="first-property">
                            · {{ getObjectFirstProperty(jsonData[key][childKey]) }}
                          </span>
                        </span>
                        <span class="child-preview">{{ getItemPreview(jsonData[key][childKey]) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 数组子项 -->
                <div v-else-if="getDataType(jsonData[key]) === 'array'" class="child-section">
                  <div class="child-header">
                    <span class="child-label">数组元素</span>
                    <div class="child-controls">
                      <select @change="addArrayElement(key, $event)" class="add-element-select">
                        <option value="">添加元素...</option>
                        <option value="string">字符串</option>
                        <option value="number">数字</option>
                        <option value="boolean">布尔</option>
                        <option value="object">对象</option>
                        <option value="array">数组</option>
                      </select>
                    </div>
                  </div>
                  <div class="child-list">
                    <div 
                      v-for="(item, itemIndex) in jsonData[key]" 
                      :key="`${key}-${itemIndex}`" 
                      class="child-item"
                      :class="{ 'selected': isPathSelected([key, itemIndex]) }"
                      draggable="true"
                      @dragstart="onArrayItemDragStart(key, itemIndex, $event)"
                      @dragover="onArrayItemDragOver(key, itemIndex, $event)"
                      @drop="onArrayItemDrop(key, itemIndex, $event)"
                      @click="selectNestedKey([key, itemIndex])"
                    >
                      <div class="child-drag-handle">
                        <i class="fas fa-grip-lines"></i>
                      </div>
                      <div class="child-content">
                        <i class="fas fa-list-ol child-icon"></i>
                        <span class="child-key">[{{ itemIndex }}]</span>
                        <span class="type-badge small" :class="getTypeClass(item)">
                          {{ getDataType(item) }}
                          <span v-if="getDataType(item) === 'object' && getObjectFirstProperty(item)" class="first-property">
                            · {{ getObjectFirstProperty(item) }}
                          </span>
                        </span>
                        <span class="child-preview">{{ getItemPreview(item) }}</span>
                      </div>
                      <button @click.stop="removeArrayElement(key, itemIndex)" class="btn-remove-child">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧编辑区域 -->
      <div class="editor-section">
        <div class="section-header">
          <h3>数据编辑器</h3>
          <div class="editor-actions">
            <button @click="addNewItem" class="btn btn-outline" title="添加项目">
              <i class="fas fa-plus"></i> 添加项目
            </button>
            <button @click="toggleViewMode" class="btn btn-outline" title="切换视图模式">
              <i :class="viewMode === 'visual' ? 'fas fa-code' : 'fas fa-eye'"></i>
              {{ viewMode === 'visual' ? '代码视图' : '可视化视图' }}
            </button>
            <div class="keyboard-hint">
              <i class="fas fa-keyboard"></i>
              <span class="hint-text">按 Esc 清除选择, Del 删除</span>
            </div>
          </div>
        </div>

        <!-- 可视化编辑器 -->
        <div v-if="viewMode === 'visual'" class="visual-editor">
          <div v-if="!jsonData" class="empty-state">
            <i class="fas fa-file-import"></i>
            <h4>选择或创建JSON文件</h4>
            <p>请加载现有文件或创建新文件开始编辑</p>
          </div>
          
          <div v-else class="json-visual-container">
            <!-- 选中键的简洁编辑 -->
            <div v-if="(selectedKey && jsonData[selectedKey] !== undefined) || selectedPath.length > 1" class="compact-editor">
              <div class="editor-header">
                <div class="breadcrumb">
                  <span v-for="(part, index) in getSelectedPath()" :key="index" class="breadcrumb-item">
                    <span>{{ part }}</span>
                    <i v-if="index < getSelectedPath().length - 1" class="fas fa-chevron-right"></i>
                  </span>
                </div>
                <button @click="clearSelection" class="btn-close-compact">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="editor-content">
                <!-- 键名、类型、值一行 -->
                <div class="editor-row-inline">
                  <div class="inline-field">
                    <span class="inline-label">键名</span>
                    <input 
                      :value="getSelectedKeyName()" 
                      @blur="updateSelectedKey($event)"
                      class="input-inline"
                      placeholder="键名"
                    />
                  </div>
                  <div class="inline-field">
                    <span class="inline-label">类型</span>
                    <select 
                      :value="getDataType(getSelectedValue())"
                      @change="changeSelectedType($event)"
                      class="select-inline"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="object">Object</option>
                      <option value="array">Array</option>
                      <option value="null">Null</option>
                    </select>
                  </div>
                  <div class="inline-field" v-if="!isComplexType(getSelectedValue())">
                    <span class="inline-label">值</span>
                    <compact-value-input 
                      :value="getSelectedValue()"
                      :type="getDataType(getSelectedValue())"
                      @update="updateSelectedValue"
                      class="value-inline"
                    />
                  </div>
                </div>
                
                <!-- 复杂类型的详细编辑 -->
                <div v-if="isComplexType(getSelectedValue())" class="complex-editor">
                  <enhanced-value-editor 
                    :data="getSelectedValue()"
                    :path="getSelectedPath()"
                    @update="updateValue"
                  />
                </div>
              </div>
            </div>
            
            <!-- 无选中时的提示 -->
            <div v-else class="no-selection">
              <i class="fas fa-hand-pointer"></i>
              <h4>选择一个键开始编辑</h4>
              <p>在左侧结构概览中点击任意键名来编辑其内容</p>
            </div>
          </div>
        </div>

        <!-- 代码编辑器 -->
        <div v-else class="code-editor">
          <textarea 
            v-model="jsonText" 
            @input="onTextChange"
            class="json-textarea"
            placeholder="输入JSON数据..."
          ></textarea>
          <div v-if="jsonError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ jsonError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import JsonItem from './JsonItem.vue';
import EnhancedValueEditor from './EnhancedValueEditor.vue';
import CompactValueInput from './CompactValueInput.vue';
import api from '@/utils/api';

// 响应式数据
const currentFile = ref<string>('');
const jsonData = ref<any>(null);
const jsonText = ref<string>('');
const jsonError = ref<string>('');
const hasChanges = ref<boolean>(false);
const viewMode = ref<'visual' | 'code'>('visual');

// 新增的响应式数据
const selectedKey = ref<string>('');
const selectedPath = ref<(string | number)[]>([]);
const expandedKeys = ref<Set<string>>(new Set());

// 子项拖拽状态
const childDraggedItem = ref<{ parentKey: string; childKey: string | number } | null>(null);
const arrayDraggedItem = ref<{ parentKey: string; index: number } | null>(null);

// 排序相关的计算属性
const sortableKeys = computed({
  get: () => jsonData.value ? Object.keys(jsonData.value) : [],
  set: (newOrder: string[]) => {
    if (jsonData.value) {
      const newData: any = {};
      newOrder.forEach(key => {
        if (jsonData.value[key] !== undefined) {
          newData[key] = jsonData.value[key];
        }
      });
      jsonData.value = newData;
      hasChanges.value = true;
    }
  }
});

// 拖拽相关状态
const draggedItem = ref<string | null>(null);
const dragOverItem = ref<string | null>(null);

// 监听数据变化
watch(jsonData, () => {
  if (jsonData.value) {
    jsonText.value = JSON.stringify(jsonData.value, null, 2);
    hasChanges.value = true;
  }
}, { deep: true });

// 方法
const loadFile = async () => {
  try {
    // 如果当前有未保存的更改，提示用户
    if (hasChanges.value && currentFile.value) {
      const shouldContinue = confirm(`当前文件 "${currentFile.value}" 有未保存的更改，确定要加载新文件吗？未保存的更改将丢失。`);
      if (!shouldContinue) return;
    }
    
    // 首先尝试从服务器获取文件列表
    try {
      const response = await api.get('/api/http/files/list?directory=dicts&extension=.json');
      if (response.data.success && response.data.files.length > 0) {
        // 创建文件选择器
        const fileList = response.data.files;
        const selectedFile = await showFileSelector(fileList);
        if (selectedFile) {
          const fileResponse = await api.get(`/api/http/files/read?path=dicts/${selectedFile}`);
          if (fileResponse.data.success) {
            const parsedData = JSON.parse(fileResponse.data.content);
            jsonData.value = parsedData;
            currentFile.value = selectedFile;
            hasChanges.value = false;
            jsonError.value = '';
            
            // 清除选择状态
            selectedKey.value = '';
            selectedPath.value = [];
            expandedKeys.value.clear();
            
            alert(`文件 "${selectedFile}" 加载成功！`);
            return;
          } else {
            throw new Error('读取文件失败');
          }
        }
      }
    } catch (serverError) {
      console.warn('服务器文件加载失败，使用本地文件选择器:', serverError);
    }
    
    // 回退到本地文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const parsedData = JSON.parse(text);
          jsonData.value = parsedData;
          currentFile.value = file.name;
          hasChanges.value = false;
          jsonError.value = '';
          
          // 清除选择状态
          selectedKey.value = '';
          selectedPath.value = [];
          expandedKeys.value.clear();
          
          alert(`文件 "${file.name}" 加载成功！`);
        } catch (error) {
          const errorMsg = '文件格式错误：' + (error as Error).message;
          jsonError.value = errorMsg;
          alert(errorMsg);
        }
      }
    };
    input.click();
  } catch (error) {
    const errorMsg = '加载文件失败：' + (error as Error).message;
    jsonError.value = errorMsg;
    alert(errorMsg);
  }
};

// 改进的文件选择器
const showFileSelector = (files: string[]): Promise<string | null> => {
  return new Promise((resolve) => {
    if (files.length === 0) {
      alert('服务器上没有找到 JSON 文件');
      resolve(null);
      return;
    }
    
    const fileListText = files.map((f, i) => `${i + 1}. ${f}`).join('\n');
    const selection = prompt(
      `服务器上找到以下 JSON 文件:\n\n${fileListText}\n\n请输入文件序号 (1-${files.length}), 或按取消使用本地文件:`,
      '1'
    );
    
    if (selection === null) {
      resolve(null);
      return;
    }
    
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < files.length) {
      resolve(files[index]);
    } else {
      alert(`无效的序号，请输入 1-${files.length} 之间的数字`);
      resolve(null);
    }
  });
};

const saveFile = async () => {
  if (!currentFile.value || !jsonData.value) return;
  
  try {
    // 验证JSON格式
    const jsonString = JSON.stringify(jsonData.value, null, 2);
    
    // 尝试保存到服务器的dicts目录
    const response = await api.post('/api/http/files/save', {
      filename: currentFile.value,
      content: jsonString,
      directory: 'dicts'
    });
    
    if (response.data.success) {
      hasChanges.value = false;
      alert(`文件 "${currentFile.value}" 保存成功！`);
    } else {
      throw new Error(response.data.error || '保存失败');
    }
  } catch (error) {
    // 如果服务器保存失败，则使用浏览器下载
    console.warn('服务器保存失败，使用浏览器下载:', error);
    
    try {
      const jsonString = JSON.stringify(jsonData.value, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFile.value;
      a.click();
      URL.revokeObjectURL(url);
      
      hasChanges.value = false;
      alert(`文件已下载为 "${currentFile.value}"`);
    } catch (downloadError) {
      alert('保存失败: ' + (downloadError as Error).message);
    }
  }
};

const createNewFile = () => {
  // 提示用户输入文件名
  const fileName = prompt('请输入新文件名:', 'new_config.json');
  if (!fileName) return; // 用户取消了
  
  // 确保文件名以.json结尾
  const finalFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  
  // 如果当前有未保存的更改，提示用户
  if (hasChanges.value && currentFile.value) {
    const shouldContinue = confirm(`当前文件 "${currentFile.value}" 有未保存的更改，确定要创建新文件吗？`);
    if (!shouldContinue) return;
  }
  
  jsonData.value = {
    "example_key": "example_value",
    "config": {
      "enabled": true,
      "timeout": 5000
    },
    "items": []
  };
  currentFile.value = finalFileName;
  hasChanges.value = true;
  jsonError.value = '';
  
  // 清除选择状态
  selectedKey.value = '';
  selectedPath.value = [];
  expandedKeys.value.clear();
};

const addNewItem = () => {
  if (!jsonData.value) {
    jsonData.value = {};
  }
  
  // 提示用户输入键名
  const keyName = prompt('请输入新项的键名:', `newItem${Object.keys(jsonData.value).length + 1}`);
  if (!keyName) return;
  
  // 检查键名是否已存在
  if (jsonData.value[keyName] !== undefined) {
    alert(`键名 "${keyName}" 已存在，请使用其他名称`);
    return;
  }
  
  // 提示用户选择类型
  const typeOptions = ['string', 'number', 'boolean', 'object', 'array', 'null'];
  const typeSelection = prompt(`请选择数据类型:\n${typeOptions.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n请输入序号 (1-${typeOptions.length}):`);
  
  if (!typeSelection) return;
  
  const typeIndex = parseInt(typeSelection) - 1;
  if (typeIndex < 0 || typeIndex >= typeOptions.length) {
    alert('无效的类型选择');
    return;
  }
  
  const selectedType = typeOptions[typeIndex];
  
  // 根据类型创建初始值
  let newValue: any;
  switch (selectedType) {
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
    case 'null':
      newValue = null;
      break;
    default:
      newValue = '';
  }
  
  jsonData.value[keyName] = newValue;
  hasChanges.value = true;
  
  // 自动选中新创建的项
  selectedKey.value = keyName;
  selectedPath.value = [keyName];
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'visual' ? 'code' : 'visual';
};

const onTextChange = () => {
  try {
    const parsed = JSON.parse(jsonText.value);
    jsonData.value = parsed;
    jsonError.value = '';
  } catch (error) {
    jsonError.value = 'JSON格式错误：' + (error as Error).message;
  }
};

// 新增的方法
const selectKey = (key: string) => {
  selectedKey.value = key;
};

const clearSelection = () => {
  selectedKey.value = '';
  selectedPath.value = [];
};

const toggleExpand = (key: string) => {
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key);
  } else {
    expandedKeys.value.add(key);
  }
};

const duplicateKey = (key: string) => {
  if (!jsonData.value) return;
  
  // 提示用户输入新键名
  let newKey = `${key}_copy`;
  let counter = 1;
  while (jsonData.value[newKey] !== undefined) {
    newKey = `${key}_copy${counter}`;
    counter++;
  }
  
  const userNewKey = prompt(`复制 "${key}" 为:`, newKey);
  if (!userNewKey) return;
  
  // 检查新键名是否已存在
  if (jsonData.value[userNewKey] !== undefined) {
    alert(`键名 "${userNewKey}" 已存在，请使用其他名称`);
    return;
  }
  
  // 深度复制值
  jsonData.value[userNewKey] = JSON.parse(JSON.stringify(jsonData.value[key]));
  hasChanges.value = true;
  
  // 自动选中新复制的项
  selectedKey.value = userNewKey;
  selectedPath.value = [userNewKey];
};

const selectNestedKey = (path: (string | number)[]) => {
  selectedPath.value = path;
  if (path.length === 1) {
    selectedKey.value = path[0] as string;
  } else {
    selectedKey.value = '';
  }
};

const getItemPreview = (item: any): string => {
  if (typeof item === 'string') {
    return item.length > 20 ? `"${item.substring(0, 20)}..."` : `"${item}"`;
  }
  if (typeof item === 'number') return item.toString();
  if (typeof item === 'boolean') return item.toString();
  if (item === null) return 'null';
  if (Array.isArray(item)) return `[${item.length}]`;
  if (typeof item === 'object') return `{${Object.keys(item).length}}`;
  return '';
};

// 子项拖拽方法
const onChildDragStart = (parentKey: string, childKey: string, event: DragEvent) => {
  childDraggedItem.value = { parentKey, childKey };
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onChildDragOver = (parentKey: string, childKey: string, event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onChildDrop = (parentKey: string, targetChildKey: string, event: DragEvent) => {
  event.preventDefault();
  const draggedData = childDraggedItem.value;
  
  if (draggedData && draggedData.parentKey === parentKey && draggedData.childKey !== targetChildKey && jsonData.value) {
    const parentObj = jsonData.value[parentKey];
    if (parentObj && typeof parentObj === 'object' && !Array.isArray(parentObj)) {
      const keys = Object.keys(parentObj);
      const sourceIndex = keys.indexOf(draggedData.childKey as string);
      const targetIndex = keys.indexOf(targetChildKey);
      
      // 重新排序键
      const newOrder = [...keys];
      newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, draggedData.childKey as string);
      
      // 重建对象
      const newObj: any = {};
      newOrder.forEach(key => {
        newObj[key] = parentObj[key];
      });
      
      jsonData.value[parentKey] = newObj;
      hasChanges.value = true;
    }
  }
  
  childDraggedItem.value = null;
};

// 数组项拖拽方法
const onArrayItemDragStart = (parentKey: string, index: number, event: DragEvent) => {
  arrayDraggedItem.value = { parentKey, index };
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onArrayItemDragOver = (parentKey: string, index: number, event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onArrayItemDrop = (parentKey: string, targetIndex: number, event: DragEvent) => {
  event.preventDefault();
  const draggedData = arrayDraggedItem.value;
  
  if (draggedData && draggedData.parentKey === parentKey && draggedData.index !== targetIndex && jsonData.value) {
    const parentArray = jsonData.value[parentKey];
    if (Array.isArray(parentArray)) {
      const newArray = [...parentArray];
      const draggedItem = newArray.splice(draggedData.index, 1)[0];
      newArray.splice(targetIndex, 0, draggedItem);
      
      jsonData.value[parentKey] = newArray;
      hasChanges.value = true;
    }
  }
  
  arrayDraggedItem.value = null;
};

const updateSelectedKey = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newKey = target.value;
  if (newKey === selectedKey.value || !newKey || !jsonData.value) return;
  
  if (jsonData.value[newKey] !== undefined) {
    alert('该键名已存在');
    target.value = selectedKey.value;
    return;
  }
  
  const value = jsonData.value[selectedKey.value];
  delete jsonData.value[selectedKey.value];
  jsonData.value[newKey] = value;
  selectedKey.value = newKey;
  hasChanges.value = true;
};

const changeSelectedType = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newType = target.value;
  if (!selectedKey.value || !jsonData.value) return;
  
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
  
  jsonData.value[selectedKey.value] = newValue;
  hasChanges.value = true;
};

// 获取选中路径和值的辅助方法
const getSelectedPath = () => {
  if (selectedPath.value.length > 0) {
    return selectedPath.value;
  }
  return selectedKey.value ? [selectedKey.value] : [];
};

const getSelectedValue = () => {
  if (!jsonData.value) return null;
  
  const path = getSelectedPath();
  let value = jsonData.value;
  
  for (const key of path) {
    value = value[key];
  }
  
  return value;
};

const getSelectedKeyName = () => {
  const path = getSelectedPath();
  return path.length > 0 ? String(path[path.length - 1]) : '';
};

const isComplexType = (value: any) => {
  const type = getDataType(value);
  return type === 'object' || type === 'array';
};

const updateSelectedValue = (newValue: any) => {
  const path = getSelectedPath();
  if (path.length > 0) {
    updateValue(path, newValue);
  }
};

// 新增的子项操作方法
const isPathSelected = (path: (string | number)[]) => {
  if (selectedPath.value.length !== path.length) return false;
  return selectedPath.value.every((part, index) => part === path[index]);
};

const addObjectProperty = (parentKey: string) => {
  if (!jsonData.value || !jsonData.value[parentKey]) return;
  
  const obj = jsonData.value[parentKey];
  let newKey = 'newProperty';
  let counter = 1;
  
  while (obj[newKey] !== undefined) {
    newKey = `newProperty${counter}`;
    counter++;
  }
  
  obj[newKey] = '';
  hasChanges.value = true;
};

const addArrayElement = (parentKey: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  const type = target.value;
  if (!type || !jsonData.value || !Array.isArray(jsonData.value[parentKey])) return;
  
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
  
  jsonData.value[parentKey].push(newValue);
  hasChanges.value = true;
  target.value = '';
};

const removeArrayElement = (parentKey: string, index: number) => {
  if (!jsonData.value || !Array.isArray(jsonData.value[parentKey])) return;
  
  if (confirm(`确定要删除第 ${index + 1} 个元素吗？`)) {
    jsonData.value[parentKey].splice(index, 1);
    hasChanges.value = true;
    
    // 如果删除的是当前选中的元素，清除选择
    if (isPathSelected([parentKey, index])) {
      clearSelection();
      selectedPath.value = [];
    }
  }
};

const updateKey = (oldKey: string, newKey: string) => {
  if (oldKey === newKey || !jsonData.value) return;
  
  const value = jsonData.value[oldKey];
  delete jsonData.value[oldKey];
  jsonData.value[newKey] = value;
  hasChanges.value = true;
};

const deleteItem = (key: string) => {
  if (!jsonData.value) return;
  
  const itemType = getDataType(jsonData.value[key]);
  const itemInfo = itemType === 'object' ? `(${Object.keys(jsonData.value[key]).length} 个属性)` :
                   itemType === 'array' ? `(${jsonData.value[key].length} 个元素)` : '';
  
  if (confirm(`确定要删除键 "${key}" 吗？\n类型: ${itemType} ${itemInfo}\n\n此操作无法撤销。`)) {
    delete jsonData.value[key];
    hasChanges.value = true;
    
    // 如果删除的是当前选中的项，清除选择
    if (selectedKey.value === key || selectedPath.value[0] === key) {
      selectedKey.value = '';
      selectedPath.value = [];
    }
  }
};

const updateValue = (path: (string | number)[], value: any) => {
  if (!jsonData.value) return;
  
  let target = jsonData.value;
  for (let i = 0; i < path.length - 1; i++) {
    target = target[path[i]];
  }
  target[path[path.length - 1]] = value;
  hasChanges.value = true;
};

const deleteNestedItem = (path: string[]) => {
  if (!jsonData.value) return;
  
  let target = jsonData.value;
  for (let i = 0; i < path.length - 1; i++) {
    target = target[path[i]];
  }
  
  if (Array.isArray(target)) {
    target.splice(parseInt(path[path.length - 1]), 1);
  } else {
    delete target[path[path.length - 1]];
  }
  hasChanges.value = true;
};

const addNestedItem = (path: string[], type: string = 'string') => {
  if (!jsonData.value) return;
  
  let target = jsonData.value;
  for (let i = 0; i < path.length; i++) {
    target = target[path[i]];
  }
  
  if (Array.isArray(target)) {
    switch (type) {
      case 'object':
        target.push({});
        break;
      case 'array':
        target.push([]);
        break;
      case 'boolean':
        target.push(false);
        break;
      case 'number':
        target.push(0);
        break;
      default:
        target.push('');
    }
  } else {
    const newKey = `newItem${Object.keys(target).length + 1}`;
    target[newKey] = type === 'boolean' ? false : type === 'number' ? 0 : '';
  }
  hasChanges.value = true;
};

const onRootOrderChange = () => {
  hasChanges.value = true;
};

// 拖拽方法
const onDragStart = (key: string, event: DragEvent) => {
  draggedItem.value = key;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', key);
  }
};

const onDragOver = (key: string, event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  dragOverItem.value = key;
};

const onDragLeave = () => {
  dragOverItem.value = null;
};

const onDrop = (targetKey: string, event: DragEvent) => {
  event.preventDefault();
  const sourceKey = draggedItem.value;
  
  if (sourceKey && sourceKey !== targetKey && jsonData.value) {
    const keys = Object.keys(jsonData.value);
    const sourceIndex = keys.indexOf(sourceKey);
    const targetIndex = keys.indexOf(targetKey);
    
    // 重新排序
    const newOrder = [...keys];
    newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, sourceKey);
    
    // 重建对象
    const newData: any = {};
    newOrder.forEach(key => {
      newData[key] = jsonData.value[key];
    });
    
    jsonData.value = newData;
    hasChanges.value = true;
  }
  
  draggedItem.value = null;
  dragOverItem.value = null;
};

const onDragEnd = () => {
  draggedItem.value = null;
  dragOverItem.value = null;
};

// 工具函数
const getDataType = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const getTypeClass = (value: any): string => {
  const type = getDataType(value);
  return `type-${type}`;
};

// 获取对象的第一个属性名和值用于显示
const getObjectFirstProperty = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    const keys = Object.keys(obj);
    if (keys.length === 0) return null;
    const key = keys[0];
    return `${key}: ${obj[key]}`;
};

// 初始化
onMounted(() => {
  // 加载类似于ap_network_config.json的示例数据
  const exampleData = {
    "ConfigForDevices": {
      "status": "enabled",
      "stop_bits": 1,
      "parity": null,
      "data_bits": 8,
      "flow_control": {
        "xon_xoff": false,
        "rts_cts": false,
        "dsr_dtr": false
      },
      "dtr": false,
      "rts": false
    },
    "Devices": [
      {
        "name": "DeviceA",
        "port": "COM32",
        "baud_rate": 115200
      },
      {
        "name": "DebugA",
        "port": "COM7",
        "baud_rate": 921600,
        "status": "disabled",
        "monitor": true
      }
    ],
    "ConfigForCommands": {
      "status": "enabled",
      "timeout": 3000,
      "concurrent_strategy": "sequential",
      "error_actions": [
        {
          "retry": 1
        }
      ]
    },
    "Commands": [
      {
        "command": "AT+QRST",
        "expected_responses": ["OK"],
        "device": "DeviceA",
        "timeout": 3000,
        "order": 1
      }
    ]
  };
  
  if (!jsonData.value) {
    jsonData.value = exampleData;
    currentFile.value = 'ap_network_config.json';
    hasChanges.value = false;
  }
  
  // 添加键盘快捷键
  const handleKeyPress = (event: KeyboardEvent) => {
    // Ctrl+S 保存
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      if (currentFile.value && hasChanges.value) {
        saveFile();
      }
    }
    // Ctrl+O 打开文件
    else if (event.ctrlKey && event.key === 'o') {
      event.preventDefault();
      loadFile();
    }
    // Ctrl+N 新建文件
    else if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      createNewFile();
    }
    // Delete 删除选中项
    else if (event.key === 'Delete' && selectedKey.value) {
      event.preventDefault();
      deleteItem(selectedKey.value);
    }
    // Escape 清除选择
    else if (event.key === 'Escape') {
      event.preventDefault();
      clearSelection();
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
  
  // 组件卸载时移除事件监听
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress);
  });
});
</script>

<style scoped>
.json-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border-radius: 8px;
}

.editor-layout {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
  max-height: 100%;
}

.file-section {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  min-height: 0;
  max-height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.keyboard-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.keyboard-hint i {
  font-size: 0.625rem;
}

.hint-text {
  white-space: nowrap;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-success:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.file-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.file-path {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #10b981;
}

.file-status.has-changes {
  color: #f59e0b;
}

.structure-overview {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.structure-overview h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 600;
}

.structure-tree {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tree-item-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
}

.tree-item-container:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: #fafbfc;
}

.tree-item:hover {
  background: #f1f5f9;
}

.tree-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.tree-item[draggable="true"] {
  cursor: grab;
}

.tree-item:active {
  cursor: grabbing;
}

.item-count {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: 'Fira Code', 'Consolas', monospace;
  margin-left: 0.25rem;
}

.drag-handle {
  cursor: grab;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #6b7280;
  background: #f1f5f9;
}

.tree-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tree-icon {
  color: #9ca3af;
  transition: transform 0.2s;
  cursor: pointer;
  width: 12px;
}

.tree-icon.expanded {
  transform: rotate(90deg);
}

.tree-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-item:hover .tree-actions {
  opacity: 1;
}

.btn-tree-action {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: #f3f4f6;
  color: #6b7280;
}

.btn-tree-action:hover {
  background: #e5e7eb;
}

.btn-tree-action.delete {
  background: #fef2f2;
  color: #dc2626;
}

.btn-tree-action.delete:hover {
  background: #fee2e2;
}

.tree-children {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.child-section {
  padding: 1rem;
}

.child-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.child-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.child-controls {
  display: flex;
  gap: 0.5rem;
}

.btn-add-child {
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
  color: #374151;
}

.btn-add-child:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.add-element-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.75rem;
  min-width: 120px;
}

.child-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.child-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: white;
}

.child-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.child-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.child-item[draggable="true"] {
  cursor: grab;
}

.child-item:active {
  cursor: grabbing;
}

.child-drag-handle {
  opacity: 0;
  cursor: grab;
  color: #9ca3af;
  font-size: 0.75rem;
  transition: opacity 0.2s;
  padding: 0.25rem;
  border-radius: 3px;
}

.child-item:hover .child-drag-handle {
  opacity: 1;
}

.child-drag-handle:hover {
  background: #f3f4f6;
}

.child-drag-handle:active {
  cursor: grabbing;
}

.child-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.child-icon {
  color: #9ca3af;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.child-preview {
  margin-left: auto;
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: 'Fira Code', 'Consolas', monospace;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-remove-child {
  opacity: 0;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  color: #dc2626;
  transition: all 0.2s;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.child-item:hover .btn-remove-child {
  opacity: 1;
}

.btn-remove-child:hover {
  background: #fee2e2;
}

.child-key {
  font-family: 'Fira Code', 'Consolas', monospace;
  color: #374151;
}

.type-badge.small {
  font-size: 0.625rem;
  padding: 0.125rem 0.25rem;
}

.key-name {
  flex: 1;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #1e293b;
}

.type-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  position: relative;
}

.type-badge .first-property {
  font-weight: 400;
  text-transform: none;
  color: inherit;
  opacity: 0.8;
  font-size: 1em;
  margin-left: 0.25rem;
}

.type-string { background: #dbeafe; color: #1d4ed8; }
.type-number { background: #dcfce7; color: #166534; }
.type-boolean { background: #fef3c7; color: #92400e; }
.type-object { background: #f3e8ff; color: #7c3aed; }
.type-array { background: #fce7f3; color: #be185d; }
.type-null { background: #f1f5f9; color: #475569; }

.visual-editor {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.json-visual-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.detail-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #374151;
}

.detail-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: white;
}

.field-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.field-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.key-input {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 500;
}

.field-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.field-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  padding: 2rem;
}

.no-selection i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.no-selection h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.125rem;
}

.no-selection p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  max-width: 300px;
  line-height: 1.5;
}

/* 紧凑编辑器样式 */
.compact-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  min-height: 0;
  max-height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumb-item i {
  color: #9ca3af;
  font-size: 0.75rem;
}

.btn-close-compact {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close-compact:hover {
  background: #e5e7eb;
  color: #374151;
}

.editor-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  min-height: 0;
}

.editor-row {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: end;
}

/* 新的一行内布局 */
.editor-row-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.inline-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.inline-field:first-child {
  flex: 0 0 auto;
  min-width: 120px;
}

.inline-field:nth-child(2) {
  flex: 0 0 auto;
  min-width: 100px;
}

.inline-field:nth-child(3) {
  flex: 1;
  min-width: 150px;
}

.inline-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  min-width: 30px;
}

.input-inline,
.select-inline {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s;
  min-width: 0;
  flex: 1;
}

.input-inline:focus,
.select-inline:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-inline {
  font-family: 'Fira Code', 'Consolas', monospace;
}

.select-inline {
  background: white;
  cursor: pointer;
}

.value-inline {
  width: 100%;
}

.field-compact {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-compact label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-compact,
.select-compact {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-compact:focus,
.select-compact:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-compact {
  font-family: 'Fira Code', 'Consolas', monospace;
}

.select-compact {
  background: white;
  cursor: pointer;
}

.complex-editor {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .editor-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .editor-row-inline {
    flex-direction: column;
    align-items: stretch;
  }
  
  .inline-field {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .inline-field:first-child,
  .inline-field:nth-child(2),
  .inline-field:nth-child(3) {
    flex: none;
    min-width: auto;
  }
  
  .inline-label {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .editor-row-inline {
    gap: 0.75rem;
    padding: 0.5rem;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #64748b;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.json-container {
  padding: 0.5rem 0;
}

.draggable-list {
  min-height: 50px;
}

.json-item {
  margin-bottom: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  transition: all 0.2s ease;
}

.json-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.json-item.drag-over {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.root-item {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.drag-handle {
  cursor: grab;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #6b7280;
  background: #f1f5f9;
}

.drag-handle:active {
  cursor: grabbing;
}

.item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.key-input {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  min-width: 120px;
}

.key-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.type-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
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

.code-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.json-textarea {
  flex: 1;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  resize: none;
  outline: none;
  line-height: 1.5;
}

.json-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-layout {
    flex-direction: column;
  }
  
  .file-section {
    flex: none;
  }
}
</style>

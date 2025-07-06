<template>
    <div class="json-formatter">
      <div class="tool-layout">
        <!-- 左侧输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <h3>Input JSON</h3>
            <div class="actions">
              <button @click="clearInput" class="btn btn-secondary">Clear</button>
              <button @click="formatJson" class="btn btn-primary">Format</button>
            </div>
          </div>
          <textarea
            v-model="inputJson"
            placeholder="Paste your JSON here..."
            class="json-input"
            @input="validateJson"
          ></textarea>
          <div v-if="validationError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ validationError }}
          </div>
        </div>
  
        <!-- 右侧输出区域 -->
        <div class="output-section">
          <div class="section-header">
            <h3>Formatted JSON</h3>
            <div class="actions">
              <button @click="copyOutput" class="btn btn-secondary">
                <i class="fas fa-copy"></i> Copy
              </button>
              <button @click="downloadJson" class="btn btn-secondary">
                <i class="fas fa-download"></i> Download
              </button>
            </div>
          </div>
          <pre class="json-output" v-html="formattedJson"></pre>
        </div>
      </div>
  
      <!-- 工具选项 -->
      <div class="options-panel">
        <div class="option-group">
          <label>Indent Size:</label>
          <select v-model="indentSize" @change="formatJson">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="\t">Tab</option>
          </select>
        </div>
        <div class="option-group">
          <label>
            <input type="checkbox" v-model="sortKeys" @change="formatJson">
            Sort Keys
          </label>
        </div>
        <div class="option-group">
          <label>
            <input type="checkbox" v-model="compactMode" @change="formatJson">
            Compact Mode
          </label>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  const inputJson = ref('');
  const outputJson = ref('');
  const validationError = ref('');
  const indentSize = ref('2');
  const sortKeys = ref(false);
  const compactMode = ref(false);
  
  const formattedJson = computed(() => {
    if (!outputJson.value) return '';
    return highlightJson(outputJson.value);
  });
  
  const validateJson = () => {
    if (!inputJson.value.trim()) {
      validationError.value = '';
      outputJson.value = '';
      return;
    }
  
    try {
      JSON.parse(inputJson.value);
      validationError.value = '';
    } catch (error: any) {
      validationError.value = `Invalid JSON: ${error.message}`;
    }
  };
  
  const formatJson = () => {
    if (!inputJson.value.trim()) {
      outputJson.value = '';
      return;
    }
  
    try {
      let parsed = JSON.parse(inputJson.value);
      
      if (sortKeys.value) {
        parsed = sortObjectKeys(parsed);
      }
  
      const indent = indentSize.value === '\t' ? '\t' : parseInt(indentSize.value);
      outputJson.value = compactMode.value 
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, indent);
        
      validationError.value = '';
    } catch (error: any) {
      validationError.value = `Error formatting JSON: ${error.message}`;
    }
  };
  
  const sortObjectKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    
    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key]);
    });
    return sorted;
  };
  
  const highlightJson = (jsonString: string): string => {
    return jsonString
      .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
      .replace(/:\s*(\d+)/g, ': <span class="json-number">$1</span>');
  };
  
  const clearInput = () => {
    inputJson.value = '';
    outputJson.value = '';
    validationError.value = '';
  };
  
  const copyOutput = async () => {
    if (outputJson.value) {
      try {
        await navigator.clipboard.writeText(outputJson.value);
        // 可以添加toast提示
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };
  
  const downloadJson = () => {
    if (outputJson.value) {
      const blob = new Blob([outputJson.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  </script>
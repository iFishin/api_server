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
  
  <style scoped>
  .json-formatter {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
  }
  
  .tool-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
  }
  
  .input-section, .output-section {
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .section-header {
    display: flex;
    justify-content: between;
    align-items: center;
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .section-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
  
  .btn-primary:hover {
    background: #2563eb;
  }
  
  .btn-secondary {
    background: white;
    color: #374151;
  }
  
  .btn-secondary:hover {
    background: #f9fafb;
  }
  
  .json-input {
    flex: 1;
    padding: 1rem;
    border: none;
    outline: none;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    resize: none;
  }
  
  .json-output {
    flex: 1;
    padding: 1rem;
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    overflow: auto;
    background: #f8fafc;
  }
  
  .error-message {
    padding: 0.75rem 1rem;
    background: #fef2f2;
    color: #dc2626;
    border-top: 1px solid #fecaca;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .options-panel {
    display: flex;
    gap: 2rem;
    align-items: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .option-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .option-group label {
    font-size: 0.875rem;
    color: #374151;
  }
  
  .option-group select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }
  
  /* JSON语法高亮 */
  .json-key { color: #dc2626; }
  .json-string { color: #059669; }
  .json-number { color: #2563eb; }
  .json-boolean { color: #7c3aed; }
  .json-null { color: #6b7280; }
  
  @media (max-width: 768px) {
    .tool-layout {
      grid-template-columns: 1fr;
    }
    
    .options-panel {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
  }
  </style>
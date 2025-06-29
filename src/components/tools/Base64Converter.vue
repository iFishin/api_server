<template>
    <div class="base64-converter">
      <div class="converter-layout">
        <!-- 编码区域 -->
        <div class="encode-section">
          <div class="section-header">
            <h3>Encode to Base64</h3>
            <div class="actions">
              <button @click="clearEncode" class="btn btn-secondary">Clear</button>
              <button @click="encodeText" class="btn btn-primary">Encode</button>
            </div>
          </div>
          <div class="input-group">
            <label>Input Type:</label>
            <select v-model="encodeInputType" @change="handleInputTypeChange">
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          </div>
          
          <div v-if="encodeInputType === 'text'" class="text-input">
            <textarea
              v-model="inputText"
              placeholder="Enter text to encode..."
              class="input-textarea"
              @input="encodeText"
            ></textarea>
          </div>
          
          <div v-else class="file-input">
            <input
              type="file"
              @change="handleFileSelect"
              class="file-input-element"
              ref="fileInput"
            >
            <div class="file-drop-zone" @drop="handleFileDrop" @dragover.prevent>
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Drop file here or click to select</p>
            </div>
          </div>
  
          <div class="output-area">
            <label>Base64 Output:</label>
            <textarea
              v-model="encodedOutput"
              readonly
              class="output-textarea"
              placeholder="Encoded result will appear here..."
            ></textarea>
            <button @click="copyEncoded" class="copy-btn">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
        </div>
  
        <!-- 解码区域 -->
        <div class="decode-section">
          <div class="section-header">
            <h3>Decode from Base64</h3>
            <div class="actions">
              <button @click="clearDecode" class="btn btn-secondary">Clear</button>
              <button @click="decodeText" class="btn btn-primary">Decode</button>
            </div>
          </div>
  
          <div class="input-area">
            <textarea
              v-model="base64Input"
              placeholder="Enter Base64 string to decode..."
              class="input-textarea"
              @input="decodeText"
            ></textarea>
          </div>
  
          <div class="output-area">
            <label>Decoded Output:</label>
            <div class="output-type-selector">
              <label>
                <input type="radio" v-model="decodeOutputType" value="text">
                Text
              </label>
              <label>
                <input type="radio" v-model="decodeOutputType" value="download">
                Download as File
              </label>
            </div>
            
            <textarea
              v-if="decodeOutputType === 'text'"
              v-model="decodedOutput"
              readonly
              class="output-textarea"
              placeholder="Decoded result will appear here..."
            ></textarea>
            
            <div v-else class="download-area">
              <button @click="downloadDecoded" class="btn btn-success" :disabled="!decodedOutput">
                <i class="fas fa-download"></i> Download File
              </button>
            </div>
            
            <button v-if="decodeOutputType === 'text'" @click="copyDecoded" class="copy-btn">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
  
          <div v-if="decodeError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ decodeError }}
          </div>
        </div>
      </div>
  
      <!-- 工具信息 -->
      <div class="info-panel">
        <div class="info-item">
          <strong>Original Size:</strong> {{ originalSize }} bytes
        </div>
        <div class="info-item">
          <strong>Encoded Size:</strong> {{ encodedSize }} bytes
        </div>
        <div class="info-item">
          <strong>Size Increase:</strong> {{ sizeIncrease }}%
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  const inputText = ref('');
  const base64Input = ref('');
  const encodedOutput = ref('');
  const decodedOutput = ref('');
  const encodeInputType = ref('text');
  const decodeOutputType = ref('text');
  const decodeError = ref('');
  const fileInput = ref<HTMLInputElement>();
  
  const originalSize = computed(() => {
    return new Blob([inputText.value]).size;
  });
  
  const encodedSize = computed(() => {
    return new Blob([encodedOutput.value]).size;
  });
  
  const sizeIncrease = computed(() => {
    if (originalSize.value === 0) return 0;
    return Math.round(((encodedSize.value - originalSize.value) / originalSize.value) * 100);
  });
  
  const encodeText = () => {
    if (!inputText.value) {
      encodedOutput.value = '';
      return;
    }
    
    try {
      encodedOutput.value = btoa(unescape(encodeURIComponent(inputText.value)));
    } catch (error) {
      console.error('Encoding error:', error);
    }
  };
  
  const decodeText = () => {
    if (!base64Input.value) {
      decodedOutput.value = '';
      decodeError.value = '';
      return;
    }
  
    try {
      const decoded = atob(base64Input.value);
      decodedOutput.value = decodeURIComponent(escape(decoded));
      decodeError.value = '';
    } catch (error) {
      decodeError.value = 'Invalid Base64 string';
      decodedOutput.value = '';
    }
  };
  
  const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      readFile(file);
    }
  };
  
  const handleFileDrop = (event: DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      readFile(file);
    }
  };
  
  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        // 对于文本文件
        inputText.value = result;
        encodeText();
      } else if (result instanceof ArrayBuffer) {
        // 对于二进制文件
        const bytes = new Uint8Array(result);
        const binary = String.fromCharCode(...bytes);
        encodedOutput.value = btoa(binary);
      }
    };
    
    if (file.type.startsWith('text/')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };
  
  const handleInputTypeChange = () => {
    inputText.value = '';
    encodedOutput.value = '';
  };
  
  const clearEncode = () => {
    inputText.value = '';
    encodedOutput.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };
  
  const clearDecode = () => {
    base64Input.value = '';
    decodedOutput.value = '';
    decodeError.value = '';
  };
  
  const copyEncoded = async () => {
    if (encodedOutput.value) {
      try {
        await navigator.clipboard.writeText(encodedOutput.value);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };
  
  const copyDecoded = async () => {
    if (decodedOutput.value) {
      try {
        await navigator.clipboard.writeText(decodedOutput.value);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };
  
  const downloadDecoded = () => {
    if (!base64Input.value) return;
    
    try {
      const binary = atob(base64Input.value);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded-file';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      decodeError.value = 'Failed to decode file';
    }
  };
  </script>
  
  <style scoped>
  .base64-converter {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
  }
  
  .converter-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
  }
  
  .encode-section, .decode-section {
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
  
  .btn-secondary {
    background: white;
    color: #374151;
  }
  
  .btn-success {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  
  .input-group {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .text-input, .input-area, .output-area {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }
  
  .input-textarea, .output-textarea {
    min-height: 150px;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.875rem;
    resize: vertical;
  }
  
  .file-input {
    padding: 1rem;
    flex: 1;
  }
  
  .file-drop-zone {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .file-drop-zone:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  .output-type-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .copy-btn {
    align-self: flex-start;
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
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
  
  .info-panel {
    display: flex;
    gap: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 0.875rem;
  }
  
  .info-item {
    color: #374151;
  }
  
  @media (max-width: 768px) {
    .converter-layout {
      grid-template-columns: 1fr;
    }
    
    .info-panel {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
  </style>
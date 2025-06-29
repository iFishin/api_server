<template>
  <div class="url-encoder">
    <div class="encoder-layout">
      <!-- URL编码区域 -->
      <div class="encode-section">
        <div class="section-header">
          <h3>URL Encode</h3>
          <div class="actions">
            <button @click="clearEncode" class="btn btn-secondary">Clear</button>
            <button @click="encodeUrl" class="btn btn-primary">Encode</button>
          </div>
        </div>
        <div class="input-area">
          <textarea
            v-model="inputUrl"
            placeholder="Enter URL or text to encode..."
            class="input-textarea"
            @input="encodeUrl"
          ></textarea>
        </div>
        <div class="output-area">
          <label>Encoded Result:</label>
          <textarea
            v-model="encodedOutput"
            readonly
            class="output-textarea"
            placeholder="Encoded URL will appear here..."
          ></textarea>
          <button @click="copyEncoded" class="copy-btn">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
      </div>

      <!-- URL解码区域 -->
      <div class="decode-section">
        <div class="section-header">
          <h3>URL Decode</h3>
          <div class="actions">
            <button @click="clearDecode" class="btn btn-secondary">Clear</button>
            <button @click="decodeUrl" class="btn btn-primary">Decode</button>
          </div>
        </div>
        <div class="input-area">
          <textarea
            v-model="encodedInput"
            placeholder="Enter encoded URL to decode..."
            class="input-textarea"
            @input="decodeUrl"
          ></textarea>
        </div>
        <div class="output-area">
          <label>Decoded Result:</label>
          <textarea
            v-model="decodedOutput"
            readonly
            class="output-textarea"
            placeholder="Decoded URL will appear here..."
          ></textarea>
          <button @click="copyDecoded" class="copy-btn">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
        <div v-if="decodeError" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          {{ decodeError }}
        </div>
      </div>
    </div>

    <!-- 编码选项 -->
    <div class="options-panel">
      <div class="option-group">
        <label>Encoding Type:</label>
        <select v-model="encodingType" @change="encodeUrl">
          <option value="component">Component (encodeURIComponent)</option>
          <option value="uri">Full URI (encodeURI)</option>
        </select>
      </div>
      <div class="option-group">
        <label>
          <input type="checkbox" v-model="encodeSpaceAsPlus" @change="encodeUrl">
          Encode spaces as + (for form data)
        </label>
      </div>
    </div>

    <!-- URL 分析 -->
    <div v-if="urlAnalysis" class="analysis-panel">
      <h3>URL Analysis</h3>
      <div class="analysis-grid">
        <div class="analysis-item">
          <strong>Protocol:</strong> {{ urlAnalysis.protocol }}
        </div>
        <div class="analysis-item">
          <strong>Host:</strong> {{ urlAnalysis.host }}
        </div>
        <div class="analysis-item">
          <strong>Port:</strong> {{ urlAnalysis.port || 'default' }}
        </div>
        <div class="analysis-item">
          <strong>Path:</strong> {{ urlAnalysis.pathname }}
        </div>
        <div class="analysis-item">
          <strong>Query:</strong> {{ urlAnalysis.search }}
        </div>
        <div class="analysis-item">
          <strong>Hash:</strong> {{ urlAnalysis.hash }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const inputUrl = ref('');
const encodedInput = ref('');
const encodedOutput = ref('');
const decodedOutput = ref('');
const decodeError = ref('');
const encodingType = ref('component');
const encodeSpaceAsPlus = ref(false);

const urlAnalysis = computed(() => {
  if (!inputUrl.value || !isValidUrl(inputUrl.value)) return null;
  
  try {
    return new URL(inputUrl.value);
  } catch {
    return null;
  }
});

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

const encodeUrl = () => {
  if (!inputUrl.value) {
    encodedOutput.value = '';
    return;
  }

  try {
    let result = '';
    
    if (encodingType.value === 'component') {
      result = encodeURIComponent(inputUrl.value);
    } else {
      result = encodeURI(inputUrl.value);
    }

    if (encodeSpaceAsPlus.value) {
      result = result.replace(/%20/g, '+');
    }

    encodedOutput.value = result;
  } catch (error) {
    console.error('Encoding error:', error);
  }
};

const decodeUrl = () => {
  if (!encodedInput.value) {
    decodedOutput.value = '';
    decodeError.value = '';
    return;
  }

  try {
    let input = encodedInput.value;
    
    // 处理 + 号
    if (input.includes('+')) {
      input = input.replace(/\+/g, '%20');
    }

    decodedOutput.value = decodeURIComponent(input);
    decodeError.value = '';
  } catch (error) {
    decodeError.value = 'Invalid encoded URL';
    decodedOutput.value = '';
  }
};

const clearEncode = () => {
  inputUrl.value = '';
  encodedOutput.value = '';
};

const clearDecode = () => {
  encodedInput.value = '';
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
</script>

<style scoped>
.url-encoder {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1rem;
}

.encoder-layout {
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
  justify-content: space-between;
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

.input-area, .output-area {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.input-textarea, .output-textarea {
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
  resize: vertical;
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

.options-panel {
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.analysis-panel {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.analysis-panel h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.analysis-item {
  font-size: 0.875rem;
  color: #374151;
}

@media (max-width: 768px) {
  .encoder-layout {
    grid-template-columns: 1fr;
  }
  
  .options-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
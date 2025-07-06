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


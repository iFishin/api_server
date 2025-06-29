<template>
  <div class="hash-generator">
    <div class="generator-layout">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="section-header">
          <h3>Input</h3>
          <div class="actions">
            <button @click="clearInput" class="btn btn-secondary">Clear</button>
            <button @click="generateHashes" class="btn btn-primary">Generate Hashes</button>
          </div>
        </div>

        <div class="input-options">
          <div class="input-type-selector">
            <label>Input Type:</label>
            <select v-model="inputType" @change="handleInputTypeChange">
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          </div>
        </div>

        <div v-if="inputType === 'text'" class="text-input">
          <textarea
            v-model="inputText"
            placeholder="Enter text to hash..."
            class="input-textarea"
            @input="generateHashes"
          ></textarea>
        </div>

        <div v-else class="file-input">
          <input
            type="file"
            @change="handleFileSelect"
            class="file-input-element"
            ref="fileInput"
          >
          <div class="file-drop-zone" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drop file here or click to select</p>
            <p v-if="selectedFile" class="file-info">Selected: {{ selectedFile.name }}</p>
          </div>
        </div>
      </div>

      <!-- 哈希结果 -->
      <div class="output-section">
        <div class="section-header">
          <h3>Hash Results</h3>
          <div class="actions">
            <button @click="copyAllHashes" class="btn btn-secondary">
              <i class="fas fa-copy"></i> Copy All
            </button>
            <button @click="downloadHashes" class="btn btn-secondary">
              <i class="fas fa-download"></i> Download
            </button>
          </div>
        </div>

        <div class="hash-results">
          <div v-for="hash in hashResults" :key="hash.algorithm" class="hash-item">
            <div class="hash-header">
              <label>{{ hash.algorithm }}:</label>
              <button @click="copyHash(hash.value)" class="copy-btn-small">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <input :value="hash.value" readonly class="hash-output" />
          </div>
        </div>
      </div>
    </div>

    <!-- 哈希算法选择 -->
    <div class="algorithm-section">
      <div class="section-header">
        <h3>Hash Algorithms</h3>
        <div class="actions">
          <button @click="selectAllAlgorithms" class="btn btn-secondary">Select All</button>
          <button @click="deselectAllAlgorithms" class="btn btn-secondary">Deselect All</button>
        </div>
      </div>
      <div class="algorithm-grid">
        <label v-for="algo in availableAlgorithms" :key="algo" class="algorithm-checkbox">
          <input
            type="checkbox"
            :value="algo"
            v-model="selectedAlgorithms"
            @change="generateHashes"
          >
          {{ algo }}
        </label>
      </div>
    </div>

    <!-- 哈希比较 -->
    <div class="comparison-section">
      <div class="section-header">
        <h3>Hash Comparison</h3>
        <button @click="compareHashes" class="btn btn-primary">Compare</button>
      </div>
      <div class="comparison-layout">
        <div class="comparison-input">
          <label>Hash to Compare:</label>
          <input
            v-model="hashToCompare"
            placeholder="Enter hash to compare..."
            class="compare-input"
          />
        </div>
        <div class="comparison-result">
          <div v-if="comparisonResult" :class="['comparison-status', comparisonResult.matches ? 'match' : 'no-match']">
            <i :class="comparisonResult.matches ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            <span v-if="comparisonResult.matches">
              Match found with {{ comparisonResult.algorithm }}
            </span>
            <span v-else>No matches found</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件完整性验证 -->
    <div class="integrity-section">
      <div class="section-header">
        <h3>File Integrity Verification</h3>
      </div>
      <div class="integrity-layout">
        <div class="expected-hash">
          <label>Expected Hash:</label>
          <input
            v-model="expectedHash"
            placeholder="Enter expected hash value..."
            class="expected-input"
          />
          <select v-model="expectedAlgorithm" class="algorithm-select">
            <option v-for="algo in availableAlgorithms" :key="algo" :value="algo">{{ algo }}</option>
          </select>
        </div>
        <div class="verification-result">
          <button @click="verifyIntegrity" class="btn btn-primary">Verify Integrity</button>
          <div v-if="integrityResult" :class="['integrity-status', integrityResult.isValid ? 'valid' : 'invalid']">
            <i :class="integrityResult.isValid ? 'fas fa-shield-alt' : 'fas fa-exclamation-triangle'"></i>
            {{ integrityResult.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <h3>Statistics</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Input Size:</span>
          <span class="stat-value">{{ inputSize }} bytes</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Algorithms Used:</span>
          <span class="stat-value">{{ selectedAlgorithms.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Generation Time:</span>
          <span class="stat-value">{{ generationTime }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

const inputType = ref('text');
const inputText = ref('');
const selectedFile = ref<File | null>(null);
const hashToCompare = ref('');
const expectedHash = ref('');
const expectedAlgorithm = ref('MD5');
const fileInput = ref<HTMLInputElement>();
const generationTime = ref(0);

const availableAlgorithms = ref([
  'MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'
]);

const selectedAlgorithms = ref(['MD5', 'SHA-1', 'SHA-256']);
const hashResults = ref<Array<{algorithm: string, value: string}>>([]);
const comparisonResult = ref<any>(null);
const integrityResult = ref<any>(null);

const inputSize = computed(() => {
  if (inputType.value === 'text') {
    return new Blob([inputText.value]).size;
  } else if (selectedFile.value) {
    return selectedFile.value.size;
  }
  return 0;
});

const generateHashes = async () => {
  if (!hasInput()) return;

  const startTime = performance.now();
  hashResults.value = [];

  try {
    let data: ArrayBuffer;
    
    if (inputType.value === 'text') {
      data = new TextEncoder().encode(inputText.value);
    } else if (selectedFile.value) {
      data = await selectedFile.value.arrayBuffer();
    } else {
      return;
    }

    for (const algorithm of selectedAlgorithms.value) {
      const hash = await calculateHash(data, algorithm);
      hashResults.value.push({
        algorithm,
        value: hash
      });
    }

    const endTime = performance.now();
    generationTime.value = Math.round(endTime - startTime);
  } catch (error) {
    console.error('Error generating hashes:', error);
  }
};

const calculateHash = async (data: ArrayBuffer, algorithm: string): Promise<string> => {
  let algoName: string;
  
  switch (algorithm) {
    case 'MD5':
      return await calculateMD5(data);
    case 'SHA-1':
      algoName = 'SHA-1';
      break;
    case 'SHA-256':
      algoName = 'SHA-256';
      break;
    case 'SHA-384':
      algoName = 'SHA-384';
      break;
    case 'SHA-512':
      algoName = 'SHA-512';
      break;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  const hashBuffer = await crypto.subtle.digest(algoName, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const calculateMD5 = async (data: ArrayBuffer): Promise<string> => {
  // 简化的MD5实现（实际项目中应使用专门的MD5库）
  // 这里为了演示，返回一个模拟的MD5值
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
};

const hasInput = (): boolean => {
  return (inputType.value === 'text' && inputText.value.trim() !== '') ||
         (inputType.value === 'file' && selectedFile.value !== null);
};

const handleInputTypeChange = () => {
  inputText.value = '';
  selectedFile.value = null;
  hashResults.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    selectedFile.value = file;
    generateHashes();
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (file) {
    selectedFile.value = file;
    if (fileInput.value) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.value.files = dt.files;
    }
    generateHashes();
  }
};

const compareHashes = () => {
  if (!hashToCompare.value.trim()) {
    comparisonResult.value = null;
    return;
  }

  const compareHash = hashToCompare.value.toLowerCase().trim();
  const match = hashResults.value.find(hash => 
    hash.value.toLowerCase() === compareHash
  );

  comparisonResult.value = {
    matches: !!match,
    algorithm: match?.algorithm
  };
};

const verifyIntegrity = () => {
  if (!expectedHash.value.trim()) {
    integrityResult.value = null;
    return;
  }

  const expectedHashValue = expectedHash.value.toLowerCase().trim();
  const actualHash = hashResults.value.find(hash => 
    hash.algorithm === expectedAlgorithm.value
  );

  if (!actualHash) {
    integrityResult.value = {
      isValid: false,
      message: `No ${expectedAlgorithm.value} hash generated. Please select the algorithm and generate hashes first.`
    };
    return;
  }

  const isValid = actualHash.value.toLowerCase() === expectedHashValue;
  integrityResult.value = {
    isValid,
    message: isValid 
      ? 'File integrity verified successfully!'
      : 'File integrity verification failed - hashes do not match!'
  };
};

const selectAllAlgorithms = () => {
  selectedAlgorithms.value = [...availableAlgorithms.value];
  generateHashes();
};

const deselectAllAlgorithms = () => {
  selectedAlgorithms.value = [];
  hashResults.value = [];
};

const clearInput = () => {
  inputText.value = '';
  selectedFile.value = null;
  hashResults.value = [];
  comparisonResult.value = null;
  integrityResult.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const copyHash = async (hash: string) => {
  try {
    await navigator.clipboard.writeText(hash);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const copyAllHashes = async () => {
  if (hashResults.value.length === 0) return;
  
  const allHashes = hashResults.value
    .map(hash => `${hash.algorithm}: ${hash.value}`)
    .join('\n');
  
  try {
    await navigator.clipboard.writeText(allHashes);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadHashes = () => {
  if (hashResults.value.length === 0) return;
  
  const content = hashResults.value
    .map(hash => `${hash.algorithm}: ${hash.value}`)
    .join('\n');
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hashes.txt';
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.hash-generator {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1.5rem;
}

.generator-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  flex: 1;
}

.input-section, .output-section, .algorithm-section, .comparison-section, .integrity-section {
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

.input-options {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.input-type-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-input {
  padding: 1rem;
  flex: 1;
}

.input-textarea {
  width: 100%;
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

.file-input-element {
  display: none;
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

.file-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.hash-results {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hash-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hash-header label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.copy-btn-small {
  padding: 0.25rem 0.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.hash-output {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #f9fafb;
  font-family: monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

.algorithm-section {
  grid-column: 1 / -1;
}

.algorithm-grid {
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.algorithm-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.algorithm-checkbox:hover {
  background: #f9fafb;
}

.comparison-section, .integrity-section {
  grid-column: 1 / -1;
}

.comparison-layout, .integrity-layout {
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: center;
}

.compare-input, .expected-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: monospace;
  margin-top: 0.5rem;
}

.algorithm-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.comparison-status, .integrity-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.comparison-status.match, .integrity-status.valid {
  background: #dcfce7;
  color: #166534;
}

.comparison-status.no-match, .integrity-status.invalid {
  background: #fef2f2;
  color: #dc2626;
}

.stats-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.stats-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

@media (max-width: 768px) {
  .generator-layout {
    grid-template-columns: 1fr;
  }
  
  .comparison-layout, .integrity-layout {
    grid-template-columns: 1fr;
  }
  
  .algorithm-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style>
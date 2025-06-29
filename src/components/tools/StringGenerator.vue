<template>
  <div class="string-generator">
    <div class="generator-container">
      <div class="controls-section">
        <h2>
          <i class="fas fa-dice"></i>
          字符串生成器
        </h2>
        <p class="description">生成指定长度和字符集的随机字符串</p>

        <!-- 长度设置 -->
        <div class="control-group">
          <div class="length-labels">
            <label for="length">字符串长度</label>
            <label for="maxLength" class="max-length-label">最大值</label>
          </div>
          <div class="length-controls">
            <input
              id="length"
              v-model.number="length"
              type="number"
              min="1"
              :max="maxLength"
              class="length-input"
            />
            <div class="slider-container">
              <input
                v-model.number="length"
                type="range"
                min="1"
                :max="maxLength"
                class="length-slider"
              />
              <div class="slider-labels">
                <span class="slider-min">1</span>
                <span class="slider-max">{{ maxLength }}</span>
              </div>
            </div>
            <input
              id="maxLength"
              v-model.number="maxLength"
              type="number"
              min="10"
              max="10000"
              class="max-length-input"
            />
          </div>
          <div class="length-info">
            当前长度: <strong>{{ length }}</strong> / 最大: <strong>{{ maxLength }}</strong>
          </div>
        </div>

        <!-- 字符集选项 -->
        <div class="control-group">
          <label>字符集选项</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input v-model="includeUppercase" type="checkbox" />
              <span class="custom-checkbox"></span>
              <span class="checkbox-text">大写字母 (A-Z)</span>
            </label>
            <label class="checkbox-item">
              <input v-model="includeLowercase" type="checkbox" />
              <span class="custom-checkbox"></span>
              <span class="checkbox-text">小写字母 (a-z)</span>
            </label>
            <label class="checkbox-item">
              <input v-model="includeNumbers" type="checkbox" />
              <span class="custom-checkbox"></span>
              <span class="checkbox-text">数字 (0-9)</span>
            </label>
            <label class="checkbox-item">
              <input v-model="includeSymbols" type="checkbox" />
              <span class="custom-checkbox"></span>
              <span class="checkbox-text">特殊字符 (!@#$%^&*)</span>
            </label>
            <label class="checkbox-item">
              <input v-model="includeSpace" type="checkbox" />
              <span class="custom-checkbox"></span>
              <span class="checkbox-text">空格</span>
            </label>
          </div>
        </div>

        <!-- 自定义字符 -->
        <div class="control-group">
          <label for="customChars">自定义字符</label>
          <input
            id="customChars"
            v-model="customCharacters"
            type="text"
            placeholder="输入自定义字符"
            class="custom-input"
          />
          <small class="help-text">输入您想要包含的自定义字符</small>
        </div>

        <!-- 排除相似字符 -->
        <div class="control-group">
          <label class="checkbox-item">
            <input v-model="excludeSimilar" type="checkbox" />
            <span class="custom-checkbox"></span>
            <span class="checkbox-text">排除相似字符 (0, O, l, 1, I)</span>
          </label>
        </div>

        <!-- 生成按钮 -->
        <div class="action-buttons">
          <button @click="generateString" class="generate-btn" :disabled="!hasValidCharSet">
            <i class="fas fa-magic"></i>
            生成字符串
          </button>
          <button @click="generateMultiple" class="batch-btn" :disabled="!hasValidCharSet">
            <i class="fas fa-layer-group"></i>
            批量生成 (10个)
          </button>
        </div>
      </div>

      <div class="output-section">
        <h3>生成结果</h3>
        
        <!-- 复制状态提示 -->
        <div v-if="copyStatus" class="copy-status">
            <i class="fas fa-check-circle"></i>
          {{ copyStatus }}
        </div>
        
        <!-- 单个结果 -->
        <div v-if="generatedString" class="result-item">
          <div class="result-header">
            <span class="result-label">生成的字符串</span>
            <button @click="copyToClipboard(generatedString)" class="copy-btn">
              <i class="fas fa-copy"></i>
              复制
            </button>
          </div>
          <div class="result-content">
            <code>{{ generatedString }}</code>
          </div>
          <div class="result-info">
            长度: {{ generatedString.length }} | 字符集: {{ getCharSetInfo() }}
          </div>
        </div>

        <!-- 批量结果 -->
        <div v-if="batchResults.length > 0" class="batch-results">
          <div class="result-header">
            <span class="result-label">批量生成结果</span>
            <button @click="copyAllToClipboard" class="copy-btn">
              <i class="fas fa-copy"></i>
              复制全部
            </button>
          </div>
          <div class="batch-list">
            <div
              v-for="(str, index) in batchResults"
              :key="index"
              class="batch-item"
              @click="copyToClipboard(str)"
            >
              <code>{{ str }}</code>
              <i class="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>

        <!-- 字符集预览 -->
        <div v-if="availableChars" class="charset-preview">
          <h4>当前字符集</h4>
          <div class="charset-display">
            <code>{{ availableChars.slice(0, 100) }}{{ availableChars.length > 100 ? '...' : '' }}</code>
          </div>
          <div class="charset-info">
            总计 {{ availableChars.length }} 个字符
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// 响应式数据
const length = ref(12);
const maxLength = ref(1000); // 滑块最大值
const includeUppercase = ref(true);
const includeLowercase = ref(true);
const includeNumbers = ref(true);
const includeSymbols = ref(false);
const includeSpace = ref(false);
const customCharacters = ref('');
const excludeSimilar = ref(false);
const generatedString = ref('');
const batchResults = ref<string[]>([]);
const copyStatus = ref<string>(''); // 复制状态提示

// 字符集定义
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = '0Ol1I';

// 计算属性
const availableChars = computed(() => {
  let chars = '';
  
  if (includeUppercase.value) chars += UPPERCASE;
  if (includeLowercase.value) chars += LOWERCASE;
  if (includeNumbers.value) chars += NUMBERS;
  if (includeSymbols.value) chars += SYMBOLS;
  if (includeSpace.value) chars += ' ';
  if (customCharacters.value) chars += customCharacters.value;
  
  if (excludeSimilar.value) {
    chars = chars.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
  }
  
  // 去重
  return [...new Set(chars.split(''))].join('');
});

const hasValidCharSet = computed(() => {
  return availableChars.value.length > 0;
});

// 监听最大值变化，确保当前长度不超过最大值
watch(maxLength, (newMax) => {
  if (length.value > newMax) {
    length.value = newMax;
  }
}, { immediate: true });

// 方法
const generateString = () => {
  if (!hasValidCharSet.value) return;
  
  let result = '';
  const chars = availableChars.value;
  
  for (let i = 0; i < length.value; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  generatedString.value = result;
  batchResults.value = []; // 清空批量结果
};

const generateMultiple = () => {
  if (!hasValidCharSet.value) return;
  
  const results = [];
  for (let i = 0; i < 10; i++) {
    let result = '';
    const chars = availableChars.value;
    
    for (let j = 0; j < length.value; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    results.push(result);
  }
  
  batchResults.value = results;
  generatedString.value = ''; // 清空单个结果
};

const getCharSetInfo = () => {
  const sets = [];
  if (includeUppercase.value) sets.push('大写');
  if (includeLowercase.value) sets.push('小写');
  if (includeNumbers.value) sets.push('数字');
  if (includeSymbols.value) sets.push('符号');
  if (includeSpace.value) sets.push('空格');
  if (customCharacters.value) sets.push('自定义');
  
  return sets.join(', ') || '无';
};

const copyToClipboard = async (text: string) => {
  try {
    // 首先尝试使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      console.log('复制成功:', text.slice(0, 20) + (text.length > 20 ? '...' : ''));
      showCopyStatus('复制成功!');
      return;
    }
    
    // 回退到传统方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log('复制成功:', text.slice(0, 20) + (text.length > 20 ? '...' : ''));
      showCopyStatus('复制成功!');
    } else {
      throw new Error('复制命令执行失败');
    }
  } catch (err) {
    console.error('复制失败:', err);
    showCopyStatus('复制失败，请手动复制');
    
    // 最后的回退：提示用户手动复制
    setTimeout(() => {
      const result = prompt('自动复制失败，请手动复制以下内容:', text);
      if (result !== null) {
        console.log('用户已查看内容');
      }
    }, 100);
  }
};

const showCopyStatus = (message: string) => {
  copyStatus.value = message;
  setTimeout(() => {
    copyStatus.value = '';
  }, 2000);
};

const copyAllToClipboard = async () => {
  const allText = batchResults.value.join('\n');
  await copyToClipboard(allText);
};
</script>

<style scoped>
.string-generator {
  padding: 2rem;
  min-width: 80%;
  margin: 0 auto;
}

.generator-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: 100%;
}

.controls-section {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.controls-section::-webkit-scrollbar,
.output-section::-webkit-scrollbar {
  width: 6px;
}

.controls-section::-webkit-scrollbar-track,
.output-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.controls-section::-webkit-scrollbar-thumb,
.output-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.controls-section::-webkit-scrollbar-thumb:hover,
.output-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.controls-section h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controls-section h2 i {
  color: #3b82f6;
}

.description {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.control-group {
  margin-bottom: 1.5rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.length-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.length-labels label {
  margin-bottom: 0;
}

.length-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.length-input {
  width: 80px;
  padding: 0.625rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  transition: border-color 0.2s ease;
}

.length-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.slider-container {
  flex: 1;
  min-width: 200px;
}

.length-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%);
  outline: none;
  appearance: none;
  cursor: pointer;
}

.length-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.length-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.length-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.slider-min,
.slider-max {
  font-weight: 500;
}

.max-length-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.max-length-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0 !important;
}

.max-length-input {
  width: 80px;
  padding: 0.625rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  transition: border-color 0.2s ease;
}

.max-length-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.length-info {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #0c4a6e;
  text-align: center;
}

.length-info strong {
  color: #1e40af;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0;
  position: relative;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  background: rgba(59, 130, 246, 0.05);
}

.checkbox-item input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox {
  position: relative;
  width: 18px !important;
  height: 18px !important;
  min-width: 18px;
  min-height: 18px;
  max-width: 18px;
  max-height: 18px;
  background: #ffffff;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 0.75rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-sizing: border-box;
  display: inline-block;
}

.custom-checkbox::after {
  content: '';
  position: absolute;
  display: none;
  left: 4px;
  top: 0px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-item input[type="checkbox"]:checked + .custom-checkbox {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.checkbox-item input[type="checkbox"]:checked + .custom-checkbox::after {
  display: block;
}

.checkbox-item:hover .custom-checkbox {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-text {
  font-weight: 500;
  line-height: 1.4;
}

.custom-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.custom-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  display: block;
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.8rem;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.generate-btn,
.batch-btn {
  flex: 1;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.generate-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.batch-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.batch-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.generate-btn:disabled,
.batch-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.output-section {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.output-section h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.copy-status {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  font-weight: 500;
  font-size: 0.9rem;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.result-item,
.batch-results {
  margin-bottom: 2rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.result-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  position: relative;
  overflow: hidden;
}

.copy-btn:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.copy-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
}

.copy-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.copy-btn:active::after {
  width: 300px;
  height: 300px;
}

.result-content {
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  position: relative;
  overflow: hidden;
}

.result-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
}

.result-content code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  word-break: break-all;
  color: #1f2937;
  line-height: 1.6;
  font-weight: 500;
}

.result-info {
  font-size: 0.8rem;
  color: #6b7280;
}

.batch-list {
  max-height: 350px;
  overflow-y: auto;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
}

.batch-item {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.batch-item:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-left: 3px solid #3b82f6;
  padding-left: 1.125rem;
}

.batch-item:last-child {
  border-bottom: none;
}

.batch-item code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  flex: 1;
  font-weight: 500;
  color: #1f2937;
}

.copy-icon {
  color: #9ca3af;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.batch-item:hover .copy-icon {
  color: #3b82f6;
}

.charset-preview {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

.charset-preview h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.charset-display {
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  position: relative;
  overflow: hidden;
}

.charset-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #3b82f6, #f59e0b);
}

.charset-display code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  word-break: break-all;
  color: #1f2937;
  line-height: 1.8;
  letter-spacing: 0.5px;
}

.charset-info {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .generator-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .string-generator {
    padding: 1rem;
  }
  
  .controls-section,
  .output-section {
    padding: 1.5rem;
  }
  
  .length-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .length-labels {
    justify-content: space-around;
  }
  
  .slider-container {
    min-width: auto;
  }
  
  .max-length-control {
    align-self: center;
  }
}
</style>

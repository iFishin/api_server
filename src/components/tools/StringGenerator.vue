<template>
  <div class="string-generator">
    <!-- Copy notification -->
    <CopyNotification
      :visible="showCopyMessage"
      :message="copyStatus"
      :type="copyType"
      @hide="showCopyMessage = false"
    />
    
    <div class="tool-layout">
      <div class="input-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-dice"></i>
            字符串生成器
          </h3>
        </div>
        
        <div class="section-content">
          <div class="description-section">
            <p class="description">生成指定长度和字符集的随机字符串，支持多种字符组合和自定义选项</p>
            <div class="feature-tags">
              <span class="feature-tag">
                <i class="fas fa-sliders-h"></i>
                自定义长度
              </span>
              <span class="feature-tag">
                <i class="fas fa-font"></i>
                多字符集
              </span>
              <span class="feature-tag">
                <i class="fas fa-layer-group"></i>
                批量生成
              </span>
            </div>
          </div>

          <!-- 长度设置 -->
          <div class="input-group">
            <div class="input-label-section">
              <label class="input-label">
                <i class="fas fa-ruler"></i>
                字符串长度设置
              </label>
              <span class="input-hint">设置生成字符串的长度和最大值</span>
            </div>
            
            <div class="length-controls">
              <div class="length-input-group">
                <label for="length">当前长度</label>
                <input
                  id="length"
                  v-model.number="length"
                  type="number"
                  min="1"
                  :max="maxLength"
                  class="length-input"
                />
              </div>
              
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
              
              <div class="max-length-group">
                <label for="maxLength">最大长度</label>
                <input
                  id="maxLength"
                  v-model.number="maxLength"
                  type="number"
                  min="10"
                  max="10000"
                  class="max-length-input"
                />
              </div>
            </div>
            
            <div class="length-info">
              当前长度: <strong>{{ length }}</strong> / 最大: <strong>{{ maxLength }}</strong>
            </div>
          </div>

          <!-- 字符集选项 -->
          <div class="config-section">
            <h4>字符集配置</h4>
            
            <div class="config-group">
              <label>预设字符集</label>
              <div class="checkbox-options">
                <label class="checkbox-item">
                  <input v-model="includeUppercase" type="checkbox" />
                  <span class="checkmark"></span>
                  大写字母 (A-Z)
                </label>
                <label class="checkbox-item">
                  <input v-model="includeLowercase" type="checkbox" />
                  <span class="checkmark"></span>
                  小写字母 (a-z)
                </label>
                <label class="checkbox-item">
                  <input v-model="includeNumbers" type="checkbox" />
                  <span class="checkmark"></span>
                  数字 (0-9)
                </label>
                <label class="checkbox-item">
                  <input v-model="includeSymbols" type="checkbox" />
                  <span class="checkmark"></span>
                  特殊字符 (!@#$%^&*)
                </label>
                <label class="checkbox-item">
                  <input v-model="includeSpace" type="checkbox" />
                  <span class="checkmark"></span>
                  空格字符
                </label>
              </div>
            </div>

            <div class="config-group">
              <label for="customChars">自定义字符</label>
              <input
                id="customChars"
                v-model="customCharacters"
                type="text"
                placeholder="输入您想要包含的自定义字符..."
                class="custom-input"
              />
              <small class="help-text">可添加任意字符扩展字符集</small>
            </div>

            <div class="config-group">
              <label class="checkbox-item">
                <input v-model="excludeSimilar" type="checkbox" />
                <span class="checkmark"></span>
                排除相似字符 (0, O, l, 1, I)
              </label>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button @click="generateString" class="btn btn-primary generate-btn" :disabled="!hasValidCharSet">
              <i class="fas fa-magic"></i>
              生成字符串
            </button>
            <button @click="generateMultiple" class="btn btn-secondary batch-btn" :disabled="!hasValidCharSet">
              <i class="fas fa-layer-group"></i>
              批量生成 (10个)
            </button>
          </div>
        </div>
      </div>

      <div class="output-section">
        <div class="section-header">
          <h3>生成结果</h3>
        </div>
        
        <div class="section-content">
          <!-- 字符集预览 -->
          <div v-if="availableChars" class="charset-preview">
            <div class="subsection-header">
              <span class="subsection-title">当前字符集</span>
              <span class="charset-stats">{{ availableChars.length }} 个字符</span>
            </div>
            <div class="charset-display">
              <code>{{ availableChars.slice(0, 100) }}{{ availableChars.length > 100 ? '...' : '' }}</code>
            </div>
          </div>
          <!-- 单个结果 -->
          <div v-if="generatedString" class="single-result">
            <div class="subsection-header">
              <span class="subsection-title">生成的字符串</span>
              <button @click="copyToClipboard(generatedString)" class="btn btn-secondary" title="复制字符串">
                <i class="fas fa-copy"></i>
                复制
              </button>
            </div>
            <div class="result-display">
              <div class="result-content">
                <code>{{ generatedString }}</code>
              </div>
              <div class="result-info">
                <div class="info-item">
                  <span class="info-label">长度:</span>
                  <span class="info-value">{{ generatedString.length }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">字符集:</span>
                  <span class="info-value">{{ getCharSetInfo() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 批量结果 -->
          <div v-if="batchResults.length > 0" class="batch-results">
            <div class="subsection-header">
              <span class="subsection-title">批量生成结果</span>
              <button @click="copyAllToClipboard" class="btn btn-secondary" title="复制所有字符串">
                <i class="fas fa-copy"></i>
                复制全部
              </button>
            </div>
            <div class="batch-grid">
              <div
                v-for="(str, index) in batchResults"
                :key="index"
                class="batch-item"
                @click="copyToClipboard(str)"
                :title="`点击复制第 ${index + 1} 个字符串`"
              >
                <span class="batch-index">#{{ index + 1 }}</span>
                <code class="batch-content">{{ str }}</code>
                <i class="fas fa-copy copy-icon"></i>
              </div>
            </div>
            <div class="batch-summary">
              生成了 <strong>{{ batchResults.length }}</strong> 个字符串，每个长度为 <strong>{{ length }}</strong>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!generatedString && batchResults.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-dice"></i>
            </div>
            <h4>请选择字符集并生成字符串</h4>
            <p>配置字符集选项，然后点击生成按钮开始创建随机字符串</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import CopyNotification from '@/components/common/CopyNotification.vue';

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
const copyType = ref<'success' | 'error' | 'info' | 'warning'>('success'); // 复制类型
const showCopyMessage = ref(false); // 显示复制消息

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
    if (navigator.clipboard && window.isSecureContext) {
      // 现代浏览器的 Clipboard API
      await navigator.clipboard.writeText(text);
      showCopySuccess('已复制到剪贴板！');
    } else {
      // 兼容旧浏览器的 fallback 方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        showCopySuccess('已复制到剪贴板！');
      } catch (err) {
        console.error('复制失败:', err);
        showCopySuccess('复制失败，请手动复制', 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (err) {
    console.error('复制失败:', err);
    showCopySuccess('复制失败，请手动复制', 'error');
  }
};

const showCopySuccess = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  copyStatus.value = message;
  copyType.value = type;
  showCopyMessage.value = true;
};

const copyAllToClipboard = async () => {
  const allText = batchResults.value.join('\n');
  await copyToClipboard(allText);
};
</script>

<style scoped>
/* StringGenerator 专属样式 - 与父容器 ToolKitView 协调 */

/* 描述区块样式 */
.string-generator .description-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 10px;
}

.string-generator .description {
  margin: 0 0 1rem 0;
  color: #1e40af;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

.string-generator .feature-tags {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.string-generator .feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #3b82f6;
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.string-generator .feature-tag i {
  font-size: 0.7rem;
}

/* 输入标签区块 */
.string-generator .input-label-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.string-generator .input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.string-generator .input-label i {
  color: #3b82f6;
  font-size: 0.8rem;
}

.string-generator .input-hint {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

/* 长度控制 - StringGenerator 专属 */
.string-generator .length-controls {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.string-generator .length-input-group,
.string-generator .max-length-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.string-generator .length-input-group label,
.string-generator .max-length-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.string-generator .length-input,
.string-generator .max-length-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
  font-weight: 600;
  color: #3b82f6;
  background: white;
  transition: all 0.2s ease;
}

.string-generator .length-input:focus,
.string-generator .max-length-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.string-generator .slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.string-generator .length-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.string-generator .length-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.string-generator .length-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.string-generator .slider-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.75rem;
  color: #6b7280;
}

.string-generator .length-info {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

/* 配置区块 - StringGenerator 专属样式 */
.string-generator .config-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.string-generator .config-section h4 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.string-generator .config-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.string-generator .config-group:last-child {
  margin-bottom: 0;
}

.string-generator .checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.string-generator .checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  padding: 0.25rem 0;
}

.string-generator .checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.string-generator .custom-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
  font-family: 'Fira Code', 'Monaco', monospace;
}

.string-generator .custom-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.string-generator .help-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

/* 操作按钮样式 */
.string-generator .action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.string-generator .generate-btn,
.string-generator .batch-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

/* 子区块标题 */
.string-generator .subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0 1rem 0;
  padding: 0 0.5rem 0.75rem 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.string-generator .subsection-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  position: relative;
}

.string-generator .subsection-title::after {
  content: '';
  position: absolute;
  bottom: -0.75rem;
  left: 0;
  width: 2rem;
  height: 2px;
  background: #3b82f6;
}

.string-generator .charset-stats {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

/* 字符集预览 */
.string-generator .charset-preview {
  margin: 1rem 0;
  padding: 0.5rem;
}

.string-generator .charset-display {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
}

.string-generator .charset-display code {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.875rem;
  color: #1e293b;
  word-break: break-all;
  line-height: 1.5;
}

/* 单个结果显示 */
.string-generator .single-result {
  margin: 1rem 0;
  padding: 0.5rem;
}

.string-generator .result-display {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.string-generator .result-content {
  padding: 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.string-generator .result-content code {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
  letter-spacing: 0.025em;
  word-break: break-all;
  line-height: 1.6;
}

.string-generator .result-info {
  padding: 1rem 1.25rem;
  background: white;
  display: flex;
  gap: 2rem;
}

.string-generator .info-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.string-generator .info-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.string-generator .info-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
}

/* 批量结果网格 */
.string-generator .batch-results {
  margin: 1rem 0;
  padding: 0.5rem;
}

.string-generator .batch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0.5rem;
  max-height: 50vh;
  overflow-y: auto;
}

.string-generator .batch-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.string-generator .batch-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.string-generator .batch-index {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 32px;
  text-align: center;
}

.string-generator .batch-content {
  flex: 1;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 600;
  word-break: break-all;
  line-height: 1.4;
}

.string-generator .copy-icon {
  font-size: 0.8rem;
  color: #6b7280;
  opacity: 0;
  transition: all 0.3s ease;
}

.string-generator .batch-item:hover .copy-icon {
  opacity: 1;
  color: #3b82f6;
  transform: scale(1.1);
}

.string-generator .batch-summary {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  margin-top: 1rem;
}

/* 空状态 - 优雅的空状态展示 */
.string-generator .empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.string-generator .empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.string-generator .empty-state h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: #374151;
  font-weight: 600;
}

.string-generator .empty-state p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 滚动条样式 */
.string-generator .batch-grid::-webkit-scrollbar {
  width: 6px;
}

.string-generator .batch-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.string-generator .batch-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.string-generator .batch-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 - 移动端优化 */
@media (max-width: 768px) {
  .string-generator .description-section {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .string-generator .feature-tags {
    gap: 0.5rem;
    justify-content: center;
  }

  .string-generator .feature-tag {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .string-generator .input-label-section {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .string-generator .length-controls {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.75rem;
  }

  .string-generator .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .string-generator .generate-btn,
  .string-generator .batch-btn {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }

  .string-generator .batch-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.25rem;
  }

  .string-generator .batch-item {
    padding: 0.75rem;
  }

  .string-generator .result-info {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .string-generator .copy-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .string-generator .description {
    font-size: 0.9rem;
  }

  .string-generator .config-section {
    padding: 0.75rem;
    margin: 0.75rem 0;
  }

  .string-generator .subsection-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    padding: 0 0.25rem 0.75rem 0.25rem;
  }

  .string-generator .batch-summary {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
}
</style>


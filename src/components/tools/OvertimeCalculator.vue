<template>
  <div class="overtime-calculator">
    <div class="tool-layout">
      <!-- 左侧输入区域 -->
      <div class="input-section">
        <div class="section-header">
          <h3>输入加班数据</h3>
          <div class="actions">
            <button @click="clearInput" class="btn btn-secondary">
              <i class="fas fa-trash"></i> 清空
            </button>
            <button @click="calculateOvertime" class="btn btn-primary">
              <i class="fas fa-calculator"></i> 计算
            </button>
          </div>
        </div>
        <div class="json-input-area">
          <label>加班数据 (JSON格式)</label>
          <div class="json-info">
            <i class="fas fa-info-circle"></i>
            <span>请输入JSON格式的加班数据，数据可从<a
                href="https://hr.quectel.com/portal/index">https://hr.quectel.com/portal/index</a>中获取，该页面只负责解析处理，不会保留用户数据</span>
          </div>
          <textarea v-model="jsonInput" class="json-input" @input="validateJson"></textarea>
          <div v-if="validationError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ validationError }}
          </div>
        </div>
      </div>

      <!-- 右侧输出区域 -->
      <div class="output-section">
        <div class="section-header">
          <h3>加班时间统计</h3>
          <div class="actions">
            <button @click="copyResults" class="btn btn-secondary">
              <i class="fas fa-copy"></i> 复制
            </button>
            <button @click="downloadResults" class="btn btn-secondary">
              <i class="fas fa-download"></i> 下载
            </button>
          </div>
        </div>
        <div class="result-container" :class="{ loading: isLoading }">
          <div v-if="isLoading" class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>计算中...</span>
          </div>
          <div v-else-if="error" class="error-container">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>
          <div v-else-if="!results" class="empty-result">
            <i class="fas fa-info-circle"></i>
            <span>请输入加班数据并点击"计算"按钮</span>
          </div>
          <div v-else class="result-content-wrapper">
            <pre class="result-content">{{ results }}</pre>
          </div>
        </div>

        <!-- 统计摘要 -->
        <div v-if="results" class="summary-section">
          <h4>加班统计摘要</h4>
          <div class="summary-items">
            <div class="summary-item">
              <span class="summary-label">总加班时长:</span>
              <span class="summary-value">{{ summaryData.totalHours }} 小时</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">工作日加班:</span>
              <span class="summary-value">{{ summaryData.workdayHours }} 小时</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">周末加班:</span>
              <span class="summary-value">{{ summaryData.weekendHours }} 小时</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">节假日加班:</span>
              <span class="summary-value">{{ summaryData.holidayHours }} 小时</span>
            </div>
            <div class="summary-item total">
              <span class="summary-label">预计加班费:</span>
              <span class="summary-value">¥ {{ summaryData.totalPay }}</span>
            </div>
          </div>
          <div class="rank-info">
            <span class="rank-label">级别评价:</span>
            <span class="rank-value" :class="'rank-' + summaryData.rankLevel">{{ summaryData.rankText }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';

// 表单数据
const jsonInput = ref(getDefaultJsonData());

// 结果数据
const results = ref('');
const isLoading = ref(false);
const error = ref('');
const validationError = ref('');

// 统计数据
const summaryData = reactive({
  totalHours: 0,
  workdayHours: 0,
  weekendHours: 0,
  holidayHours: 0,
  totalPay: 0,
  rankLevel: '',
  rankText: ''
});

// 获取示例JSON数据
function getDefaultJsonData(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `
  [
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_1",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_1",
      "ID": "10000001",
      "CARDTIME": "2025-02-17 09:00:00",
      "SHIFTTERM": "2025-02-17",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_2",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_2",
      "ID": "10000002",
      "CARDTIME": "2025-02-17 18:00:00",
      "SHIFTTERM": "2025-02-17",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_3",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_3",
      "ID": "10000003",
      "CARDTIME": "2025-02-18 09:00:00",
      "SHIFTTERM": "2025-02-18",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_4",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_4",
      "ID": "10000004",
      "CARDTIME": "2025-02-18 20:00:00",
      "SHIFTTERM": "2025-02-18",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_5",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_5",
      "ID": "10000005",
      "CARDTIME": "2025-02-22 09:00:00",
      "SHIFTTERM": "2025-02-22",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_6",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_6",
      "ID": "10000006",
      "CARDTIME": "2025-02-22 21:00:00",
      "SHIFTTERM": "2025-02-22",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_7",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_7",
      "ID": "10000007",
      "CARDTIME": "2025-02-23 10:00:00",
      "SHIFTTERM": "2025-02-23",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_8",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_8",
      "ID": "10000008",
      "CARDTIME": "2025-02-23 19:00:00",
      "SHIFTTERM": "2025-02-23",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_9",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_9",
      "ID": "10000009",
      "CARDTIME": "2025-02-29 09:00:00",
      "SHIFTTERM": "2025-02-29",
      "K_LOCKED": ""
    },
    {
      "K_EXTRAS": "EXAMPLE_EXTRAS_10",
      "EMPID": "10001",
      "K_PKEYS": "EXAMPLE_PKEYS_10",
      "ID": "10000010",
      "CARDTIME": "2025-02-29 22:00:00",
      "SHIFTTERM": "2025-02-29",
      "K_LOCKED": ""
    }
  ]
  `
}

// 验证JSON输入
function validateJson(): void {
  if (!jsonInput.value.trim()) {
    validationError.value = '';
    return;
  }

  try {
    JSON.parse(jsonInput.value);
    validationError.value = '';
  } catch (err: any) {
    validationError.value = `JSON格式错误: ${err.message}`;
  }
}

// 清空输入
function clearInput(): void {
  jsonInput.value = getDefaultJsonData();
  validationError.value = '';
}

// 计算加班时间
async function calculateOvertime(): Promise<void> {
  // 验证输入
  if (!jsonInput.value.trim()) {
    error.value = '请输入加班数据';
    return;
  }

  validateJson();
  if (validationError.value) {
    error.value = validationError.value;
    return;
  }

  // 清空错误和结果
  error.value = '';
  results.value = '';
  isLoading.value = true;

  try {
    // 直接使用JSON输入作为请求数据
    const requestData = JSON.parse(jsonInput.value);

    // 发送请求到API

    // 发送请求到API
    const response = await axios.post('/api/http/overtime/calculate', requestData);

    if (response.status === 200 && response.data) {
      results.value = response.data.result || '计算完成，但没有返回数据';
      parseResults(results.value);
    } else {
      error.value = '计算失败: 服务器未返回有效数据';
    }
  } catch (err: any) {
    error.value = `计算失败: ${err.message || '未知错误'}`;
  } finally {
    isLoading.value = false;
  }
}

// 解析结果，提取摘要数据
function parseResults(resultStr: string): void {
  try {
    // 解析总加班时长
    const totalHoursMatch = resultStr.match(/总加班时长: (\d+(\.\d+)?)/);
    summaryData.totalHours = totalHoursMatch ? parseFloat(totalHoursMatch[1]) : 0;

    // 解析工作日加班
    const workdayMatch = resultStr.match(/工作日加班时长: (\d+(\.\d+)?)/);
    summaryData.workdayHours = workdayMatch ? parseFloat(workdayMatch[1]) : 0;

    // 解析周末加班
    const weekendMatch = resultStr.match(/周末加班时长: (\d+(\.\d+)?)/);
    summaryData.weekendHours = weekendMatch ? parseFloat(weekendMatch[1]) : 0;

    // 解析节假日加班
    const holidayMatch = resultStr.match(/节假日加班时长: (\d+(\.\d+)?)/);
    summaryData.holidayHours = holidayMatch ? parseFloat(holidayMatch[1]) : 0;

    // 解析总收入
    const totalPayMatch = resultStr.match(/扣减后总收入: (\d+(\.\d+)?)/);
    summaryData.totalPay = totalPayMatch ? parseFloat(totalPayMatch[1]) : 0;

    // 解析评级 - 使用正则表达式提取级别
    const rankMatch = resultStr.match(/鉴定您的级别为：\s*([^\n]*)/);
    if (rankMatch && rankMatch[1]) {
      const rankText = rankMatch[1].trim();
      summaryData.rankText = rankText;

      // 根据提取的文本设置级别
      if (rankText.includes('李在赣神魔')) {
        summaryData.rankLevel = 'very-low';
      } else if (rankText.includes('不太行')) {
        summaryData.rankLevel = 'low';
      } else if (rankText.includes('一般') || rankText.includes('建议多加点')) {
        summaryData.rankLevel = 'medium';
      } else if (rankText.includes('牛逼')) {
        summaryData.rankLevel = 'high';
      } else if (rankText.includes('逆天')) {
        summaryData.rankLevel = 'very-high';
      } else if (rankText.includes('你是懂加班的')) {
        summaryData.rankLevel = 'expert';
      } else {
        summaryData.rankLevel = 'unknown';
      }
    } else {
      summaryData.rankLevel = 'unknown';
      summaryData.rankText = '未知评级';
    }
  } catch (err) {
    console.error('解析结果时出错:', err);
  }
}

// 复制结果
function copyResults(): void {
  if (!results.value) return;

  navigator.clipboard.writeText(results.value)
    .then(() => {
      // 可以添加一个复制成功的提示
      const originalText = '复制';
      const button = document.querySelector('.output-section .actions button:first-child');
      if (button) {
        const icon = button.querySelector('i');
        if (icon) icon.className = 'fas fa-check';
        button.textContent = ' 已复制';

        setTimeout(() => {
          if (icon) {
            icon.className = 'fas fa-copy';
            button.textContent = '';
            button.appendChild(icon);
            button.appendChild(document.createTextNode(' 复制'));
          }
        }, 2000);
      }
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
}

// 下载结果
function downloadResults(): void {
  if (!results.value) return;

  const blob = new Blob([results.value], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  const currentDate = new Date().toISOString().split('T')[0];

  link.href = URL.createObjectURL(blob);
  link.download = `加班统计_${currentDate}.txt`;
  link.click();

  URL.revokeObjectURL(link.href);
}

// 初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑，例如加载保存的设置等
});
</script>

<style scoped>
.overtime-calculator {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tool-layout {
  display: flex;
  gap: 1.5rem;
  min-height: 600px;
  max-height: 800px;
}

.input-section,
.output-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--vscode-editor-background, #ffffff);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden; /* 防止溢出 */
  height: 100%; /* 确保占满容器高度 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vscode-panel-border, #e0e0e0);
}

.section-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--vscode-foreground, #333333);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--vscode-button-background, #0e639c);
  color: var(--vscode-button-foreground, white);
}

.btn-primary:hover {
  background-color: var(--vscode-button-hoverBackground, #1177bb);
}

.btn-secondary {
  background-color: var(--vscode-button-secondaryBackground, #3a3d41);
  color: var(--vscode-button-secondaryForeground, white);
}

.btn-secondary:hover {
  background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
}

.input-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  color: var(--vscode-input-foreground, #333333);
  font-weight: 500;
}

input[type="month"],
input[type="number"],
textarea {
  padding: 0.5rem;
  background-color: var(--vscode-input-background, #3c3c3c);
  color: var(--vscode-input-foreground, #cccccc);
  border: 1px solid var(--vscode-input-border, #3c3c3c);
  border-radius: 4px;
  font-family: var(--vscode-font-family, 'Consolas, "Courier New", monospace');
}

textarea {
  resize: vertical;
  min-height: 3rem;
}

.json-input-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  /* 防止溢出 */
}

.json-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #f0f7ff;
  border: 1px solid #d0e0f0;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #0066cc;
}

.json-input {
  flex: 1;
  /* 固定高度 */
  font-family: var(--vscode-editor-font-family, 'Consolas, "Courier New", monospace');
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: var(--vscode-input-background, #f5f5f5);
  color: var(--vscode-input-foreground, #333333);
  border: 1px solid var(--vscode-input-border, #d0d0d0);
  border-radius: 4px;
  margin-top: 0.5rem;
  resize: none;
  /* 禁止调整大小，保持布局稳定 */
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: var(--vscode-inputValidation-errorBackground, #5a1d1d);
  color: var(--vscode-inputValidation-errorForeground, #ffffff);
  border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-container {
  position: relative;
  background-color: var(--vscode-editor-background, #f8f8f8);
  border: 1px solid var(--vscode-input-border, #d0d0d0);
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden; /* 更改为hidden以避免双滚动条 */
  height: 200px !important; /* 使用!important强制高度 */
  max-height: 200px !important; /* 最大高度也设置 */
  display: flex; /* 使用flexbox布局 */
  flex-direction: column; /* 垂直排列内容 */
}

.result-container.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0; /* 移除最小高度限制 */
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--vscode-foreground, #cccccc);
}

.loading-spinner i {
  font-size: 2rem;
}

.error-container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--vscode-errorForeground, #f48771);
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  padding: 1rem;
  font-size: 1rem;
  text-align: center;
  min-height: auto; /* 移除固定的最小高度 */
  color: var(--vscode-descriptionForeground, #8a8a8a);
}

.result-content-wrapper {
  flex: 0 1 auto; /* 改为不自动扩展 */
  overflow: auto; /* 只在内容包装器中设置滚动 */
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 100%; /* 确保不会超出父容器 */
}

.result-content {
  padding: 1rem;
  margin: 0;
  font-family: var(--vscode-editor-font-family, 'Consolas, "Courier New", monospace');
  font-size: 0.9rem;
  color: var(--vscode-editor-foreground, #333333);
  white-space: pre-wrap;
  overflow-wrap: break-word;
  width: 100%;
  min-height: auto; /* 不强制最小高度 */
}

.summary-section {
  padding: 1rem 1.5rem;
  background-color: var(--vscode-editor-background, #fff);
  border-radius: 8px;
  margin-top: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  border: 1px solid var(--vscode-panel-border, #e0e0e0);
}

.summary-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--vscode-foreground, #333);
  border-bottom: 1px solid var(--vscode-panel-border, #e0e0e0);
  padding-bottom: 0.5rem;
  font-weight: 600;
}

.summary-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background-color: var(--vscode-sideBar-background, #f7f7f7);
  border: 1px solid var(--vscode-panel-border, #e0e0e0);
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.summary-item.total {
  grid-column: 1 / -1;
  background-color: var(--vscode-editor-inactiveSelectionBackground, #e8f0f8);
  border: 1px solid #c0d0e0;
  padding: 1rem 1.5rem;
}

.summary-label {
  font-size: 0.95rem;
  color: var(--vscode-descriptionForeground, #666);
  font-weight: 500;
}

.summary-value {
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--vscode-foreground, #222);
  letter-spacing: 0.5px;
}

.summary-item.total .summary-value {
  font-size: 1.35rem;
  color: var(--vscode-button-foreground, #0066cc);
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--vscode-sideBar-background, #f7f7f7);
  border: 1px solid var(--vscode-panel-border, #e0e0e0);
  border-radius: 6px;
  margin-top: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.rank-label {
  font-size: 1rem;
  color: var(--vscode-descriptionForeground, #888);
  font-weight: 500;
}

.rank-value {
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.rank-very-low {
  color: #f48771;
}

.rank-low {
  color: #e58833;
}

.rank-medium {
  color: #ddb100;
}

.rank-high {
  color: #89d185;
}

.rank-very-high {
  color: #4ec9b0;
}

.rank-expert {
  color: #9cdcfe;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-layout {
    flex-direction: column;
  }

  .summary-items {
    grid-template-columns: 1fr;
  }
}
</style>
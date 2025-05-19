<template>
  <div class="test-panel">
    <div class="panel-header">
      <h3>API Tester</h3>
      <div class="request-method" :class="api.method.toLowerCase()">
        {{ api.method.toUpperCase() }}
      </div>
    </div>

    <!-- Request Builder -->
    <div class="request-builder">
      <!-- URL Display -->
      <div class="url-display">
        <span class="url-label">URL:</span>
        <code class="url-value">{{ fullRequestUrl }}</code>
        <button 
          @click="copy(fullRequestUrl)" 
          class="copy-btn"
          title="Copy URL"
        >
          <svg-icon name="copy" />
        </button>
      </div>

      <!-- Params Input -->
      <div class="params-section">
        <div v-if="hasPathParams" class="param-group">
          <h4 class="param-group-title">
            <svg-icon name="link" class="icon" />
            Path Params
          </h4>
          <div v-for="param in pathParams" :key="param.name" class="param-item">
            <ParamInput 
              :param="param" 
              v-model="paramValues[param.name]"
              @change="updateUrlPreview"
            />
          </div>
        </div>

        <div v-if="hasQueryParams" class="param-group">
          <h4 class="param-group-title">
            <svg-icon name="search" class="icon" />
            Query Params
          </h4>
          <div v-for="param in queryParams" :key="param.name" class="param-item">
            <ParamInput 
              :param="param" 
              v-model="paramValues[param.name]"
              @change="updateUrlPreview"
            />
          </div>
        </div>

        <div v-if="hasBodyParams" class="param-group">
          <h4 class="param-group-title">
            <svg-icon name="json" class="icon" />
            Body
            <span class="body-format">(application/json)</span>
          </h4>
          <div class="json-editor-container">
            <MonacoEditor
              v-model="requestBody"
              language="json"
              :options="editorOptions"
              @change="validateJson"
            />
            <div v-if="jsonError" class="json-error">
              <svg-icon name="error" /> {{ jsonError }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Controls -->
    <div class="request-controls">
      <button 
        @click="sendRequest" 
        :disabled="loading || hasJsonError"
        class="send-btn"
        :class="{ loading }"
      >
        <span v-if="!loading">
          <svg-icon name="send" /> Send
        </span>
        <span v-else>
          <LoadingSpinner /> Sending...
        </span>
      </button>
      
      <div class="history-controls">
        <button 
          @click="showHistory = !showHistory"
          class="history-btn"
        >
          <svg-icon name="history" /> History
        </button>
        <button 
          @click="clearHistory"
          class="clear-btn"
          v-if="requestHistory.length > 0"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Response Section -->
    <div class="response-section" v-if="response || error">
      <div class="response-header">
        <h4>
          <svg-icon name="response" class="icon" />
          Response
          <span 
            v-if="responseStatus" 
            class="status-badge"
            :class="statusClass"
          >
            {{ responseStatus }}
          </span>
        </h4>
        <div class="response-time" v-if="responseTime">
          Time: {{ responseTime }}ms
        </div>
      </div>

      <div class="response-tabs">
        <button 
          v-for="tab in responseTabs" 
          :key="tab"
          @click="activeResponseTab = tab"
          :class="{ active: activeResponseTab === tab }"
        >
          {{ tab }}
        </button>
      </div>

      <div class="response-content">
        <!-- Pretty JSON -->
        <template v-if="activeResponseTab === 'Pretty' && isJsonResponse">
          <JsonViewer 
            :value="parsedResponse" 
            :expand-depth="2"
            class="json-viewer"
          />
        </template>

        <!-- Raw Response -->
        <template v-else-if="activeResponseTab === 'Raw'">
          <pre class="raw-response">{{ response }}</pre>
        </template>

        <!-- Headers -->
        <template v-else-if="activeResponseTab === 'Headers' && responseHeaders">
          <table class="headers-table">
            <tr v-for="(value, key) in responseHeaders" :key="key">
              <th>{{ key }}</th>
              <td>{{ value }}</td>
            </tr>
          </table>
        </template>

        <!-- Error -->
        <div v-if="error" class="error-message">
          <svg-icon name="warning" />
          <div class="error-details">
            <div class="error-title">{{ error.name || 'Error' }}</div>
            <div class="error-text">{{ error.message }}</div>
            <div v-if="error.stack" class="error-stack">{{ error.stack }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request History -->
    <Transition name="slide-fade">
      <div class="history-panel" v-if="showHistory && requestHistory.length > 0">
        <div class="history-header">
          <h4>History</h4>
          <button @click="showHistory = false" class="close-btn">
            <svg-icon name="close" />
          </button>
        </div>
        <ul class="history-list">
          <li 
            v-for="(item, index) in requestHistory" 
            :key="index"
            @click="loadFromHistory(item)"
            :class="{ active: isHistoryActive(item) }"
          >
            <div class="history-method" :class="item.method.toLowerCase()">
              {{ item.method }}
            </div>
            <div class="history-url">
              {{ item.url }}
            </div>
            <div class="history-status" :class="getStatusClass(item.status)">
              {{ item.status }}
            </div>
            <div class="history-time">
              {{ formatTime(item.timestamp) }}
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import SvgIcon from './SvgIcon.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ParamInput from './ParamInput.vue'
import MonacoEditor from './MonacoEditor.vue'
import JsonViewer from './JsonViewer.vue'
import type { ApiDocument } from '@/types/api'

// 类型定义
interface RequestHistoryItem {
  id: string
  method: string
  url: string
  status?: number
  timestamp: number
  params?: Record<string, any>
  body?: string
}

// 属性
const props = defineProps<{
  api: ApiDocument
}>()

// 响应式状态
const paramValues = ref<Record<string, any>>({})
const requestBody = ref('')
const loading = ref(false)
const response = ref<string | null>(null)
const responseHeaders = ref<Record<string, string> | null>(null)
const responseStatus = ref<number | null>(null)
const responseTime = ref<number | null>(null)
const error = ref<Error | null>(null)
const jsonError = ref<string | null>(null)
const activeResponseTab = ref<'Pretty' | 'Raw' | 'Headers'>('Pretty')
const showHistory = ref(false)
const requestHistory = ref<RequestHistoryItem[]>([])
const editorOptions = ref({
  automaticLayout: true,
  minimap: { enabled: false },
  lineNumbers: 'off',
  scrollBeyondLastLine: false,
  fontSize: 14,
  theme: 'vs-dark'
})

// 计算属性
const pathParams = computed(() => 
  props.api.parameters?.filter(p => p.in === 'path') || []
)

const queryParams = computed(() =>
  props.api.parameters?.filter(p => p.in === 'query') || []
)

const hasPathParams = computed(() => pathParams.value.length > 0)
const hasQueryParams = computed(() => queryParams.value.length > 0)
const hasBodyParams = computed(() => 
  !!props.api.requestBody?.content?.['application/json']
)

const fullRequestUrl = computed(() => {
  let url = props.api.path
  
  // 替换路径参数
  pathParams.value.forEach(p => {
    url = url.replace(`{${p.name}}`, paramValues.value[p.name] || `:${p.name}`)
  })
  
  // 添加查询参数
  const query = queryParams.value
    .map(p => `${p.name}=${paramValues.value[p.name] || ''}`)
    .filter(p => p.includes('='))
    .join('&')
  
  return query ? `${url}?${query}` : url
})

const isJsonResponse = computed(() => 
  responseHeaders.value?.['content-type']?.includes('application/json')
)

const parsedResponse = computed(() => {
  if (!response.value || !isJsonResponse.value) return null
  try {
    return JSON.parse(response.value)
  } catch {
    return null
  }
})

const statusClass = computed(() => {
  if (!responseStatus.value) return ''
  return responseStatus.value >= 200 && responseStatus.value < 300 
    ? 'success' 
    : responseStatus.value >= 400 && responseStatus.value < 500
      ? 'client-error'
      : 'server-error'
})

const hasJsonError = computed(() => !!jsonError.value)

const responseTabs = computed(() => {
  const tabs: ('Pretty' | 'Raw' | 'Headers')[] = []
  if (isJsonResponse.value) tabs.push('Pretty')
  tabs.push('Raw')
  if (responseHeaders.value) tabs.push('Headers')
  return tabs
})

// 方法
const { copy } = useClipboard()

const updateUrlPreview = () => {
  // 触发响应式更新
}

const validateJson = () => {
  if (!requestBody.value) {
    jsonError.value = null
    return
  }
  
  try {
    JSON.parse(requestBody.value)
    jsonError.value = null
  } catch (e) {
    jsonError.value = '无效的JSON格式'
  }
}

const sendRequest = async () => {
  loading.value = true
  response.value = null
  error.value = null
  responseHeaders.value = null
  responseStatus.value = null
  const startTime = Date.now()
  
  try {
    // 构建URL
    let url = props.api.path
    pathParams.value.forEach(p => {
      url = url.replace(`{${p.name}}`, encodeURIComponent(paramValues.value[p.name] || ''))
    })
    
    // 添加查询参数
    const query = queryParams.value
      .map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(paramValues.value[p.name] || '')}`)
      .filter(p => !p.endsWith('='))
      .join('&')
    
    if (query) url += (url.includes('?') ? '&' : '?') + query
    
    // 请求配置
    const options: RequestInit = { 
      method: props.api.method.toUpperCase(),
      headers: {}
    }
    
    // 添加请求体
    if (hasBodyParams.value && requestBody.value) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      }
      options.body = requestBody.value
    }
    
    const res = await fetch(url, options)
    responseStatus.value = res.status
    responseHeaders.value = Object.fromEntries(res.headers.entries())
    
    const text = await res.text()
    response.value = text
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
    
    // 保存到历史记录
    saveToHistory({
      method: props.api.method,
      url,
      status: res.status,
      params: { ...paramValues.value },
      body: requestBody.value
    })
  } catch (err) {
    error.value = err instanceof Error ? err : new Error(String(err))
  } finally {
    loading.value = false
    responseTime.value = Date.now() - startTime
  }
}

const saveToHistory = (item: Omit<RequestHistoryItem, 'id' | 'timestamp'>) => {
  const historyItem: RequestHistoryItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...item
  }
  
  requestHistory.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (requestHistory.value.length > 10) {
    requestHistory.value.pop()
  }
  
  // 保存到localStorage
  localStorage.setItem('apiTesterHistory', JSON.stringify(requestHistory.value))
}

const loadFromHistory = (item: RequestHistoryItem) => {
  // 加载参数
  if (item.params) {
    paramValues.value = { ...item.params }
  }
  
  // 加载请求体
  if (item.body) {
    requestBody.value = item.body
  }
  
  showHistory.value = false
}

const clearHistory = () => {
  requestHistory.value = []
  localStorage.removeItem('apiTesterHistory')
}

const getStatusClass = (status?: number) => {
  if (!status) return ''
  return status >= 200 && status < 300 
    ? 'success' 
    : status >= 400 && status < 500
      ? 'client-error'
      : 'server-error'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const isHistoryActive = (item: RequestHistoryItem) => {
  return item.url === fullRequestUrl.value && 
         item.method === props.api.method.toUpperCase()
}

// 初始化
onMounted(() => {
  // 从localStorage加载历史记录
  const savedHistory = localStorage.getItem('apiTesterHistory')
  if (savedHistory) {
    try {
      requestHistory.value = JSON.parse(savedHistory)
    } catch {
      requestHistory.value = []
    }
  }
  
  // 初始化请求体
  if (hasBodyParams.value) {
    const schema = props.api.requestBody?.content?.['application/json']?.schema
    if (schema?.example) {
      requestBody.value = JSON.stringify(schema.example, null, 2)
    } else {
      requestBody.value = '{\n  \n}'
    }
  }
  
  // 初始化参数默认值
  props.api.parameters?.forEach(param => {
    if (param.schema?.example !== undefined) {
      paramValues.value[param.name] = param.schema.example
    }
  })
})
</script>

<style scoped>
.test-panel {
  --success-color: #10b981;
  --client-error-color: #f59e0b;
  --server-error-color: #ef4444;
  --primary-color: #3b82f6;
  --text-color: #333;
  --border-color: #e5e7eb;
  --bg-color: #fff;
  --hover-bg: #f9fafb;
  --code-bg: #f3f4f6;
  --dark-bg: #1e293b;
  --dark-text: #e2e8f0;
  
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-color);
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--dark-bg);
  color: white;
}

.request-method {
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
  
  &.get { background: #61affe; }
  &.post { background: #49cc90; }
  &.put { background: #fca130; }
  &.delete { background: #f93e3e; }
  &.patch { background: #50e3c2; }
}

.request-builder {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.url-display {
  display: flex;
  align-items: center;
  background: var(--code-bg);
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-family: 'Fira Code', monospace;
}

.url-label {
  font-weight: 500;
  margin-right: 8px;
  color: #6b7280;
}

.url-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(0,0,0,0.05);
    color: var(--primary-color);
  }
}

.param-group {
  margin-bottom: 20px;
}

.param-group-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #374151;
  
  .icon {
    margin-right: 8px;
    color: #6b7280;
  }
}

.body-format {
  font-weight: normal;
  color: #6b7280;
  margin-left: 6px;
  font-size: 14px;
}

.json-editor-container {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  height: 200px;
}

.json-error {
  color: var(--server-error-color);
  font-size: 13px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  
  .icon {
    margin-right: 6px;
  }
}

.request-controls {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid var(--border-color);
}

.send-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &.loading {
    background: #93c5fd;
  }
  
  .icon {
    margin-right: 8px;
  }
}

.history-controls {
  display: flex;
  gap: 8px;
}

.history-btn, .clear-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background: var(--hover-bg);
  }
}

.clear-btn {
  color: #ef4444;
  border-color: #fecaca;
}

.response-section {
  padding: 16px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h4 {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: 15px;
  }
  
  .icon {
    margin-right: 8px;
    color: #6b7280;
  }
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
  
  &.success {
    background: #d1fae5;
    color: #065f46;
  }
  
  &.client-error {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.server-error {
    background: #fee2e2;
    color: #991b1b;
  }
}

.response-time {
  font-size: 13px;
  color: #6b7280;
}

.response-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 12px;
  
  button {
    padding: 8px 16px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    
    &.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      font-weight: 500;
    }
    
    &:hover:not(.active) {
      color: #4b5563;
    }
  }
}

.raw-response {
  background: var(--code-bg);
  padding: 12px;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  overflow-x: auto;
  margin: 0;
}

.json-viewer {
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
}

.headers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  
  th, td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    font-weight: 500;
    color: #4b5563;
    width: 30%;
  }
}

.error-message {
  background: #fef2f2;
  border-left: 4px solid var(--server-error-color);
  padding: 12px;
  border-radius: 0 4px 4px 0;
  margin-top: 16px;
  display: flex;
  
  .icon {
    color: var(--server-error-color);
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .error-title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .error-text {
    font-size: 14px;
  }
  
  .error-stack {
    font-family: 'Fira Code', monospace;
    font-size: 12px;
    color: #6b7280;
    margin-top: 8px;
  }
}

.history-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 350px;
  background: var(--bg-color);
  box-shadow: -4px 0 12px rgba(0,0,0,0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h4 {
    margin: 0;
    font-size: 15px;
  }
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: var(--text-color);
  }
}

.history-list {
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.history-list li {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background: var(--hover-bg);
  }
  
  &.active {
    background: #eff6ff;
  }
}

.history-method {
  font-weight: bold;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  
  &.get { background: #dbeafe; color: #1d4ed8; }
  &.post { background: #dcfce7; color: #166534; }
  &.put { background: #fef3c7; color: #92400e; }
  &.delete { background: #fee2e2; color: #991b1b; }
}

.history-url {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-status {
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  
  &.success { color: var(--success-color); }
  &.client-error { color: var(--client-error-color); }
  &.server-error { color: var(--server-error-color); }
}

.history-time {
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
}

/* 过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .test-panel {
    --text-color: #e2e8f0;
    --bg-color: #1e293b;
    --border-color: #334155;
    --hover-bg: #334155;
    --code-bg: #0f172a;
    
    .request-controls {
      background: #0f172a;
    }
    
    .param-group-title {
      color: #e2e8f0;
    }
    
    .history-list li.active {
      background: #334155;
    }
  }
}
</style>
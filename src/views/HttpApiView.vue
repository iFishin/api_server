<template>
    <div class="http-api-container">
        <!-- API侧边栏导航 -->
        <div class="api-sidebar">
            <div class="sidebar-header">
                <h3>HTTP</h3>
            </div>
            <div class="api-search">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        v-model="searchTerm" 
                        placeholder="搜索API..." 
                        class="search-input"
                    />
                    <i v-if="searchTerm" @click="clearSearch" class="fas fa-times clear-search"></i>
                </div>
            </div>
            <div class="api-categories">
                <div v-for="(group, method) in groupedApis" :key="method" class="api-category">
                    <div class="category-header" @click="toggleCategory(method)">
                        <div class="method-badge" :class="method.toLowerCase()">{{ method }}</div>
                        <span class="category-count">{{ group.length }}</span>
                        <i class="fas" :class="expandedCategories[method] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    </div>
                    <div class="category-items" v-show="expandedCategories[method]">
                        <div 
                            v-for="api in group" 
                            :key="api.operationId" 
                            class="api-item"
                            :class="{ 'active': selectedApiId === api.operationId }"
                            @click="scrollToApi(api.operationId)"
                        >
                            <span class="api-item-path">{{ api.path.split('/').pop() || api.path }}</span>
                            <span class="api-item-summary">{{ truncate(api.summary, 30) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- API文档内容 -->
        <div class="api-doc-viewer">
            <h1 class="main-title">HTTP API Documentation</h1>
            
            <div v-if="loading" class="loading-state">
                <div class="loader">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                正在加载API文档...
            </div>

        <div v-else-if="error" class="error-state">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="error-details">
                <div class="error-message">加载文档失败: {{ error }}</div>
                <p class="error-help">可能的原因：服务器未启动、API路径已更改或者网络问题</p>
                <button @click="retryLoading">
                    <i class="fas fa-sync-alt"></i> 重试
                </button>
                <button @click="showDebugInfo = !showDebugInfo" class="debug-button">
                    <i class="fas" :class="showDebugInfo ? 'fa-eye-slash' : 'fa-eye'"></i>
                    {{ showDebugInfo ? '隐藏' : '显示' }}调试信息
                </button>
                <div v-if="showDebugInfo" class="debug-info">
                    <p><strong><i class="fas fa-link"></i> 当前 API 路径:</strong> /api/docs</p>
                    <p><strong><i class="fas fa-check-circle"></i> 请确认:</strong> 后端已正确实现 /api/docs 接口</p>
                </div>
            </div>
        </div>

        <template v-else>
            <div v-for="api in apis" :key="api.operationId" class="api-section" :id="api.operationId">
                <!-- 接口头部信息 -->
                <div class="api-header">
                    <div class="method-tag" :class="api.method ? api.method.toLowerCase() : ''">
                        {{ api.method || 'UNKNOWN' }}
                    </div>
                    <h2 class="api-title">{{ api.summary }}</h2>
                    <div class="api-tags">
                        <span v-for="tag in api.tags" :key="tag" class="api-tag">{{ tag }}</span>
                    </div>
                </div>

                <!-- 接口主体内容 -->
                <div class="api-body">
                    <!-- 左侧文档信息 -->
                    <div class="api-docs">
                        <div class="docs-section">
                            <h3>Endpoint</h3>
                            <code class="endpoint">{{ api.path }}</code>
                        </div>

                        <div v-if="api.description" class="docs-section">
                            <h3>Description</h3>
                            <div class="markdown-content" v-html="renderMarkdown(api.description)"></div>
                        </div>

                        <!-- 参数分类展示 -->
                        <template v-if="api.parameters && api.parameters.length">
                            <div class="docs-section">
                                <h3>Parameters</h3>
                                <div class="parameters-grid">
                                    <!-- 路径参数 -->
                                    <div v-if="api.parameters.some((p: any) => p.in === 'path')" class="param-group">
                                        <h4>Path Parameters</h4>
                                        <div v-for="param in api.parameters.filter((p: any) => p.in === 'path')" :key="param.name" class="param-item">
                                            <ParamDetail :param="param" />
                                        </div>
                                    </div>

                                    <!-- 查询参数 -->
                                    <div v-if="api.parameters.some((p: any) => p.in === 'query')" class="param-group">
                                        <h4>Query Parameters</h4>
                                        <div v-for="param in api.parameters?.filter((p: any) => p.in === 'query')" :key="param.name" class="param-item">
                                            <ParamDetail :param="param" />
                                        </div>
                                    </div>

                                    <!-- 请求体参数 -->
                                    <div v-if="getRequestSchema(api)" class="param-group">
                                        <h4>Request Body</h4>
                                        <div class="param-item">
                                            <SchemaViewer :schema="getRequestSchema(api)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- 响应示例 -->
                        <div class="docs-section">
                            <h3>Responses</h3>
                            <div v-for="(response, code) in api.responses" :key="code" class="response-item">
                                <div class="status-code" :class="statusCodeClass(code)">HTTP {{ code }}</div>
                                <SchemaViewer v-if="response.content && response.content['application/json'] && response.content['application/json'].schema"
                                    :schema="response.content['application/json'].schema" />
                            </div>
                        </div>
                    </div>

                    <!-- 右侧测试面板 -->
                    <div class="api-test-panel">
                        <TestPanel 
                            :api="api"
                            @test-start="handleTestStart"
                            @test-result="handleTestResult"
                        />
                    </div>
                </div>
            </div>
        </template>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import type { ApiDocument } from '@/types/api'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import api from '@/utils/api'

// 引入子组件
import ParamDetail from '@components/ParamDetail.vue'
import SchemaViewer from '@components/SchemaViewer.vue'
import TestPanel from '@components/TestPanel.vue'

// 响应式状态
const apis = ref<ApiDocument[]>([])
const filteredApis = ref<ApiDocument[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const apiGroup = ref('http') // 默认加载HTTP API组
const searchTerm = ref('')
const selectedApiId = ref<string | null>(null)
const expandedCategories = ref<Record<string, boolean>>({})
const showDebugInfo = ref(false) // 调试信息显示控制

// 按HTTP方法分组的API
const groupedApis = computed(() => {
  const grouped: Record<string, ApiDocument[]> = {}
  
  filteredApis.value.forEach(api => {
    const method = api.method?.toUpperCase() || 'UNKNOWN'
    if (!grouped[method]) {
      grouped[method] = []
    }
    grouped[method].push(api)
  })
  
  // 按常用方法排序
  const orderedGroups: Record<string, ApiDocument[]> = {}
  const methodOrder = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'UNKNOWN']
  
  methodOrder.forEach(method => {
    if (grouped[method] && grouped[method].length > 0) {
      orderedGroups[method] = grouped[method]
    }
  })
  
  // 将其他不在上述顺序中的方法也添加进来
  Object.keys(grouped).forEach(method => {
    if (!orderedGroups[method]) {
      orderedGroups[method] = grouped[method]
    }
  })
  
  return orderedGroups
})

// 辅助函数 - 文本截断
const truncate = (text: string, length: number): string => {
    return text.length > length ? text.substring(0, length) + '...' : text
}

// 切换分类展开/折叠
const toggleCategory = (method: string) => {
    expandedCategories.value[method] = !expandedCategories.value[method]
}

// 清除搜索
const clearSearch = () => {
    searchTerm.value = ''
}

// 滚动到指定API
const scrollToApi = async (apiId: string) => {
    selectedApiId.value = apiId
    await nextTick()
    
    const element = document.getElementById(apiId)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

// 获取指定 API 的请求体 schema
const getRequestSchema = (api: ApiDocument) => 
    api.requestBody?.content?.['application/json']?.schema;

// 方法
const fetchAPIDocs = async () => {
    try {
        loading.value = true
        error.value = null
        const response = await api.get(`/api/docs`, {
            params: { group: apiGroup.value }
        })
        // 直接使用响应数据，不再假设有 data 属性包装
        apis.value = Array.isArray(response.data) ? response.data : []
        filteredApis.value = apis.value
        
        // 默认所有分类为折叠状态
        const methods = new Set(apis.value.map(api => api.method?.toUpperCase() || 'UNKNOWN'))
        methods.forEach(method => {
            expandedCategories.value[method] = false
        })
        
        // 如果没有API，设置错误信息
        if (apis.value.length === 0) {
            error.value = "没有找到API文档"
        }
        
    } catch (err: any) {
        if (err.response) {
            // 服务器响应了错误状态码
            error.value = `HTTP ${err.response.status}: ${err.response.data?.message || err.message}`
        } else if (err.request) {
            // 请求已发出但没有收到响应
            error.value = 'No response from server'
        } else {
            // 其他错误
            error.value = err.message || 'Unknown error'
        }
    } finally {
        loading.value = false
    }
}

const retryLoading = () => {
    error.value = null
    fetchAPIDocs()
}

const renderMarkdown = (content: string) => {
    marked.setOptions({
        async: false,
        highlight: function(code: string, lang: string) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value
            }
            return code
        }
    } as any)
    return marked.parse(content)
}

// 测试面板事件处理
const handleTestStart = () => {}
const handleTestResult = (_result: any) => {}

// 状态码样式
const statusCodeClass = (code: string | number) => {
    const num = Number(code)
    if (num >= 200 && num < 300) return 'success'
    if (num >= 400 && num < 500) return 'client-error'
    if (num >= 500) return 'server-error'
    return ''
}

// 监听搜索词变化
watch(searchTerm, (newVal) => {
    if (!newVal) {
        filteredApis.value = apis.value // 重置为所有API
    } else {
        const searchLower = newVal.toLowerCase()
        filteredApis.value = apis.value.filter(api => 
            api.summary?.toLowerCase().includes(searchLower) || 
            api.path?.toLowerCase().includes(searchLower) || 
            api.description?.toLowerCase().includes(searchLower) ||
            api.method?.toLowerCase().includes(searchLower)
        )
    }
})

// 自动加载
onMounted(fetchAPIDocs)
</script>

<style scoped>
.api-doc-viewer {
    width: 100%;
    margin: 0 auto;
    padding: 2.5rem 2rem 3rem 2rem;
    background: #f7f9fb;
    border-radius: 18px;
    box-shadow: 0 6px 32px 0 rgba(30, 34, 90, 0.08), 0 1.5px 4px 0 rgba(30, 34, 90, 0.04);
    max-height: calc(100vh - 80px);
    overflow-y: auto;
}
.main-title {
    font-size: 2.4rem;
    font-weight: 700;
    margin-bottom: 2.5rem;
    letter-spacing: 0.02em;
    color: #1a2233;
    text-shadow: 0 2px 8px rgba(30,34,90,0.04);
}
.api-section {
    border-radius: 14px;
    padding: 2rem 2rem 1.5rem 2rem;
    margin-bottom: 2.2rem;
    border: none;
    background: #fff;
    box-shadow: 0 2px 16px 0 rgba(30, 34, 90, 0.06);
    transition: box-shadow 0.2s;
}
.api-section:hover {
    box-shadow: 0 6px 32px 0 rgba(30, 34, 90, 0.10);
}
.api-header {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
}
.method-tag {
    font-weight: 700;
    padding: 0.28rem 1.1rem;
    border-radius: 6px;
    color: #fff;
    text-transform: uppercase;
    font-size: 1.08rem;
    letter-spacing: 0.04em;
    box-shadow: 0 1px 4px rgba(30,34,90,0.08);
    border: none;
}
.method-tag.get { background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%); }
.method-tag.post { background: linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%); }
.method-tag.put { background: linear-gradient(90deg, #ffe259 0%, #ffa751 100%); color: #333; }
.method-tag.delete { background: linear-gradient(90deg, #ff5858 0%, #f09819 100%); }
.method-tag.options { background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%); }
.method-tag.head { background: linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%); }
.method-tag.patch { background: linear-gradient(90deg, #f7971e 0%, #ffd200 100%); color: #333; }
.method-tag.trace { background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%); }
.method-tag.connect { background: linear-gradient(90deg, #f7971e 0%, #ffd200 100%); color: #333; }
.method-tag.custom {
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    color: #fff;
}

.api-title {
    font-size: 1.45rem;
    font-weight: 600;
    margin: 0;
    color: #1a2233;
}
.api-tags {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
}
.api-tag {
    background: linear-gradient(90deg, #e1e4e8 0%, #f7f9fb 100%);
    color: #4a5568;
    border-radius: 4px;
    padding: 0.22rem 0.7rem;
    font-size: 0.97rem;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(30,34,90,0.03);
}
.api-body {
    display: flex;
    gap: 2.5rem;
}
.api-docs {
    flex: 2.2;
    min-width: 0;
    overflow-y: auto;
    max-height: 600px;
}
.api-test-panel {
    flex: 1;
    position: sticky;
    top: 2rem;
    height: fit-content;
    background: #f9fafb;
    border: 1.5px solid #e3e8f0;
    border-radius: 12px;
    padding: 0.5rem 0.5rem;
    box-shadow: 0 2px 12px rgba(30,34,90,0.06);
    min-width: 50%;
}
.docs-section {
    margin-bottom: 1.6rem;
}
.endpoint {
    background: #f3f6fa;
    padding: 0.28rem 0.7rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', monospace;
    font-size: 1.01rem;
    color: #2d3748;
    letter-spacing: 0.01em;
}
.parameters-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 2.2rem;
}
.param-group {
    min-width: 240px;
    background: #f7f9fb;
    border-radius: 8px;
    padding: 1rem 1.2rem;
    box-shadow: 0 1px 4px rgba(30,34,90,0.03);
}
.param-item {
    margin-bottom: 0.8rem;
}
.status-code {
    display: inline-block;
    padding: 0.28rem 0.95rem;
    border-radius: 5px;
    font-weight: 700;
    margin-bottom: 0.5rem;
    font-size: 1.01rem;
    letter-spacing: 0.02em;
    box-shadow: 0 1px 4px rgba(30,34,90,0.04);
}
.status-code.success { background: #e6f9ed; color: #1e824c; }
.status-code.client-error { background: #fff7e6; color: #b26a00; }
.status-code.server-error { background: #fdeaea; color: #b71c1c; }
.loading-state {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 2.5rem 0;
    text-align: center;
    justify-content: center;
    font-size: 1.15rem;
    color: #4a5568;
}

.error-state {
    display: flex;
    gap: 1.5rem;
    padding: 2.5rem 1rem;
    border-radius: 8px;
    background-color: #fff2f2;
    border: 1px solid #fecaca;
    margin: 1rem 0;
}

.error-icon {
    font-size: 2rem;
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
}
.error-icon i {
    font-size: 2rem;
}

.error-details {
    flex: 1;
}

.error-message {
    font-weight: 500;
    font-size: 1.2rem;
    color: #b91c1c;
    margin-bottom: 0.5rem;
}

.error-help {
    font-size: 0.95rem;
    color: #64748b;
    margin-bottom: 1rem;
}

.debug-info {
    margin-top: 1rem;
    padding: 0.8rem;
    background-color: #f8fafc;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: monospace;
    color: #334155;
}

.debug-button {
    background: #f1f5f9;
    color: #334155;
    margin-left: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
}
.debug-button:hover {
    background: #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
}
.loader i {
    font-size: 1.8rem;
    color: #5b86e5;
}
.markdown-content {
    line-height: 1.7;
    color: #2d3748;
    font-size: 1.04rem;
}
.markdown-content h3 { font-size: 1.18rem; margin: 1.1rem 0 0.7rem 0; font-weight: 600; color: #1a2233; }
.markdown-content code { background: #f3f6fa; padding: 0.22rem 0.5rem; border-radius: 4px; font-size: 0.98em; }
.markdown-content pre { 
    background: #23272e; 
    padding: 1.1rem; 
    border-radius: 8px; 
    overflow-x: auto;
    color: #f8f8f2;
    font-size: 0.98rem;
    margin-bottom: 1.2rem;
    box-shadow: 0 1px 8px rgba(30,34,90,0.07);
}
.markdown-content pre code { background: none; padding: 0; color: inherit; }
button {
    background: linear-gradient(90deg, #5b86e5 0%, #36d1c4 100%);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(30,34,90,0.08);
    transition: background 0.2s, box-shadow 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}
button:hover {
    background: linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%);
    box-shadow: 0 2px 8px rgba(30,34,90,0.12);
}
button i {
    font-size: 0.9rem;
}
@media (max-width: 900px) {
    .api-body {
        flex-direction: column;
        gap: 1.5rem;
    }
    .api-test-panel {
        position: static;
        min-width: 0;
        width: 100%;
        margin-top: 1.5rem;
    }
}
/* HTTP API 容器布局 */
.http-api-container {
    display: flex;
    width: 100%;
    height: calc(100vh - 80px);
    gap: 20px;
}

/* API 侧边栏样式 */
.api-sidebar {
    width: 20%;
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 4px 20px rgba(30, 34, 90, 0.07);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #f7f9fb, #ffffff);
}

.sidebar-header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #1a2233;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.api-search {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 14px;
}

.search-input {
    width: 100%;
    padding: 10px 36px 10px 36px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
}

.search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.clear-search {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s;
}

.clear-search:hover {
    color: #475569;
}

.api-categories {
    flex: 1;
    overflow-y: auto;
}

.api-category {
    border-bottom: 1px solid #e2e8f0;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;
    user-select: none;
}

.category-header:hover {
    background: #f8fafc;
}

.method-badge {
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    color: white;
    text-transform: uppercase;
    min-width: 50px;
    text-align: center;
}

.method-badge.get {
    background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.method-badge.post {
    background: linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%);
}

.method-badge.put {
    background: linear-gradient(90deg, #ffe259 0%, #ffa751 100%);
    color: #333;
}

.method-badge.delete {
    background: linear-gradient(90deg, #ff5858 0%, #f09819 100%);
}

.method-badge.patch {
    background: linear-gradient(90deg, #f7971e 0%, #ffd200 100%);
    color: #333;
}

.method-badge.options, .method-badge.head {
    background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
}

.method-badge.unknown {
    background: linear-gradient(90deg, #a1a1aa 0%, #71717a 100%);
}

.category-count {
    font-size: 13px;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
}

.category-header i {
    margin-left: auto;
    font-size: 12px;
    color: #94a3b8;
    transition: transform 0.2s;
}

.category-items {
    padding: 0 8px 8px 8px;
    background: #f8fafc;
}

.api-item {
    display: flex;
    flex-direction: column;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    border-left: 3px solid transparent;
    margin-bottom: 5px;
}

.api-item:hover {
    background: #f1f5f9;
    transform: translateX(2px);
}

.api-item.active {
    background: #dbeafe;
    border-left-color: #3b82f6;
}

.api-item-path {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 3px;
}

.api-item-summary {
    font-size: 12px;
    color: #64748b;
}

@media (max-width: 1200px) {
    .api-sidebar {
        width: 250px;
        min-width: 250px;
    }
}

@media (max-width: 900px) {
    .http-api-container {
        flex-direction: column;
        height: auto;
    }
    
    .api-sidebar {
        width: 100%;
        max-height: 300px;
        min-height: 300px;
    }
}

@media (max-width: 600px) {
    .api-doc-viewer {
        padding: 1rem 0.2rem;
    }
    .api-section {
        padding: 1rem 0.5rem;
    }
    .api-test-panel {
        padding: 1rem 0.5rem;
    }
}

/* 自定义滚动条样式 */
.api-doc-viewer::-webkit-scrollbar,
.api-docs::-webkit-scrollbar {
    width: 6px;
}

.api-doc-viewer::-webkit-scrollbar-track,
.api-docs::-webkit-scrollbar-track {
    background: rgba(240, 242, 245, 0.7);
    border-radius: 3px;
}

.api-doc-viewer::-webkit-scrollbar-thumb,
.api-docs::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #5b86e5 0%, #36d1c4 100%);
    border-radius: 3px;
}

.api-doc-viewer::-webkit-scrollbar-thumb:hover,
.api-docs::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #4a75d4 0%, #25c0b3 100%);
}
</style>
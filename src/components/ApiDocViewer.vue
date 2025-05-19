<template>
    <div class="api-doc-viewer">
        <h1 class="main-title">{{ apiGroup }} API Documentation</h1>
        
        <div v-if="loading" class="loading-state">
            <div class="loader"></div>
            Loading API Documentation...
        </div>

        <div v-else-if="error" class="error-state">
            ❌ Failed to load documentation: {{ error }}
            <button @click="retryLoading">Retry</button>
        </div>

        <template v-else>
            <div v-for="api in apis" :key="api.operationId" class="api-section">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiDocument } from '@/types/api'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// 引入子组件
import ParamDetail from './ParamDetail.vue'
import SchemaViewer from './SchemaViewer.vue'
import TestPanel from './TestPanel.vue'
import type any from 'axios'

// 组件配置
const props = defineProps<{
    apiGroup: string
}>()

// 响应式状态
const apis = ref<ApiDocument[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// 获取指定 API 的请求体 schema
const getRequestSchema = (api: ApiDocument) => 
    api.requestBody?.content?.['application/json']?.schema;

// 方法
const fetchAPIDocs = async () => {
    try {
        loading.value = true
        error.value = null
        const res = await fetch(`/api/docs?group=${props.apiGroup}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const { data, message } = await res.json()
        apis.value = data
        console.log('API Docs:', apis.value)
    } catch (err: any) {
        error.value = err instanceof Error ? err.message : 'Unknown error'
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

// 自动加载
onMounted(fetchAPIDocs)
</script>

<style scoped>
.api-doc-viewer {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem 2rem 3rem 2rem;
    background: #f7f9fb;
    border-radius: 18px;
    box-shadow: 0 6px 32px 0 rgba(30, 34, 90, 0.08), 0 1.5px 4px 0 rgba(30, 34, 90, 0.04);
    min-height: 90vh;
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
.loading-state,
.error-state {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 2.5rem 0;
    text-align: center;
    justify-content: center;
    font-size: 1.15rem;
    color: #4a5568;
}
.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #5b86e5;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
}
button:hover {
    background: linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%);
    box-shadow: 0 2px 8px rgba(30,34,90,0.12);
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
</style>
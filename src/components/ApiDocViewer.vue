<!--
 * @Date: 2025-04-19
 * @LastEditors: Fishing
 * @LastEditTime: 2025-04-19
 * @FilePath: \Api_Server\src\components\ApiDocViewer.vue
 * @Description: https://github.com/iFishin
-->
<template>
    <div v-if="hasApiData" class="api-doc-viewer">
        <h1 class="main-title">API Documentation</h1>
        <div v-for="api in apis" :key="api.id" class="api-section">
            <div class="api-header">
                <h2>{{ api.name }}</h2>
                <span :class="['method-badge', api.method.toLowerCase()]">{{ api.method }}</span>
            </div>
            <p class="api-description">{{ api.description }}</p>
            
            <div class="api-content">
                <div class="api-details">
                    <div class="endpoint-box">
                        <label>Endpoint:</label>
                        <code>{{ api.endpoint }}</code>
                    </div>
                    
                    <div class="parameters-section">
                        <h3>Parameters</h3>
                        <div class="parameter-list">
                            <div v-for="param in api.parameters" :key="param.name" class="parameter-item">
                                <div class="param-header">
                                    <span class="param-name">{{ param.name }}</span>
                                    <span class="param-type">{{ param.type }}</span>
                                </div>
                                <p class="param-description">{{ param.description }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="response-section">
                        <h3>Response Example</h3>
                        <pre class="response-block">{{ api.response }}</pre>
                    </div>
                </div>

                <div class="api-test">
                    <h3>Test API</h3>
                    <form @submit.prevent="testApi(api)" class="test-form">
                        <div v-for="param in api.parameters" :key="param.name" class="form-group">
                            <label :for="param.name">{{ param.name }}</label>
                            <input 
                                :type="param.type === 'number'? 'number' : 'text'" 
                                v-model="testParams[param.name]" 
                                :id="param.name"
                                :placeholder="param.description"
                            >
                        </div>
                        <button type="submit">发送请求</button>
                    </form>
                    <div v-if="testResult" class="test-result">
                        <pre>{{ testResult }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

interface Api {
    id: number
    name: string,
    method: string,
    endpoint: string,
    description: string,
    parameters: Array<{
        name: string,
        type: string,
        description: string
    }>,
    response: string
}

const currentPageTitle = computed(() => store.state.currentPageTitle)
const apis = computed(() => store.getters.getApisByType(currentPageTitle.value))
const hasApiData = computed(() => apis.value && apis.value.length > 0)

const testParams = reactive<Record<string, string | number>>({})
const testResult = ref<string | null>(null)

const testApi = async (api: Api) => {
    try {
        testResult.value = '发送请求中...'
        
        let finalEndpoint = '/api' + api.endpoint
        if (api.endpoint.includes('{id}') && testParams.id) {
            finalEndpoint = api.endpoint.replace('{id}', testParams.id.toString())
        }
        const response = await fetch(finalEndpoint, {
            method: api.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: api.method !== 'GET' ? JSON.stringify(testParams) : undefined
        })

        const data = await response.json()
        testResult.value = JSON.stringify(data, null, 2)
    } catch (error) {
        if (error instanceof Error) {
            testResult.value = JSON.stringify({
                status: 'error',
                message: error.message
            }, null, 2)
        }
    }
}

// 使用 defineOptions 定义组件选项
defineOptions({
  name: 'ApiDocViewer'
})
</script>

<style scoped>
.api-doc-viewer {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.main-title {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 2rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 1rem;
}

.api-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    padding: 2rem;
}

.api-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.api-header h2 {
    margin: 0;
    color: #2c3e50;
}

.method-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
}

.get { background: #61affe; color: white; }
.post { background: #49cc90; color: white; }
.put { background: #fca130; color: white; }
.delete { background: #f93e3e; color: white; }

.api-description {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
}

.api-content {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 2rem;
}

.endpoint-box {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
}

.endpoint-box code {
    display: block;
    margin-top: 0.5rem;
    font-size: 1.1rem;
    color: #e83e8c;
}

.parameters-section, .response-section {
    margin-bottom: 2rem;
}

.parameter-list {
    display: grid;
    gap: 1rem;
}

.parameter-item {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
}

.param-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.param-name {
    font-weight: bold;
    color: #2c3e50;
}

.param-type {
    background: #e9ecef;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #666;
}

.param-description {
    color: #666;
    margin: 0;
}

.response-block {
    background: #272822;
    color: #f8f8f2;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
}

.api-test {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 1rem;
}

button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background: #0056b3;
}

.test-result {
    margin-top: 1.5rem;
    background: #272822;
    border-radius: 6px;
    padding: 1rem;
}

.test-result pre {
    color: #f8f8f2;
    margin: 0;
}
</style>
<template>
  <div class="external-services-demo">
    <h1>🔗 外部服务重定向演示</h1>
    
    <div class="info-box">
      <p>点击下面的链接将会重定向到对应端口的外部服务</p>
      <p class="note">⚠️ 请确保目标服务已启动</p>
    </div>

    <div class="services-grid">
      <div 
        v-for="[path, service] in enabledServices" 
        :key="path"
        class="service-card"
      >
        <div class="service-header">
          <i v-if="service.icon" :class="service.icon"></i>
          <h3>{{ service.name }}</h3>
        </div>
        
        <p class="service-description">{{ service.description }}</p>
        
        <div class="service-info">
          <div class="info-item">
            <span class="label">路径:</span>
            <code>{{ path }}</code>
          </div>
          <div class="info-item">
            <span class="label">端口:</span>
            <code>{{ service.port }}</code>
          </div>
          <div class="info-item">
            <span class="label">目标URL:</span>
            <code>{{ getTargetUrl(path) }}</code>
          </div>
        </div>

        <div class="service-actions">
          <!-- 使用 router-link 会触发导航守卫 -->
          <router-link :to="path" class="btn btn-primary">
            <i class="fa-solid fa-arrow-right"></i>
            访问服务
          </router-link>
          
          <!-- 直接链接（绕过路由） -->
          <a :href="getTargetUrl(path)" class="btn btn-secondary" target="_blank">
            <i class="fa-solid fa-external-link"></i>
            新标签打开
          </a>
        </div>
      </div>
    </div>

    <div class="config-section">
      <h2>⚙️ 配置信息</h2>
      <pre><code>{{ configJson }}</code></pre>
      
      <div class="config-actions">
        <button @click="copyConfig" class="btn btn-copy">
          <i class="fa-solid fa-copy"></i>
          复制配置
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>🧪 测试重定向</h2>
      <div class="test-form">
        <input 
          v-model="testPath" 
          type="text" 
          placeholder="输入路径，例如: /pan"
          class="test-input"
        >
        <button @click="testRedirect" class="btn btn-test">
          <i class="fa-solid fa-flask"></i>
          测试
        </button>
      </div>
      
      <div v-if="testResult" class="test-result">
        <h3>测试结果:</h3>
        <pre>{{ testResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  externalServices, 
  getEnabledServices, 
  getServiceUrl,
  getServiceByPath 
} from '@/config/external-services'

const router = useRouter()

// 启用的服务
const enabledServices = computed(() => {
  return Object.entries(getEnabledServices())
})

// 配置 JSON
const configJson = computed(() => {
  return JSON.stringify(externalServices, null, 2)
})

// 测试相关
const testPath = ref('/pan')
const testResult = ref('')

// 获取目标 URL
function getTargetUrl(path: string): string {
  return getServiceUrl(path, path) || '未配置'
}

// 复制配置
function copyConfig() {
  navigator.clipboard.writeText(configJson.value)
    .then(() => {
      alert('配置已复制到剪贴板')
    })
    .catch(() => {
      alert('复制失败，请手动复制')
    })
}

// 测试重定向
function testRedirect() {
  const serviceInfo = getServiceByPath(testPath.value)
  
  if (serviceInfo) {
    const { path, service } = serviceInfo
    const targetUrl = getServiceUrl(path, testPath.value)
    
    testResult.value = `✅ 匹配成功！\n` +
      `服务: ${service.name}\n` +
      `端口: ${service.port}\n` +
      `目标URL: ${targetUrl}\n\n` +
      `将会重定向到: ${targetUrl}`
  } else {
    testResult.value = `❌ 未找到匹配的外部服务\n\n` +
      `路径 "${testPath.value}" 不在配置中`
  }
}
</script>

<style scoped>
.external-services-demo {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 2rem 0 1rem;
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  border-radius: 4px;
}

.info-box p {
  margin: 0.5rem 0;
}

.note {
  color: #ff9800;
  font-weight: 500;
}

/* 服务网格 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.service-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.service-card:hover {
  border-color: #2196f3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
  transform: translateY(-2px);
}

.service-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.service-header i {
  font-size: 2rem;
  color: #2196f3;
}

.service-header h3 {
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0;
}

.service-description {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.service-info {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #666;
  min-width: 70px;
}

code {
  background: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #2196f3;
  font-size: 0.85rem;
}

.service-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #fff;
  color: #2196f3;
  border: 2px solid #2196f3;
}

.btn-secondary:hover {
  background: #e3f2fd;
}

/* 配置区域 */
.config-section {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.config-section pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.6;
}

.config-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-copy,
.btn-test {
  padding: 0.75rem 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-copy:hover {
  background: #45a049;
}

/* 测试区域 */
.test-section {
  background: #fff3e0;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #ff9800;
}

.test-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.test-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
}

.test-input:focus {
  outline: none;
  border-color: #ff9800;
}

.btn-test {
  background: #ff9800;
  padding: 0.75rem 1.5rem;
}

.btn-test:hover {
  background: #f57c00;
}

.test-result {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.test-result pre {
  margin: 0.5rem 0 0;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  color: #2c3e50;
}
</style>

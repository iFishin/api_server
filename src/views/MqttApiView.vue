<template>
  <div class="mqtt-view" :class="{ 'dark-theme': isDarkMode }">
    <!-- Theme Toggle -->
    <div class="theme-toggle">
      <button @click="toggleTheme" class="theme-btn" :title="isDarkMode ? '切换到浅色主题' : '切换到深色主题'">
        <span v-if="isDarkMode">🌞</span>
        <span v-else>🌙</span>
      </button>
    </div>

    <!-- Shortcuts Help Panel -->
    <div v-if="showShortcuts" class="shortcuts-panel">
      <div class="shortcuts-content">
        <div class="shortcuts-header">
          <h3>⌨️ 快捷键</h3>
          <button @click="showShortcuts = false" class="close-btn">✕</button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>K</kbd>
            <span>显示/隐藏快捷键</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>P</kbd>
            <span>发布消息</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>S</kbd>
            <span>订阅主题</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>D</kbd>
            <span>断开连接</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>E</kbd>
            <span>导出数据</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>R</kbd>
            <span>刷新状态</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时监控面板 -->
    <div class="real-time-monitor" v-if="!isLoading">
      <div class="monitor-header">
        <h3>📈 MQTT 实时监控</h3>
        <div class="monitor-controls">
          <button @click="toggleAutoRefresh" class="monitor-btn" :class="{ active: autoRefresh }">
            <span>{{ autoRefresh ? '⏸️' : '▶️' }}</span>
            {{ autoRefresh ? '暂停' : '开始' }}
          </button>
          <span class="refresh-interval">{{ refreshInterval / 1000 }}秒刷新</span>
        </div>
      </div>
      
      <div class="monitor-grid">
        <div class="monitor-card">
          <div class="monitor-icon">🌐</div>
          <div class="monitor-data">
            <div class="monitor-value">{{ brokerStatus ? '在线' : '离线' }}</div>
            <div class="monitor-label">Broker状态</div>
          </div>
        </div>
        
        <div class="monitor-card">
          <div class="monitor-icon">🔗</div>
          <div class="monitor-data">
            <div class="monitor-value">{{ mqttClients.length }}</div>
            <div class="monitor-label">活跃连接</div>
          </div>
        </div>
        
        <div class="monitor-card">
          <div class="monitor-icon">📊</div>
          <div class="monitor-data">
            <div class="monitor-value">{{ messageHistory.length }}</div>
            <div class="monitor-label">消息总数</div>
          </div>
        </div>
        
        <div class="monitor-card">
          <div class="monitor-icon">📝</div>
          <div class="monitor-data">
            <div class="monitor-value">{{ subscriptions.length }}</div>
            <div class="monitor-label">订阅主题</div>
          </div>
        </div>

        <div class="monitor-card">
          <div class="monitor-icon">🔒</div>
          <div class="monitor-data">
            <div class="monitor-value">{{ secureConnections }}</div>
            <div class="monitor-label">安全连接</div>
          </div>
        </div>
        
        <div class="monitor-card">
          <div class="monitor-icon">⚡</div>
          <div class="monitor-data">
            <div class="monitor-value">{{ messagesPerMinute }}</div>
            <div class="monitor-label">消息/分钟</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>正在连接MQTT Broker...</p>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="message error-message">
      <span class="message-icon">⚠️</span>
      {{ error }}
      <button @click="error = ''" class="message-close">✕</button>
    </div>
    
    <div v-if="successMessage" class="message success-message">
      <span class="message-icon">✅</span>
      {{ successMessage }}
      <button @click="successMessage = ''" class="message-close">✕</button>
    </div>

    <!-- Control Panel -->
    <div class="control-panel" v-if="!isLoading">
      <div class="panel-section">
        <div class="section-header">
          <h3>🎛️ MQTT 控制中心</h3>
          <div class="stats-display">
            <span class="stat-chip">
              <span class="stat-icon">🌐</span>
              端口: 1883/8883
            </span>
            <span class="stat-chip">
              <span class="stat-icon">🔗</span>
              {{ mqttClients.length }} 连接
            </span>
            <span class="stat-chip">
              <span class="stat-icon">📝</span>
              {{ subscriptions.length }} 订阅
            </span>
            <!-- 导出按钮 -->
            <button @click="exportData" class="export-btn" :disabled="messageHistory.length === 0">
              <span>💾 导出数据</span>
            </button>
            <!-- 快捷键按钮 -->
            <button @click="showShortcuts = true" class="shortcuts-btn" title="快捷键 (Ctrl+K)">
              <span>⌨️ 快捷键</span>
            </button>
          </div>
        </div>

        <!-- Broker状态卡片 -->
        <div class="status-cards">
          <div class="status-card mqtt-broker" :class="{ active: brokerStatus, inactive: !brokerStatus }">
            <div class="card-header">
              <div class="card-icon">🌐</div>
              <h4>MQTT Broker</h4>
              <div class="status-badge" :class="brokerStatus ? 'online' : 'offline'">
                {{ brokerStatus ? '在线' : '离线' }}
              </div>
            </div>
            <div class="card-content">
              <div class="port-info">
                <div class="port-item">
                  <span class="port-label">标准端口:</span>
                  <span class="port-value">1883</span>
                  <span class="port-status" :class="{ active: standardPortActive }">●</span>
                </div>
                <div class="port-item">
                  <span class="port-label">安全端口:</span>
                  <span class="port-value">8883</span>
                  <span class="port-status" :class="{ active: securePortActive }">●</span>
                </div>
              </div>
              <div class="broker-actions">
                <button @click="toggleBroker" class="action-btn" :class="brokerStatus ? 'stop' : 'start'">
                  {{ brokerStatus ? '停止服务' : '启动服务' }}
                </button>
                <button @click="restartBroker" class="action-btn restart" :disabled="!brokerStatus">
                  🔄 重启
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 连接管理部分 -->
      <div class="panel-section">
        <div class="section-header">
          <h3>🔗 连接管理</h3>
          <div class="connection-controls">
            <select v-model="selectedProtocol" class="protocol-select">
              <option value="mqtt">MQTT (1883)</option>
              <option value="mqtts">MQTTS (8883)</option>
            </select>
            <button @click="showConnectionForm = !showConnectionForm" class="toggle-btn">
              {{ showConnectionForm ? '隐藏' : '新建连接' }}
            </button>
          </div>
        </div>

        <!-- 连接表单 -->
        <div v-if="showConnectionForm" class="connection-form">
          <div class="form-group">
            <label>客户端ID:</label>
            <input v-model="newConnection.clientId" type="text" placeholder="自动生成或手动输入" />
          </div>
          <div class="form-group">
            <label>主机地址:</label>
            <input v-model="newConnection.host" type="text" placeholder="localhost" />
          </div>
          <div class="form-group">
            <label>端口:</label>
            <input v-model="newConnection.port" type="number" :placeholder="selectedProtocol === 'mqtts' ? '8883' : '1883'" />
          </div>
          <div class="form-group">
            <label>用户名:</label>
            <input v-model="newConnection.username" type="text" placeholder="可选" />
          </div>
          <div class="form-group">
            <label>密码:</label>
            <input v-model="newConnection.password" type="password" placeholder="可选" />
          </div>
          <div class="form-group">
            <label>保持连接 (秒):</label>
            <input v-model="newConnection.keepAlive" type="number" placeholder="60" />
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input v-model="newConnection.cleanSession" type="checkbox" />
              清除会话
            </label>
          </div>
          <div class="form-actions">
            <button @click="connectToMqtt" class="action-btn connect">连接</button>
            <button @click="resetConnectionForm" class="action-btn reset">重置</button>
          </div>
        </div>

        <!-- 活跃连接列表 -->
        <div class="connections-list">
          <h4>活跃连接 ({{ mqttClients.length }})</h4>
          <div v-if="mqttClients.length === 0" class="empty-state">
            <div class="empty-icon">🔌</div>
            <p>暂无活跃连接</p>
            <small>创建新连接以开始使用MQTT</small>
          </div>
          <div v-else class="client-cards">
            <div v-for="client in mqttClients" :key="client.id" class="client-card">
              <div class="client-header">
                <div class="client-info">
                  <span class="client-id">{{ client.clientId }}</span>
                  <span class="client-protocol">{{ client.protocol.toUpperCase() }}</span>
                </div>
                <div class="client-status">
                  <span class="status-dot" :class="client.connected ? 'connected' : 'disconnected'"></span>
                  {{ client.connected ? '已连接' : '已断开' }}
                </div>
              </div>
              <div class="client-details">
                <div class="detail-item">
                  <span>地址:</span>
                  <span>{{ client.host }}:{{ client.port }}</span>
                </div>
                <div class="detail-item">
                  <span>连接时间:</span>
                  <span>{{ formatTime(client.connectTime) }}</span>
                </div>
                <div class="detail-item">
                  <span>消息数:</span>
                  <span>{{ client.messageCount || 0 }}</span>
                </div>
              </div>
              <div class="client-actions">
                <button @click="disconnectClient(client.id)" class="action-btn disconnect" :disabled="!client.connected">
                  断开连接
                </button>
                <button @click="selectClient(client)" class="action-btn select">
                  选择
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主题订阅部分 -->
      <div class="panel-section">
        <div class="section-header">
          <h3>📝 主题订阅</h3>
          <button @click="showSubscriptionForm = !showSubscriptionForm" class="toggle-btn">
            {{ showSubscriptionForm ? '隐藏' : '新增订阅' }}
          </button>
        </div>

        <!-- 订阅表单 -->
        <div v-if="showSubscriptionForm" class="subscription-form">
          <div class="form-group">
            <label>主题:</label>
            <input v-model="newSubscription.topic" type="text" placeholder="例如: sensor/temperature" />
          </div>
          <div class="form-group">
            <label>QoS等级:</label>
            <select v-model="newSubscription.qos">
              <option value="0">0 - 最多一次</option>
              <option value="1">1 - 至少一次</option>
              <option value="2">2 - 恰好一次</option>
            </select>
          </div>
          <div class="form-actions">
            <button @click="subscribeToTopic" class="action-btn subscribe" :disabled="!selectedClient">
              订阅主题
            </button>
            <button @click="resetSubscriptionForm" class="action-btn reset">重置</button>
          </div>
        </div>

        <!-- 订阅列表 -->
        <div class="subscriptions-list">
          <div v-if="subscriptions.length === 0" class="empty-state">
            <div class="empty-icon">📋</div>
            <p>暂无订阅主题</p>
            <small>订阅主题以接收消息</small>
          </div>
          <div v-else class="subscription-cards">
            <div v-for="sub in subscriptions" :key="sub.id" class="subscription-card">
              <div class="subscription-header">
                <span class="topic-name">{{ sub.topic }}</span>
                <span class="qos-badge">QoS {{ sub.qos }}</span>
              </div>
              <div class="subscription-details">
                <div class="detail-item">
                  <span>客户端:</span>
                  <span>{{ sub.clientId }}</span>
                </div>
                <div class="detail-item">
                  <span>消息数:</span>
                  <span>{{ sub.messageCount || 0 }}</span>
                </div>
                <div class="detail-item">
                  <span>订阅时间:</span>
                  <span>{{ formatTime(sub.subscribeTime) }}</span>
                </div>
              </div>
              <div class="subscription-actions">
                <button @click="unsubscribeFromTopic(sub.id)" class="action-btn unsubscribe">
                  取消订阅
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息发布部分 -->
      <div class="panel-section">
        <div class="section-header">
          <h3>📤 消息发布</h3>
          <button @click="showPublishForm = !showPublishForm" class="toggle-btn">
            {{ showPublishForm ? '隐藏' : '发布消息' }}
          </button>
        </div>

        <!-- 发布表单 -->
        <div v-if="showPublishForm" class="publish-form">
          <div class="form-group">
            <label>目标主题:</label>
            <input v-model="newMessage.topic" type="text" placeholder="例如: sensor/temperature" />
          </div>
          <div class="form-group">
            <label>消息内容:</label>
            <textarea v-model="newMessage.payload" rows="4" placeholder="输入消息内容..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>QoS等级:</label>
              <select v-model="newMessage.qos">
                <option value="0">0 - 最多一次</option>
                <option value="1">1 - 至少一次</option>
                <option value="2">2 - 恰好一次</option>
              </select>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="newMessage.retain" type="checkbox" />
                保留消息
              </label>
            </div>
          </div>
          <div class="form-actions">
            <button @click="publishMessage" class="action-btn publish" :disabled="!selectedClient">
              发布消息
            </button>
            <button @click="resetPublishForm" class="action-btn reset">重置</button>
          </div>
        </div>
      </div>

      <!-- 消息历史部分 -->
      <div class="panel-section">
        <div class="section-header">
          <h3>📋 消息历史</h3>
          <div class="message-controls">
            <select v-model="messageFilter.type" class="filter-select">
              <option value="all">全部消息</option>
              <option value="published">已发布</option>
              <option value="received">已接收</option>
            </select>
            <select v-model="messageFilter.topic" class="filter-select">
              <option value="">全部主题</option>
              <option v-for="topic in uniqueTopics" :key="topic" :value="topic">{{ topic }}</option>
            </select>
            <button @click="clearMessageHistory" class="action-btn clear">清空历史</button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container">
          <div v-if="filteredMessages.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <p>暂无消息记录</p>
            <small>发布或接收消息后将在此显示</small>
          </div>
          <div v-else class="messages-list">
            <div v-for="message in paginatedMessages" :key="message.id" class="message-card">
              <div class="message-header">
                <div class="message-type" :class="message.type">
                  <span v-if="message.type === 'published'">📤</span>
                  <span v-else>📥</span>
                  {{ message.type === 'published' ? '已发布' : '已接收' }}
                </div>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-content">
                <div class="message-topic">
                  <strong>主题:</strong> {{ message.topic }}
                </div>
                <div class="message-payload">
                  <strong>内容:</strong>
                  <pre>{{ message.payload }}</pre>
                </div>
                <div class="message-details">
                  <span class="detail">QoS: {{ message.qos }}</span>
                  <span class="detail">客户端: {{ message.clientId }}</span>
                  <span v-if="message.retain" class="detail retain">保留</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页控制 -->
          <div v-if="totalPages > 1" class="pagination">
            <button @click="currentPage = 1" :disabled="currentPage === 1" class="page-btn">
              ⏮️
            </button>
            <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
              ⏪
            </button>
            <span class="page-info">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
              ⏩
            </button>
            <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="page-btn">
              ⏭️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'MqttApiView',
  setup() {
    // 主题控制
    const isDarkMode = ref(false)
    
    // 加载状态
    const isLoading = ref(false)
    
    // 消息状态
    const error = ref('')
    const successMessage = ref('')
    
    // 快捷键面板
    const showShortcuts = ref(false)
    
    // Broker状态
    const brokerStatus = ref(false)
    const standardPortActive = ref(false)
    const securePortActive = ref(false)
    
    // 实时监控
    const autoRefresh = ref(false)
    const refreshInterval = ref(5000)
    let refreshTimer = null
    
    // MQTT客户端连接
    const mqttClients = ref([])
    const selectedClient = ref(null)
    const showConnectionForm = ref(false)
    const selectedProtocol = ref('mqtt')
    
    // 新连接表单
    const newConnection = reactive({
      clientId: '',
      host: 'localhost',
      port: 1883,
      username: '',
      password: '',
      keepAlive: 60,
      cleanSession: true
    })
    
    // 订阅管理
    const subscriptions = ref([])
    const showSubscriptionForm = ref(false)
    const newSubscription = reactive({
      topic: '',
      qos: '0'
    })
    
    // 消息发布
    const showPublishForm = ref(false)
    const newMessage = reactive({
      topic: '',
      payload: '',
      qos: '0',
      retain: false
    })
    
    // 消息历史
    const messageHistory = ref([])
    const messageFilter = reactive({
      type: 'all',
      topic: ''
    })
    
    // 分页
    const currentPage = ref(1)
    const messagesPerPage = ref(20)
    
    // 计算属性
    const secureConnections = computed(() => {
      return mqttClients.value.filter(client => client.protocol === 'mqtts').length
    })
    
    const messagesPerMinute = computed(() => {
      const now = Date.now()
      const oneMinuteAgo = now - 60000
      return messageHistory.value.filter(msg => msg.timestamp > oneMinuteAgo).length
    })
    
    const uniqueTopics = computed(() => {
      const topics = new Set()
      messageHistory.value.forEach(msg => topics.add(msg.topic))
      return Array.from(topics)
    })
    
    const filteredMessages = computed(() => {
      let filtered = messageHistory.value
      
      if (messageFilter.type !== 'all') {
        filtered = filtered.filter(msg => msg.type === messageFilter.type)
      }
      
      if (messageFilter.topic) {
        filtered = filtered.filter(msg => msg.topic === messageFilter.topic)
      }
      
      return filtered.sort((a, b) => b.timestamp - a.timestamp)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredMessages.value.length / messagesPerPage.value)
    })
    
    const paginatedMessages = computed(() => {
      const start = (currentPage.value - 1) * messagesPerPage.value
      const end = start + messagesPerPage.value
      return filteredMessages.value.slice(start, end)
    })
    
    // 方法
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('mqtt-theme', isDarkMode.value ? 'dark' : 'light')
    }
    
    const toggleAutoRefresh = () => {
      autoRefresh.value = !autoRefresh.value
      if (autoRefresh.value) {
        startAutoRefresh()
      } else {
        stopAutoRefresh()
      }
    }
    
    const startAutoRefresh = () => {
      refreshTimer = setInterval(() => {
        refreshStatus()
      }, refreshInterval.value)
    }
    
    const stopAutoRefresh = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }
    
    const refreshStatus = async () => {
      try {
        // 这里添加实际的MQTT状态刷新逻辑
        console.log('刷新MQTT状态...')
      } catch (error) {
        console.error('刷新状态失败:', error)
      }
    }
    
    const toggleBroker = async () => {
      isLoading.value = true
      try {
        if (brokerStatus.value) {
          // 停止Broker
          await stopMqttBroker()
          successMessage.value = 'MQTT Broker已停止'
        } else {
          // 启动Broker
          await startMqttBroker()
          successMessage.value = 'MQTT Broker已启动'
        }
      } catch (err) {
        error.value = '操作失败: ' + err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const restartBroker = async () => {
      isLoading.value = true
      try {
        await stopMqttBroker()
        await new Promise(resolve => setTimeout(resolve, 1000))
        await startMqttBroker()
        successMessage.value = 'MQTT Broker已重启'
      } catch (err) {
        error.value = '重启失败: ' + err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const startMqttBroker = async () => {
      // 模拟启动MQTT Broker
      brokerStatus.value = true
      standardPortActive.value = true
      securePortActive.value = true
    }
    
    const stopMqttBroker = async () => {
      // 模拟停止MQTT Broker
      brokerStatus.value = false
      standardPortActive.value = false
      securePortActive.value = false
      // 断开所有客户端
      mqttClients.value = []
      subscriptions.value = []
    }
    
    const connectToMqtt = async () => {
      try {
        if (!newConnection.clientId) {
          newConnection.clientId = 'client_' + Date.now()
        }
        
        const port = newConnection.port || (selectedProtocol.value === 'mqtts' ? 8883 : 1883)
        
        const client = {
          id: Date.now(),
          clientId: newConnection.clientId,
          host: newConnection.host,
          port: port,
          protocol: selectedProtocol.value,
          connected: true,
          connectTime: Date.now(),
          messageCount: 0
        }
        
        mqttClients.value.push(client)
        selectedClient.value = client
        showConnectionForm.value = false
        successMessage.value = `已连接到 ${client.host}:${client.port}`
        
        resetConnectionForm()
      } catch (err) {
        error.value = '连接失败: ' + err.message
      }
    }
    
    const disconnectClient = (clientId) => {
      const index = mqttClients.value.findIndex(client => client.id === clientId)
      if (index > -1) {
        const client = mqttClients.value[index]
        mqttClients.value.splice(index, 1)
        
        // 移除相关订阅
        subscriptions.value = subscriptions.value.filter(sub => sub.clientId !== client.clientId)
        
        if (selectedClient.value && selectedClient.value.id === clientId) {
          selectedClient.value = null
        }
        
        successMessage.value = `客户端 ${client.clientId} 已断开连接`
      }
    }
    
    const selectClient = (client) => {
      selectedClient.value = client
      successMessage.value = `已选择客户端: ${client.clientId}`
    }
    
    const resetConnectionForm = () => {
      newConnection.clientId = ''
      newConnection.host = 'localhost'
      newConnection.port = selectedProtocol.value === 'mqtts' ? 8883 : 1883
      newConnection.username = ''
      newConnection.password = ''
      newConnection.keepAlive = 60
      newConnection.cleanSession = true
    }
    
    const subscribeToTopic = async () => {
      if (!selectedClient.value) {
        error.value = '请先选择一个客户端'
        return
      }
      
      if (!newSubscription.topic) {
        error.value = '请输入主题名称'
        return
      }
      
      try {
        const subscription = {
          id: Date.now(),
          clientId: selectedClient.value.clientId,
          topic: newSubscription.topic,
          qos: parseInt(newSubscription.qos),
          subscribeTime: Date.now(),
          messageCount: 0
        }
        
        subscriptions.value.push(subscription)
        showSubscriptionForm.value = false
        successMessage.value = `已订阅主题: ${subscription.topic}`
        
        resetSubscriptionForm()
      } catch (err) {
        error.value = '订阅失败: ' + err.message
      }
    }
    
    const unsubscribeFromTopic = (subscriptionId) => {
      const index = subscriptions.value.findIndex(sub => sub.id === subscriptionId)
      if (index > -1) {
        const subscription = subscriptions.value[index]
        subscriptions.value.splice(index, 1)
        successMessage.value = `已取消订阅: ${subscription.topic}`
      }
    }
    
    const resetSubscriptionForm = () => {
      newSubscription.topic = ''
      newSubscription.qos = '0'
    }
    
    const publishMessage = async () => {
      if (!selectedClient.value) {
        error.value = '请先选择一个客户端'
        return
      }
      
      if (!newMessage.topic || !newMessage.payload) {
        error.value = '请输入主题和消息内容'
        return
      }
      
      try {
        const message = {
          id: Date.now(),
          type: 'published',
          clientId: selectedClient.value.clientId,
          topic: newMessage.topic,
          payload: newMessage.payload,
          qos: parseInt(newMessage.qos),
          retain: newMessage.retain,
          timestamp: Date.now()
        }
        
        messageHistory.value.push(message)
        selectedClient.value.messageCount++
        
        showPublishForm.value = false
        successMessage.value = `消息已发布到: ${message.topic}`
        
        resetPublishForm()
        
        // 模拟接收消息
        setTimeout(() => {
          simulateReceivedMessage(message)
        }, 100)
        
      } catch (err) {
        error.value = '发布失败: ' + err.message
      }
    }
    
    const simulateReceivedMessage = (originalMessage) => {
      // 查找匹配的订阅
      const matchingSubscriptions = subscriptions.value.filter(sub => 
        sub.topic === originalMessage.topic || topicMatches(sub.topic, originalMessage.topic)
      )
      
      matchingSubscriptions.forEach(sub => {
        const receivedMessage = {
          id: Date.now() + Math.random(),
          type: 'received',
          clientId: sub.clientId,
          topic: originalMessage.topic,
          payload: originalMessage.payload,
          qos: Math.min(originalMessage.qos, sub.qos),
          retain: originalMessage.retain,
          timestamp: Date.now()
        }
        
        messageHistory.value.push(receivedMessage)
        sub.messageCount++
      })
    }
    
    const topicMatches = (subscriptionTopic, messageTopic) => {
      // 简单的主题匹配实现
      const subParts = subscriptionTopic.split('/')
      const msgParts = messageTopic.split('/')
      
      if (subParts.length !== msgParts.length && !subParts.includes('#')) {
        return false
      }
      
      for (let i = 0; i < subParts.length; i++) {
        if (subParts[i] === '#') return true
        if (subParts[i] !== '+' && subParts[i] !== msgParts[i]) {
          return false
        }
      }
      
      return true
    }
    
    const resetPublishForm = () => {
      newMessage.topic = ''
      newMessage.payload = ''
      newMessage.qos = '0'
      newMessage.retain = false
    }
    
    const clearMessageHistory = () => {
      messageHistory.value = []
      currentPage.value = 1
      successMessage.value = '消息历史已清空'
    }
    
    const exportData = () => {
      const data = {
        clients: mqttClients.value,
        subscriptions: subscriptions.value,
        messages: messageHistory.value,
        exportTime: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mqtt-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      successMessage.value = '数据导出成功'
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }
    
    // 键盘快捷键
    const handleKeyDown = (event) => {
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'k':
            event.preventDefault()
            showShortcuts.value = !showShortcuts.value
            break
          case 'p':
            event.preventDefault()
            showPublishForm.value = !showPublishForm.value
            break
          case 's':
            event.preventDefault()
            showSubscriptionForm.value = !showSubscriptionForm.value
            break
          case 'd':
            event.preventDefault()
            if (selectedClient.value) {
              disconnectClient(selectedClient.value.id)
            }
            break
          case 'e':
            event.preventDefault()
            exportData()
            break
          case 'r':
            event.preventDefault()
            refreshStatus()
            break
        }
      }
    }
    
    // 生命周期
    onMounted(() => {
      // 加载主题设置
      const savedTheme = localStorage.getItem('mqtt-theme')
      if (savedTheme === 'dark') {
        isDarkMode.value = true
      }
      
      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeyDown)
      
      // 初始化数据
      initializeMockData()
    })
    
    onUnmounted(() => {
      stopAutoRefresh()
      document.removeEventListener('keydown', handleKeyDown)
    })
    
    const initializeMockData = () => {
      // 模拟一些初始数据
      brokerStatus.value = true
      standardPortActive.value = true
      securePortActive.value = true
      
      // 添加一个示例客户端
      const mockClient = {
        id: 1,
        clientId: 'demo_client',
        host: 'localhost',
        port: 1883,
        protocol: 'mqtt',
        connected: true,
        connectTime: Date.now() - 300000,
        messageCount: 5
      }
      
      mqttClients.value.push(mockClient)
      selectedClient.value = mockClient
      
      // 添加示例订阅
      subscriptions.value.push({
        id: 1,
        clientId: 'demo_client',
        topic: 'sensor/temperature',
        qos: 1,
        subscribeTime: Date.now() - 240000,
        messageCount: 3
      })
      
      // 添加示例消息
      const mockMessages = [
        {
          id: 1,
          type: 'received',
          clientId: 'demo_client',
          topic: 'sensor/temperature',
          payload: '{"value": 23.5, "unit": "°C"}',
          qos: 1,
          retain: false,
          timestamp: Date.now() - 180000
        },
        {
          id: 2,
          type: 'published',
          clientId: 'demo_client',
          topic: 'device/status',
          payload: '{"status": "online"}',
          qos: 0,
          retain: true,
          timestamp: Date.now() - 120000
        }
      ]
      
      messageHistory.value.push(...mockMessages)
    }
    
    return {
      // 状态
      isDarkMode,
      isLoading,
      error,
      successMessage,
      showShortcuts,
      brokerStatus,
      standardPortActive,
      securePortActive,
      autoRefresh,
      refreshInterval,
      
      // MQTT状态
      mqttClients,
      selectedClient,
      showConnectionForm,
      selectedProtocol,
      newConnection,
      
      // 订阅
      subscriptions,
      showSubscriptionForm,
      newSubscription,
      
      // 发布
      showPublishForm,
      newMessage,
      
      // 消息
      messageHistory,
      messageFilter,
      currentPage,
      messagesPerPage,
      
      // 计算属性
      secureConnections,
      messagesPerMinute,
      uniqueTopics,
      filteredMessages,
      totalPages,
      paginatedMessages,
      
      // 方法
      toggleTheme,
      toggleAutoRefresh,
      refreshStatus,
      toggleBroker,
      restartBroker,
      connectToMqtt,
      disconnectClient,
      selectClient,
      resetConnectionForm,
      subscribeToTopic,
      unsubscribeFromTopic,
      resetSubscriptionForm,
      publishMessage,
      resetPublishForm,
      clearMessageHistory,
      exportData,
      formatTime
    }
  }
}
</script>

<style scoped>
/* 主题切换按钮 */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.theme-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 快捷键面板 */
.shortcuts-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.shortcuts-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.shortcuts-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.close-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #ff3838;
  transform: scale(1.1);
}

.shortcuts-list {
  display: grid;
  gap: 15px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.shortcut-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.shortcut-item kbd {
  background: #495057;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0 2px;
}

/* 主容器 */
.mqtt-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

.mqtt-view.dark-theme {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

/* 实时监控面板 */
.real-time-monitor {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: slideDown 0.6s ease;
}

.mqtt-view.dark-theme .real-time-monitor {
  background: rgba(52, 73, 94, 0.95);
  color: white;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.mqtt-view.dark-theme .monitor-header {
  border-bottom-color: #495057;
}

.monitor-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
}

.mqtt-view.dark-theme .monitor-header h3 {
  color: white;
}

.monitor-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.monitor-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.monitor-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.monitor-btn.active {
  background: linear-gradient(45deg, #27ae60, #2ecc71);
}

.refresh-interval {
  color: #666;
  font-size: 12px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.mqtt-view.dark-theme .refresh-interval {
  background: #495057;
  color: #adb5bd;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.monitor-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.mqtt-view.dark-theme .monitor-card {
  background: #495057;
  border-color: #6c757d;
}

.monitor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.monitor-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.monitor-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.mqtt-view.dark-theme .monitor-value {
  color: white;
}

.monitor-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.mqtt-view.dark-theme .monitor-label {
  color: #adb5bd;
}

/* 加载覆盖层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  animation: fadeIn 0.3s ease;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

/* 消息提示 */
.message {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1200;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideInRight 0.3s ease;
}

.error-message {
  background: #e74c3c;
  border-left: 4px solid #c0392b;
}

.success-message {
  background: #27ae60;
  border-left: 4px solid #229954;
}

.message-icon {
  font-size: 18px;
}

.message-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  margin-left: auto;
  padding: 0;
  opacity: 0.8;
}

.message-close:hover {
  opacity: 1;
}

/* 控制面板 */
.control-panel {
  animation: slideUp 0.8s ease;
}

.panel-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.mqtt-view.dark-theme .panel-section {
  background: rgba(52, 73, 94, 0.95);
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.mqtt-view.dark-theme .section-header {
  border-bottom-color: #495057;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.mqtt-view.dark-theme .section-header h3 {
  color: white;
}

.stats-display {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.stat-chip {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  font-size: 14px;
}

.export-btn, .shortcuts-btn {
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.export-btn:hover, .shortcuts-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(243, 156, 18, 0.4);
}

.export-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 状态卡片 */
.status-cards {
  display: grid;
  gap: 20px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.mqtt-view.dark-theme .status-card {
  background: #495057;
  color: white;
}

.status-card.active {
  border-color: #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.1));
}

.status-card.inactive {
  border-color: #e74c3c;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.1));
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 24px;
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header h4 {
  margin: 0;
  flex: 1;
  color: #2c3e50;
  font-size: 18px;
}

.mqtt-view.dark-theme .card-header h4 {
  color: white;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.online {
  background: #27ae60;
  color: white;
}

.status-badge.offline {
  background: #e74c3c;
  color: white;
}

.card-content {
  display: grid;
  gap: 20px;
}

.port-info {
  display: grid;
  gap: 10px;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.mqtt-view.dark-theme .port-item {
  background: #6c757d;
}

.port-label {
  font-weight: 500;
  color: #495057;
}

.mqtt-view.dark-theme .port-label {
  color: #adb5bd;
}

.port-value {
  font-weight: bold;
  color: #2c3e50;
}

.mqtt-view.dark-theme .port-value {
  color: white;
}

.port-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #bdc3c7;
  margin-left: auto;
}

.port-status.active {
  background: #27ae60;
  animation: pulse 2s infinite;
}

.broker-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn.start {
  background: #27ae60;
  color: white;
}

.action-btn.stop {
  background: #e74c3c;
  color: white;
}

.action-btn.restart {
  background: #f39c12;
  color: white;
}

.action-btn.connect {
  background: #3498db;
  color: white;
}

.action-btn.disconnect {
  background: #e74c3c;
  color: white;
}

.action-btn.select {
  background: #9b59b6;
  color: white;
}

.action-btn.subscribe {
  background: #2ecc71;
  color: white;
}

.action-btn.unsubscribe {
  background: #e67e22;
  color: white;
}

.action-btn.publish {
  background: #3498db;
  color: white;
}

.action-btn.reset {
  background: #95a5a6;
  color: white;
}

.action-btn.clear {
  background: #e74c3c;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.action-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 连接控制 */
.connection-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.protocol-select, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.mqtt-view.dark-theme .protocol-select,
.mqtt-view.dark-theme .filter-select {
  background: #495057;
  border-color: #6c757d;
  color: white;
}

.toggle-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* 表单样式 */
.connection-form, .subscription-form, .publish-form {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid #e9ecef;
}

.mqtt-view.dark-theme .connection-form,
.mqtt-view.dark-theme .subscription-form,
.mqtt-view.dark-theme .publish-form {
  background: #343a40;
  border-color: #495057;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: end;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.mqtt-view.dark-theme .form-group label {
  color: #adb5bd;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.mqtt-view.dark-theme .form-group input,
.mqtt-view.dark-theme .form-group select,
.mqtt-view.dark-theme .form-group textarea {
  background: #495057;
  border-color: #6c757d;
  color: white;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

/* 连接列表 */
.connections-list, .subscriptions-list {
  margin-top: 25px;
}

.connections-list h4, .subscriptions-list h4 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 16px;
}

.mqtt-view.dark-theme .connections-list h4,
.mqtt-view.dark-theme .subscriptions-list h4 {
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.mqtt-view.dark-theme .empty-state {
  color: #adb5bd;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.7;
}

.empty-state p {
  margin: 10px 0 5px;
  font-size: 16px;
  font-weight: 500;
}

.empty-state small {
  font-size: 14px;
  opacity: 0.8;
}

.client-cards, .subscription-cards {
  display: grid;
  gap: 15px;
}

.client-card, .subscription-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.mqtt-view.dark-theme .client-card,
.mqtt-view.dark-theme .subscription-card {
  background: #495057;
  border-color: #6c757d;
}

.client-card:hover, .subscription-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.client-header, .subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-id, .topic-name {
  font-weight: bold;
  color: #2c3e50;
}

.mqtt-view.dark-theme .client-id,
.mqtt-view.dark-theme .topic-name {
  color: white;
}

.client-protocol, .qos-badge {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.client-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6c757d;
}

.mqtt-view.dark-theme .client-status {
  color: #adb5bd;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #bdc3c7;
}

.status-dot.connected {
  background: #27ae60;
  animation: pulse 2s infinite;
}

.status-dot.disconnected {
  background: #e74c3c;
}

.client-details, .subscription-details {
  display: grid;
  gap: 8px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-item span:first-child {
  color: #6c757d;
  font-weight: 500;
}

.mqtt-view.dark-theme .detail-item span:first-child {
  color: #adb5bd;
}

.detail-item span:last-child {
  color: #2c3e50;
}

.mqtt-view.dark-theme .detail-item span:last-child {
  color: white;
}

.client-actions, .subscription-actions {
  display: flex;
  gap: 10px;
}

/* 消息控制 */
.message-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* 消息容器 */
.messages-container {
  margin-top: 25px;
}

.messages-list {
  display: grid;
  gap: 15px;
  margin-bottom: 25px;
}

.message-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.mqtt-view.dark-theme .message-card {
  background: #495057;
  border-color: #6c757d;
}

.message-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.mqtt-view.dark-theme .message-header {
  border-bottom-color: #6c757d;
}

.message-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 15px;
}

.message-type.published {
  background: #e3f2fd;
  color: #1976d2;
}

.message-type.received {
  background: #e8f5e8;
  color: #388e3c;
}

.mqtt-view.dark-theme .message-type.published {
  background: rgba(25, 118, 210, 0.2);
  color: #64b5f6;
}

.mqtt-view.dark-theme .message-type.received {
  background: rgba(56, 142, 60, 0.2);
  color: #81c784;
}

.message-time {
  font-size: 12px;
  color: #6c757d;
}

.mqtt-view.dark-theme .message-time {
  color: #adb5bd;
}

.message-content {
  display: grid;
  gap: 12px;
}

.message-topic, .message-payload {
  font-size: 14px;
}

.message-topic strong, .message-payload strong {
  color: #495057;
  margin-right: 8px;
}

.mqtt-view.dark-theme .message-topic strong,
.mqtt-view.dark-theme .message-payload strong {
  color: #adb5bd;
}

.message-payload pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px;
  margin: 5px 0 0;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.mqtt-view.dark-theme .message-payload pre {
  background: #343a40;
  border-color: #495057;
  color: #f8f9fa;
}

.message-details {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.detail {
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 3px 8px;
  border-radius: 12px;
}

.mqtt-view.dark-theme .detail {
  background: #343a40;
  color: #adb5bd;
}

.detail.retain {
  background: #fff3cd;
  color: #856404;
}

.mqtt-view.dark-theme .detail.retain {
  background: rgba(133, 100, 4, 0.2);
  color: #ffc107;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 25px;
}

.page-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.mqtt-view.dark-theme .page-btn {
  background: #495057;
  border-color: #6c757d;
  color: white;
}

.page-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.mqtt-view.dark-theme .page-btn:hover {
  background: #6c757d;
}

.page-btn:disabled {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
}

.mqtt-view.dark-theme .page-btn:disabled {
  background: #343a40;
  border-color: #495057;
  color: #6c757d;
}

.page-info {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
  margin: 0 10px;
}

.mqtt-view.dark-theme .page-info {
  color: #adb5bd;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mqtt-view {
    padding: 10px;
  }
  
  .panel-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .monitor-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-display {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .connection-controls, .message-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions, .client-actions, .subscription-actions {
    flex-direction: column;
  }
  
  .shortcuts-content {
    margin: 20px;
    padding: 20px;
  }
  
  .message-details {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .theme-toggle {
    top: 10px;
    right: 10px;
  }
  
  .theme-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .monitor-header, .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .client-header, .subscription-header, .message-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }
}
</style>
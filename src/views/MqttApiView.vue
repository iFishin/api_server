<template>
  <div class="mqtt-view">
    <!-- Page Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <div class="title-icon">
              <i class="fas fa-satellite-dish"></i>
            </div>
            <div>
              <h1>MQTT Service</h1>
              <p>Message Queuing Telemetry Transport Dashboard</p>
            </div>
          </div>
        </div>
        
        <div class="header-stats">
          <div class="stat-item">
            <i class="fas fa-users"></i>
            <span class="stat-number">{{ mqttClients.length }}</span>
            <span class="stat-label">Clients</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-paper-plane"></i>
            <span class="stat-number">{{ messageHistory.length }}</span>
            <span class="stat-label">Messages</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-list"></i>
            <span class="stat-number">{{ subscriptions.length }}</span>
            <span class="stat-label">Subscriptions</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="toggleAutoRefresh" class="btn" :class="{ active: autoRefresh }">
            <i :class="autoRefresh ? 'fas fa-pause' : 'fas fa-play'"></i>
            {{ autoRefresh ? 'Pause' : 'Start' }}
          </button>
          <button @click="exportData" class="btn" :disabled="messageHistory.length === 0">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Component -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Connecting to MQTT Broker...</p>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="message error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
      <button @click="error = ''" class="close-btn">×</button>
    </div>
    
    <div v-if="successMessage" class="message success">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
      <button @click="successMessage = ''" class="close-btn">×</button>
    </div>

    <!-- Main Content -->
    <div class="main-content" v-if="!isLoading">
      <!-- Service Status -->
      <div class="service-panel">
        <div class="service-toggle" :class="{ active: brokerStatus }">
          <div class="service-info">
            <i class="fas fa-satellite-dish"></i>
            <div>
              <h3>MQTT Broker</h3>
              <span>Ports 1883/8883</span>
            </div>
          </div>
          <div class="service-status">
            <span class="status-dot" :class="{ online: brokerStatus }"></span>
            {{ brokerStatus ? 'Online' : 'Offline' }}
          </div>
          <button @click="toggleBroker" class="toggle-btn" :class="{ active: brokerStatus }">
            <i :class="brokerStatus ? 'fas fa-stop' : 'fas fa-play'"></i>
          </button>
        </div>
      </div>

      <div class="content-grid">
        <!-- Connection Management -->
        <div class="service-card">
          <div class="card-header">
            <h2><i class="fas fa-link"></i> Connection Management</h2>
            <button @click="refreshStatus" :disabled="loading" class="refresh-btn">
              <i v-if="!loading" class="fas fa-sync-alt"></i>
              <div v-else class="loading-spinner small"></div>
            </button>
          </div>

          <div class="card-content">
            <!-- Connection Form -->
            <div class="config-section">
              <h3>Connect to Broker</h3>
              <div class="config-item">
                <label>Broker URL</label>
                <input v-model="brokerUrl" placeholder="mqtt://localhost:1883" :disabled="isConnected" />
              </div>
              <div class="config-item">
                <label>Client ID</label>
                <input v-model="clientId" placeholder="client_12345" :disabled="isConnected" />
              </div>
              <div class="config-grid">
                <div class="config-item">
                  <label>Username</label>
                  <input v-model="username" placeholder="Optional" :disabled="isConnected" />
                </div>
                <div class="config-item">
                  <label>Password</label>
                  <input v-model="password" type="password" placeholder="Optional" :disabled="isConnected" />
                </div>
              </div>
              <div class="config-actions">
                <button 
                  @click="isConnected ? disconnect() : connect()" 
                  :disabled="loading || !brokerUrl"
                  class="action-btn"
                  :class="{ connected: isConnected }"
                >
                  {{ isConnected ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
            </div>

            <!-- Active Clients -->
            <div class="clients-section">
              <h3>Active Clients ({{ mqttClients.length }})</h3>
              <div v-if="mqttClients.length > 0" class="clients-list">
                <div v-for="client in mqttClients" :key="client.id" class="client-item">
                  <div class="client-info">
                    <i class="fas fa-user"></i>
                    <span>{{ client.id }}</span>
                    <span class="client-status" :class="client.status">{{ client.status }}</span>
                  </div>
                  <div class="client-actions">
                    <button @click="kickClient(client.id)" class="kick-btn">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-users"></i>
                <p>No clients connected</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Publish & Subscribe -->
        <div class="service-card">
          <div class="card-header">
            <h2><i class="fas fa-paper-plane"></i> Publish & Subscribe</h2>
          </div>

          <div class="card-content">
            <!-- Subscribe Section -->
            <div class="config-section">
              <h3>Subscribe to Topic</h3>
              <div class="subscribe-form">
                <div class="input-group">
                  <input 
                    v-model="subscribeTopicInput" 
                    placeholder="Enter topic (e.g., sensor/temperature)"
                    :disabled="!isConnected"
                    @keydown.enter="subscribe"
                  />
                  <select v-model="subscribeQos" :disabled="!isConnected">
                    <option value="0">QoS 0</option>
                    <option value="1">QoS 1</option>
                    <option value="2">QoS 2</option>
                  </select>
                  <button 
                    @click="subscribe" 
                    :disabled="!isConnected || !subscribeTopicInput.trim()"
                    class="subscribe-btn"
                  >
                    Subscribe
                  </button>
                </div>
              </div>

              <!-- Active Subscriptions -->
              <div class="subscriptions-list" v-if="subscriptions.length > 0">
                <h4>Active Subscriptions</h4>
                <div v-for="sub in subscriptions" :key="sub.topic" class="subscription-item">
                  <span class="topic">{{ sub.topic }}</span>
                  <span class="qos">QoS {{ sub.qos }}</span>
                  <button @click="unsubscribe(sub.topic)" class="unsubscribe-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Publish Section -->
            <div class="config-section">
              <h3>Publish Message</h3>
              <div class="publish-form">
                <div class="config-item">
                  <label>Topic</label>
                  <input 
                    v-model="publishTopic" 
                    placeholder="Enter topic"
                    :disabled="!isConnected"
                  />
                </div>
                <div class="config-grid">
                  <div class="config-item">
                    <label>QoS</label>
                    <select v-model="publishQos" :disabled="!isConnected">
                      <option value="0">QoS 0</option>
                      <option value="1">QoS 1</option>
                      <option value="2">QoS 2</option>
                    </select>
                  </div>
                  <div class="config-item">
                    <label>Retain</label>
                    <label class="switch">
                      <input type="checkbox" v-model="publishRetain" :disabled="!isConnected" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
                <div class="config-item">
                  <label>Message</label>
                  <textarea 
                    v-model="publishMessage" 
                    placeholder="Enter message content..."
                    :disabled="!isConnected"
                    rows="3"
                    @keydown.ctrl.enter="publish"
                  ></textarea>
                </div>
                <div class="config-actions">
                  <button 
                    @click="publish" 
                    :disabled="!isConnected || !publishTopic.trim() || !publishMessage.trim()"
                    class="publish-btn"
                  >
                    Publish Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message History -->
        <div class="history-card">
          <div class="card-header">
            <h2><i class="fas fa-history"></i> Message History</h2>
            <div class="history-actions">
              <select v-model="messageFilter" class="filter-select">
                <option value="all">All Messages</option>
                <option value="publish">Published</option>
                <option value="received">Received</option>
                <option value="subscribe">Subscriptions</option>
                <option value="unsubscribe">Unsubscriptions</option>
              </select>
              <button @click="clearMessageHistory" :disabled="messageHistory.length === 0" class="clear-btn">
                <i class="fas fa-trash-alt"></i>
                Clear
              </button>
            </div>
          </div>
          <div class="card-content">
            <div v-if="filteredMessages.length > 0" class="message-list">
              <div v-for="msg in filteredMessages.slice(0, 50)" :key="msg.id" class="message-item" :class="[msg.type, msg.direction]">
                <div class="message-meta">
                  <span class="message-type" :class="msg.type">{{ msg.type.toUpperCase() }}</span>
                  <span class="message-qos">QoS {{ msg.qos || 0 }}</span>
                  <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                </div>
                <div class="message-content">
                  <div class="message-topic">{{ msg.topic }}</div>
                  <div class="message-payload">{{ msg.payload }}</div>
                </div>
                <div class="message-status" :class="msg.status || 'success'">
                  <i class="fas fa-check-circle" v-if="(msg.status || 'success') === 'success'"></i>
                  <i class="fas fa-times-circle" v-else></i>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>{{ messageFilter === 'all' ? 'No messages yet' : 'No matching messages' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import axios from 'axios'

// State variables
const autoRefresh = ref(false)
const refreshInterval = ref(5000)
const messageFilter = ref('all')
let refreshTimer: number | null = null

// Loading states
const isLoading = ref(false)
const loading = ref(false)

// Error states
const error = ref('')
const successMessage = ref('')

// MQTT broker status
const brokerStatus = ref(false)

// Connection state
const isConnected = ref(false)
const brokerUrl = ref('mqtt://localhost:1883')
const clientId = ref(`client_${Math.random().toString(36).substr(2, 9)}`)
const username = ref('')
const password = ref('')

// Clients
const mqttClients = ref<Array<{id: string, status: string}>>([])

// Subscriptions
const subscriptions = ref<Array<{topic: string, qos: number}>>([])
const subscribeTopicInput = ref('')
const subscribeQos = ref(0)

// Publish
const publishTopic = ref('')
const publishMessage = ref('')
const publishQos = ref(0)
const publishRetain = ref(false)

// Message history
const messageHistory = ref<Array<{
  id: string
  timestamp: Date
  type: 'publish' | 'received' | 'subscribe' | 'unsubscribe'
  direction?: 'in' | 'out'
  topic: string
  payload?: string
  qos?: number
  status?: 'success' | 'error'
}>>([])

// Computed properties
const filteredMessages = computed(() => {
  if (messageFilter.value === 'all') return messageHistory.value
  
  return messageHistory.value.filter(msg => {
    switch (messageFilter.value) {
      case 'publish': return msg.type === 'publish'
      case 'received': return msg.type === 'received'
      case 'subscribe': return msg.type === 'subscribe'
      case 'unsubscribe': return msg.type === 'unsubscribe'
      default: return true
    }
  })
})

// Utility functions
const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const addMessageToHistory = (type: 'publish' | 'received' | 'subscribe' | 'unsubscribe', topic: string, payload?: string, qos?: number, status: 'success' | 'error' = 'success') => {
  const newMessage = {
    id: Date.now().toString(),
    timestamp: new Date(),
    type,
    topic,
    payload,
    qos,
    status
  }
  messageHistory.value.unshift(newMessage)
  
  if (messageHistory.value.length > 200) {
    messageHistory.value = messageHistory.value.slice(0, 200)
  }
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
  refreshTimer = window.setInterval(async () => {
    try {
      await Promise.all([
        fetchBrokerStatus(),
        fetchClients()
      ])
    } catch (err) {
      console.error('Auto refresh failed:', err)
    }
  }, refreshInterval.value)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const exportData = () => {
  const data = {
    exportTime: new Date().toISOString(),
    brokerStatus: brokerStatus.value,
    isConnected: isConnected.value,
    subscriptions: subscriptions.value,
    messageHistory: messageHistory.value.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `mqtt-data-${new Date().toISOString().slice(0, 10)}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  showSuccess('Data exported successfully')
}

const clearMessageHistory = () => {
  messageHistory.value = []
  showSuccess('Message history cleared')
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit', 
    second: '2-digit'
  })
}

const handleError = (err: any, context: string) => {
  console.error(`${context}:`, err)
  const message = err.response?.data?.message || err.message || 'An error occurred'
  error.value = `${context}: ${message}`
  setTimeout(() => {
    error.value = ''
  }, 5000)
}

// API functions
async function fetchBrokerStatus() {
  try {
    const res = await axios.get('/api/mqtt/status')
    brokerStatus.value = res.data.running
  } catch (err) {
    handleError(err, 'Failed to fetch broker status')
  }
}

async function fetchClients() {
  try {
    const res = await axios.get('/api/mqtt/clients')
    mqttClients.value = res.data.clients || []
  } catch (err) {
    handleError(err, 'Failed to fetch clients')
  }
}

async function toggleBroker() {
  try {
    if (brokerStatus.value) {
      await axios.post('/api/mqtt/stop')
      showSuccess('MQTT Broker stopped successfully')
    } else {
      await axios.post('/api/mqtt/start')
      showSuccess('MQTT Broker started successfully')
    }
    await fetchBrokerStatus()
  } catch (err) {
    handleError(err, 'Failed to toggle MQTT broker')
  }
}

async function connect() {
  loading.value = true
  try {
    await axios.post('/api/mqtt/connect', {
      url: brokerUrl.value,
      clientId: clientId.value,
      username: username.value || undefined,
      password: password.value || undefined
    })
    isConnected.value = true
    showSuccess('Connected to MQTT broker')
  } catch (err) {
    handleError(err, 'Failed to connect to broker')
  } finally {
    loading.value = false
  }
}

async function disconnect() {
  loading.value = true
  try {
    await axios.post('/api/mqtt/disconnect')
    isConnected.value = false
    subscriptions.value = []
    showSuccess('Disconnected from MQTT broker')
  } catch (err) {
    handleError(err, 'Failed to disconnect from broker')
  } finally {
    loading.value = false
  }
}

async function subscribe() {
  if (!subscribeTopicInput.value.trim()) return
  
  try {
    await axios.post('/api/mqtt/subscribe', {
      topic: subscribeTopicInput.value,
      qos: subscribeQos.value
    })
    
    subscriptions.value.push({
      topic: subscribeTopicInput.value,
      qos: subscribeQos.value
    })
    
    addMessageToHistory('subscribe', subscribeTopicInput.value, undefined, subscribeQos.value)
    showSuccess(`Subscribed to topic: ${subscribeTopicInput.value}`)
    subscribeTopicInput.value = ''
  } catch (err) {
    addMessageToHistory('subscribe', subscribeTopicInput.value, undefined, subscribeQos.value, 'error')
    handleError(err, 'Failed to subscribe to topic')
  }
}

async function unsubscribe(topic: string) {
  try {
    await axios.post('/api/mqtt/unsubscribe', { topic })
    
    subscriptions.value = subscriptions.value.filter(sub => sub.topic !== topic)
    addMessageToHistory('unsubscribe', topic)
    showSuccess(`Unsubscribed from topic: ${topic}`)
  } catch (err) {
    addMessageToHistory('unsubscribe', topic, undefined, undefined, 'error')
    handleError(err, 'Failed to unsubscribe from topic')
  }
}

async function publish() {
  if (!publishTopic.value.trim() || !publishMessage.value.trim()) return
  
  try {
    await axios.post('/api/mqtt/publish', {
      topic: publishTopic.value,
      payload: publishMessage.value,
      qos: publishQos.value,
      retain: publishRetain.value
    })
    
    addMessageToHistory('publish', publishTopic.value, publishMessage.value, publishQos.value)
    showSuccess(`Message published to topic: ${publishTopic.value}`)
    publishMessage.value = ''
  } catch (err) {
    addMessageToHistory('publish', publishTopic.value, publishMessage.value, publishQos.value, 'error')
    handleError(err, 'Failed to publish message')
  }
}

async function kickClient(clientId: string) {
  try {
    await axios.post('/api/mqtt/kick', { clientId })
    await fetchClients()
    showSuccess(`Client ${clientId} disconnected`)
  } catch (err) {
    handleError(err, 'Failed to kick client')
  }
}

const refreshStatus = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchBrokerStatus(),
      fetchClients()
    ])
  } catch (err) {
    handleError(err, 'Failed to refresh status')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchBrokerStatus(),
      fetchClients()
    ])
  } catch (err) {
    handleError(err, 'Failed to initialize')
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
/* Base styles - matching TcpUdpApiView */
.mqtt-view {
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Header */
.header {
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 0;
  flex-shrink: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-left {
  flex: 1;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: #6366f1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.title-section h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.title-section p {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 1rem;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  min-width: 80px;
}

.stat-item i {
  color: #6366f1;
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn:hover {
  background: #f9fafb;
  border-color: #6366f1;
}

.btn.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Messages */
.message {
  position: fixed;
  top: 80px;
  right: 1rem;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.message.success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
}

/* Main content */
.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

/* Service panel */
.service-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  flex-shrink: 0;
}

.service-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.service-toggle.active {
  background: #f0f9ff;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.service-info i {
  font-size: 1.25rem;
  color: #6366f1;
}

.service-info h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #1f2937;
}

.service-info span {
  font-size: 0.875rem;
  color: #6b7280;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
}

.status-dot.online {
  background: #16a34a;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.toggle-btn:hover {
  border-color: #6366f1;
}

.toggle-btn.active {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.history-card {
  grid-column: 1 / -1;
}

/* Service cards */
.service-card, .history-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn {
  padding: 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.refresh-btn:hover {
  border-color: #6366f1;
}

.card-content {
  padding: 1.5rem;
}

/* Config sections */
.config-section {
  margin-bottom: 2rem;
}

.config-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #374151;
}

.config-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.config-item label {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.25rem;
}

.config-item input, 
.config-item select, 
.config-item textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.config-actions {
  margin-top: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #4f46e5;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.connected {
  background: #dc2626;
}

.action-btn.connected:hover {
  background: #b91c1c;
}

/* Forms */
.subscribe-form, .publish-form {
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: end;
}

.input-group input {
  flex: 1;
}

.subscribe-btn, .publish-btn {
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.subscribe-btn:disabled, .publish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Subscriptions */
.subscriptions-list h4 {
  margin: 1rem 0 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.subscription-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.subscription-item .topic {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
}

.subscription-item .qos {
  font-size: 0.75rem;
  color: #6b7280;
}

.unsubscribe-btn {
  padding: 0.25rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #6366f1;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Clients */
.clients-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #374151;
}

.client-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.client-info i {
  color: #6366f1;
}

.client-status {
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  background: #f0fdf4;
  color: #16a34a;
}

.kick-btn {
  padding: 0.25rem 0.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* History */
.history-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-list {
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.message-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 120px;
}

.message-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.message-type.publish {
  background: #fef3c7;
  color: #d97706;
}

.message-type.received {
  background: #dbeafe;
  color: #1d4ed8;
}

.message-type.subscribe {
  background: #f3e8ff;
  color: #7c3aed;
}

.message-type.unsubscribe {
  background: #fee2e2;
  color: #dc2626;
}

.message-qos, .message-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.message-content {
  flex: 1;
}

.message-topic {
  font-family: monospace;
  font-size: 0.875rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.message-payload {
  font-size: 0.875rem;
  color: #6b7280;
  word-break: break-all;
}

.message-status {
  min-width: 20px;
}

.message-status.success i {
  color: #16a34a;
}

.message-status.error i {
  color: #dc2626;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .input-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

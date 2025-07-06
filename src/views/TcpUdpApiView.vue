<template>
  <div class="tcpudp-view">
    <!-- Page Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <div class="title-icon">
              <i class="fas fa-network-wired"></i>
            </div>
            <div>
              <h1>Network Services</h1>
              <p>TCP & UDP Network Service Dashboard</p>
            </div>
          </div>
        </div>
        
        <div class="header-stats">
          <div class="stat-item">
            <i class="fas fa-users"></i>
            <span class="stat-number">{{ tcpClients.length }}</span>
            <span class="stat-label">TCP Clients</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-comments"></i>
            <span class="stat-number">{{ messageHistory.length }}</span>
            <span class="stat-label">Messages</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-server"></i>
            <span class="stat-number">{{ (tcpStatus ? 1 : 0) + (udpStatus ? 1 : 0) }}</span>
            <span class="stat-label">Active Services</span>
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
    <LoadingPage 
      v-if="isLoading"
      icon="fas fa-network-wired"
      title="Initializing Network Services"
      description="Loading service status and connection information..."
      :show-progress="true"
      progress-text="Loading..."
    />

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
      <!-- Service Toggles -->
      <div class="service-panel">
        <div class="service-toggle" :class="{ active: tcpStatus }">
          <div class="service-info">
            <i class="fas fa-plug"></i>
            <div>
              <h3>TCP Server</h3>
              <span>Port 9001 • {{ tcpClients.length }} client{{ tcpClients.length !== 1 ? 's' : '' }}</span>
            </div>
          </div>
          <div class="service-status">
            <span class="status-dot" :class="{ online: tcpStatus }"></span>
            {{ tcpStatus ? 'Online' : 'Offline' }}
          </div>
          <button @click="handleTcpToggle" class="toggle-btn" :class="{ active: tcpStatus }">
            <i :class="tcpStatus ? 'fas fa-stop' : 'fas fa-play'"></i>
          </button>
        </div>

        <div class="service-toggle" :class="{ active: udpStatus }">
          <div class="service-info">
            <i class="fas fa-broadcast-tower"></i>
            <div>
              <h3>UDP Server</h3>
              <span>Port 9000 • Stateless protocol</span>
            </div>
          </div>
          <div class="service-status">
            <span class="status-dot" :class="{ online: udpStatus }"></span>
            {{ udpStatus ? 'Online' : 'Offline' }}
          </div>
          <button @click="handleUdpToggle" class="toggle-btn" :class="{ active: udpStatus }">
            <i :class="udpStatus ? 'fas fa-stop' : 'fas fa-broadcast-tower'"></i>
          </button>
        </div>
      </div>

      <div class="content-grid">
        <!-- TCP Service -->
        <div class="service-card">
          <div class="card-header">
            <h2><i class="fas fa-plug"></i> TCP Service</h2>
            <button @click="fetchTcpStatus" :disabled="tcpLoading" class="refresh-btn">
              <i v-if="!tcpLoading" class="fas fa-sync-alt"></i>
              <LoadingSpinner v-else />
            </button>
          </div>

          <div class="card-content">
            <!-- Echo Config -->
            <div class="config-section">
              <h3>Echo Configuration</h3>
              <div class="config-item">
                <label>Enable Echo</label>
                <label class="switch">
                  <input type="checkbox" v-model="tcpEchoEnabled" @change="setTcpEchoEnabled" :disabled="tcpLoading" />
                  <span class="slider"></span>
                </label>
              </div>
              <div class="config-item">
                <label>Echo Content</label>
                <input v-model="tcpEchoContent" @blur="setTcpEchoContent" placeholder="Leave empty for original echo" :disabled="tcpLoading" />
              </div>
            </div>

            <!-- Connected Clients -->
            <div class="clients-section">
              <h3>Connected Clients ({{ tcpClients.length }})</h3>
              <div class="clients-actions" v-if="tcpClients.length > 0">
                <button @click="refreshClients" :disabled="tcpLoading" class="refresh-clients-btn">
                  <i class="fas fa-sync-alt"></i>
                  Refresh
                </button>
                <button @click="disconnectAllClients" :disabled="tcpLoading" class="disconnect-all-btn">
                  <i class="fas fa-times-circle"></i>
                  Disconnect All
                </button>
              </div>
              <div v-if="tcpClients.length > 0" class="clients-list">
                <div v-for="client in tcpClients" :key="client.id" class="client-item">
                  <div class="client-info">
                    <i class="fas fa-desktop"></i>
                    <div class="client-details">
                      <div class="client-id">{{ client.id }}</div>
                      <div class="client-address">{{ client.address }}:{{ client.port }}</div>
                      <div class="client-status">
                        <span class="status-dot online"></span>
                        Connected
                        <span class="connection-time">{{ getConnectionTime(client.id) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="message-input">
                    <input 
                      v-model="tcpSendMsg[client.id]" 
                      placeholder="Enter message to send..."
                      :disabled="tcpLoading"
                      @keydown.enter="sendToTcpClient(client.id)"
                    />
                    <button 
                      @click="sendToTcpClient(client.id)" 
                      :disabled="tcpLoading || !tcpSendMsg[client.id]?.trim()"
                      class="send-btn"
                    >
                      <i class="fas fa-paper-plane"></i>
                      Send
                    </button>
                    <button 
                      @click="disconnectClient(client.id)" 
                      :disabled="tcpLoading"
                      class="disconnect-btn"
                      title="Disconnect client"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-plug"></i>
                <p>No clients connected</p>
                <small>Clients will appear here when they connect to port 9001</small>
              </div>
            </div>

            <!-- Send as Client -->
            <div class="client-section">
              <h3>Send as Client</h3>
              <div class="send-panel">
                <div class="target-config">
                  <input v-model="tcpTargetIp" placeholder="IP Address" :disabled="tcpLoading" />
                  <input v-model.number="tcpTargetPort" type="number" placeholder="Port" :disabled="tcpLoading" />
                </div>
                <div class="message-area">
                  <input 
                    v-model="tcpClientMsg" 
                    placeholder="Enter message..."
                    :disabled="tcpLoading"
                    @keydown.enter="sendTcpClientMsg"
                  />
                  <button 
                    @click="sendTcpClientMsg" 
                    :disabled="tcpLoading || !tcpClientMsg.trim() || !tcpTargetIp || !tcpTargetPort"
                  >
                    Send TCP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- UDP Service -->
        <div class="service-card">
          <div class="card-header">
            <h2><i class="fas fa-broadcast-tower"></i> UDP Service</h2>
            <button @click="fetchUdpStatus" :disabled="udpLoading" class="refresh-btn">
              <i v-if="!udpLoading" class="fas fa-sync-alt"></i>
              <LoadingSpinner v-else />
            </button>
          </div>

          <div class="card-content">
            <!-- Echo Config -->
            <div class="config-section">
              <h3>Echo Configuration</h3>
              <div class="config-item">
                <label>Enable Echo</label>
                <label class="switch">
                  <input type="checkbox" v-model="udpEchoEnabled" @change="setUdpEchoEnabled" :disabled="udpLoading" />
                  <span class="slider"></span>
                </label>
              </div>
              <div class="config-item">
                <label>Echo Content</label>
                <input v-model="udpEchoContent" @blur="setUdpEchoContent" placeholder="Leave empty for original echo" :disabled="udpLoading" />
              </div>
            </div>

            <!-- Send as Client -->
            <div class="client-section">
              <h3>Send as Client</h3>
              <div class="send-panel">
                <div class="target-config">
                  <input v-model="udpTargetIp" placeholder="IP Address" :disabled="udpLoading" />
                  <input v-model.number="udpTargetPort" type="number" placeholder="Port" :disabled="udpLoading" />
                </div>
                <div class="message-area">
                  <input 
                    v-model="udpClientMsg" 
                    placeholder="Enter message..."
                    :disabled="udpLoading"
                    @keydown.enter="sendUdpClientMsg"
                  />
                  <button 
                    @click="sendUdpClientMsg" 
                    :disabled="udpLoading || !udpClientMsg.trim() || !udpTargetIp || !udpTargetPort"
                  >
                    Send UDP
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
                <option value="tcp">TCP Messages</option>
                <option value="udp">UDP Messages</option>
                <option value="in">Incoming</option>
                <option value="out">Outgoing</option>
                <option value="error">Errors</option>
              </select>
              <button @click="clearMessageHistory" :disabled="messageHistory.length === 0" class="clear-btn">
                <i class="fas fa-trash-alt"></i>
                Clear
              </button>
            </div>
          </div>
          <div class="card-content">
            <div v-if="filteredMessages.length > 0" class="message-list">
              <div v-for="msg in filteredMessages.slice(0, 20)" :key="msg.id" class="message-item" :class="[msg.type, msg.direction, msg.status]">
                <div class="message-meta">
                  <span class="message-type" :class="msg.type">{{ msg.type.toUpperCase() }}</span>
                  <i class="message-direction" :class="`fas ${msg.direction === 'in' ? 'fa-arrow-down' : 'fa-arrow-up'}`"></i>
                  <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                  <span class="message-date">{{ formatDate(msg.timestamp) }}</span>
                </div>
                <div class="message-content">
                  <div class="message-route">
                    <span class="from">{{ msg.from }}</span>
                    <span class="arrow">→</span>
                    <span class="to">{{ msg.to }}</span>
                  </div>
                  <div class="message-text">{{ msg.message }}</div>
                </div>
                <div class="message-status" :class="msg.status">
                  <i v-if="msg.status === 'success'" class="fas fa-check-circle"></i>
                  <i v-else class="fas fa-times-circle"></i>
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
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import LoadingPage from '@/components/pages/LoadingPage.vue'

// State variables
const autoRefresh = ref(false)
const refreshInterval = ref(5000)
const messageFilter = ref('all')
let refreshTimer: number | null = null

// Loading states
const isLoading = ref(false)
const tcpLoading = ref(false)
const udpLoading = ref(false)

// Error states
const error = ref('')
const successMessage = ref('')

// TCP
const tcpStatus = ref(false)
const tcpEchoEnabled = ref(true)
const tcpEchoContent = ref('')
const tcpClients = ref<{
  id: string, 
  address: string, 
  port: number, 
  connected: boolean,
  connectedAt: string,
  connectedDuration: number
}[]>([])
const tcpSendMsg = ref<Record<string, string>>({})
const tcpTargetIp = ref('127.0.0.1')
const tcpTargetPort = ref(9001)
const tcpClientMsg = ref('')

// UDP
const udpStatus = ref(false)
const udpEchoEnabled = ref(true)
const udpEchoContent = ref('')
const udpTargetIp = ref('127.0.0.1')
const udpTargetPort = ref(9000)
const udpClientMsg = ref('')

// Message history
const messageHistory = ref<Array<{
  id: string
  timestamp: Date
  type: 'tcp' | 'udp'
  direction: 'in' | 'out'
  from?: string
  to?: string
  message: string
  status: 'success' | 'error'
}>>([])

// Computed properties
const filteredMessages = computed(() => {
  if (messageFilter.value === 'all') return messageHistory.value
  
  return messageHistory.value.filter(msg => {
    switch (messageFilter.value) {
      case 'tcp': return msg.type === 'tcp'
      case 'udp': return msg.type === 'udp'
      case 'in': return msg.direction === 'in'
      case 'out': return msg.direction === 'out'
      case 'error': return msg.status === 'error'
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

const addMessageToHistory = (type: 'tcp' | 'udp', direction: 'in' | 'out', message: string, from?: string, to?: string, status: 'success' | 'error' = 'success') => {
  const newMessage = {
    id: Date.now().toString(),
    timestamp: new Date(),
    type,
    direction,
    from,
    to,
    message,
    status
  }
  messageHistory.value.unshift(newMessage)
  
  if (messageHistory.value.length > 100) {
    messageHistory.value = messageHistory.value.slice(0, 100)
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
        fetchTcpStatus(),
        fetchUdpStatus(),
        fetchTcpClients()
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
    tcpStatus: tcpStatus.value,
    udpStatus: udpStatus.value,
    tcpClients: tcpClients.value,
    messageHistory: messageHistory.value.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `tcpudp-data-${new Date().toISOString().slice(0, 10)}.json`
  
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

const formatDate = (date: Date) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (msgDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (msgDate.getTime() === today.getTime() - 86400000) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const getConnectionTime = (clientId: string) => {
  const client = tcpClients.value.find(c => c.id === clientId)
  if (!client) return 'Unknown'
  
  const duration = client.connectedDuration
  if (duration < 60) {
    return `${duration}s`
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)}m ${duration % 60}s`
  } else {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
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
async function fetchTcpStatus() {
  try {
    const res = await axios.get('/api/tcp/status')
    tcpStatus.value = res.data.listening
  } catch (err) {
    handleError(err, 'Failed to fetch TCP status')
  }
}

async function fetchUdpStatus() {
  try {
    const res = await axios.get('/api/udp/status')
    udpStatus.value = res.data.listening
  } catch (err) {
    handleError(err, 'Failed to fetch UDP status')
  }
}

async function fetchTcpClients() {
  try {
    const res = await axios.get('/api/tcp/clients')
    tcpClients.value = res.data.clients
  } catch (err) {
    handleError(err, 'Failed to fetch TCP clients')
  }
}

async function fetchTcpEcho() {
  try {
    const res = await axios.get('/api/tcp/echo')
    tcpEchoEnabled.value = res.data.enabled
    tcpEchoContent.value = res.data.content || ''
  } catch (err) {
    handleError(err, 'Failed to fetch TCP echo config')
  }
}

async function fetchUdpEcho() {
  try {
    const res = await axios.get('/api/udp/echo')
    udpEchoEnabled.value = res.data.enabled
    udpEchoContent.value = res.data.content || ''
  } catch (err) {
    handleError(err, 'Failed to fetch UDP echo config')
  }
}

async function setTcpEchoEnabled() {
  tcpLoading.value = true
  try {
    await axios.post('/api/tcp/echo/enabled', { enabled: tcpEchoEnabled.value })
    showSuccess('TCP echo setting updated')
  } catch (err) {
    handleError(err, 'Failed to update TCP echo setting')
  } finally {
    tcpLoading.value = false
  }
}

async function setTcpEchoContent() {
  tcpLoading.value = true
  try {
    await axios.post('/api/tcp/echo/content', { content: tcpEchoContent.value || null })
    showSuccess('TCP echo content updated')
  } catch (err) {
    handleError(err, 'Failed to update TCP echo content')
  } finally {
    tcpLoading.value = false
  }
}

async function setUdpEchoEnabled() {
  udpLoading.value = true
  try {
    await axios.post('/api/udp/echo/enabled', { enabled: udpEchoEnabled.value })
    showSuccess('UDP echo setting updated')
  } catch (err) {
    handleError(err, 'Failed to update UDP echo setting')
  } finally {
    udpLoading.value = false
  }
}

async function setUdpEchoContent() {
  udpLoading.value = true
  try {
    await axios.post('/api/udp/echo/content', { content: udpEchoContent.value || null })
    showSuccess('UDP echo content updated')
  } catch (err) {
    handleError(err, 'Failed to update UDP echo content')
  } finally {
    udpLoading.value = false
  }
}

async function sendToTcpClient(clientId: string) {
  if (!tcpSendMsg.value[clientId]?.trim()) return
  
  tcpLoading.value = true
  try {
    await axios.post('/api/tcp/sendToClient', { 
      clientId, 
      message: tcpSendMsg.value[clientId] 
    })
    addMessageToHistory('tcp', 'out', tcpSendMsg.value[clientId], 'Server', clientId)
    showSuccess(`Message sent to client ${clientId}`)
    tcpSendMsg.value[clientId] = ''
  } catch (err) {
    addMessageToHistory('tcp', 'out', tcpSendMsg.value[clientId], 'Server', clientId, 'error')
    handleError(err, 'Failed to send message to TCP client')
  } finally {
    tcpLoading.value = false
  }
}

async function disconnectClient(clientId: string) {
  if (!confirm(`Are you sure you want to disconnect client ${clientId}?`)) return
  
  tcpLoading.value = true
  try {
    await axios.post('/api/tcp/disconnectClient', { clientId })
    showSuccess(`Client ${clientId} disconnected`)
    await fetchTcpClients() // 刷新客户端列表
  } catch (err) {
    handleError(err, 'Failed to disconnect TCP client')
  } finally {
    tcpLoading.value = false
  }
}

async function refreshClients() {
  tcpLoading.value = true
  try {
    await fetchTcpClients()
    showSuccess('Client list refreshed')
  } catch (err) {
    handleError(err, 'Failed to refresh client list')
  } finally {
    tcpLoading.value = false
  }
}

async function disconnectAllClients() {
  if (!confirm('Are you sure you want to disconnect all clients?')) return
  
  tcpLoading.value = true
  try {
    await axios.post('/api/tcp/closeAllClients')
    showSuccess('All clients disconnected')
    await fetchTcpClients() // 刷新客户端列表
  } catch (err) {
    handleError(err, 'Failed to disconnect all clients')
  } finally {
    tcpLoading.value = false
  }
}

async function sendTcpClientMsg() {
  if (!tcpClientMsg.value.trim() || !tcpTargetIp.value || !tcpTargetPort.value) return
  
  tcpLoading.value = true
  const target = `${tcpTargetIp.value}:${tcpTargetPort.value}`
  
  try {
    await axios.post('/api/tcp/send', {
      host: tcpTargetIp.value,
      port: tcpTargetPort.value,
      message: tcpClientMsg.value
    })
    addMessageToHistory('tcp', 'out', tcpClientMsg.value, 'Client', target)
    showSuccess(`TCP message sent to ${target}`)
    tcpClientMsg.value = ''
  } catch (err) {
    addMessageToHistory('tcp', 'out', tcpClientMsg.value, 'Client', target, 'error')
    handleError(err, 'Failed to send TCP message')
  } finally {
    tcpLoading.value = false
  }
}

async function sendUdpClientMsg() {
  if (!udpClientMsg.value.trim() || !udpTargetIp.value || !udpTargetPort.value) return
  
  udpLoading.value = true
  const target = `${udpTargetIp.value}:${udpTargetPort.value}`
  
  try {
    await axios.post('/api/udp/send', {
      host: udpTargetIp.value,
      port: udpTargetPort.value,
      message: udpClientMsg.value
    })
    addMessageToHistory('udp', 'out', udpClientMsg.value, 'Client', target)
    showSuccess(`UDP message sent to ${target}`)
    udpClientMsg.value = ''
  } catch (err) {
    addMessageToHistory('udp', 'out', udpClientMsg.value, 'Client', target, 'error')
    handleError(err, 'Failed to send UDP message')
  } finally {
    udpLoading.value = false
  }
}

const handleTcpToggle = async () => {
  try {
    if (tcpStatus.value) {
      await axios.post('/api/tcp/stop')
      showSuccess('TCP Server stopped successfully')
    } else {
      await axios.post('/api/tcp/start')
      showSuccess('TCP Server started successfully')
    }
    await fetchTcpStatus()
  } catch (err) {
    handleError(err, 'Failed to toggle TCP server')
  }
}

const handleUdpToggle = async () => {
  try {
    if (udpStatus.value) {
      await axios.post('/api/udp/stop')
      showSuccess('UDP Server stopped successfully')
    } else {
      await axios.post('/api/udp/start')
      showSuccess('UDP Server started successfully')
    }
    await fetchUdpStatus()
  } catch (err) {
    handleError(err, 'Failed to toggle UDP server')
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchTcpStatus(),
      fetchUdpStatus(),
      fetchTcpClients(),
      fetchTcpEcho(),
      fetchUdpEcho()
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
/* Base styles */
.tcpudp-view {
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 只在这里允许垂直滚动 */
}

/* Header */
.header {
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 0;
  flex-shrink: 0; /* 防止头部被压缩 */
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
  background: #10b981;
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
  color: #10b981;
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
  border-color: #10b981;
}

.btn.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Messages */
.message {
  position: fixed;
  top: 80px; /* 位于 header 下方 */
  right: 1rem;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000; /* 确保在最上层 */
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
  overflow-y: auto; /* 允许内容区域滚动 */
}

/* Service panel */
.service-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  flex-shrink: 0; /* 防止被压缩 */
}

.service-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.service-toggle:last-child {
  border-bottom: none;
}

.service-toggle.active {
  background: #f0fdf4;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.service-info i {
  font-size: 1.25rem;
  color: #10b981;
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
  border-color: #10b981;
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
  border-color: #10b981;
}

.card-content {
  padding: 1.5rem;
}

/* Config section */
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.config-item label {
  font-size: 0.875rem;
  color: #374151;
}

.config-item input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
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
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Clients section */
.clients-section {
  margin-bottom: 2rem;
}

.clients-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #374151;
}

.clients-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.refresh-clients-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.refresh-clients-btn:hover:not(:disabled) {
  background: #2563eb;
}

.disconnect-all-btn {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.disconnect-all-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.refresh-clients-btn:disabled,
.disconnect-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}



.client-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.client-item:hover {
  background: #f0fdf4;
  border-color: #10b981;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.client-info i {
  color: #10b981;
  font-size: 1.25rem;
}

.client-details {
  flex: 1;
}

.client-id {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.client-address {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.client-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #16a34a;
}

.connection-time {
  margin-left: auto;
  color: #6b7280;
  font-size: 0.7rem;
}

.message-input {
  display: flex;
  flex: 1;
  gap: 0.5rem;
}

.message-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.send-btn {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #059669;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.disconnect-btn {
  padding: 0.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.disconnect-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.disconnect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Client section */
.client-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #374151;
}

.send-panel > * + * {
  margin-top: 1rem;
}

.target-config {
  display: flex;
  gap: 0.5rem;
}

.target-config input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.message-area {
  display: flex;
  gap: 0.5rem;
}

.message-area input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.message-area button {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.message-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.message-type.tcp {
  background: #dbeafe;
  color: #1d4ed8;
}

.message-type.udp {
  background: #f3e8ff;
  color: #7c3aed;
}

.message-direction {
  font-size: 0.875rem;
}

.message-direction.fa-arrow-down {
  color: #16a34a;
}

.message-direction.fa-arrow-up {
  color: #dc2626;
}

.message-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.message-date {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-left: 0.5rem;
}

.message-content {
  flex: 1;
}

.message-route {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.message-text {
  font-size: 0.875rem;
  color: #1f2937;
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
  
  .target-config {
    flex-direction: column;
  }
  
  .client-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

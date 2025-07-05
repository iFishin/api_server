<template>
  <div class="tcpudp-view">
    <!-- 页面头部 -->
    <div class="tcpudp-header">
      <!-- 背景装饰 -->
      <div class="header-background">
        <div class="bg-pattern"></div>
        <div class="floating-icons">
          <div class="float-icon" style="--delay: 0s; --x: 10%; --y: 20%;">
            <i class="fas fa-network-wired"></i>
          </div>
          <div class="float-icon" style="--delay: 1s; --x: 85%; --y: 30%;">
            <i class="fas fa-server"></i>
          </div>
          <div class="float-icon" style="--delay: 2s; --x: 20%; --y: 70%;">
            <i class="fas fa-wifi"></i>
          </div>
          <div class="float-icon" style="--delay: 3s; --x: 75%; --y: 60%;">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="float-icon" style="--delay: 4s; --x: 50%; --y: 15%;">
            <i class="fas fa-broadcast-tower"></i>
          </div>
        </div>
      </div>
      
      <!-- 主要内容 -->
      <div class="header-content">
        <div class="header-main">
          <div class="header-info">
            <div class="title-section">
              <div class="title-icon">
                <i class="fas fa-network-wired"></i>
                <div class="icon-glow"></div>
              </div>
              <div class="title-content">
                <h1 class="main-title">
                  <span class="title-gradient">Network</span>
                  <span class="title-normal">Services</span>
                </h1>
                <div class="title-underline"></div>
              </div>
            </div>
            <p class="subtitle">
              <i class="fas fa-star subtitle-icon"></i>
              Real-time TCP & UDP Network Service Monitoring Dashboard
            </p>
            <div class="feature-badges">
              <span class="feature-badge">
                <i class="fas fa-bolt"></i>
                Real-time Monitoring
              </span>
              <span class="feature-badge">
                <i class="fas fa-shield-alt"></i>
                Reliable Connection
              </span>
              <span class="feature-badge">
                <i class="fas fa-tachometer-alt"></i>
                High Performance
              </span>
            </div>
          </div>
          
          <div class="header-stats">
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                  <div class="stat-pulse"></div>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ tcpClients.length }}</span>
                  <span class="stat-label">TCP Clients</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-comments"></i>
                  <div class="stat-pulse"></div>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ messageHistory.length }}</span>
                  <span class="stat-label">Messages</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-server"></i>
                  <div class="stat-pulse"></div>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ tcpStatus && udpStatus ? '2' : tcpStatus || udpStatus ? '1' : '0' }}</span>
                  <span class="stat-label">Active Services</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 服务状态快览 -->
        <div class="services-overview">
          <div class="overview-title">
            <i class="fas fa-server"></i>
            Services Status
          </div>
          <div class="services-status-grid">
            <div class="service-status-card" :class="{ active: tcpStatus }">
              <div class="service-status-header">
                <div class="service-status-icon">
                  <i class="fas fa-plug"></i>
                </div>
                <div class="service-status-info">
                  <h4>TCP Server</h4>
                  <span class="service-port">Port 9001</span>
                </div>
                <div class="service-status-indicator">
                  <div class="status-dot" :class="{ online: tcpStatus, offline: !tcpStatus }"></div>
                  <span class="status-text">{{ tcpStatus ? 'Online' : 'Offline' }}</span>
                </div>
              </div>
              <div class="service-stats-row">
                <div class="stat-box">
                  <span class="stat-number">{{ tcpClients.length }}</span>
                  <span class="stat-label">Clients</span>
                </div>
                <div class="stat-box">
                  <span class="stat-number">{{ messageHistory.filter(m => m.type.toLowerCase() === 'tcp').length }}</span>
                  <span class="stat-label">Messages</span>
                </div>
              </div>
            </div>
            
            <div class="service-status-card" :class="{ active: udpStatus }">
              <div class="service-status-header">
                <div class="service-status-icon">
                  <i class="fas fa-broadcast-tower"></i>
                </div>
                <div class="service-status-info">
                  <h4>UDP Server</h4>
                  <span class="service-port">Port 9000</span>
                </div>
                <div class="service-status-indicator">
                  <div class="status-dot" :class="{ online: udpStatus, offline: !udpStatus }"></div>
                  <span class="status-text">{{ udpStatus ? 'Online' : 'Offline' }}</span>
                </div>
              </div>
              <div class="service-stats-row">
                <div class="stat-box">
                  <span class="stat-number">{{ udpMessagesCount }}</span>
                  <span class="stat-label">Messages</span>
                </div>
                <div class="stat-box">
                  <span class="stat-number">{{ messagesPerMinute }}</span>
                  <span class="stat-label">Per Min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时监控面板 -->
        <div class="monitor-panel">
          <div class="monitor-header">
            <div class="monitor-title">
              <div class="monitor-title-icon">
                <i class="fas fa-chart-line"></i>
                <div class="title-pulse"></div>
              </div>
              <h3>Real-time Monitor</h3>
            </div>
            <div class="monitor-controls">
              <button @click="toggleAutoRefresh" class="control-btn" :class="{ active: autoRefresh }">
                <i class="btn-icon" :class="autoRefresh ? 'fas fa-pause' : 'fas fa-play'"></i>
                <span class="btn-text">{{ autoRefresh ? 'Pause' : 'Start' }}</span>
              </button>
              <div class="refresh-info">
                <i class="fas fa-clock"></i>
                <span>{{ refreshInterval / 1000 }}s</span>
              </div>
            </div>
          </div>
          <div class="monitor-metrics">
            <div class="metric-card">
              <div class="metric-icon">
                <i class="fas fa-chart-bar"></i>
                <div class="metric-glow"></div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ messageHistory.length }}</div>
                <div class="metric-label">Total Messages</div>
                <div class="metric-trend">
                  <i class="fas fa-arrow-up"></i>
                  <span>+{{ messagesPerMinute }}/min</span>
                </div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <i class="fas fa-tachometer-alt"></i>
                <div class="metric-glow"></div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ messagesPerMinute }}</div>
                <div class="metric-label">Messages/min</div>
                <div class="metric-trend">
                  <i class="fas fa-bolt"></i>
                  <span>Real-time</span>
                </div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <i class="fas fa-link"></i>
                <div class="metric-glow"></div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ tcpClients.length }}</div>
                <div class="metric-label">TCP Connections</div>
                <div class="metric-trend">
                  <i class="fas fa-wifi" :class="{ 'text-success': tcpStatus, 'text-danger': !tcpStatus }"></i>
                  <span>{{ tcpStatus ? 'Active' : 'Inactive' }}</span>
                </div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <i class="fas fa-satellite-dish"></i>
                <div class="metric-glow"></div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ udpMessagesCount }}</div>
                <div class="metric-label">UDP Messages</div>
                <div class="metric-trend">
                  <i class="fas fa-broadcast-tower" :class="{ 'text-success': udpStatus, 'text-danger': !udpStatus }"></i>
                  <span>{{ udpStatus ? 'Broadcasting' : 'Stopped' }}</span>
                </div>
              </div>
            </div>
          </div>
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
    <div v-if="error" class="message error-message">
      <i class="fas fa-exclamation-triangle message-icon"></i>
      {{ error }}
      <button @click="error = ''" class="message-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div v-if="successMessage" class="message success-message">
      <i class="fas fa-check-circle message-icon"></i>
      {{ successMessage }}
      <button @click="successMessage = ''" class="message-close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- 主内容容器 -->
    <div class="main-container">
      <!-- Control Panel -->
      <div class="control-panel" v-if="!isLoading">
      <div class="panel-section">
        <div class="section-header">
          <div class="header-left">
            <div class="header-icon">
              <i class="fas fa-cogs"></i>
              <div class="icon-sparkle"></div>
            </div>
            <div class="header-content">
              <h3>Network Control Center</h3>
              <p>Manage and monitor network services</p>
            </div>
          </div>
          <div class="stats-display">
            <div class="stat-chip stat-chip-primary">
              <i class="fas fa-plug"></i>
              <span class="stat-value">{{ tcpClients.length }}</span>
              <span class="stat-label">TCP Connections</span>
            </div>
            <div class="stat-chip stat-chip-success">
              <i class="fas fa-envelope"></i>
              <span class="stat-value">{{ messageHistory.length }}</span>
              <span class="stat-label">Total Messages</span>
            </div>
            <div class="stat-chip stat-chip-info">
              <i class="fas fa-server"></i>
              <span class="stat-value">{{ tcpStatus && udpStatus ? '2' : tcpStatus || udpStatus ? '1' : '0' }}</span>
              <span class="stat-label">Active Services</span>
            </div>
            <button @click="exportData" class="export-btn" :disabled="messageHistory.length === 0">
              <i class="fas fa-download"></i>
              <span>Export Data</span>
            </button>
          </div>
        </div>
        
        <div class="service-toggles">
          <div class="service-toggle service-toggle-tcp" :class="{ active: tcpStatus }">
            <div class="toggle-header">
              <div class="toggle-icon-wrapper">
                <i class="fas fa-plug toggle-icon"></i>
                <div class="connection-pulse" :class="{ active: tcpStatus }"></div>
              </div>
              <div class="toggle-details">
                <div class="toggle-title">TCP Server</div>
                <div class="toggle-desc">Port 9001 • Reliable Transport</div>
              </div>
              <div class="toggle-status" :class="{ online: tcpStatus, offline: !tcpStatus }">
                <div class="status-indicator"></div>
                <span class="status-text">{{ tcpStatus ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
            <div class="toggle-content">
              <div class="service-metrics">
                <div class="metric-item">
                  <span class="metric-value">{{ tcpClients.length }}</span>
                  <span class="metric-label">Active Clients</span>
                </div>
                <div class="metric-item">
                  <span class="metric-value">{{ messageHistory.filter(m => m.type.toLowerCase() === 'tcp').length }}</span>
                  <span class="metric-label">Messages Sent</span>
                </div>
                <div class="metric-item">
                  <span class="metric-value">9001</span>
                  <span class="metric-label">Port</span>
                </div>
              </div>
              <div class="toggle-actions">
                <button @click="handleTcpToggle" class="action-btn" :class="{ active: tcpStatus }">
                  <i :class="tcpStatus ? 'fas fa-stop' : 'fas fa-play'"></i>
                  {{ tcpStatus ? 'Stop Server' : 'Start Server' }}
                </button>
              </div>
            </div>
          </div>

          <div class="service-toggle service-toggle-udp" :class="{ active: udpStatus }">
            <div class="toggle-header">
              <div class="toggle-icon-wrapper">
                <i class="fas fa-broadcast-tower toggle-icon"></i>
                <div class="connection-pulse" :class="{ active: udpStatus }"></div>
              </div>
              <div class="toggle-details">
                <div class="toggle-title">UDP Server</div>
                <div class="toggle-desc">Port 9000 • Fast Broadcast</div>
              </div>
              <div class="toggle-status" :class="{ online: udpStatus, offline: !udpStatus }">
                <div class="status-indicator"></div>
                <span class="status-text">{{ udpStatus ? 'Broadcasting' : 'Stopped' }}</span>
              </div>
            </div>
            <div class="toggle-content">
              <div class="service-metrics">
                <div class="metric-item">
                  <span class="metric-value">{{ udpMessagesCount }}</span>
                  <span class="metric-label">Messages Sent</span>
                </div>
                <div class="metric-item">
                  <span class="metric-value">{{ messagesPerMinute }}</span>
                  <span class="metric-label">Per Minute</span>
                </div>
                <div class="metric-item">
                  <span class="metric-value">9000</span>
                  <span class="metric-label">Port</span>
                </div>
              </div>
              <div class="toggle-actions">
                <button @click="handleUdpToggle" class="action-btn" :class="{ active: udpStatus }">
                  <i :class="udpStatus ? 'fas fa-stop' : 'fas fa-broadcast-tower'"></i>
                  {{ udpStatus ? 'Stop Broadcast' : 'Start Broadcast' }}
                </button>
              </div>
            </div>          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="main-grid" v-if="!isLoading">      <!-- TCP Service Card -->
      <div class="service-card tcp-card">
        <div class="service-header">
          <div class="service-info">
            <div class="service-icon-wrapper">
              <i class="fas fa-plug service-icon"></i>
              <div class="connection-indicator" :class="{ active: tcpStatus }">
                <div class="pulse-ring"></div>
                <div class="pulse-dot"></div>
              </div>
            </div>
            <div class="service-details">
              <h2>TCP 可靠传输</h2>
              <p class="service-subtitle">面向连接 · 数据完整性保证</p>
              <div class="service-stats">
                <span class="stat-item">
                  <span class="stat-label">连接数</span>
                  <span class="stat-value">{{ tcpClients.length }}</span>
                </span>
                <span class="stat-divider">·</span>
                <span class="stat-item">
                  <span class="stat-label">端口</span>
                  <span class="stat-value">9001</span>
                </span>
              </div>
            </div>
          </div>
          <div class="service-actions">
            <button class="action-btn refresh-btn" @click="fetchTcpStatus" :disabled="tcpLoading" title="刷新状态">
              <i v-if="!tcpLoading" class="fas fa-sync-alt action-icon"></i>
              <LoadingSpinner v-else />
            </button>
          </div>
        </div>

        <div class="service-content">
          <!-- Echo Configuration -->
          <div class="config-section">
            <div class="section-header">
              <h3>
                <i class="fas fa-cogs"></i>
                回显配置
              </h3>
              <div class="section-badge">基础设置</div>
            </div>
            
            <div class="config-grid">
              <div class="config-item">
                <label class="config-label">
                  <span class="label-text">启用回显</span>
                  <span class="label-desc">自动回复接收到的消息</span>
                </label>
                <div class="config-control">
                  <label class="modern-switch">
                    <input 
                      type="checkbox" 
                      v-model="tcpEchoEnabled" 
                      @change="setTcpEchoEnabled"
                      :disabled="tcpLoading"
                    />
                    <span class="switch-slider"></span>
                    <span class="switch-label">{{ tcpEchoEnabled ? 'ON' : 'OFF' }}</span>
                  </label>
                </div>
              </div>
              
              <div class="config-item">
                <label class="config-label">
                  <span class="label-text">回显内容</span>
                  <span class="label-desc">自定义回显消息内容</span>
                </label>
                <div class="config-control">
                  <input 
                    v-model="tcpEchoContent" 
                    @blur="setTcpEchoContent" 
                    placeholder="留空则原样回显"
                    class="modern-input"
                    :disabled="tcpLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Connected Clients -->
          <div class="clients-section">
            <div class="section-header">
              <h3>
                <i class="fas fa-users"></i>
                活跃连接
              </h3>
              <div class="section-badge">{{ tcpClients.length }} 个客户端</div>
            </div>
              <div v-if="tcpClients.length > 0" class="clients-list">
              <div v-for="client in tcpClients" :key="client.id" class="client-card">
                <div class="client-info">
                  <div class="client-avatar">
                    <i class="fas fa-desktop client-icon"></i>
                    <div class="online-indicator"></div>
                  </div>
                  <div class="client-details">
                    <div class="client-id">{{ client.id }}</div>
                    <div class="client-status">
                      <span class="status-dot online"></span>
                      在线 · TCP连接
                    </div>
                  </div>
                </div>
                <div class="client-message-area">
                  <div class="message-input-group">
                    <textarea 
                      v-model="tcpSendMsg[client.id]" 
                      placeholder="输入要发送的消息... (Ctrl+Enter 快速发送)"
                      class="client-message-input"
                      :disabled="tcpLoading"
                      @keydown.ctrl.enter="sendToTcpClient(client.id)"
                      rows="2"
                    ></textarea>
                    <button 
                      @click="sendToTcpClient(client.id)" 
                      class="send-btn"
                      :disabled="tcpLoading || !tcpSendMsg[client.id]?.trim()"
                      :title="tcpSendMsg[client.id]?.trim() ? '发送消息' : '请输入消息内容'"
                    >
                      <LoadingSpinner v-if="tcpLoading" />
                      <i v-else class="fas fa-paper-plane send-icon"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-illustration">
                <i class="fas fa-plug empty-icon"></i>
                <div class="empty-text">
                  <h4>暂无客户端连接</h4>
                  <p>等待客户端连接到 TCP 服务器</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Send as Client -->
          <div class="client-section">
            <div class="section-header">
              <h3>
                <i class="fas fa-paper-plane"></i>
                客户端发送
              </h3>
              <div class="section-badge">主动发送</div>
            </div>
            
            <div class="send-panel">
              <div class="target-config">
                <div class="input-group">
                  <label class="input-label">目标地址</label>
                  <input 
                    v-model="tcpTargetIp" 
                    placeholder="IP 地址"
                    class="modern-input target-ip"
                    :disabled="tcpLoading"
                  />
                </div>
                <div class="input-group">
                  <label class="input-label">端口</label>
                  <input 
                    v-model.number="tcpTargetPort" 
                    type="number" 
                    placeholder="端口号"
                    class="modern-input target-port"
                    :disabled="tcpLoading"
                  />
                </div>
              </div>
              
              <div class="message-area">
                <label class="input-label">消息内容</label>
                <div class="message-input-group">
                  <textarea 
                    v-model="tcpClientMsg" 
                    placeholder="输入要发送的消息内容..."
                    class="message-textarea"
                    :disabled="tcpLoading"
                    @keydown.ctrl.enter="sendTcpClientMsg"
                    rows="3"
                  ></textarea>
                  <button 
                    @click="sendTcpClientMsg" 
                    class="send-btn primary"
                    :disabled="tcpLoading || !tcpClientMsg.trim() || !tcpTargetIp || !tcpTargetPort"
                  >
                    <LoadingSpinner v-if="tcpLoading" />
                    <span v-else>🚀 发送 TCP</span>
                  </button>
                </div>
                <div class="send-hint">提示: Ctrl+Enter 快速发送</div>
              </div>
            </div>
          </div>
        </div>
      </div>      <!-- UDP Service Card -->
      <div class="service-card udp-card">
        <div class="service-header">
          <div class="service-info">
            <div class="service-icon-wrapper">
              <i class="fas fa-broadcast-tower service-icon"></i>
              <div class="connection-indicator" :class="{ active: udpStatus }">
                <div class="pulse-ring"></div>
                <div class="pulse-dot"></div>
              </div>
            </div>
            <div class="service-details">
              <h2>UDP 快速传输</h2>
              <p class="service-subtitle">无连接 · 高速数据交换</p>
              <div class="service-stats">                <span class="stat-item">
                  <span class="stat-label">消息数</span>
                  <span class="stat-value">{{ messageHistory.filter(m => m.type.toLowerCase() === 'udp').length }}</span>
                </span>
                <span class="stat-divider">·</span>
                <span class="stat-item">
                  <span class="stat-label">端口</span>
                  <span class="stat-value">9000</span>
                </span>
              </div>
            </div>
          </div>
          <div class="service-actions">
            <button class="action-btn refresh-btn" @click="fetchUdpStatus" :disabled="udpLoading" title="刷新状态">
              <i v-if="!udpLoading" class="fas fa-sync-alt action-icon"></i>
              <LoadingSpinner v-else />
            </button>
          </div>
        </div>

        <div class="service-content">
          <!-- Echo Configuration -->
          <div class="config-section">
            <div class="section-header">
              <h3>
                <i class="fas fa-cogs"></i>
                回显配置
              </h3>
              <div class="section-badge">基础设置</div>
            </div>
            
            <div class="config-grid">
              <div class="config-item">
                <label class="config-label">
                  <span class="label-text">启用回显</span>
                  <span class="label-desc">自动回复接收到的消息</span>
                </label>
                <div class="config-control">
                  <label class="modern-switch">
                    <input 
                      type="checkbox" 
                      v-model="udpEchoEnabled" 
                      @change="setUdpEchoEnabled"
                      :disabled="udpLoading"
                    />
                    <span class="switch-slider"></span>
                    <span class="switch-label">{{ udpEchoEnabled ? 'ON' : 'OFF' }}</span>
                  </label>
                </div>
              </div>
              
              <div class="config-item">
                <label class="config-label">
                  <span class="label-text">回显内容</span>
                  <span class="label-desc">自定义回显消息内容</span>
                </label>
                <div class="config-control">
                  <input 
                    v-model="udpEchoContent" 
                    @blur="setUdpEchoContent" 
                    placeholder="留空则原样回显"
                    class="modern-input"
                    :disabled="udpLoading"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Send as Client -->
          <div class="client-section">
            <div class="section-header">
              <h3>
                <i class="fas fa-paper-plane"></i>
                客户端发送
              </h3>
              <div class="section-badge">主动发送</div>
            </div>
            
            <div class="send-panel">
              <div class="target-config">
                <div class="input-group">
                  <label class="input-label">目标地址</label>
                  <input 
                    v-model="udpTargetIp" 
                    placeholder="IP 地址"
                    class="modern-input target-ip"
                    :disabled="udpLoading"
                  />
                </div>
                <div class="input-group">
                  <label class="input-label">端口</label>
                  <input 
                    v-model.number="udpTargetPort" 
                    type="number" 
                    placeholder="端口号"
                    class="modern-input target-port"
                    :disabled="udpLoading"
                  />
                </div>
              </div>
              
              <div class="message-area">
                <label class="input-label">消息内容</label>
                <div class="message-input-group">
                  <textarea 
                    v-model="udpClientMsg" 
                    placeholder="输入要发送的消息内容..."
                    class="message-textarea"
                    :disabled="udpLoading"
                    @keydown.ctrl.enter="sendUdpClientMsg"
                    rows="3"
                  ></textarea>
                  <button 
                    @click="sendUdpClientMsg" 
                    class="send-btn primary"
                    :disabled="udpLoading || !udpClientMsg.trim() || !udpTargetIp || !udpTargetPort"
                  >
                    <LoadingSpinner v-if="udpLoading" />
                    <span v-else>🚀 发送 UDP</span>
                  </button>
                </div>
                <div class="send-hint">提示: Ctrl+Enter 快速发送</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message History -->
      <div class="history-card">
        <div class="history-header">
          <h3>
            <i class="fas fa-chart-line"></i>
            消息历史
          </h3>
          <div class="history-actions">
            <div class="filter-controls">
              <select v-model="messageFilter" class="filter-select">
                <option value="all">全部消息</option>
                <option value="tcp">TCP消息</option>
                <option value="udp">UDP消息</option>
                <option value="in">接收消息</option>
                <option value="out">发送消息</option>
                <option value="error">错误消息</option>
              </select>
            </div>
            <button class="action-btn clear-btn" @click="clearMessageHistory" :disabled="messageHistory.length === 0">
              <i class="fas fa-trash-alt"></i>
              清空
            </button>
          </div>
        </div>
        <div class="history-content">
          <div v-if="filteredMessages.length > 0" class="message-list">
            <div v-for="msg in filteredMessages.slice(0, 20)" :key="msg.id" class="message-item" :class="[msg.type, msg.direction, msg.status]">
              <div class="message-meta">
                <span class="message-type-badge" :class="msg.type">{{ msg.type.toUpperCase() }}</span>
                <i class="message-direction" :class="`fas ${msg.direction === 'in' ? 'fa-arrow-down' : 'fa-arrow-up'} ${msg.direction}`"></i>
                <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
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
                <i v-if="msg.status === 'success'" class="fas fa-check-circle text-green-500"></i>
                <i v-else class="fas fa-times-circle text-red-500"></i>
              </div>
            </div>
          </div>
          <div v-else class="empty-history">
            <i class="fas fa-inbox empty-icon"></i>
            <p>{{ messageFilter === 'all' ? '暂无消息记录' : '暂无符合条件的消息' }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 结束主内容容器 -->
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import axios from 'axios'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import LoadingPage from '@/components/pages/LoadingPage.vue'

// 新增的响应式变量
const autoRefresh = ref(false)
const refreshInterval = ref(5000) // 5秒
const messagesPerMinute = ref(0)
const messageFilter = ref('all')
let refreshTimer: number | null = null
let messageCounter = ref(0)
let lastMinuteTimestamp = ref(Date.now())

// Loading states
const isLoading = ref(false)
const tcpLoading = ref(false)
const udpLoading = ref(false)

// Error states
const error = ref('')

// TCP
const tcpStatus = ref(false)
const tcpEchoEnabled = ref(true)
const tcpEchoContent = ref('')
const tcpClients = ref<{id: string}[]>([])
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

// Success messages
const successMessage = ref('')

// Message history for monitoring
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

// Show success message temporarily
const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// 覆盖 addMessageToHistory 方法以支持统计
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
  
  // Keep only last 100 messages
  if (messageHistory.value.length > 100) {
    messageHistory.value = messageHistory.value.slice(0, 100)
  }
  
  // 更新每分钟消息统计
  updateMessagesPerMinute()
}

// 计算属性
const udpMessagesCount = computed(() => {
  return messageHistory.value.filter(m => m.type.toLowerCase() === 'udp').length
})

const filteredMessages = computed(() => {
  if (messageFilter.value === 'all') return messageHistory.value
  
  return messageHistory.value.filter(msg => {
    switch (messageFilter.value) {
      case 'tcp':
        return msg.type.toLowerCase() === 'tcp'
      case 'udp':
        return msg.type.toLowerCase() === 'udp'
      case 'in':
        return msg.direction === 'in'
      case 'out':
        return msg.direction === 'out'
      case 'error':
        return msg.status === 'error'
      default:
        return true
    }
  })
})

// 新增方法
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

const updateMessagesPerMinute = () => {
  const now = Date.now()
  const oneMinuteAgo = now - 60000 // 1分钟前
  
  const recentMessages = messageHistory.value.filter(msg => 
    msg.timestamp.getTime() > oneMinuteAgo
  )
  
  messagesPerMinute.value = recentMessages.length
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
    })),
    statistics: {
      totalMessages: messageHistory.value.length,
      tcpMessages: messageHistory.value.filter(m => m.type === 'tcp').length,
      udpMessages: messageHistory.value.filter(m => m.type === 'udp').length,
      successfulMessages: messageHistory.value.filter(m => m.status === 'success').length,
      errorMessages: messageHistory.value.filter(m => m.status === 'error').length
    }
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `tcpudp-data-${new Date().toISOString().slice(0, 10)}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  showSuccess('数据导出成功')
}

// Clear message history
const clearMessageHistory = () => {
  messageHistory.value = []
  showSuccess('消息历史已清空')
}

// Format timestamp
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit', 
    second: '2-digit'
  })
}

// Get connection status text
const getConnectionStatusText = (isActive: boolean) => {
  return isActive ? '运行中' : '已停止'
}

// Get connection status class
const getConnectionStatusClass = (isActive: boolean) => {
  return isActive ? 'status-running' : 'status-stopped'
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey) {
    switch (event.key) {
      case 'r':
        event.preventDefault()
        Promise.all([fetchTcpStatus(), fetchUdpStatus(), fetchTcpClients()])
        break
      case 'e':
        event.preventDefault()
        if (messageHistory.value.length > 0) {
          exportData()
        }
        break
    }
  }
}

// 初始化加载
onMounted(async () => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
  
  // 启动消息统计更新器
  setInterval(updateMessagesPerMinute, 10000) // 每10秒更新一次
  
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
    showSuccess('TCP 回显设置已更新')
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
    showSuccess('TCP 回显内容已更新')
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
    showSuccess('UDP 回显设置已更新')
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
    showSuccess('UDP 回显内容已更新')
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
    showSuccess(`消息已发送至客户端 ${clientId}`)
    tcpSendMsg.value[clientId] = ''
  } catch (err) {
    addMessageToHistory('tcp', 'out', tcpSendMsg.value[clientId], 'Server', clientId, 'error')
    handleError(err, 'Failed to send message to TCP client')
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
    showSuccess(`TCP 消息已发送至 ${target}`)
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
    showSuccess(`UDP 消息已发送至 ${target}`)
    udpClientMsg.value = ''
  } catch (err) {
    addMessageToHistory('udp', 'out', udpClientMsg.value, 'Client', target, 'error')
    handleError(err, 'Failed to send UDP message')
  } finally {
    udpLoading.value = false
  }
}

// TCP/UDP 服务切换方法
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

// 处理错误
const handleError = (err: any, context: string) => {
  console.error(`${context}:`, err)
  const message = err.response?.data?.message || err.message || 'An error occurred'
  error.value = `${context}: ${message}`
  setTimeout(() => {
    error.value = ''
  }, 5000)
}

// 清理
onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('keydown', handleKeydown)
})

// 初始化
onMounted(async () => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
  
  // 启动消息统计更新器
  setInterval(updateMessagesPerMinute, 10000) // 每10秒更新一次
  
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
</script>

<style scoped>
/* 页面整体布局重新设计 - 绿白模糊背景 */
.tcpudp-view {
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    linear-gradient(135deg, #f8fafc 0%, #f0fdf4 25%, #ecfdf5 50%, #f0f9ff 75%, #f8fafc 100%);
  backdrop-filter: blur(2px);
  overflow-x: hidden;
  position: relative;
}

.tcpudp-view::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(34, 197, 94, 0.02) 0%, transparent 40%),
    radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.02) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}

.tcpudp-view > * {
  position: relative;
  z-index: 1;
}

/* 页面头部重新设计 */
.tcpudp-header {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  overflow: hidden;
  padding: 2.5rem 2rem;
  margin: 1rem 1rem 2rem 1rem;
  border-radius: 24px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 
    0 8px 32px rgba(16, 185, 129, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

/* 新增：背景装饰 */
.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.06) 0%, transparent 50%);
  background-size: 100px 100px;
  animation: patternFloat 20s ease-in-out infinite;
}

@keyframes patternFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
}

.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.float-icon {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 40px;
  height: 40px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  animation: floatAround 6s ease-in-out infinite;
  animation-delay: var(--delay);
}

.float-icon i {
  color: rgba(16, 185, 129, 0.6);
  font-size: 1rem;
}

@keyframes floatAround {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(5deg); }
  50% { transform: translateY(-8px) rotate(-3deg); }
  75% { transform: translateY(-20px) rotate(8deg); }
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  margin-bottom: 2rem;
}

.header-info {
  flex: 1;
  max-width: 600px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title-icon {
  position: relative;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.title-icon i {
  font-size: 1.5rem;
  color: #ffffff;
  z-index: 2;
  position: relative;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

.title-content {
  flex: 1;
}

.main-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.title-gradient {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 8px rgba(31, 41, 55, 0.1);
}

.title-normal {
  color: #6b7280;
  margin-left: 0.5rem;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #10b981 0%, rgba(16, 185, 129, 0.3) 100%);
  border-radius: 2px;
  animation: slideIn 1s ease-out;
}

@keyframes slideIn {
  from { width: 0; opacity: 0; }
  to { width: 80px; opacity: 1; }
}

.subtitle {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subtitle-icon {
  color: #f59e0b;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

.feature-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.feature-badge {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 25px;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.feature-badge:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.feature-badge i {
  font-size: 0.75rem;
  color: #10b981;
}

/* 原有样式保持不变 */

/* 主容器布局重新设计 */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem; /* 增加底部间距防止遮挡 */
  min-height: calc(100vh - 200px); /* 确保有足够的高度 */
}

/* ==================== 控制面板重新设计 ==================== */
.control-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 12px 40px rgba(16, 185, 129, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  margin-bottom: 2rem;
}

.panel-section {
  padding: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0.7) 100%);
  border-bottom: 1px solid rgba(16, 185, 129, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  position: relative;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  overflow: hidden;
}

.icon-sparkle {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  animation: sparkle 3s ease-in-out infinite;
  transform: translateX(-100%) translateY(-100%) rotate(45deg);
}

@keyframes sparkle {
  0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.header-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.header-content p {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.stats-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  min-width: 80px;
  text-align: center;
}

.stat-chip-primary {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.stat-chip-success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #15803d;
}

.stat-chip-info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
}

.stat-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-chip i {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 服务切换区域样式 */
.service-toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 2rem 2.5rem;
}

.service-toggle {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(16, 185, 129, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.service-toggle.active {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.02);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
}

.service-toggle:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.2);
}

.service-toggle-tcp.active {
  border-color: rgba(16, 185, 129, 0.3);
}

.service-toggle-udp.active {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.02);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
}

.toggle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border-bottom: 1px solid rgba(16, 185, 129, 0.1);
}

.toggle-icon-wrapper {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: white;
  overflow: hidden;
}

.service-toggle-tcp .toggle-icon-wrapper {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.service-toggle-udp .toggle-icon-wrapper {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.connection-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.connection-pulse.active {
  animation: connectionPulse 2s ease-in-out infinite;
}

.service-toggle-tcp .connection-pulse.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.service-toggle-udp .connection-pulse.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

@keyframes connectionPulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.05); opacity: 0.2; }
}

.toggle-details {
  flex: 1;
  margin: 0 1.5rem;
}

.toggle-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.toggle-desc {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.toggle-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.toggle-status.online .status-indicator {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: statusPulse 2s infinite;
}

.toggle-status.offline .status-indicator {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.1); }
}

.status-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.toggle-content {
  padding: 1.75rem;
}

.service-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-item {
  text-align: center;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: rgba(16, 185, 129, 0.08);
  transform: translateY(-1px);
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toggle-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #059669;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
}

.action-btn.active {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: white;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.action-btn.active:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

/* 统一所有面板和卡片的基础样式 */
.control-panel,
.service-card,
.history-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
  margin-bottom: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.control-panel:hover,
.service-card:hover,
.history-card:hover {
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.15);
  transform: translateY(-3px);
  border-color: rgba(16, 185, 129, 0.2);
}

/* 重新设计服务概览部分 */
.services-overview {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
  overflow: hidden;
}

.overview-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(16, 185, 129, 0.1);
}

.overview-title i {
  font-size: 1.4rem;
  color: #10b981;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
}

/* 服务状态网格重新设计 */
.services-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  align-items: stretch; /* 确保所有卡片高度一致 */
}

.service-status-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid rgba(16, 185, 129, 0.1);
  border-radius: 18px;
  padding: 1.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.08);
  position: relative;
  min-height: 160px; /* 设置最小高度确保一致性 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
  border-radius: 18px 18px 0 0;
  transition: all 0.3s ease;
}

.service-status-card.active {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(255, 255, 255, 0.95) 100%);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

.service-status-card.active::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  height: 5px;
}

.service-status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.25);
}

.service-status-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-shrink: 0;
}

.service-status-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.service-status-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
  animation: iconShine 3s ease-in-out infinite;
}

@keyframes iconShine {
  0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.service-status-info {
  flex: 1;
  margin: 0 1rem;
}

.service-status-info h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.service-port {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  display: inline-block;
}

.service-status-indicator {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
}

.status-dot.online {
  background: #10b981;
  animation: pulseOnline 2s ease-in-out infinite;
}

.status-dot.offline {
  background: #ef4444;
  animation: pulseOffline 2s ease-in-out infinite;
}

@keyframes pulseOnline {
  0%, 100% { 
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 6px rgba(16, 185, 129, 0.2);
  }
  50% { 
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 10px rgba(16, 185, 129, 0.1);
  }
}

@keyframes pulseOffline {
  0%, 100% { 
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 6px rgba(239, 68, 68, 0.2);
  }
  50% { 
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 10px rgba(239, 68, 68, 0.1);
  }
}

.status-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  text-align: right;
}

.service-stats-row {
  display: flex;
  gap: 1rem;
  margin-top: auto; /* 将统计数据推到底部 */
}

.stat-box {
  flex: 1;
  text-align: center;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-box:hover {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  transform: translateY(-1px);
}

.stat-number {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 重新设计监控面板 */
.monitor-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.12);
  overflow: hidden;
  margin-bottom: 2rem;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid rgba(16, 185, 129, 0.1);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(255, 255, 255, 0.6) 100%);
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.monitor-title-icon {
  position: relative;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: white;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.title-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  opacity: 0.4;
  animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 0.2; }
}

.monitor-title h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.02em;
}

.monitor-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  color: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, rgba(248, 250, 252, 0.95) 100%);
}

.control-btn.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  border-color: rgba(16, 185, 129, 0.3);
}

.btn-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.btn-text {
  white-space: nowrap;
  font-weight: 600;
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  color: #059669;
  font-size: 0.875rem;
  font-weight: 600;
}

.monitor-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: 2rem 2.5rem;
}

.metric-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.2);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-card:hover::before {
  opacity: 1;
}

.metric-icon {
  position: relative;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1.25rem;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
}

.metric-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  opacity: 0.3;
  animation: metricGlow 3s ease-in-out infinite;
}

@keyframes metricGlow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.1; }
}

.metric-content {
  text-align: left;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #059669;
}

.metric-trend i {
  font-size: 0.75rem;
}

.text-success {
  color: #10b981 !important;
}

.text-danger {
  color: #ef4444 !important;
}

/* 优化主网格布局 */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 历史记录卡片占据整行 */
.history-card {
  grid-column: 1 / -1;
}

/* 新的服务状态卡片样式 */
.services-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.service-status-card {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(16, 185, 129, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.05);
}

.service-status-card.active {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.02);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
}

.service-status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.2);
}

.service-status-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.service-status-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.service-status-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.service-port {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.service-status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: pulse-online 2s infinite;
}

.status-dot.offline {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

@keyframes pulse-online {
  0%, 100% { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.1); }
}

.status-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.service-stats-row {
  display: flex;
  gap: 1rem;
}

.stat-box {
  flex: 1;
  text-align: center;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
/* 主题变量 */
:root {
  --bg-primary: linear-gradient(135deg, #e8f2ff 0%, #f8fafc 100%);
  --bg-card: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  --text-primary: #1a202c;
  --text-secondary: #64748b;
  --border-color: rgba(255, 255, 255, 0.4);
  --shadow-base: 0 8px 32px rgba(30,41,59,0.13);
}

.dark-theme {
  --bg-primary: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  --bg-card: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%);
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --border-color: rgba(30, 41, 59, 0.4);
  --shadow-base: 0 8px 32px rgba(0,0,0,0.3);
}

/* Base Layout */
.tcpudp-view {
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  height: 100%;
  margin: 0.5rem auto;
  padding: 2rem 1.5rem;
  border-radius: 22px;
  background: linear-gradient(135deg, #e8f2ff 0%, #f8fafc 100%);
  box-shadow: 0 8px 32px rgba(30,41,59,0.13);
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
  min-height: 100vh;
}

/* Hero Section */
.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%);
  color: #fff;
  font-size: 2rem;
  font-weight: 900;
  border-radius: 20px;
  padding: 0.5em 1.5em;
  letter-spacing: 1px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.25);
}

.network-icon {
  width: 1.5em;
  height: 1.5em;
  fill: currentColor;
}

.subtitle {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.subtitle-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  color: #1976d2;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 15px;
  padding: 0.4em 1.5em;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.1);
}

.intro {
  color: #4a5568;
  font-size: 1.1rem;
  margin-top: 1rem;
  font-weight: 500;
  line-height: 1.6;
}

/* Quick Stats */
.quick-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
  font-size: 1.8rem;
  opacity: 0.8;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1976d2;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 600;
  margin-top: 0.2rem;
}

/* Messages */
.message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  animation: slideIn 0.4s ease-out;
  position: relative;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-message {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(252, 165, 165, 0.05) 100%);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.1);
}

.success-message {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(167, 243, 208, 0.05) 100%);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
}

.message-icon {
  font-size: 1.4rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.message-close {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.1rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.message-close:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-50%) scale(1.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Control Panel */
.control-panel {
  max-width: 1200px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.control-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0;
  letter-spacing: -0.02em;
}

.stats-display {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 
    0 4px 20px rgba(102, 126, 234, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-chip:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(102, 126, 234, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.stat-chip .stat-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.service-toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.service-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.service-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s ease;
}

.service-toggle:hover::before {
  left: 100%;
}

.service-toggle:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 4px 0 rgba(102, 126, 234, 0.1) inset;
  border-color: rgba(102, 126, 234, 0.3);
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.toggle-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  font-size: 1.8rem;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  transition: all 0.3s ease;
}

.service-toggle:hover .toggle-icon-wrapper {
  transform: rotate(5deg) scale(1.1);
  box-shadow: 
    0 12px 35px rgba(102, 126, 234, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.connection-pulse {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #e2e8f0;
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.connection-pulse.active {
  background: #10b981;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7), 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(16, 185, 129, 0), 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0), 0 2px 8px rgba(16, 185, 129, 0.3);
  }
}

.toggle-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1a202c;
  letter-spacing: -0.01em;
}

.toggle-desc {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
}

.toggle-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.toggle-status::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.toggle-status:hover::before {
  left: 100%;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
}

.status-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: inherit;
  filter: brightness(1.2);
}

.status-text {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toggle-status.connected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 
    0 4px 20px rgba(16, 185, 129, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.toggle-status.connected .status-indicator {
  background: #ffffff;
  animation: statusPulse 2s infinite;
}

.toggle-status.disconnected {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  box-shadow: 
    0 4px 20px rgba(100, 116, 139, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.toggle-status.disconnected .status-indicator {
  background: #ffffff;
  opacity: 0.7;
}

.toggle-status.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 
    0 4px 20px rgba(239, 68, 68, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.toggle-status.error .status-indicator {
  background: #ffffff;
  animation: errorBlink 1s infinite;
}

@keyframes statusPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes errorBlink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}

/* Status Classes for Toggle */
.toggle-status.status-running {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 
    0 4px 20px rgba(16, 185, 129, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.toggle-status.status-running .status-indicator {
  background: #ffffff;
  animation: statusPulse 2s infinite;
}

.toggle-status.status-stopped {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  box-shadow: 
    0 4px 20px rgba(100, 116, 139, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.toggle-status.status-stopped .status-indicator {
  background: #ffffff;
  opacity: 0.7;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* Service Cards */
.service-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(20px);
  position: relative;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.6;
}

.service-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.tcp-card {
  --card-color: #1976d2;
  color: var(--card-color);
}

.tcp-card::before {
  background: linear-gradient(90deg, transparent, #1976d2, transparent);
}

.udp-card {
  --card-color: #ff9800;
  color: var(--card-color);
}

.udp-card::before {
  background: linear-gradient(90deg, transparent, #ff9800, transparent);
}

.service-header {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
  padding: 2rem;
  border-bottom: 1px solid rgba(233, 236, 239, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-info {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  flex: 1;
}

.service-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.tcp-card .service-icon-wrapper {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
}

.udp-card .service-icon-wrapper {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.3);
}

.connection-indicator {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #ef4444;
  opacity: 0.3;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  position: relative;
  z-index: 1;
}

.connection-indicator.active .pulse-ring {
  background: #10b981;
  animation: pulseRing 2s infinite;
}

.connection-indicator.active .pulse-dot {
  background: #10b981;
}

@keyframes pulseRing {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
}

.service-details {
  flex: 1;
}

.service-details h2 {
  color: #1a202c;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.service-subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  font-weight: 500;
  line-height: 1.4;
}

.service-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.service-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}

.service-stats .stat-label {
  font-size: 0.75rem;
  color: #a0aec0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.service-stats .stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2d3748;
}

.stat-divider {
  color: #e2e8f0;
  font-weight: 700;
  font-size: 1.2rem;
}

.service-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  font-size: 1.2rem;
}

/* Service Content */
.service-content {
  padding: 2rem;
}

.config-section,
.clients-section,
.client-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.config-section:last-child,
.clients-section:last-child,
.client-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-badge {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  color: #1976d2;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Configuration */
.config-grid {
  display: grid;
  gap: 1.5rem;
}

.config-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.config-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border-color: rgba(102, 126, 234, 0.2);
}

.config-label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.label-text {
  font-weight: 700;
  color: #1a202c;
  font-size: 1.05rem;
  letter-spacing: 0.2px;
}

.label-desc {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
  line-height: 1.4;
}

.config-control {
  display: flex;
  align-items: center;
}

/* Modern Switch */
.modern-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.modern-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: relative;
  width: 64px;
  height: 32px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  border-radius: 32px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
}

.switch-slider:before {
  content: "";
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.modern-switch input:checked + .switch-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: inset 0 2px 6px rgba(102, 126, 234, 0.3);
}

.modern-switch input:checked + .switch-slider:before {
  transform: translateX(32px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.switch-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: #2d3748;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Modern Input */
.modern-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(5px);
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.modern-input:disabled {
  background: rgba(226, 232, 240, 0.8);
  color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

.modern-input::placeholder {
  color: #a0aec0;
  font-style: italic;
}

/* Input Groups */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.input-label {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
}

.target-config {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.target-port {
  width: 120px;
}

/* Message Area */
.message-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-input-group {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-textarea {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  background: white;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;
}

.message-textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.send-btn {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  font-size: 0.95rem;
}

.send-btn.primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
}

.send-btn:disabled {
  background: #bbb;
  cursor: not-allowed;
  opacity: 0.6;
}

.send-icon {
  font-size: 1.1rem;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-illustration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.empty-text h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-weight: 700;
}

.empty-text p {
  margin: 0;
  font-style: italic;
  font-weight: 500;
}

.empty-history {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-history .empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.6;
}

/* Message History */
.history-card {
  grid-column: 1 / -1;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.history-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
}

.history-actions {
  display: flex;
  gap: 0.5rem;
}

.clear-btn {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  color: white;
}

.history-content {
  padding: 2rem;
  max-height: 500px;
  overflow-y: auto;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.message-item:hover {
  background: #f0f0f0;
  border-color: #1976d2;
}

.message-item.error {
  background: #ffebee;
  border-color: #ffcdd2;
}

.message-item.success {
  background: #e8f5e8;
  border-color: #c8e6c9;
}

.message-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
}

.message-type-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.message-type-badge.tcp {
  background: #e3f2fd;
  color: #1976d2;
}

.message-type-badge.udp {
  background: #fff3e0;
  color: #ff9800;
}

.message-direction {
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 600;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-route {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 600;
}

.from, .to {
  font-family: 'Consolas', 'Monaco', monospace;
  background: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.arrow {
  color: #1976d2;
  font-weight: bold;
}

.message-text {
  font-size: 0.95rem;
  color: #2c3e50;
  font-weight: 500;
  word-break: break-word;
}

.message-status {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .tcpudp-view {
    padding: 1rem 0.5rem;
    margin: 0;
    border-radius: 0;
  }
  
  .quick-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    justify-content: center;
  }
  
  .service-toggles {
    grid-template-columns: 1fr;
  }
  
  .service-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .target-config {
    grid-template-columns: 1fr;
  }
  
  .message-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .config-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .client-card {
    padding: 1rem;
  }
  
  .message-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    text-align: center;
  }
  
  .message-meta {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .logo-badge {
    font-size: 1.5rem;
    padding: 0.5em 1em;
  }
  
  .service-content {
    padding: 1rem;
  }
  
  .control-panel {
    padding: 1rem;
  }
}

/* ======================== 实时监控面板样式 ======================== */
.real-time-monitor {
  max-width: 1200px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  overflow: hidden;
  position: relative;
}

.real-time-monitor::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(16, 185, 129, 0.6) 25%, 
    rgba(59, 130, 246, 0.6) 50%, 
    rgba(239, 68, 68, 0.6) 75%, 
    transparent 100%
  );
  animation: rainbowShimmer 3s ease-in-out infinite;
}

@keyframes rainbowShimmer {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid rgba(233, 236, 239, 0.3);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}



.btn-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.btn-text {
  white-space: nowrap;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem 2.5rem;
}

.monitor-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(229, 231, 235, 0.3);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.monitor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-gradient);
  border-radius: 20px 20px 0 0;
}

.monitor-card[data-metric="messages"]::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.monitor-card[data-metric="speed"]::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.monitor-card[data-metric="tcp"]::before {
  background: linear-gradient(90deg, #1976d2, #0d47a1);
}

.monitor-card[data-metric="udp"]::before {
  background: linear-gradient(90deg, #ff9800, #e65100);
}

.monitor-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.monitor-card.pulse {
  animation: cardPulse 3s ease-in-out infinite;
}

@keyframes cardPulse {
  0%, 100% { 
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
  50% { 
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.monitor-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.monitor-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.monitor-card:hover .monitor-icon::before {
  left: 100%;
}

.monitor-icon.messages {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.monitor-icon.speed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.monitor-icon.tcp {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

.monitor-icon.udp {
  background: linear-gradient(135deg, #ff9800 0%, #e65100 100%);
}

.card-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(229, 231, 235, 0.3);
}

.card-trend.up {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.card-trend.stable {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.trend-icon {
  font-size: 0.9rem;
}

.monitor-data {
  margin-bottom: 1.5rem;
}

.monitor-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.monitor-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-footer {
  margin-top: auto;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  background: rgba(243, 244, 246, 0.8);
}

.metric-change.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.metric-change.neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.change-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* ======================== 快捷键面板样式 ======================== */
.shortcuts-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.shortcuts-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.shortcuts-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 24px 24px 0 0;
}

.shortcuts-content h4 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 2rem 0;
  text-align: center;
  letter-spacing: -0.02em;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.4);
  transition: all 0.3s ease;
  font-weight: 600;
  color: #374151;
}

.shortcut-item:hover {
  transform: translateX(4px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.shortcut-item kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 0.5rem;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: white;
  border-radius: 6px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  margin: 0 0.25rem;
  letter-spacing: 0.5px;
}

.close-shortcuts {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.close-shortcuts:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.close-shortcuts:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.shortcuts-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcuts-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 
    0 12px 35px rgba(102, 126, 234, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.shortcuts-btn:active {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}



/* 深色主题样式调整 */
.dark-theme .real-time-monitor {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%);
  border-color: rgba(30, 41, 59, 0.4);
}

.dark-theme .monitor-header {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
  border-bottom-color: rgba(71, 85, 105, 0.3);
}

.dark-theme .monitor-title h3 {
  color: #f1f5f9;
}

.dark-theme .control-btn {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
  color: #cbd5e1;
  border-color: rgba(71, 85, 105, 0.6);
}

.dark-theme .control-btn:hover {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
}

.dark-theme .monitor-card {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border-color: rgba(71, 85, 105, 0.3);
}

.dark-theme .monitor-value {
  color: #f1f5f9;
}

.dark-theme .monitor-label {
  color: #94a3b8;
}

.dark-theme .shortcuts-content {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%);
  border-color: rgba(30, 41, 59, 0.4);
}

.dark-theme .shortcuts-content h4 {
  color: #f1f5f9;
}

.dark-theme .shortcut-item {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  color: #cbd5e1;
  border-color: rgba(71, 85, 105, 0.4);
}

.dark-theme .shortcut-item:hover {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%);
  border-color: rgba(102, 126, 234, 0.3);
}

.dark-theme .theme-btn {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  color: #cbd5e1;
  border-color: rgba(30, 41, 59, 0.4);
}

/* ======================== 导出按钮样式 ======================== */
.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 20px rgba(139, 92, 246, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;
}

.export-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.export-btn:hover:not(:disabled)::before {
  left: 100%;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(139, 92, 246, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ======================== 过滤器样式 ======================== */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.6rem 1rem;
  border: 2px solid rgba(229, 231, 235, 0.6);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  color: #374151;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.dark-theme .filter-select {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
  color: #cbd5e1;
  border-color: rgba(71, 85, 105, 0.6);
}

/* ======================== 响应式调整 ======================== */
@media (max-width: 768px) {
  .monitor-panel {
    margin: 0 0.5rem 1.5rem;
    border-radius: 16px;
  }
  
  .monitor-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1.5rem;
  }
  
  .monitor-metrics {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .metric-card {
    padding: 1.5rem;
  }
  
  .metric-value {
    font-size: 1.75rem;
  }
  
  .main-container {
    padding: 1rem 1rem 3rem; /* 移动端也保持底部间距 */
  }
  
  .tcpudp-header {
    margin: 0 0.5rem 1.5rem;
    padding: 1.5rem;
    border-radius: 20px;
  }
  
  .header-main {
    flex-direction: column;
    gap: 2rem;
  }
  
  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .services-status-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .service-status-card {
    min-height: 140px; /* 移动端稍微降低最小高度 */
  }
  
  .services-overview {
    margin: 0 0.5rem 1.5rem;
    padding: 1.5rem;
  }
  
  .monitor-panel {
    margin: 0 0.5rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .monitor-metrics {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .control-btn .btn-text {
    display: none;
  }
  
  .metric-card {
    padding: 1.25rem;
  }
  
  .metric-value {
    font-size: 1.5rem;
  }
  
  .feature-badges {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

import { ref, onMounted, computed, onUnmounted } from 'vue';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
// 新增的响应式变量
const isDarkMode = ref(false);
const autoRefresh = ref(false);
const refreshInterval = ref(5000); // 5秒
const messagesPerMinute = ref(0);
const messageFilter = ref('all');
const showShortcuts = ref(false);
let refreshTimer = null;
let messageCounter = ref(0);
let lastMinuteTimestamp = ref(Date.now());
// Loading states
const isLoading = ref(false);
const tcpLoading = ref(false);
const udpLoading = ref(false);
// Error states
const error = ref('');
// TCP
const tcpStatus = ref(false);
const tcpEchoEnabled = ref(true);
const tcpEchoContent = ref('');
const tcpClients = ref([]);
const tcpSendMsg = ref({});
const tcpTargetIp = ref('127.0.0.1');
const tcpTargetPort = ref(9001);
const tcpClientMsg = ref('');
// UDP
const udpStatus = ref(false);
const udpEchoEnabled = ref(true);
const udpEchoContent = ref('');
const udpTargetIp = ref('127.0.0.1');
const udpTargetPort = ref(9000);
const udpClientMsg = ref('');
// Success messages
const successMessage = ref('');
// Message history for monitoring
const messageHistory = ref([]);
// Show success message temporarily
const showSuccess = (message) => {
    successMessage.value = message;
    setTimeout(() => {
        successMessage.value = '';
    }, 3000);
};
// 覆盖 addMessageToHistory 方法以支持统计
const addMessageToHistory = (type, direction, message, from, to, status = 'success') => {
    const newMessage = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type,
        direction,
        from,
        to,
        message,
        status
    };
    messageHistory.value.unshift(newMessage);
    // Keep only last 100 messages
    if (messageHistory.value.length > 100) {
        messageHistory.value = messageHistory.value.slice(0, 100);
    }
    // 更新每分钟消息统计
    updateMessagesPerMinute();
};
// 计算属性
const udpMessagesCount = computed(() => {
    return messageHistory.value.filter(m => m.type.toLowerCase() === 'udp').length;
});
const filteredMessages = computed(() => {
    if (messageFilter.value === 'all')
        return messageHistory.value;
    return messageHistory.value.filter(msg => {
        switch (messageFilter.value) {
            case 'tcp':
                return msg.type.toLowerCase() === 'tcp';
            case 'udp':
                return msg.type.toLowerCase() === 'udp';
            case 'in':
                return msg.direction === 'in';
            case 'out':
                return msg.direction === 'out';
            case 'error':
                return msg.status === 'error';
            default:
                return true;
        }
    });
});
// 新增方法
const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('tcpudp-theme', isDarkMode.value ? 'dark' : 'light');
};
const toggleAutoRefresh = () => {
    autoRefresh.value = !autoRefresh.value;
    if (autoRefresh.value) {
        startAutoRefresh();
    }
    else {
        stopAutoRefresh();
    }
};
const startAutoRefresh = () => {
    refreshTimer = window.setInterval(async () => {
        try {
            await Promise.all([
                fetchTcpStatus(),
                fetchUdpStatus(),
                fetchTcpClients()
            ]);
        }
        catch (err) {
            console.error('Auto refresh failed:', err);
        }
    }, refreshInterval.value);
};
const stopAutoRefresh = () => {
    if (refreshTimer) {
        window.clearInterval(refreshTimer);
        refreshTimer = null;
    }
};
const updateMessagesPerMinute = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000; // 1分钟前
    const recentMessages = messageHistory.value.filter(msg => msg.timestamp.getTime() > oneMinuteAgo);
    messagesPerMinute.value = recentMessages.length;
};
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
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `tcpudp-data-${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSuccess('数据导出成功');
};
// Clear message history
const clearMessageHistory = () => {
    messageHistory.value = [];
    showSuccess('消息历史已清空');
};
// Format timestamp
const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};
// Get connection status text
const getConnectionStatusText = (isActive) => {
    return isActive ? '运行中' : '已停止';
};
// Get connection status class
const getConnectionStatusClass = (isActive) => {
    return isActive ? 'status-running' : 'status-stopped';
};
// 键盘快捷键
const handleKeydown = (event) => {
    if (event.ctrlKey) {
        switch (event.key) {
            case 'r':
                event.preventDefault();
                Promise.all([fetchTcpStatus(), fetchUdpStatus(), fetchTcpClients()]);
                break;
            case 'e':
                event.preventDefault();
                if (messageHistory.value.length > 0) {
                    exportData();
                }
                break;
            case 't':
                event.preventDefault();
                toggleTheme();
                break;
        }
    }
};
// 初始化加载
onMounted(async () => {
    // 加载主题设置
    const savedTheme = localStorage.getItem('tcpudp-theme');
    if (savedTheme === 'dark') {
        isDarkMode.value = true;
    }
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeydown);
    // 启动消息统计更新器
    setInterval(updateMessagesPerMinute, 10000); // 每10秒更新一次
    isLoading.value = true;
    try {
        await Promise.all([
            fetchTcpStatus(),
            fetchUdpStatus(),
            fetchTcpClients(),
            fetchTcpEcho(),
            fetchUdpEcho()
        ]);
    }
    catch (err) {
        handleError(err, 'Failed to initialize');
    }
    finally {
        isLoading.value = false;
    }
});
async function fetchTcpStatus() {
    try {
        const res = await axios.get('/api/tcp/status');
        tcpStatus.value = res.data.listening;
    }
    catch (err) {
        handleError(err, 'Failed to fetch TCP status');
    }
}
async function fetchUdpStatus() {
    try {
        const res = await axios.get('/api/udp/status');
        udpStatus.value = res.data.listening;
    }
    catch (err) {
        handleError(err, 'Failed to fetch UDP status');
    }
}
async function fetchTcpClients() {
    try {
        const res = await axios.get('/api/tcp/clients');
        tcpClients.value = res.data.clients;
    }
    catch (err) {
        handleError(err, 'Failed to fetch TCP clients');
    }
}
async function fetchTcpEcho() {
    try {
        const res = await axios.get('/api/tcp/echo');
        tcpEchoEnabled.value = res.data.enabled;
        tcpEchoContent.value = res.data.content || '';
    }
    catch (err) {
        handleError(err, 'Failed to fetch TCP echo config');
    }
}
async function fetchUdpEcho() {
    try {
        const res = await axios.get('/api/udp/echo');
        udpEchoEnabled.value = res.data.enabled;
        udpEchoContent.value = res.data.content || '';
    }
    catch (err) {
        handleError(err, 'Failed to fetch UDP echo config');
    }
}
async function setTcpEchoEnabled() {
    tcpLoading.value = true;
    try {
        await axios.post('/api/tcp/echo/enabled', { enabled: tcpEchoEnabled.value });
        showSuccess('TCP 回显设置已更新');
    }
    catch (err) {
        handleError(err, 'Failed to update TCP echo setting');
    }
    finally {
        tcpLoading.value = false;
    }
}
async function setTcpEchoContent() {
    tcpLoading.value = true;
    try {
        await axios.post('/api/tcp/echo/content', { content: tcpEchoContent.value || null });
        showSuccess('TCP 回显内容已更新');
    }
    catch (err) {
        handleError(err, 'Failed to update TCP echo content');
    }
    finally {
        tcpLoading.value = false;
    }
}
async function setUdpEchoEnabled() {
    udpLoading.value = true;
    try {
        await axios.post('/api/udp/echo/enabled', { enabled: udpEchoEnabled.value });
        showSuccess('UDP 回显设置已更新');
    }
    catch (err) {
        handleError(err, 'Failed to update UDP echo setting');
    }
    finally {
        udpLoading.value = false;
    }
}
async function setUdpEchoContent() {
    udpLoading.value = true;
    try {
        await axios.post('/api/udp/echo/content', { content: udpEchoContent.value || null });
        showSuccess('UDP 回显内容已更新');
    }
    catch (err) {
        handleError(err, 'Failed to update UDP echo content');
    }
    finally {
        udpLoading.value = false;
    }
}
async function sendToTcpClient(clientId) {
    if (!tcpSendMsg.value[clientId]?.trim())
        return;
    tcpLoading.value = true;
    try {
        await axios.post('/api/tcp/sendToClient', {
            clientId,
            message: tcpSendMsg.value[clientId]
        });
        addMessageToHistory('tcp', 'out', tcpSendMsg.value[clientId], 'Server', clientId);
        showSuccess(`消息已发送至客户端 ${clientId}`);
        tcpSendMsg.value[clientId] = '';
    }
    catch (err) {
        addMessageToHistory('tcp', 'out', tcpSendMsg.value[clientId], 'Server', clientId, 'error');
        handleError(err, 'Failed to send message to TCP client');
    }
    finally {
        tcpLoading.value = false;
    }
}
async function sendTcpClientMsg() {
    if (!tcpClientMsg.value.trim() || !tcpTargetIp.value || !tcpTargetPort.value)
        return;
    tcpLoading.value = true;
    const target = `${tcpTargetIp.value}:${tcpTargetPort.value}`;
    try {
        await axios.post('/api/tcp/send', {
            host: tcpTargetIp.value,
            port: tcpTargetPort.value,
            message: tcpClientMsg.value
        });
        addMessageToHistory('tcp', 'out', tcpClientMsg.value, 'Client', target);
        showSuccess(`TCP 消息已发送至 ${target}`);
        tcpClientMsg.value = '';
    }
    catch (err) {
        addMessageToHistory('tcp', 'out', tcpClientMsg.value, 'Client', target, 'error');
        handleError(err, 'Failed to send TCP message');
    }
    finally {
        tcpLoading.value = false;
    }
}
async function sendUdpClientMsg() {
    if (!udpClientMsg.value.trim() || !udpTargetIp.value || !udpTargetPort.value)
        return;
    udpLoading.value = true;
    const target = `${udpTargetIp.value}:${udpTargetPort.value}`;
    try {
        await axios.post('/api/udp/send', {
            host: udpTargetIp.value,
            port: udpTargetPort.value,
            message: udpClientMsg.value
        });
        addMessageToHistory('udp', 'out', udpClientMsg.value, 'Client', target);
        showSuccess(`UDP 消息已发送至 ${target}`);
        udpClientMsg.value = '';
    }
    catch (err) {
        addMessageToHistory('udp', 'out', udpClientMsg.value, 'Client', target, 'error');
        handleError(err, 'Failed to send UDP message');
    }
    finally {
        udpLoading.value = false;
    }
}
// 处理错误
const handleError = (err, context) => {
    console.error(`${context}:`, err);
    const message = err.response?.data?.message || err.message || 'An error occurred';
    error.value = `${context}: ${message}`;
    setTimeout(() => {
        error.value = '';
    }, 5000);
};
// 清理
onUnmounted(() => {
    stopAutoRefresh();
    document.removeEventListener('keydown', handleKeydown);
});
// 初始化
onMounted(async () => {
    // 加载主题设置
    const savedTheme = localStorage.getItem('tcpudp-theme');
    if (savedTheme === 'dark') {
        isDarkMode.value = true;
    }
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeydown);
    // 启动消息统计更新器
    setInterval(updateMessagesPerMinute, 10000); // 每10秒更新一次
    isLoading.value = true;
    try {
        await Promise.all([
            fetchTcpStatus(),
            fetchUdpStatus(),
            fetchTcpClients(),
            fetchTcpEcho(),
            fetchUdpEcho()
        ]);
    }
    catch (err) {
        handleError(err, 'Failed to initialize');
    }
    finally {
        isLoading.value = false;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['loading-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-close']} */ ;
/** @type {__VLS_StyleScopedClasses['control-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['connected']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['disconnected']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-running']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-stopped']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tcp-card']} */ ;
/** @type {__VLS_StyleScopedClasses['udp-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tcp-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['udp-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['service-details']} */ ;
/** @type {__VLS_StyleScopedClasses['service-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['service-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['clients-section']} */ ;
/** @type {__VLS_StyleScopedClasses['client-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['message-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-history']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-type-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['message-type-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tcpudp-view']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggles']} */ ;
/** @type {__VLS_StyleScopedClasses['service-header']} */ ;
/** @type {__VLS_StyleScopedClasses['target-config']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['service-content']} */ ;
/** @type {__VLS_StyleScopedClasses['control-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['real-time-monitor']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-title']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tcp']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['udp']} */ ;
/** @type {__VLS_StyleScopedClasses['card-trend']} */ ;
/** @type {__VLS_StyleScopedClasses['card-trend']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-change']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-change']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-content']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-content']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['close-shortcuts']} */ ;
/** @type {__VLS_StyleScopedClasses['close-shortcuts']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['real-time-monitor']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-value']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-label']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
/** @type {__VLS_StyleScopedClasses['real-time-monitor']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-value']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-content']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tcpudp-view" },
    ...{ class: ({ 'dark-theme': __VLS_ctx.isDarkMode }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "theme-toggle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleTheme) },
    ...{ class: "theme-btn" },
    title: (__VLS_ctx.isDarkMode ? '切换到浅色主题' : '切换到深色主题'),
});
if (__VLS_ctx.isDarkMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
if (!__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "real-time-monitor" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-controls" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleAutoRefresh) },
        ...{ class: "monitor-btn" },
        ...{ class: ({ active: __VLS_ctx.autoRefresh }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.autoRefresh ? '⏸️' : '▶️');
    (__VLS_ctx.autoRefresh ? '暂停' : '开始');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "refresh-interval" },
    });
    (__VLS_ctx.refreshInterval / 1000);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-value" },
    });
    (__VLS_ctx.messageHistory.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-value" },
    });
    (__VLS_ctx.messagesPerMinute);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-value" },
    });
    (__VLS_ctx.tcpClients.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-value" },
    });
    (__VLS_ctx.udpMessagesCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "monitor-label" },
    });
}
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-content" },
    });
    /** @type {[typeof LoadingSpinner, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message error-message" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "message-icon" },
    });
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.error))
                    return;
                __VLS_ctx.error = '';
            } },
        ...{ class: "message-close" },
    });
}
if (__VLS_ctx.successMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message success-message" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "message-icon" },
    });
    (__VLS_ctx.successMessage);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.successMessage))
                    return;
                __VLS_ctx.successMessage = '';
            } },
        ...{ class: "message-close" },
    });
}
if (!__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "control-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-display" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-chip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-icon" },
    });
    (__VLS_ctx.tcpClients.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-chip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-icon" },
    });
    (__VLS_ctx.messageHistory.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-chip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-icon" },
    });
    (__VLS_ctx.tcpStatus && __VLS_ctx.udpStatus ? '2' : __VLS_ctx.tcpStatus || __VLS_ctx.udpStatus ? '1' : '0');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.exportData) },
        ...{ class: "export-btn" },
        disabled: (__VLS_ctx.messageHistory.length === 0),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-toggles" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-toggle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-icon-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "toggle-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "connection-pulse" },
        ...{ class: ({ active: __VLS_ctx.tcpStatus }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-status" },
        ...{ class: (__VLS_ctx.getConnectionStatusClass(__VLS_ctx.tcpStatus)) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-text" },
    });
    (__VLS_ctx.getConnectionStatusText(__VLS_ctx.tcpStatus));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-toggle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-icon-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "toggle-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "connection-pulse" },
        ...{ class: ({ active: __VLS_ctx.udpStatus }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toggle-status" },
        ...{ class: (__VLS_ctx.getConnectionStatusClass(__VLS_ctx.udpStatus)) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-text" },
    });
    (__VLS_ctx.getConnectionStatusText(__VLS_ctx.udpStatus));
}
if (!__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-card tcp-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-icon-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "service-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "connection-indicator" },
        ...{ class: ({ active: __VLS_ctx.tcpStatus }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-ring" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-dot" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "service-subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-stats" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.tcpClients.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-divider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-value" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.fetchTcpStatus) },
        ...{ class: "action-btn refresh-btn" },
        disabled: (__VLS_ctx.tcpLoading),
        title: "刷新状态",
    });
    if (!__VLS_ctx.tcpLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "action-icon" },
        });
    }
    else {
        /** @type {[typeof LoadingSpinner, ]} */ ;
        // @ts-ignore
        const __VLS_3 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({}));
        const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "config-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-control" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "modern-switch" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.setTcpEchoEnabled) },
        type: "checkbox",
        disabled: (__VLS_ctx.tcpLoading),
    });
    (__VLS_ctx.tcpEchoEnabled);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "switch-slider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "switch-label" },
    });
    (__VLS_ctx.tcpEchoEnabled ? 'ON' : 'OFF');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "config-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-control" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onBlur: (__VLS_ctx.setTcpEchoContent) },
        placeholder: "留空则原样回显",
        ...{ class: "modern-input" },
        disabled: (__VLS_ctx.tcpLoading),
    });
    (__VLS_ctx.tcpEchoContent);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "clients-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-badge" },
    });
    (__VLS_ctx.tcpClients.length);
    if (__VLS_ctx.tcpClients.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "clients-list" },
        });
        for (const [client] of __VLS_getVForSourceType((__VLS_ctx.tcpClients))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (client.id),
                ...{ class: "client-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "client-info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "client-avatar" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "client-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "online-indicator" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "client-details" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "client-id" },
            });
            (client.id);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "client-status" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "status-dot online" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "client-message-area" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-input-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
                ...{ onKeydown: (...[$event]) => {
                        if (!(!__VLS_ctx.isLoading))
                            return;
                        if (!(__VLS_ctx.tcpClients.length > 0))
                            return;
                        __VLS_ctx.sendToTcpClient(client.id);
                    } },
                value: (__VLS_ctx.tcpSendMsg[client.id]),
                placeholder: "输入要发送的消息... (Ctrl+Enter 快速发送)",
                ...{ class: "client-message-input" },
                disabled: (__VLS_ctx.tcpLoading),
                rows: "2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.isLoading))
                            return;
                        if (!(__VLS_ctx.tcpClients.length > 0))
                            return;
                        __VLS_ctx.sendToTcpClient(client.id);
                    } },
                ...{ class: "send-btn" },
                disabled: (__VLS_ctx.tcpLoading || !__VLS_ctx.tcpSendMsg[client.id]?.trim()),
                title: (__VLS_ctx.tcpSendMsg[client.id]?.trim() ? '发送消息' : '请输入消息内容'),
            });
            if (__VLS_ctx.tcpLoading) {
                /** @type {[typeof LoadingSpinner, ]} */ ;
                // @ts-ignore
                const __VLS_6 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({}));
                const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "send-icon" },
                });
            }
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-illustration" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "empty-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "client-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "send-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "target-config" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "input-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "IP 地址",
        ...{ class: "modern-input target-ip" },
        disabled: (__VLS_ctx.tcpLoading),
    });
    (__VLS_ctx.tcpTargetIp);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "input-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "端口号",
        ...{ class: "modern-input target-port" },
        disabled: (__VLS_ctx.tcpLoading),
    });
    (__VLS_ctx.tcpTargetPort);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "input-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        ...{ onKeydown: (__VLS_ctx.sendTcpClientMsg) },
        value: (__VLS_ctx.tcpClientMsg),
        placeholder: "输入要发送的消息内容...",
        ...{ class: "message-textarea" },
        disabled: (__VLS_ctx.tcpLoading),
        rows: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.sendTcpClientMsg) },
        ...{ class: "send-btn primary" },
        disabled: (__VLS_ctx.tcpLoading || !__VLS_ctx.tcpClientMsg.trim() || !__VLS_ctx.tcpTargetIp || !__VLS_ctx.tcpTargetPort),
    });
    if (__VLS_ctx.tcpLoading) {
        /** @type {[typeof LoadingSpinner, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({}));
        const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "send-hint" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-card udp-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-icon-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "service-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "connection-indicator" },
        ...{ class: ({ active: __VLS_ctx.udpStatus }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-ring" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-dot" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "service-subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-stats" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.messageHistory.filter(m => m.type.toLowerCase() === 'udp').length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-divider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-value" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.fetchUdpStatus) },
        ...{ class: "action-btn refresh-btn" },
        disabled: (__VLS_ctx.udpLoading),
        title: "刷新状态",
    });
    if (!__VLS_ctx.udpLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "action-icon" },
        });
    }
    else {
        /** @type {[typeof LoadingSpinner, ]} */ ;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({}));
        const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "config-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-control" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "modern-switch" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.setUdpEchoEnabled) },
        type: "checkbox",
        disabled: (__VLS_ctx.udpLoading),
    });
    (__VLS_ctx.udpEchoEnabled);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "switch-slider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "switch-label" },
    });
    (__VLS_ctx.udpEchoEnabled ? 'ON' : 'OFF');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "config-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-control" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onBlur: (__VLS_ctx.setUdpEchoContent) },
        placeholder: "留空则原样回显",
        ...{ class: "modern-input" },
        disabled: (__VLS_ctx.udpLoading),
    });
    (__VLS_ctx.udpEchoContent);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "client-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "send-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "target-config" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "input-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "IP 地址",
        ...{ class: "modern-input target-ip" },
        disabled: (__VLS_ctx.udpLoading),
    });
    (__VLS_ctx.udpTargetIp);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "input-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "端口号",
        ...{ class: "modern-input target-port" },
        disabled: (__VLS_ctx.udpLoading),
    });
    (__VLS_ctx.udpTargetPort);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "input-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        ...{ onKeydown: (__VLS_ctx.sendUdpClientMsg) },
        value: (__VLS_ctx.udpClientMsg),
        placeholder: "输入要发送的消息内容...",
        ...{ class: "message-textarea" },
        disabled: (__VLS_ctx.udpLoading),
        rows: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.sendUdpClientMsg) },
        ...{ class: "send-btn primary" },
        disabled: (__VLS_ctx.udpLoading || !__VLS_ctx.udpClientMsg.trim() || !__VLS_ctx.udpTargetIp || !__VLS_ctx.udpTargetPort),
    });
    if (__VLS_ctx.udpLoading) {
        /** @type {[typeof LoadingSpinner, ]} */ ;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({}));
        const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "send-hint" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-controls" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.messageFilter),
        ...{ class: "filter-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "all",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "tcp",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "udp",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "in",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "out",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "error",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.clearMessageHistory) },
        ...{ class: "action-btn clear-btn" },
        disabled: (__VLS_ctx.messageHistory.length === 0),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-content" },
    });
    if (__VLS_ctx.filteredMessages.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-list" },
        });
        for (const [msg] of __VLS_getVForSourceType((__VLS_ctx.filteredMessages.slice(0, 20)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (msg.id),
                ...{ class: "message-item" },
                ...{ class: ([msg.type, msg.direction, msg.status]) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "message-type-badge" },
                ...{ class: (msg.type) },
            });
            (msg.type.toUpperCase());
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "message-direction" },
                ...{ class: (msg.direction) },
            });
            (msg.direction === 'in' ? '📥' : '📤');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "message-time" },
            });
            (__VLS_ctx.formatTime(msg.timestamp));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-route" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "from" },
            });
            (msg.from);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "arrow" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "to" },
            });
            (msg.to);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-text" },
            });
            (msg.message);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-status" },
                ...{ class: (msg.status) },
            });
            if (msg.status === 'success') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            }
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-history" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "empty-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.messageFilter === 'all' ? '暂无消息记录' : '暂无符合条件的消息');
    }
}
if (__VLS_ctx.showShortcuts) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "shortcuts-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "shortcuts-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "shortcut-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "shortcut-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "shortcut-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "shortcut-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "shortcut-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.kbd, __VLS_intrinsicElements.kbd)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showShortcuts))
                    return;
                __VLS_ctx.showShortcuts = false;
            } },
        ...{ class: "close-shortcuts" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showShortcuts = true;
        } },
    ...{ class: "shortcuts-btn" },
    title: "查看快捷键",
});
/** @type {__VLS_StyleScopedClasses['tcpudp-view']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['real-time-monitor']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-interval']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-data']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-value']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-label']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-data']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-value']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-label']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-data']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-value']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-label']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-data']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-value']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor-label']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-close']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['success-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-close']} */ ;
/** @type {__VLS_StyleScopedClasses['control-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-display']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggles']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-info']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-details']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-title']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['status-text']} */ ;
/** @type {__VLS_StyleScopedClasses['service-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-info']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-details']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-title']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['status-text']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tcp-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-header']} */ ;
/** @type {__VLS_StyleScopedClasses['service-info']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['service-details']} */ ;
/** @type {__VLS_StyleScopedClasses['service-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['service-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['service-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-content']} */ ;
/** @type {__VLS_StyleScopedClasses['config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['config-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-label']} */ ;
/** @type {__VLS_StyleScopedClasses['label-text']} */ ;
/** @type {__VLS_StyleScopedClasses['label-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['config-control']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-label']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-label']} */ ;
/** @type {__VLS_StyleScopedClasses['label-text']} */ ;
/** @type {__VLS_StyleScopedClasses['label-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['config-control']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['clients-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['clients-list']} */ ;
/** @type {__VLS_StyleScopedClasses['client-card']} */ ;
/** @type {__VLS_StyleScopedClasses['client-info']} */ ;
/** @type {__VLS_StyleScopedClasses['client-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['client-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['online-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['client-details']} */ ;
/** @type {__VLS_StyleScopedClasses['client-id']} */ ;
/** @type {__VLS_StyleScopedClasses['client-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['online']} */ ;
/** @type {__VLS_StyleScopedClasses['client-message-area']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['client-message-input']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-illustration']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
/** @type {__VLS_StyleScopedClasses['client-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['send-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['target-config']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-label']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['target-ip']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-label']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['target-port']} */ ;
/** @type {__VLS_StyleScopedClasses['message-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-label']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['message-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['send-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['udp-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-header']} */ ;
/** @type {__VLS_StyleScopedClasses['service-info']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['service-details']} */ ;
/** @type {__VLS_StyleScopedClasses['service-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['service-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['service-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-content']} */ ;
/** @type {__VLS_StyleScopedClasses['config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['config-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-label']} */ ;
/** @type {__VLS_StyleScopedClasses['label-text']} */ ;
/** @type {__VLS_StyleScopedClasses['label-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['config-control']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-label']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-label']} */ ;
/** @type {__VLS_StyleScopedClasses['label-text']} */ ;
/** @type {__VLS_StyleScopedClasses['label-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['config-control']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['client-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['send-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['target-config']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-label']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['target-ip']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-label']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['target-port']} */ ;
/** @type {__VLS_StyleScopedClasses['message-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-label']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['message-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['send-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['history-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-list']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['message-type-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['message-direction']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-route']} */ ;
/** @type {__VLS_StyleScopedClasses['from']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['to']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-status']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-history']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-content']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-list']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcut-item']} */ ;
/** @type {__VLS_StyleScopedClasses['close-shortcuts']} */ ;
/** @type {__VLS_StyleScopedClasses['shortcuts-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            LoadingSpinner: LoadingSpinner,
            isDarkMode: isDarkMode,
            autoRefresh: autoRefresh,
            refreshInterval: refreshInterval,
            messagesPerMinute: messagesPerMinute,
            messageFilter: messageFilter,
            showShortcuts: showShortcuts,
            isLoading: isLoading,
            tcpLoading: tcpLoading,
            udpLoading: udpLoading,
            error: error,
            tcpStatus: tcpStatus,
            tcpEchoEnabled: tcpEchoEnabled,
            tcpEchoContent: tcpEchoContent,
            tcpClients: tcpClients,
            tcpSendMsg: tcpSendMsg,
            tcpTargetIp: tcpTargetIp,
            tcpTargetPort: tcpTargetPort,
            tcpClientMsg: tcpClientMsg,
            udpStatus: udpStatus,
            udpEchoEnabled: udpEchoEnabled,
            udpEchoContent: udpEchoContent,
            udpTargetIp: udpTargetIp,
            udpTargetPort: udpTargetPort,
            udpClientMsg: udpClientMsg,
            successMessage: successMessage,
            messageHistory: messageHistory,
            udpMessagesCount: udpMessagesCount,
            filteredMessages: filteredMessages,
            toggleTheme: toggleTheme,
            toggleAutoRefresh: toggleAutoRefresh,
            exportData: exportData,
            clearMessageHistory: clearMessageHistory,
            formatTime: formatTime,
            getConnectionStatusText: getConnectionStatusText,
            getConnectionStatusClass: getConnectionStatusClass,
            fetchTcpStatus: fetchTcpStatus,
            fetchUdpStatus: fetchUdpStatus,
            setTcpEchoEnabled: setTcpEchoEnabled,
            setTcpEchoContent: setTcpEchoContent,
            setUdpEchoEnabled: setUdpEchoEnabled,
            setUdpEchoContent: setUdpEchoContent,
            sendToTcpClient: sendToTcpClient,
            sendTcpClientMsg: sendTcpClientMsg,
            sendUdpClientMsg: sendUdpClientMsg,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */

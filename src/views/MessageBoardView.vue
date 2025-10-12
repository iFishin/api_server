<template>
  <div class="message-board" @click="handleOutsideClick">
    <!-- 动态背景 -->
    <div class="animated-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="mesh-pattern"></div>
    </div>

    <!-- 留言列表 - 全屏滚动卡片 -->
    <div class="messages-container" ref="messagesContainer" @scroll="handleMessagesScroll">
      <div class="messages-stack">
        <div
          v-for="(message, index) in messages"
          :key="message.id"
          class="message-card-wrapper"
          :data-index="index"
          ref="messageCards"
        >
          <div
            class="message-card"
            :class="{ 
              'is-pinned': message.is_pinned,
              'is-active': currentCardIndex === index,
              'is-prev': currentCardIndex > index,
              'is-next': currentCardIndex < index
            }"
          >
            <!-- 简约指示器 -->
            <div class="mini-indicator">
              <span>{{ index + 1 }}/{{ messages.length }}</span>
            </div>

            <!-- 留言内容 - 全屏居中显示 -->
            <div class="message-content-fullscreen">
              <div class="quote-icon top">
                <i class="fas fa-quote-left"></i>
              </div>
              
              <p class="message-text-large">{{ message.content }}</p>
              
              <div class="quote-icon bottom">
                <i class="fas fa-quote-right"></i>
              </div>
              
              <!-- 作者署名 -->
              <div class="message-author">
                <span class="author-name">—— {{ message.user_name }}</span>
                <span class="author-time">{{ formatTime(message.created_at) }}</span>
              </div>
            </div>

            <!-- 悬浮互动按钮 -->
            <div class="floating-actions">
              <button 
                class="floating-btn like-btn" 
                :class="{ active: isLiked(message.id) }"
                @click="toggleLike(message)"
                :title="'点赞 (' + (message.likes || 0) + ')'"
              >
                <i class="fas fa-heart"></i>
                <span class="btn-count" v-if="message.likes > 0">{{ message.likes }}</span>
              </button>
              
              <button 
                class="floating-btn reply-btn" 
                @click="replyToMessage(message)"
                :title="'回复' + (message.reply_count ? ' (' + message.reply_count + ')' : '')"
              >
                <i class="fas fa-reply"></i>
                <span class="btn-count" v-if="message.reply_count && message.reply_count > 0">{{ message.reply_count }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more-section" v-if="hasMore">
        <button @click="loadMore" class="load-more-button" :disabled="loading">
          <span v-if="!loading">
            <i class="fas fa-chevron-down"></i>
            加载更多
          </span>
          <span v-else>
            <i class="fas fa-spinner fa-spin"></i>
            加载中...
          </span>
        </button>
      </div>
    </div>

    <!-- 底部留言输入框 -->
    <div 
      class="input-panel" 
      :class="{ 'is-replying': replyingTo, 'collapsed': !isPanelExpanded }"
      ref="inputPanel"
    >
      <!-- 折叠时的触发按钮 -->
      <button 
        v-if="!isPanelExpanded" 
        class="expand-panel-btn" 
        @click.stop="togglePanel"
      >
        <i class="fas fa-pen"></i>
        <span>写留言</span>
      </button>

      <!-- 展开的输入表单 -->
      <div class="input-container" v-show="isPanelExpanded" @click.stop>
        <!-- 折叠按钮 -->
        <button class="collapse-panel-btn" @click="togglePanel">
          <i class="fas fa-chevron-down"></i>
        </button>

        <!-- 回复提示 -->
        <div v-if="replyingTo" class="reply-indicator">
          <div class="reply-info">
            <i class="fas fa-reply"></i>
            <span>回复 <strong>@{{ replyingTo.user_name }}</strong></span>
          </div>
          <button @click="cancelReply" class="cancel-button">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 输入表单 -->
        <div class="input-form">
          <div class="form-row">
            <div class="form-field" :class="{ 'has-error': errors.user_name }">
              <div class="field-icon">
                <i class="fas fa-user"></i>
              </div>
              <input
                v-model="newMessage.user_name"
                type="text"
                placeholder="你的昵称 *"
                maxlength="50"
                class="field-input"
              />
              <div class="field-border"></div>
            </div>
            
            <div class="form-field">
              <div class="field-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <input
                v-model="newMessage.email"
                type="email"
                placeholder="邮箱（选填）"
                maxlength="100"
                class="field-input"
              />
              <div class="field-border"></div>
            </div>
          </div>

          <div class="form-field textarea-field" :class="{ 'has-error': errors.content }">
            <div class="field-icon">
              <i class="fas fa-pen"></i>
            </div>
            <textarea
              v-model="newMessage.content"
              placeholder="写下你的想法..."
              maxlength="500"
              rows="3"
              class="field-textarea"
            ></textarea>
            <div class="char-counter">{{ newMessage.content.length }}/500</div>
            <div class="field-border"></div>
          </div>

          <!-- 提交按钮和提示 -->
          <div class="form-footer">
            <div class="rate-limit-notice" v-if="remainingTime > 0">
              <i class="fas fa-hourglass-half"></i>
              <span>{{ remainingTime }}秒后可再次发送</span>
            </div>
            <button
              @click="submitMessage"
              class="submit-button"
              :disabled="isSubmitting || remainingTime > 0"
            >
              <span class="button-content">
                <i class="fas fa-paper-plane"></i>
                <span>{{ isSubmitting ? '发送中...' : '发送' }}</span>
              </span>
              <div class="button-glow"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回顶部 -->
    <transition name="fade">
      <button
        v-show="showBackToTop"
        @click="scrollToTop"
        class="scroll-top-button"
      >
        <i class="fas fa-arrow-up"></i>
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';

// 类型定义
interface Message {
  id: number;
  user_name: string;
  email?: string;
  content: string;
  parent_id?: number;
  likes: number;
  is_pinned: boolean;
  created_at: string;
  replies?: Message[];
  reply_count?: number;
}

// 状态管理
const messages = ref<Message[]>([]);
const statistics = ref<any>(null);
const loading = ref(false);
const isSubmitting = ref(false);
const hasMore = ref(true);
const page = ref(1);
const limit = 20;

const showBackToTop = ref(false);

// 输入面板折叠状态
const isPanelExpanded = ref(false);

// 全屏滚动相关
const messagesContainer = ref<HTMLElement | null>(null);
const messageCards = ref<HTMLElement[]>([]);
const currentCardIndex = ref(0);
const hasScrolled = ref(false);
let scrollTimeout: number | null = null;

// 留言表单
const newMessage = reactive({
  user_name: '',
  email: '',
  content: ''
});

const errors = reactive({
  user_name: '',
  content: ''
});

// 回复功能
const replyingTo = ref<Message | null>(null);

// 点赞记录（使用 localStorage 持久化）
const likedMessages = ref<Set<number>>(new Set());

// 速率限制（1分钟）
const lastSubmitTime = ref(0);
const remainingTime = ref(0);
let countdownTimer: number | null = null;

// 统计数据计算
const statsData = computed(() => {
  if (!statistics.value) return [];
  
  return [
    {
      icon: 'fas fa-comments',
      label: '总留言',
      value: statistics.value.total_messages || '0',
      color: 'blue'
    },
    {
      icon: 'fas fa-heart',
      label: '总点赞',
      value: statistics.value.total_likes || '0',
      color: 'red'
    },
    {
      icon: 'fas fa-check-circle',
      label: '已显示',
      value: statistics.value.approved_messages || '0',
      color: 'green'
    },
    {
      icon: 'fas fa-reply',
      label: '回复数',
      value: statistics.value.reply_messages || '0',
      color: 'purple'
    }
  ];
});

// 初始化
onMounted(async () => {
  await Promise.all([
    loadMessages(),
    loadStatistics()
  ]);
  
  // 加载点赞记录
  const savedLikes = localStorage.getItem('likedMessages');
  if (savedLikes) {
    likedMessages.value = new Set(JSON.parse(savedLikes));
  }
  
  // 加载上次提交时间
  const savedTime = localStorage.getItem('lastSubmitTime');
  if (savedTime) {
    lastSubmitTime.value = parseInt(savedTime);
    updateRemainingTime();
  }
  
  // 滚动监听
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});

// 加载留言
async function loadMessages() {
  try {
    loading.value = true;
    const offset = (page.value - 1) * limit;
    const response = await axios.get(`/api/messages/tree?limit=${limit}&offset=${offset}`);
    
    if (response.data.success) {
      const newMessages = response.data.data;
      
      if (page.value === 1) {
        messages.value = newMessages;
      } else {
        messages.value = [...messages.value, ...newMessages];
      }
      
      hasMore.value = messages.value.length < response.data.total;
    }
  } catch (error) {
    console.error('加载留言失败:', error);
  } finally {
    loading.value = false;
  }
}

// 加载统计信息
async function loadStatistics() {
  try {
    const response = await axios.get('/api/messages/statistics');
    if (response.data.success) {
      statistics.value = response.data.data;
    }
  } catch (error) {
    console.error('加载统计失败:', error);
  }
}

// 加载更多
async function loadMore() {
  page.value++;
  await loadMessages();
}

// 提交留言
async function submitMessage() {
  // 验证
  errors.user_name = '';
  errors.content = '';
  
  if (!newMessage.user_name.trim()) {
    errors.user_name = '请输入昵称';
    return;
  }
  
  if (!newMessage.content.trim()) {
    errors.content = '请输入留言内容';
    return;
  }
  
  if (newMessage.content.length > 500) {
    errors.content = '留言内容不能超过500字';
    return;
  }
  
  try {
    isSubmitting.value = true;
    
    const payload: any = {
      user_name: newMessage.user_name.trim(),
      content: newMessage.content.trim()
    };
    
    if (newMessage.email) {
      payload.email = newMessage.email.trim();
    }
    
    if (replyingTo.value) {
      payload.parent_id = replyingTo.value.id;
    }
    
    const response = await axios.post('/api/messages', payload);
    
    if (response.data.success) {
      // 记录提交时间
      lastSubmitTime.value = Date.now();
      localStorage.setItem('lastSubmitTime', lastSubmitTime.value.toString());
      updateRemainingTime();
      
      // 清空表单
      newMessage.user_name = '';
      newMessage.email = '';
      newMessage.content = '';
      replyingTo.value = null;
      
      // 刷新列表
      page.value = 1;
      await Promise.all([
        loadMessages(),
        loadStatistics()
      ]);
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // 显示成功提示
      showNotification('留言发送成功！', 'success');
    }
  } catch (error: any) {
    showNotification(error.response?.data?.error || '发送失败，请稍后重试', 'error');
  } finally {
    isSubmitting.value = false;
  }
}

// 点击外部区域时折叠输入面板
function handleOutsideClick(event: MouseEvent) {
  if (isPanelExpanded.value) {
    isPanelExpanded.value = false;
  }
}

// 切换输入面板展开/折叠
function togglePanel() {
  isPanelExpanded.value = !isPanelExpanded.value;
}

// 更新剩余时间
function updateRemainingTime() {
  const updateTime = () => {
    const elapsed = Date.now() - lastSubmitTime.value;
    const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
    remainingTime.value = remaining;
    
    if (remaining === 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };
  
  updateTime();
  
  if (remainingTime.value > 0) {
    countdownTimer = window.setInterval(updateTime, 1000);
  }
}

// 点赞/取消点赞
async function toggleLike(message: Message) {
  const messageId = message.id;
  const isCurrentlyLiked = likedMessages.value.has(messageId);
  
  try {
    const endpoint = isCurrentlyLiked ? 'unlike' : 'like';
    const response = await axios.post(`/api/messages/${messageId}/${endpoint}`);
    
    if (response.data.success) {
      message.likes = response.data.data.likes;
      
      if (isCurrentlyLiked) {
        likedMessages.value.delete(messageId);
      } else {
        likedMessages.value.add(messageId);
      }
      
      // 保存到 localStorage
      localStorage.setItem('likedMessages', JSON.stringify([...likedMessages.value]));
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
  }
}

// 检查是否已点赞
function isLiked(messageId: number): boolean {
  return likedMessages.value.has(messageId);
}

// 回复留言
function replyToMessage(message: Message) {
  replyingTo.value = message;
  
  // 展开输入面板
  isPanelExpanded.value = true;
  
  // 滚动到留言框
  setTimeout(() => {
    const inputPanel = document.querySelector('.input-panel');
    if (inputPanel) {
      inputPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    
    // 聚焦到内容输入框
    const textarea = document.querySelector('.field-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }, 100);
}

// 取消回复
function cancelReply() {
  replyingTo.value = null;
}

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 生成头像渐变色
function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
  ];
  
  // 根据名字生成一个稳定的索引
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return gradients[Math.abs(hash) % gradients.length];
}

// 滚动处理
function handleScroll() {
  showBackToTop.value = window.scrollY > 500;
}

// 处理留言容器滚动（全屏卡片切换）
function handleMessagesScroll(event: Event) {
  hasScrolled.value = true;
  
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  scrollTimeout = window.setTimeout(() => {
    const container = event.target as HTMLElement;
    const scrollTop = container.scrollTop;
    const windowHeight = window.innerHeight - 200; // 减去头部和底部空间
    
    // 计算当前应该显示第几张卡片
    const newIndex = Math.round(scrollTop / windowHeight);
    
    if (newIndex !== currentCardIndex.value && newIndex >= 0 && newIndex < messages.value.length) {
      currentCardIndex.value = newIndex;
      
      // 平滑滚动到精确位置
      container.scrollTo({
        top: newIndex * windowHeight,
        behavior: 'smooth'
      });
    }
  }, 100);
}

// 回到顶部
function scrollToTop() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
    currentCardIndex.value = 0;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 显示通知
function showNotification(message: string, type: 'success' | 'error') {
  // 简单的 alert，可以后续替换为更美观的通知组件
  alert(message);
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.message-board {
  min-height: 100vh;
  padding: 0;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 动态背景 - 移除，使用全局背景 */
.animated-background {
  display: none;
}

/* 页面标题 */
.board-header {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 80px 20px 40px;
}

.title-container {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.icon-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
}

.icon-wrapper i {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 2;
  animation: iconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba(102, 126, 234, 0.3));
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.board-title {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title-text {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2c3e50 0%, #667eea 50%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  letter-spacing: -1px;
}

.title-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  color: #7f8c8d;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-top: 5px;
}

.board-description {
  font-size: 1.1rem;
  color: #95a5a6;
  margin: 0;
}

/* 统计卡片 */
.stats-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  animation: slideUp 0.6s ease-out backwards;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
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

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.red {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.stat-sparkle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 留言容器 - 全屏滚动 */
.messages-container {
  position: relative;
  z-index: 1;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
  padding-bottom: 200px;
  
  /* 隐藏滚动条但保持功能 */
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* 滚动提示 */
.scroll-hint {
  position: fixed;
  bottom: 220px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 50;
  animation: bounceHint 2s ease-in-out infinite;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.scroll-hint i {
  font-size: 1.5rem;
  animation: arrowDown 1.5s ease-in-out infinite;
}

@keyframes bounceHint {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

@keyframes arrowDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

.messages-stack {
  position: relative;
  width: 100%;
}

.message-card-wrapper {
  height: 100vh;
  min-height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 留言卡片 - 极简全屏设计 */
.message-card {
  width: 100%;
  max-width: 1200px;
  height: 100%;
  min-height: 100vh;
  position: relative;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 60px 140px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 简约指示器 */
.mini-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #95a5a6;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.message-card:hover .mini-indicator {
  opacity: 0.8;
}

/* 全屏内容容器 */
.message-content-fullscreen {
  width: 100%;
  max-width: 900px;
  position: relative;
  text-align: center;
  animation: contentFadeIn 0.8s ease-out;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 引号装饰 */
.quote-icon {
  font-size: 3rem;
  color: rgba(102, 126, 234, 0.2);
  margin-bottom: 20px;
}

.quote-icon.top {
  text-align: left;
  margin-bottom: 30px;
}

.quote-icon.bottom {
  text-align: right;
  margin-top: 30px;
  margin-bottom: 40px;
}

/* 留言文本 - 超大字体 */
.message-text-large {
  font-size: 2.5rem;
  line-height: 1.6;
  color: #2c3e50;
  font-weight: 500;
  margin: 0;
  padding: 0 40px;
  word-wrap: break-word;
  white-space: pre-wrap;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-card.is-active .message-text-large {
  animation: textReveal 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s backwards;
}

@keyframes textReveal {
  from {
    opacity: 0;
    transform: translateY(40px);
    filter: blur(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* 作者署名 */
.message-author {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 50px;
  opacity: 0.8;
}

.author-name {
  font-size: 1.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.author-time {
  font-size: 1rem;
  color: #95a5a6;
  font-weight: 500;
}

/* 悬浮互动按钮 */
.floating-actions {
  position: absolute;
  bottom: 20%;
  left: 80%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  opacity: 1;
  transition: all 0.3s ease;
  z-index: 10;
}

.message-card:hover .floating-actions {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.floating-btn {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  color: #52c41a;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.floating-btn:hover {
  transform: translateY(-8px) scale(1.1);
  box-shadow: 
    0 12px 35px rgba(82, 196, 26, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.floating-btn.like-btn.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  box-shadow: 
    0 12px 35px rgba(245, 87, 108, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.floating-btn.like-btn.active:hover {
  transform: translateY(-8px) scale(1.15) rotate(10deg);
}

.btn-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
}

.floating-btn.like-btn.active .btn-count {
  background: linear-gradient(135deg, #fff 0%, #ffe0e6 100%);
  color: #f5576c;
}

/* 卡片状态 */
.message-card.is-active {
  transform: scale(1) translateY(0);
  opacity: 1;
  z-index: 10;
}

.message-card.is-prev {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.message-card.is-next {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.message-card.is-pinned {
  border: 2px solid #667eea;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98), 
    rgba(102, 126, 234, 0.08));
  box-shadow: 
    0 20px 60px rgba(102, 126, 234, 0.25),
    0 0 0 1px rgba(102, 126, 234, 0.6);
}

/* 旧样式已删除，使用新的极简设计 */

.user-details {
  flex: 1;
}

/* 旧样式已删除，使用新的极简设计 */

/* 加载更多按钮 */
.load-more-section {
  margin-bottom: 16px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border-left: 3px solid #667eea;
  transition: all 0.2s ease;
}

.reply-item:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateX(4px);
}

.reply-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 10px;
}

.reply-user {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.9rem;
}

.reply-time {
  font-size: 0.75rem;
  color: #95a5a6;
  flex-shrink: 0;
}

.reply-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555;
  margin: 0;
  word-wrap: break-word;
}

/* 加载更多 */
.load-more-section {
  text-align: center;
  margin-top: 40px;
}

.load-more-button {
  padding: 14px 40px;
  border: none;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.load-more-button:hover:not(:disabled) {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 输入面板 */
.input-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.98) 90%, transparent);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 100;
  padding: 20px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 折叠状态 */
.input-panel.collapsed {
  padding: 15px;
  background: transparent;
  border-top: none;
  box-shadow: none;
}

/* 展开按钮 */
.expand-panel-btn {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 30px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(82, 196, 26, 0.3);
    transition: all 0.3s ease;
}

.expand-panel-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(82, 196, 26, 0.5);
}

.expand-panel-btn i {
  font-size: 1.1rem;
}

/* 折叠按钮 */
.collapse-panel-btn {
  position: absolute;
  top: -50px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 10;
}

.collapse-panel-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  background: #667eea;
  color: #fff;
}

.input-panel.is-replying {
  background: linear-gradient(to top, rgba(102, 126, 234, 0.05) 90%, transparent);
}

.input-container {
  max-width: 900px;
  margin: 0 auto;
}

.reply-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
  color: #fff;
  margin-bottom: -1px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
}

.cancel-button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.input-form {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  position: relative;
}

.form-field.has-error .field-border {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.field-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  z-index: 2;
  transition: color 0.3s ease;
}

.form-field:focus-within .field-icon {
  color: #667eea;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 14px 16px 14px 46px;
  border: none;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  font-size: 0.95rem;
  color: #2c3e50;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.05);
}

.field-textarea {
  resize: vertical;
  min-height: 90px;
  padding-top: 16px;
  line-height: 1.6;
}

.textarea-field .field-icon {
  top: 20px;
  transform: none;
}

.field-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  border-radius: 2px;
}

.form-field:focus-within .field-border {
  transform: scaleX(1);
}

.char-counter {
  position: absolute;
  right: 16px;
  bottom: 12px;
  font-size: 0.8rem;
  color: #95a5a6;
  pointer-events: none;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  gap: 16px;
}

.rate-limit-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(230, 126, 34, 0.1);
  border-radius: 20px;
  color: #e67e22;
  font-size: 0.85rem;
  font-weight: 600;
}

.submit-button {
  padding: 14px 36px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(82, 196, 26, 0.5);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-button:hover:not(:disabled) .button-glow {
  opacity: 1;
  animation: buttonGlow 1.5s ease-in-out infinite;
}

@keyframes buttonGlow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
  }
}

/* 返回顶部按钮 */
.scroll-top-button {
  position: fixed;
  bottom: 200px;
  right: 30px;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 99;
}

.scroll-top-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
}

.scroll-top-button i {
  animation: arrowBounce 1.5s ease-in-out infinite;
}

@keyframes arrowBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .board-header {
    padding: 60px 20px 30px;
  }
  
  .title-text {
    font-size: 2.2rem;
  }
  
  .title-subtitle {
    font-size: 0.9rem;
    letter-spacing: 2px;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 40px;
  }
  
  .stat-card {
    padding: 18px;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
  
  .messages-container {
    height: calc(100vh - 80px);
  }
  
  .message-card-wrapper {
    height: calc(100vh - 250px);
    min-height: 400px;
    padding: 15px;
  }
  
  .message-card {
    padding: 50px 25px 120px;
    max-width: 100%;
  }
  
  .message-text-large {
    font-size: 1.8rem;
    padding: 0 15px;
    line-height: 1.5;
  }
  
  .quote-icon {
    font-size: 2rem;
  }
  
  .quote-icon.top {
    margin-bottom: 20px;
  }
  
  .quote-icon.bottom {
    margin-top: 20px;
    margin-bottom: 25px;
  }
  
  .message-author {
    margin-top: 30px;
  }
  
  .author-name {
    font-size: 1.1rem;
  }
  
  .author-time {
    font-size: 0.9rem;
  }
  
  .floating-actions {
    bottom: 25px;
    gap: 12px;
    opacity: 1; /* 移动端始终显示 */
  }
  
  .floating-btn {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .btn-count {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
  
  .mini-indicator {
    top: 18px;
    right: 18px;
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .card-indicator .current {
    font-size: 1rem;
  }
  
  .pinned-badge {
    top: 15px;
    right: 15px;
    padding: 6px 12px;
    font-size: 0.75rem;
  }
  
  .message-user {
    padding-top: 30px;
    margin-bottom: 24px;
    gap: 14px;
  }
  
  .user-avatar {
    width: 52px;
    height: 52px;
    font-size: 1.4rem;
  }
  
  .user-name {
    font-size: 1.1rem;
  }
  
  .message-meta {
    font-size: 0.85rem;
  }
  
  .message-body {
    margin-bottom: 24px;
    max-height: 200px;
  }
  
  .message-text {
    font-size: 1rem;
    line-height: 1.7;
  }
  
  .message-footer {
    gap: 10px;
  }
  
  .action-button {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
  
  .replies-section {
    margin-top: 16px;
    padding-top: 16px;
  }
  
  .reply-item {
    padding: 12px;
  }
  
  .scroll-hint {
    bottom: 240px;
    font-size: 0.85rem;
  }
  
  .input-panel {
    padding: 15px;
  }
  
  .input-panel.collapsed {
    padding: 12px;
  }
  
  .expand-panel-btn {
    max-width: 160px;
    padding: 12px 24px;
    font-size: 0.9rem;
  }
  
  .collapse-panel-btn {
    top: -45px;
    right: 15px;
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
  .input-form {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .submit-button {
    width: 100%;
  }
  
  .scroll-top-button {
    bottom: 240px;
    right: 20px;
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .message-card {
    padding: 24px 18px;
  }
  
  .message-body {
    max-height: 150px;
  }
  
  .replies-section {
    max-height: 120px;
    overflow-y: auto;
  }
}
</style>

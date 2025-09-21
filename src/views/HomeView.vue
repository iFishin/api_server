<template>
  <div class="home-view">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-pattern"></div>
      <div class="floating-elements">
        <div class="float-element blue" style="--x: 10%; --y: 20%; --delay: 0s;">
          <i class="fas fa-code"></i>
        </div>
        <div class="float-element green" style="--x: 85%; --y: 15%; --delay: 1s;">
          <i class="fas fa-rocket"></i>
        </div>
        <div class="float-element dark" style="--x: 15%; --y: 70%; --delay: 2s;">
          <i class="fas fa-cogs"></i>
        </div>
        <div class="float-element gray" style="--x: 80%; --y: 75%; --delay: 3s;">
          <i class="fas fa-shield-alt"></i>
        </div>
        <div class="float-element blue" style="--x: 50%; --y: 10%; --delay: 4s;">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="float-element green" style="--x: 25%; --y: 45%; --delay: 5s;">
          <i class="fas fa-database"></i>
        </div>
        <div class="float-element dark" style="--x: 75%; --y: 50%; --delay: 6s;">
          <i class="fas fa-network-wired"></i>
        </div>
      </div>
    </div>

    <div class="hero">
      <h1>
        <span class="logo-badge">
          <IconApi />
          API_Server
        </span>
      </h1>
      <p class="subtitle">
        <span class="subtitle-badge">All-in-One Development&Debug Kits Platform</span>
      </p>
      
      <!-- 循环提示词展示 -->
      <div class="tips-carousel">
        <div class="tip-item" :class="{ active: currentTipIndex === index }" 
             v-for="(tip, index) in tips" :key="index">
          <i :class="tip.icon"></i>
          <span>{{ tip.text }}</span>
        </div>
      </div>
    </div>

    <!-- 核心功能卡片 -->
    <div class="features-grid">
      <div class="feature-card" v-for="feature in features" :key="feature.id">
        <div class="feature-icon">{{ feature.icon }}</div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.desc }}</p>
      </div>
    </div>

    <!-- 快速开始 -->
    <div class="quickstart-section">
      <h2>🚀 快速开始</h2>
      <div class="steps-grid">
        <div class="step-card" v-for="(step, index) in quickSteps" :key="index">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
      
      <!-- 无界导航入口 -->
      <div class="infinite-nav-entry">
        <router-link to="/infinite-nav" class="infinite-nav-button">
          <div class="nav-button-icon">
            <i class="fas fa-infinity"></i>
          </div>
          <div class="nav-button-content">
            <h3>🌌 体验无界导航</h3>
            <p>探索无限循环的交互式导航界面</p>
          </div>
          <div class="nav-button-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 底部 -->
    <div class="footer">
      <div class="footer-content">
        <p><strong>API_Server</strong> - 现代化开发工具集</p>
        <div class="footer-links">
          <a href="#" class="footer-link">开始使用</a>
          <a href="#" class="footer-link">文档</a>
          <a href="#" class="footer-link">支持</a>
          <a href="https://github.com/iFishin/api_server" class="footer-link">Github Repo</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import IconApi from '@/components/icons/IconApi.vue';

// 循环提示词数据
const tips = ref([
  { icon: 'fas fa-rocket', text: '高效API测试，一键完成' },
  { icon: 'fas fa-shield-alt', text: '安全可靠，企业级保障' },
  { icon: 'fas fa-code', text: '多协议支持，开发无忧' },
  { icon: 'fas fa-chart-line', text: '实时监控，性能可视' },
  { icon: 'fas fa-puzzle-piece', text: '无缝集成，工作流畅' }
]);

const currentTipIndex = ref(0);
let tipInterval: number | null = null;

// 核心功能数据
const features = ref([
  {
    id: 1,
    icon: '🧪',
    title: '多协议支持',
    desc: 'HTTP/TCP/UDP/MQTT统一接口'
  },
  {
    id: 2,
    icon: '⚡',
    title: '即时测试',
    desc: 'API模拟与自动化测试'
  },
  {
    id: 3,
    icon: '🔗',
    title: '工作流集成',
    desc: '文档、测试、部署一体化'
  },
  {
    id: 4,
    icon: '📊',
    title: '数据分析',
    desc: '性能监控与分析仪表板'
  }
]);

// 快速开始步骤
const quickSteps = ref([
  {
    title: '浏览文档',
    desc: '查看API接口文档'
  },
  {
    title: '测试接口',
    desc: '使用交互式测试工具'
  },
  {
    title: '集成应用',
    desc: '无缝集成到开发流程'
  }
]);

// 启动提示词循环
const startTipCarousel = () => {
  tipInterval = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % tips.value.length;
  }, 3000);
};

// 停止提示词循环
const stopTipCarousel = () => {
  if (tipInterval) {
    clearInterval(tipInterval);
    tipInterval = null;
  }
};

onMounted(() => {
  startTipCarousel();
  // 添加主页样式类
  document.body.classList.add('home-page');
});

onUnmounted(() => {
  stopTipCarousel();
  // 移除主页样式类
  document.body.classList.remove('home-page');
});
</script>

<style scoped>
/* 全局滚动条隐藏 */
:global(html) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

:global(html::-webkit-scrollbar) {
  display: none;
}

:global(body) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
  overflow-x: hidden;
}

:global(body::-webkit-scrollbar) {
  display: none;
}

/* 主页专用样式 - 覆盖App.vue的main容器样式 */
:global(body.home-page) {
  overflow-x: hidden;
}

:global(body.home-page .main-container) {
  overflow: visible !important;
  height: auto !important;
  padding: 0 !important;
}

:global(body.home-page main) {
  overflow: visible !important;
  height: auto !important;
  max-height: none !important;
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border: none !important;
}

:global(body.home-page header) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
  backdrop-filter: blur(10px) !important;
  background: rgba(255, 255, 255, 0.9) !important;
}

.home-view {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 2rem;
  padding-top: 5rem; /* 为固定导航栏留出空间 */
  border-radius: 0;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 40%, #f8fafc 70%, #f0fdf4 100%);
  box-shadow: none;
  border: none;
  font-family: 'Inter', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
  position: relative;
  box-sizing: border-box;
}

/* 内容容器 */
.home-view > * {
  max-width: 100%;
  box-sizing: border-box;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 75% 25%, rgba(59, 130, 246, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 25% 75%, rgba(71, 85, 105, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.02) 0%, transparent 70%);
  background-size: 100px 100px, 120px 120px, 140px 140px, 150px 150px, 200px 200px;
  background-position: 0 0, 50px 25px, 25px 50px, 75px 75px, 100px 100px;
  /* 移除旋转动画，使用更柔和的移动 */
  animation: patternMove 60s ease-in-out infinite;
}

@keyframes patternMove {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
}

.floating-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.float-element {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  left: var(--x);
  top: var(--y);
  animation: floatUpDown 6s ease-in-out infinite;
  animation-delay: var(--delay);
  transition: all 0.3s ease;
}

.float-element:hover {
  transform: translateY(-5px) scale(1.1);
}

/* 不同颜色主题的浮动元素 */
.float-element.green {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: rgba(34, 197, 94, 0.7);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
}

.float-element.blue {
  background: rgba(239, 246, 255, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: rgba(59, 130, 246, 0.7);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
}

.float-element.dark {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(71, 85, 105, 0.3);
  color: rgba(71, 85, 105, 0.7);
  box-shadow: 0 4px 20px rgba(71, 85, 105, 0.15);
}

.float-element.gray {
  background: rgba(249, 250, 251, 0.9);
  border: 1px solid rgba(156, 163, 175, 0.3);
  color: rgba(107, 114, 128, 0.7);
  box-shadow: 0 4px 20px rgba(107, 114, 128, 0.15);
}

@keyframes floatUpDown {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-20px) scale(1.05); }
  50% { transform: translateY(-10px) scale(0.95); }
  75% { transform: translateY(-15px) scale(1.02); }
}

.hero {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 5rem;
  padding: 3rem 0;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, 
    rgba(240, 253, 244, 0.95) 0%, 
    rgba(255, 255, 255, 0.98) 20%, 
    rgba(255, 255, 255, 0.98) 80%, 
    rgba(240, 253, 244, 0.95) 100%);
  color: #1f2937;
  font-size: 2.8rem;
  font-weight: 800;
  border-radius: 20px;
  padding: 0.4em 1.2em;
  letter-spacing: 2px;
  box-shadow: 
    0 8px 32px rgba(34, 197, 94, 0.12),
    0 4px 16px rgba(71, 85, 105, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.15);
  backdrop-filter: blur(15px) saturate(1.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.logo-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(34, 197, 94, 0.1) 30%, 
    rgba(255, 255, 255, 0.3) 50%, 
    rgba(34, 197, 94, 0.1) 70%, 
    transparent);
  transition: left 0.5s ease;
}

.logo-badge:hover::before {
  left: 100%;
}

.logo-badge:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(34, 197, 94, 0.2),
    0 6px 20px rgba(71, 85, 105, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-color: rgba(34, 197, 94, 0.3);
}

.logo-badge svg {
  margin-right: 0.5em;
  width: 1.2em;
  height: 1.2em;
  fill: #1f2937;
  filter: drop-shadow(0 1px 2px rgba(34, 197, 94, 0.3));
}

.subtitle {
  margin: 1.5rem 0;
}

.subtitle-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  color: #1e40af;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.5em 1.5em;
  letter-spacing: 1px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}

.subtitle-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.subtitle-badge:hover::before {
  transform: translateX(100%);
}

/* 提示词轮播 */
.tips-carousel {
  position: relative;
  height: 60px;
  margin: 2rem 0;
  overflow: hidden;
}

.tip-item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  opacity: 0;
  transition: all 0.5s ease;
  font-size: 1.1rem;
  color: #16a34a;
  font-weight: 500;
}

.tip-item.active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.tip-item i {
  font-size: 1.3rem;
  color: #22c55e;
}

/* 功能网格 */
.features-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 5rem 0;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.feature-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 
    0 4px 20px rgba(71, 85, 105, 0.08),
    0 2px 10px rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6 0%, #22c55e 50%, #1e40af 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(34, 197, 94, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 12px 40px rgba(71, 85, 105, 0.12),
    0 6px 20px rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  background: linear-gradient(135deg, #1e40af 0%, #16a34a 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  position: relative;
  z-index: 2;
}

.feature-card p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}

/* 快速开始 */
.quickstart-section {
  position: relative;
  z-index: 1;
  margin: 6rem 0;
  text-align: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.quickstart-section h2 {
  font-size: 2rem;
  background: linear-gradient(135deg, #1e40af 0%, #16a34a 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  font-weight: 700;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.step-card {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 
    0 2px 12px rgba(71, 85, 105, 0.08),
    0 1px 6px rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.step-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #3b82f6 0%, #22c55e 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.step-card:hover::before {
  transform: scaleY(1);
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 25px rgba(71, 85, 105, 0.12),
    0 4px 15px rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  position: relative;
}

.step-number::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  border-radius: 50%;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.step-card:hover .step-number::before {
  opacity: 0.3;
}

.step-content {
  text-align: left;
}

.step-content h4 {
  background: linear-gradient(135deg, #1e40af 0%, #16a34a 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.step-content p {
  color: #64748b;
  font-size: 0.9rem;
}

/* 底部 */
.footer {
  position: relative;
  z-index: 1;
  margin-top: 6rem;
  padding: 3rem 0 2rem;
  border-top: 1px solid rgba(34, 197, 94, 0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.footer-content {
  text-align: center;
}

/* 无界导航入口 */
.infinite-nav-entry {
  margin: 3rem auto 0;
  max-width: 600px;
}

.infinite-nav-button {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, 
    rgba(147, 51, 234, 0.95) 0%, 
    rgba(59, 130, 246, 0.95) 50%, 
    rgba(16, 185, 129, 0.95) 100%);
  color: white;
  text-decoration: none;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  gap: 1.5rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 10px 30px rgba(147, 51, 234, 0.3),
    0 5px 15px rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.infinite-nav-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2) 30%, 
    rgba(255, 255, 255, 0.4) 50%, 
    rgba(255, 255, 255, 0.2) 70%, 
    transparent);
  transition: left 0.6s ease;
}

.infinite-nav-button:hover::before {
  left: 100%;
}

.infinite-nav-button:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 20px 50px rgba(147, 51, 234, 0.4),
    0 10px 25px rgba(59, 130, 246, 0.3),
    0 0 30px rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.infinite-nav-button:active {
  transform: translateY(-2px) scale(0.98);
}

.nav-button-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.infinite-nav-button:hover .nav-button-icon {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(360deg);
}

.nav-button-icon i {
  font-size: 1.8rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: infinityPulse 2s ease-in-out infinite;
}

@keyframes infinityPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.nav-button-content {
  flex: 1;
  text-align: left;
  position: relative;
  z-index: 2;
}

.nav-button-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffffff, #f0f9ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-button-content p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.95);
}

.nav-button-arrow {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.infinite-nav-button:hover .nav-button-arrow {
  transform: translateX(5px);
}

.nav-button-arrow i {
  font-size: 1.2rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.footer-content p {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.footer-content strong {
  background: linear-gradient(135deg, #1e40af 0%, #16a34a 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.footer-link {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.footer-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.4s ease;
}

.footer-link:hover::before {
  left: 100%;
}

.footer-link:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  color: #1e40af;
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
    padding-top: 4.5rem; /* 移动端为导航栏留出空间 */
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  .hero {
    padding: 2rem 0;
    margin-bottom: 3rem;
  }

  .logo-badge {
    font-size: 2.2rem;
    padding: 0.3em 1em;
    max-width: 100%;
    box-sizing: border-box;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin: 3rem 0;
    width: 100%;
  }

  .quickstart-section {
    margin: 4rem 0;
    width: 100%;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
  }

  .infinite-nav-button {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }

  .nav-button-content {
    text-align: center;
  }

  .nav-button-arrow {
    transform: rotate(90deg);
  }

  .infinite-nav-button:hover .nav-button-arrow {
    transform: rotate(90deg) translateX(5px);
  }

  .footer {
    margin-top: 4rem;
    padding: 2rem 0 1.5rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }

  .tip-item {
    font-size: 1rem;
  }

  /* 移动端浮动元素适配 */
  .float-element {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }

  .bg-pattern {
    background-size: 80px 80px, 100px 100px, 120px 120px, 130px 130px, 160px 160px;
  }
}

@media (max-width: 480px) {
  .home-view {
    padding: 0.75rem;
    padding-top: 4rem; /* 小屏幕为导航栏留出空间 */
  }

  .hero {
    margin-bottom: 2rem;
    padding: 1.5rem 0;
  }

  .logo-badge {
    font-size: 1.8rem;
    padding: 0.3em 0.8em;
  }

  .features-grid {
    margin: 2rem 0;
    gap: 1rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .quickstart-section {
    margin: 3rem 0;
  }

  .footer {
    margin-top: 3rem;
  }

  .step-card {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .step-content {
    text-align: center;
  }
}
</style>
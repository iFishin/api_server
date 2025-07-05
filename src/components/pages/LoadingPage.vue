<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="loading-animation">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-icon">
          <i :class="icon"></i>
        </div>
      </div>
      <h3 class="loading-title">{{ title }}</h3>
      <p class="loading-text">{{ description }}</p>
      <div class="loading-progress" v-if="showProgress">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <span class="progress-text">{{ progressText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
  showProgress?: boolean
  progressText?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'fas fa-network-wired',
  title: 'Loading',
  description: '正在加载内容...',
  showProgress: true,
  progressText: 'Loading...'
})
</script>

<style scoped>
/* Loading Overlay - 重新设计 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.9) 50%, rgba(59, 130, 246, 0.85) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(12px);
  animation: overlayFadeIn 0.5s ease-out;
}

@keyframes overlayFadeIn {
  from { 
    opacity: 0; 
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1; 
    backdrop-filter: blur(12px);
  }
}

.loading-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 3.5rem 4.5rem;
  border-radius: 28px;
  text-align: center;
  box-shadow: 
    0 32px 80px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: contentSlideUp 0.6s ease-out 0.2s both;
  max-width: 420px;
  width: 90%;
}

@keyframes contentSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.loading-animation {
  position: relative;
  margin: 0 auto 2rem;
  width: 80px;
  height: 80px;
}

.loading-spinner {
  position: absolute;
  width: 100%;
  height: 100%;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spinRing 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #10b981;
  animation-delay: 0s;
  opacity: 1;
}

.spinner-ring:nth-child(2) {
  border-right-color: #3b82f6;
  animation-delay: -0.4s;
  opacity: 0.8;
  transform: scale(0.8);
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #8b5cf6;
  animation-delay: -0.8s;
  opacity: 0.6;
  transform: scale(0.6);
}

@keyframes spinRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
  }
}

.loading-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-text {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.5;
}

.loading-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 50%, #3b82f6 100%);
  border-radius: 6px;
  animation: progressFill 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

@keyframes progressFill {
  0% { 
    width: 0%; 
    transform: translateX(-100%);
  }
  50% { 
    width: 70%; 
    transform: translateX(0%);
  }
  100% { 
    width: 100%; 
    transform: translateX(0%);
  }
}

.progress-text {
  font-size: 0.9rem;
  color: #10b981;
  font-weight: 600;
  letter-spacing: 0.05em;
  animation: textFade 1.5s ease-in-out infinite;
}

@keyframes textFade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .loading-content {
    padding: 2rem 2.5rem;
    width: 95%;
  }
  
  .loading-title {
    font-size: 1.5rem;
  }
  
  .loading-text {
    font-size: 1rem;
  }
  
  .loading-animation {
    width: 60px;
    height: 60px;
    margin-bottom: 1.5rem;
  }
  
  .loading-icon {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
}
</style>

<template>
  <Teleport to="body">
    <Transition name="notification" appear>
      <div v-if="visible" class="copy-notification" :class="notificationClass">
        <div class="notification-content">
          <i :class="iconClass"></i>
          <span>{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';

interface Props {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000
});

const emit = defineEmits<{
  hide: [];
}>();

const timeoutId = ref<number | null>(null);

const notificationClass = computed(() => {
  return `notification-${props.type}`;
});

const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle'
  };
  return icons[props.type];
});

// 监听 visible 属性变化，当变为 true 时启动自动隐藏定时器
watch(() => props.visible, (newVisible) => {
  // 清除之前的定时器
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }
  
  // 如果显示通知且设置了持续时间，启动自动隐藏定时器
  if (newVisible && props.duration > 0) {
    timeoutId.value = window.setTimeout(() => {
      emit('hide');
      timeoutId.value = null;
    }, props.duration);
  }
}, { immediate: true });
</script>

<style scoped>
.copy-notification {
  position: fixed;
  top: 10rem;
  right: 2rem;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  z-index: 9999;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.notification-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.notification-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.notification-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.notification-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.notification-content i {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* 过渡动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .copy-notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    padding: 0.875rem 1.25rem;
    min-width: unset;
  }
  
  .notification-content {
    font-size: 0.8rem;
  }
  
  .notification-content i {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .copy-notification {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    padding: 0.75rem 1rem;
  }
}
</style>

<template>
  <div class="empty-page">
    <div class="empty-icon">
      <i :class="iconClass"></i>
    </div>
    <h3 v-if="title">{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <p v-if="subDescription" class="sub-description">{{ subDescription }}</p>
    <p v-if="comingSoon" class="coming-soon">{{ comingSoon }}</p>
    
    <!-- 插槽支持自定义操作按钮 -->
    <div v-if="$slots.default" class="empty-actions">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 图标类名，默认为 'fas fa-search' */
  icon?: string
  /** 主标题 */
  title?: string
  /** 主要描述文本 */
  description?: string
  /** 副描述文本 */
  subDescription?: string
  /** "即将推出"文本 */
  comingSoon?: string
  /** 分类名称，会自动替换 description 中的占位符 */
  categoryName?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'fas fa-search',
  title: 'No content found',
  description: '',
  subDescription: '',
  comingSoon: '',
  categoryName: ''
})

const iconClass = computed(() => props.icon)
</script>

<style scoped>
.empty-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  margin: 2rem 0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon i {
  font-size: 2rem;
  color: #64748b;
}

.empty-page h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #475569;
  font-weight: 600;
}

.empty-page p {
  margin: 0 0 0.5rem 0;
  color: #64748b;
  font-size: 1rem;
}

.sub-description {
  margin-top: 0.25rem !important;
}

.coming-soon {
  color: #f59e0b !important;
  font-weight: 600;
}

.empty-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-page {
    padding: 3rem 1.5rem;
  }
  
  .empty-icon {
    width: 60px;
    height: 60px;
  }
  
  .empty-icon i {
    font-size: 1.5rem;
  }
  
  .empty-page h3 {
    font-size: 1.25rem;
  }
  
  .empty-page p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .empty-page {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    width: 50px;
    height: 50px;
  }
  
  .empty-icon i {
    font-size: 1.25rem;
  }
}
</style>

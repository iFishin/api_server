<template>
  <div class="compact-value-input">
    <!-- 字符串输入 -->
    <input 
      v-if="type === 'string'"
      :value="value" 
      @input="updateValue(($event.target as HTMLInputElement).value)"
      class="input-compact"
      placeholder="输入文本"
    />
    
    <!-- 数字输入 -->
    <input 
      v-else-if="type === 'number'"
      type="number" 
      :value="value" 
      @input="updateValue(Number(($event.target as HTMLInputElement).value))"
      class="input-compact"
      placeholder="输入数字"
      step="any"
    />
    
    <!-- 布尔值切换 -->
    <div v-else-if="type === 'boolean'" class="boolean-compact">
      <button 
        @click="updateValue(true)"
        class="bool-btn"
        :class="{ active: value === true }"
      >
        True
      </button>
      <button 
        @click="updateValue(false)"
        class="bool-btn"
        :class="{ active: value === false }"
      >
        False
      </button>
    </div>
    
    <!-- 空值显示 -->
    <div v-else class="null-display">
      <span>null</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: any;
  type: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [value: any];
}>();

const updateValue = (newValue: any) => {
  emit('update', newValue);
};
</script>

<style scoped>
.compact-value-input {
  width: 100%;
}

.input-compact {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.input-compact:focus {
  outline: none;
  border-color: #3b82f6;
}

.boolean-compact {
  display: flex;
  gap: 0.25rem;
}

.bool-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #f9fafb;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.bool-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.bool-btn:hover:not(.active) {
  background: #f3f4f6;
}

.null-display {
  padding: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: #6b7280;
  font-style: italic;
  text-align: center;
  font-family: 'Fira Code', 'Consolas', monospace;
}
</style>

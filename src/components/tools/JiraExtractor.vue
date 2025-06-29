<template>
  <div class="jira-extractor">
    <!-- 复制成功提示 -->
    <div v-if="showCopyMessage" class="copy-notification">
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <span>{{ copyMessage }}</span>
      </div>
    </div>
    
    <div class="extractor-container">
      <div class="input-section">
        <h2>
          <i class="fas fa-tags"></i>
          JIRA 提取器
        </h2>
        <p class="description">从文本中提取 JIRA 票号并生成搜索表达式</p>

        <!-- 输入区域 -->
        <div class="input-group">
          <label for="input-text">输入文本</label>
          <textarea
            id="input-text"
            v-model="inputText"
            placeholder="粘贴包含 JIRA 票号的文本，例如：
修复了 ABC-123 和 DEF-456 的问题
完成 XYZ-789 功能开发
处理 PROJ-1001, PROJ-1002 等tickets"
            class="input-textarea"
            rows="8"
          ></textarea>
          <div class="input-stats">
            字符数: {{ inputText.length }} | 行数: {{ inputText.split('\n').length }}
          </div>
        </div>

        <!-- 提取配置 -->
        <div class="config-section">
          <h3>提取配置</h3>
          
          <div class="config-group">
            <label for="jira-pattern">JIRA 票号模式</label>
            <select id="jira-pattern" v-model="selectedPattern" class="pattern-select">
              <option value="default">默认模式 (项目-数字)</option>
              <option value="custom">自定义正则表达式</option>
            </select>
          </div>

          <div v-if="selectedPattern === 'custom'" class="config-group">
            <label for="custom-regex">自定义正则表达式</label>
            <input
              id="custom-regex"
              v-model="customRegex"
              type="text"
              placeholder="例如: [A-Z]+-\d+"
              class="regex-input"
            />
            <small class="help-text">使用标准正则表达式语法</small>
          </div>

          <div class="config-group">
            <label class="checkbox-item">
              <input v-model="removeDuplicates" type="checkbox" />
              <span class="checkmark"></span>
              去除重复票号
            </label>
          </div>

          <div class="config-group">
            <label class="checkbox-item">
              <input v-model="sortResults" type="checkbox" />
              <span class="checkmark"></span>
              按项目和编号排序
            </label>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="extractJiraTickets" class="extract-btn" :disabled="!inputText.trim()">
            <i class="fas fa-search"></i>
            提取票号
          </button>
          <button @click="clearAll" class="clear-btn">
            <i class="fas fa-trash"></i>
            清空
          </button>
        </div>
      </div>

      <div class="output-section">
        <h3>提取结果</h3>

        <!-- 提取统计 -->
        <div v-if="extractedTickets.length > 0" class="stats-cards">
          <div class="stat-card">
            <div class="stat-number">{{ extractedTickets.length }}</div>
            <div class="stat-label">发现票号</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ uniqueProjects.length }}</div>
            <div class="stat-label">项目数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ duplicateCount }}</div>
            <div class="stat-label">重复票号</div>
          </div>
        </div>

        <!-- 票号列表 -->
        <div v-if="displayedTickets.length > 0" class="tickets-section">
          <div class="section-header">
            <span class="section-title">提取的票号</span>
            <button @click="copyTicketsList" class="copy-btn" title="复制所有票号">
              <i class="fas fa-copy"></i>
              复制列表
            </button>
          </div>
          <div class="tickets-grid">
            <div
              v-for="ticket in displayedTickets"
              :key="ticket"
              class="ticket-item"
              @click="copyToClipboard(ticket)"
            >
              <span class="ticket-code">{{ ticket }}</span>
              <i class="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>

        <!-- JIRA 搜索表达式 -->
        <div v-if="extractedTickets.length > 0" class="search-expressions">
          <div class="section-header">
            <span class="section-title">JIRA 搜索表达式</span>
            <button @click="copySearchExpression" class="copy-btn" title="复制JQL查询表达式">
              <i class="fas fa-copy"></i>
              复制表达式
            </button>
          </div>
          
          <!-- JQL 查询 -->
          <div class="expression-item">
            <div class="expression-header">
              <span class="expression-label">JQL 查询</span>
              <span class="expression-tag">推荐</span>
              <button @click="copyToClipboard(jqlExpression)" class="mini-copy-btn" title="复制JQL查询">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div class="expression-content">
              <code>{{ jqlExpression }}</code>
            </div>
          </div>

          <!-- 简单 OR 查询 -->
          <div class="expression-item">
            <div class="expression-header">
              <span class="expression-label">简单 OR 查询</span>
              <button @click="copyToClipboard(orExpression)" class="mini-copy-btn" title="复制OR查询">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div class="expression-content">
              <code>{{ orExpression }}</code>
            </div>
          </div>

          <!-- 按项目分组的查询 -->
          <div v-if="projectGroups.length > 1" class="expression-item">
            <div class="expression-header">
              <span class="expression-label">按项目分组</span>
            </div>
            <div class="project-groups">
              <div
                v-for="group in projectGroups"
                :key="group.project"
                class="project-group"
              >
                <div class="project-header">
                  <div class="project-name">{{ group.project }}</div>
                  <button 
                    @click="copyToClipboard(`project = ${group.project} AND key in (${group.tickets.join(', ')})`)" 
                    class="mini-copy-btn" 
                    :title="`复制${group.project}项目查询`"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
                <div class="project-expression">
                  <code>project = {{ group.project }} AND key in ({{ group.tickets.join(', ') }})</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="extractedTickets.length === 0 && hasSearched" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <h4>未找到 JIRA 票号</h4>
          <p>请检查输入文本是否包含有效的 JIRA 票号格式，例如 ABC-123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 响应式数据
const inputText = ref('');
const selectedPattern = ref('default');
const customRegex = ref('[A-Z]+-\\d+');
const removeDuplicates = ref(true);
const sortResults = ref(true);
const extractedTickets = ref<string[]>([]);
const hasSearched = ref(false);
const copyMessage = ref('');
const showCopyMessage = ref(false);

// 默认 JIRA 票号正则表达式
const defaultJiraRegex = /[A-Z][A-Z0-9]*-\d+/g;

// 计算属性
const currentRegex = computed(() => {
  if (selectedPattern.value === 'custom' && customRegex.value) {
    try {
      return new RegExp(customRegex.value, 'g');
    } catch (e) {
      return defaultJiraRegex;
    }
  }
  return defaultJiraRegex;
});

const displayedTickets = computed(() => {
  let tickets = [...extractedTickets.value];
  
  if (removeDuplicates.value) {
    tickets = [...new Set(tickets)];
  }
  
  if (sortResults.value) {
    tickets.sort((a, b) => {
      const [projectA, numA] = a.split('-');
      const [projectB, numB] = b.split('-');
      
      if (projectA !== projectB) {
        return projectA.localeCompare(projectB);
      }
      
      return parseInt(numA) - parseInt(numB);
    });
  }
  
  return tickets;
});

const uniqueProjects = computed(() => {
  const projects = new Set(
    displayedTickets.value.map(ticket => ticket.split('-')[0])
  );
  return Array.from(projects);
});

const duplicateCount = computed(() => {
  return extractedTickets.value.length - new Set(extractedTickets.value).size;
});

const jqlExpression = computed(() => {
  if (displayedTickets.value.length === 0) return '';
  
  const ticketList = displayedTickets.value.map(ticket => `"${ticket}"`).join(', ');
  return `key in (${ticketList})`;
});

const orExpression = computed(() => {
  if (displayedTickets.value.length === 0) return '';
  
  return displayedTickets.value.map(ticket => `key = "${ticket}"`).join(' OR ');
});

const projectGroups = computed(() => {
  const groups: { [key: string]: string[] } = {};
  
  displayedTickets.value.forEach(ticket => {
    const project = ticket.split('-')[0];
    if (!groups[project]) {
      groups[project] = [];
    }
    groups[project].push(`"${ticket}"`);
  });
  
  return Object.entries(groups).map(([project, tickets]) => ({
    project,
    tickets
  }));
});

// 方法
const extractJiraTickets = () => {
  hasSearched.value = true;
  const matches = inputText.value.match(currentRegex.value);
  extractedTickets.value = matches || [];
};

const clearAll = () => {
  inputText.value = '';
  extractedTickets.value = [];
  hasSearched.value = false;
};

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 现代浏览器的 Clipboard API
      await navigator.clipboard.writeText(text);
      showCopySuccess('已复制到剪贴板！');
    } else {
      // 兼容旧浏览器的 fallback 方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        showCopySuccess('已复制到剪贴板！');
      } catch (err) {
        console.error('复制失败:', err);
        showCopySuccess('复制失败，请手动复制', 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (err) {
    console.error('复制失败:', err);
    showCopySuccess('复制失败，请手动复制', 'error');
  }
};

const showCopySuccess = (message: string, type: 'success' | 'error' = 'success') => {
  copyMessage.value = message;
  showCopyMessage.value = true;
  
  // 3秒后自动隐藏提示
  setTimeout(() => {
    showCopyMessage.value = false;
  }, 3000);
};

const copyTicketsList = async () => {
  const ticketsList = displayedTickets.value.join('\n');
  await copyToClipboard(ticketsList);
};

const copySearchExpression = async () => {
  await copyToClipboard(jqlExpression.value);
};
</script>

<style scoped>
.jira-extractor {
  padding: 2rem;
  min-width: 80%;
  margin: 0 auto;
  position: relative;
  min-height: calc(100vh - 4rem);
}

/* 复制成功通知 */
.copy-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  z-index: 1000;
  animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.notification-content i {
  font-size: 1.1rem;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.extractor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  min-height: calc(100vh - 8rem);
  height: 100%;
  align-items: stretch;
}

.input-section,
.output-section {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.output-section {
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 自定义滚动条样式 */
.output-section::-webkit-scrollbar {
  width: 6px;
}

.output-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.output-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.output-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.input-section h2,
.output-section h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-section h2 {
  font-size: 1.5rem;
}

.input-section h2 i {
  color: #3b82f6;
}

.output-section h3 {
  font-size: 1.25rem;
}

.description {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.input-group {
  margin-bottom: 2rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.input-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  resize: vertical;
  min-height: 120px;
}

.input-stats {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.config-section {
  margin-bottom: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.config-section h3 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
}

.config-group {
  margin-bottom: 1rem;
}

.config-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.pattern-select,
.regex-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.8rem;
}

.input-section {
  display: flex;
  flex-direction: column;
}

.input-section .action-buttons {
  margin-top: auto;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

@media (max-width: 600px) {
  .action-buttons {
    gap: 0.75rem;
  }
  
  .extract-btn,
  .clear-btn {
    min-width: 0;
    flex: 1;
  }
}

.extract-btn,
.clear-btn {
  flex: 1;
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  white-space: nowrap;
}

.extract-btn {
  background: #3b82f6;
  color: white;
}

.extract-btn:hover:not(:disabled) {
  background: #2563eb;
}

.extract-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.clear-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.clear-btn:hover {
  background: #e5e7eb;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tickets-section,
.search-expressions {
  margin-bottom: 2rem;
  flex-shrink: 0;
}

.tickets-section:last-child,
.search-expressions:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #374151;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.copy-btn:hover {
  background: #e5e7eb;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.ticket-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-item:hover {
  background: #e5e7eb;
}

.ticket-code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1f2937;
}

.copy-icon {
  color: #9ca3af;
  font-size: 0.7rem;
}

.expression-item {
  margin-bottom: 1.5rem;
}

.expression-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.mini-copy-btn {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  color: #374151;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.mini-copy-btn:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.mini-copy-btn i {
  font-size: 0.7rem;
}

.expression-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.expression-tag {
  background: #10b981;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.expression-content {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
}

.expression-content code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  word-break: break-all;
  color: #1f2937;
}

.project-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-group {
  margin-bottom: 1rem;
}

.project-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.project-expression {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem;
}

.project-expression code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  word-break: break-all;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.empty-icon {
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.empty-icon i {
  font-size: 1.5rem;
  color: #9ca3af;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.1rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .extractor-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    min-height: calc(100vh - 2rem);
  }
  
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .tickets-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.25rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .extract-btn,
  .clear-btn {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
  
  .jira-extractor {
    padding: 1rem;
    min-height: calc(100vh - 2rem);
  }
  
  .input-section,
  .output-section {
    padding: 1.5rem;
    height: auto;
    min-height: auto;
  }
  
  .output-section {
    overflow-y: visible;
    max-height: none;
  }
}

@media (max-width: 480px) {
  .extract-btn,
  .clear-btn {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
  }
}
</style>

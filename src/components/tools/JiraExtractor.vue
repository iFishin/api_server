<template>
  <div class="jira-extractor">
    <!-- Copy notification -->
    <CopyNotification :visible="showCopyMessage" :message="copyMessage" type="success"
      @hide="showCopyMessage = false" />

    <div class="tool-layout">
      <div class="input-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-tags"></i>
            JIRA 票号提取器
          </h3>
        </div>

        <div class="section-content">
          <div class="description-section">
            <p class="description">从文本中快速提取 JIRA 票号并自动生成各种搜索表达式</p>
            <div class="feature-tags">
              <span class="feature-tag">
                <i class="fas fa-bolt"></i>
                快速提取
              </span>
              <span class="feature-tag">
                <i class="fas fa-magic"></i>
                自动生成JQL
              </span>
              <span class="feature-tag">
                <i class="fas fa-copy"></i>
                一键复制
              </span>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-group">
            <div class="input-label-section">
              <label for="input-text" class="input-label">
                <i class="fas fa-file-text"></i>
                输入文本
              </label>
              <span class="input-hint">支持多种格式的文本输入</span>
            </div>
            <textarea id="input-text" v-model="inputText" placeholder="粘贴包含 JIRA 票号的文本，例如：
修复了 ABC-123 和 DEF-456 的问题
完成 XYZ-789 功能开发
处理 PROJ-1001, PROJ-1002 等tickets" class="input-textarea" rows="8"></textarea>
            <div class="input-stats">
              字符数: {{ inputText.length }} | 行数: {{ inputText.split('\n').length }}
            </div>
          </div>

          <!-- 提取配置 -->
          <div class="config-section">
            <h4>提取配置</h4>

            <div class="config-group">
              <label for="jira-pattern">JIRA 票号模式</label>
              <select id="jira-pattern" v-model="selectedPattern" class="pattern-select">
                <option value="default">默认模式 (项目-数字)</option>
                <option value="custom">自定义正则表达式</option>
              </select>
            </div>

            <div v-if="selectedPattern === 'custom'" class="config-group">
              <label for="custom-regex">自定义正则表达式</label>
              <input id="custom-regex" v-model="customRegex" type="text" placeholder="例如: [A-Z]+-\d+"
                class="regex-input" />
              <small class="help-text">使用标准正则表达式语法</small>
            </div>

            <div class="config-options">
              <label class="checkbox-item">
                <input v-model="removeDuplicates" type="checkbox" />
                <span class="checkmark"></span>
                去除重复票号
              </label>

              <label class="checkbox-item">
                <input v-model="sortResults" type="checkbox" />
                <span class="checkmark"></span>
                按项目和编号排序
              </label>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button @click="extractJiraTickets" class="btn btn-primary extract-btn" :disabled="!inputText.trim()">
              <i class="fas fa-search"></i>
              提取票号
            </button>
            <button @click="clearAll" class="btn btn-secondary clear-btn">
              <i class="fas fa-trash"></i>
              清空
            </button>
          </div>
        </div>
      </div>

      <div class="output-section">
        <div class="section-header">
          <h3>提取结果</h3>
        </div>

        <div class="section-content">
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
            <div class="subsection-header">
              <span class="subsection-title">提取的票号</span>
              <button @click="copyTicketsList" class="btn btn-secondary" title="复制所有票号">
                <i class="fas fa-copy"></i>
                复制列表
              </button>
            </div>
            <div class="tickets-grid">
              <div v-for="ticket in displayedTickets" :key="ticket" class="ticket-item"
                @click="copyToClipboard(ticket)">
                <span class="ticket-code">{{ ticket }}</span>
                <i class="fas fa-copy copy-icon"></i>
              </div>
            </div>
          </div>

          <!-- JIRA 搜索表达式 -->
          <div v-if="extractedTickets.length > 0" class="search-expressions">
            <div class="subsection-header">
              <span class="subsection-title">JIRA 搜索表达式</span>
              <button @click="copySearchExpression" class="btn btn-secondary" title="复制JQL查询表达式">
                <i class="fas fa-copy"></i>
                复制表达式
              </button>
            </div>

            <!-- JQL 查询 -->
            <div class="expression-item">
              <div class="expression-header">
                <span class="expression-label">JQL 查询 (推荐)</span>
                <span class="expression-tag">最优</span>
                <button @click="copyToClipboard(jqlExpression)" class="mini-copy-btn" title="复制JQL查询">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <div class="expression-content">
                <div class="expression-description">
                  <small>使用 JIRA 原生 JQL 语法，性能最佳</small>
                </div>
                <code>{{ jqlExpression }}</code>
              </div>
            </div>

            <!-- 简单 OR 查询 -->
            <div class="expression-item">
              <div class="expression-header">
                <span class="expression-label">OR 查询</span>
                <span class="expression-tag secondary">兼容</span>
                <button @click="copyToClipboard(orExpression)" class="mini-copy-btn" title="复制OR查询">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <div class="expression-content">
                <div class="expression-description">
                  <small>适用于旧版本 JIRA 或自定义搜索</small>
                </div>
                <code>{{ orExpression }}</code>
              </div>
            </div>

            <!-- IN 语句查询 -->
            <div class="expression-item">
              <div class="expression-header">
                <span class="expression-label">IN 语句查询</span>
                <span class="expression-tag info">简洁</span>
                <button @click="copyToClipboard(inExpression)" class="mini-copy-btn" title="复制IN查询">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <div class="expression-content">
                <div class="expression-description">
                  <small>适合大量票号的批量查询</small>
                </div>
                <code>{{ inExpression }}</code>
              </div>
            </div>

            <!-- 逗号分隔列表 -->
            <div class="expression-item">
              <div class="expression-header">
                <span class="expression-label">票号列表</span>
                <span class="expression-tag utility">工具</span>
                <button @click="copyToClipboard(commaExpression)" class="mini-copy-btn" title="复制票号列表">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <div class="expression-content">
                <div class="expression-description">
                  <small>纯票号列表，便于其他工具使用</small>
                </div>
                <code>{{ commaExpression }}</code>
              </div>
            </div>

            <!-- 按项目分组的查询 -->
            <div v-if="projectGroups.length > 1" class="expression-item">
              <div class="expression-header">
                <span class="expression-label">按项目分组</span>
              </div>
              <div class="project-groups">
                <div v-for="group in projectGroups" :key="group.project" class="project-group">
                  <div class="project-header">
                    <div class="project-name">{{ group.project }}</div>
                    <button
                      @click="copyToClipboard(`project = ${group.project} AND key in (${group.tickets.join(', ')})`)"
                      class="mini-copy-btn" :title="`复制${group.project}项目查询`">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CopyNotification from '@/components/common/CopyNotification.vue';

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

const inExpression = computed(() => {
  if (displayedTickets.value.length === 0) return '';

  return `key in (${displayedTickets.value.join(', ')})`;
});

const commaExpression = computed(() => {
  if (displayedTickets.value.length === 0) return '';

  return displayedTickets.value.join(', ');
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
/* JiraExtractor 专属样式 - 与父容器 ToolKitView 协调 */

/* 输入统计信息 */
.jira-extractor .input-stats {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  text-align: right;
}

/* 文本框专属样式 */
.jira-extractor .input-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  resize: vertical;
  min-height: 120px;
  background: white;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.jira-extractor .input-textarea:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}

.jira-extractor .input-textarea::placeholder {
  color: #9ca3af;
  font-size: 0.8rem;
}

/* 描述区块样式 */
.jira-extractor .description-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #d1fae5;
  border-radius: 10px;
}

.jira-extractor .description {
  margin: 0 0 1rem 0;
  color: #065f46;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

.jira-extractor .feature-tags {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.jira-extractor .feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #10b981;
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.jira-extractor .feature-tag i {
  font-size: 0.7rem;
}

/* 输入标签区块 */
.jira-extractor .input-label-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.jira-extractor .input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.jira-extractor .input-label i {
  color: #10b981;
  font-size: 0.8rem;
}

.jira-extractor .input-hint {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

/* 配置区块 - JIRA 专属样式 */
.jira-extractor .config-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.jira-extractor .config-section h4 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.jira-extractor .config-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.jira-extractor .config-group:last-child {
  margin-bottom: 0;
}

.jira-extractor .pattern-select,
.jira-extractor .regex-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
}

.jira-extractor .pattern-select:focus,
.jira-extractor .regex-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}

.jira-extractor .help-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.jira-extractor .config-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.jira-extractor .checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  padding: 0.25rem 0;
}

.jira-extractor .checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #10b981;
}

/* 操作按钮样式 */
.jira-extractor .action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.jira-extractor .extract-btn,
.jira-extractor .clear-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

.jira-extractor .extract-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: 1px solid #10b981;
}

.jira-extractor .extract-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.jira-extractor .extract-btn:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.jira-extractor .clear-btn {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.jira-extractor .clear-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(107, 114, 128, 0.1);
}

/* 统计卡片 - JIRA 核心特色 */
.jira-extractor .stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 0.5rem;
}

.jira-extractor .stat-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.jira-extractor .stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #059669);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.jira-extractor .stat-card:hover {
  border-color: #10b981;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
  transform: translateY(-4px);
}

.jira-extractor .stat-card:hover::before {
  transform: scaleX(1);
}

.jira-extractor .stat-number {
  font-size: 2.25rem;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.jira-extractor .stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.25rem;
}

/* 子区块标题 */
.jira-extractor .subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0 1rem 0;
  padding: 0 0.5rem 0.75rem 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.jira-extractor .subsection-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  position: relative;
}

.jira-extractor .subsection-title::after {
  content: '';
  position: absolute;
  bottom: -0.75rem;
  left: 0;
  width: 2rem;
  height: 2px;
  background: #10b981;
}

/* 票号网格 - JIRA 核心功能 */
.jira-extractor .tickets-section {
  padding: 0.5rem;
  margin: 1rem 0;
}

.jira-extractor .tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0.5rem;
  max-height: 50vh;
  /* 限制最大高度 */
  overflow-y: auto;
  /* 启用垂直滚动 */
}

.jira-extractor .ticket-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Fira Code', 'Monaco', monospace;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.jira-extractor .ticket-item:hover {
  border-color: #10b981;
  background: #ecfdf5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.jira-extractor .ticket-code {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.025em;
}

.jira-extractor .copy-icon {
  font-size: 0.8rem;
  color: #6b7280;
  opacity: 0;
  transition: all 0.3s ease;
}

.jira-extractor .ticket-item:hover .copy-icon {
  opacity: 1;
  color: #10b981;
  transform: scale(1.1);
}

/* 搜索表达式 - JIRA 核心功能 */
.jira-extractor .search-expressions {
  margin-top: 1.5rem;
  padding: 0.5rem;
}

.jira-extractor .expression-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 1.25rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.jira-extractor .expression-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #10b981;
}

.jira-extractor .expression-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.jira-extractor .expression-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
}

.jira-extractor .expression-tag {
  font-size: 0.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.jira-extractor .expression-tag.secondary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.jira-extractor .expression-tag.info {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.jira-extractor .expression-tag.utility {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.jira-extractor .mini-copy-btn {
  padding: 0.375rem 0.75rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.jira-extractor .mini-copy-btn:hover {
  background: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.jira-extractor .expression-content {
  padding: 1.25rem;
}

.jira-extractor .expression-description {
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border-radius: 6px;
  border-left: 3px solid #10b981;
}

.jira-extractor .expression-description small {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
}

.jira-extractor .expression-content code {
  display: block;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.9rem;
  color: #1e293b;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 项目分组 */
.jira-extractor .project-groups {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 40vh;
  /* 限制最大高度 */
  overflow-y: auto;
  /* 启用垂直滚动 */
}

.jira-extractor .project-group {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.jira-extractor .project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e5e7eb;
}

.jira-extractor .project-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.jira-extractor .project-expression {
  padding: 0.75rem;
}

.jira-extractor .project-expression code {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.8rem;
  color: #1e293b;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 空状态 - 优雅的空状态展示 */
.jira-extractor .empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.jira-extractor .empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.jira-extractor .empty-state h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: #374151;
  font-weight: 600;
}

.jira-extractor .empty-state p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 响应式设计 - 移动端优化 */
@media (max-width: 768px) {
  .jira-extractor .description-section {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .jira-extractor .feature-tags {
    gap: 0.5rem;
  }

  .jira-extractor .feature-tag {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .jira-extractor .input-label-section {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .jira-extractor .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .jira-extractor .extract-btn,
  .jira-extractor .clear-btn {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }

  .jira-extractor .stats-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin: 1rem 0;
    padding: 0.25rem;
  }

  .jira-extractor .stat-card {
    padding: 1.25rem 1rem;
  }

  .jira-extractor .stat-number {
    font-size: 2rem;
  }

  .jira-extractor .tickets-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.5rem;
    padding: 0.25rem;
  }

  .jira-extractor .ticket-item {
    padding: 0.5rem 0.75rem;
  }

  .jira-extractor .ticket-code {
    font-size: 0.8rem;
  }

  .jira-extractor .expression-content code {
    font-size: 0.8rem;
    padding: 0.875rem;
  }

  .jira-extractor .project-expression code {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .jira-extractor .description {
    font-size: 0.9rem;
  }

  .jira-extractor .feature-tags {
    justify-content: center;
  }

  .jira-extractor .config-section {
    padding: 0.75rem;
    margin: 0.75rem 0;
  }

  .jira-extractor .subsection-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    padding: 0 0.25rem 0.75rem 0.25rem;
  }

  .jira-extractor .expression-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    padding: 0.875rem 1rem;
  }

  .jira-extractor .stats-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 0;
  }

  .jira-extractor .stat-card {
    padding: 1rem 0.5rem;
  }

  .jira-extractor .stat-number {
    font-size: 1.75rem;
  }

  .jira-extractor .copy-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    padding: 0.75rem 1rem;
  }

  .jira-extractor .action-buttons {
    gap: 0.5rem;
  }

  .jira-extractor .extract-btn,
  .jira-extractor .clear-btn {
    padding: 0.75rem 0.875rem;
    font-size: 0.8rem;
  }

  .jira-extractor .expression-description {
    padding: 0.375rem 0.5rem;
    margin-bottom: 0.5rem;
  }

  .jira-extractor .expression-description small {
    font-size: 0.75rem;
  }
}

/* 滚动条样式 */
.jira-extractor .tickets-grid::-webkit-scrollbar,
.jira-extractor .project-groups::-webkit-scrollbar {
  width: 6px;
}

.jira-extractor .tickets-grid::-webkit-scrollbar-track,
.jira-extractor .project-groups::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.jira-extractor .tickets-grid::-webkit-scrollbar-thumb,
.jira-extractor .project-groups::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.jira-extractor .tickets-grid::-webkit-scrollbar-thumb:hover,
.jira-extractor .project-groups::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
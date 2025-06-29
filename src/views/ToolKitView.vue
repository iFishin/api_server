<template>
  <div class="toolkit-view">
    <!-- 页面头部 -->
    <div v-if="shouldShowHeader" class="toolkit-header">
      <!-- 背景装饰 -->
      <div class="header-background">
        <div class="bg-pattern"></div>
        <div class="floating-icons">
          <div class="float-icon" style="--delay: 0s; --x: 10%; --y: 20%;">
            <i class="fas fa-code"></i>
          </div>
          <div class="float-icon" style="--delay: 1s; --x: 85%; --y: 30%;">
            <i class="fas fa-tools"></i>
          </div>
          <div class="float-icon" style="--delay: 2s; --x: 20%; --y: 70%;">
            <i class="fas fa-magic"></i>
          </div>
          <div class="float-icon" style="--delay: 3s; --x: 75%; --y: 60%;">
            <i class="fas fa-rocket"></i>
          </div>
          <div class="float-icon" style="--delay: 4s; --x: 50%; --y: 15%;">
            <i class="fas fa-bolt"></i>
          </div>
        </div>
      </div>
      
      <!-- 主要内容 -->
      <div class="header-content">
        <div class="header-main">
          <div class="header-info">
            <div class="title-section">
              <div class="title-icon">
                <i class="fas fa-wrench"></i>
                <div class="icon-glow"></div>
              </div>
              <div class="title-content">
                <h1 class="main-title">
                  <span class="title-gradient">Developer</span>
                  <span class="title-normal">Toolkit</span>
                </h1>
                <div class="title-underline"></div>
              </div>
            </div>
            <p class="subtitle">
              <i class="fas fa-star subtitle-icon"></i>
              Professional tools for developers, testers, and DevOps engineers
            </p>
            <div class="feature-badges">
              <span class="feature-badge">
                <i class="fas fa-bolt"></i>
                Fast & Reliable
              </span>
              <span class="feature-badge">
                <i class="fas fa-lock"></i>
                Privacy First
              </span>
              <span class="feature-badge">
                <i class="fas fa-mobile-alt"></i>
                Mobile Friendly
              </span>
            </div>
          </div>
          
          <div class="header-stats">
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-tools"></i>
                  <div class="stat-pulse"></div>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ tools.length }}</span>
                  <span class="stat-label">Available Tools</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-layer-group"></i>
                  <div class="stat-pulse"></div>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ toolCategories.length }}</span>
                  <span class="stat-label">Categories</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                  <div class="stat-pulse"></div>
                </div>
                <div class="stat-content">
                  <span class="stat-number">1K+</span>
                  <span class="stat-label">Daily Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 快速访问栏 -->
        <div class="quick-access">
          <div class="quick-access-title">
            <i class="fas fa-flash"></i>
            Quick Access
          </div>
          <div class="quick-tools">
            <div 
              v-for="tool in popularTools" 
              :key="tool.id"
              class="quick-tool"
              @click="selectTool(tool)"
            >
              <i :class="tool.icon"></i>
              <span>{{ tool.name }}</span>
            </div>
          </div>
        </div>

        <!-- 工具分类选择 -->
        <div class="categories-section">
          <div class="categories-title">
            <i class="fas fa-layer-group"></i>
            Browse by Category
          </div>
          <div class="categories-grid">
            <div 
              v-for="category in toolCategories" 
              :key="category.id"
              class="category-card"
              @click="selectCategory(category.id)"
            >
              <div class="category-icon">
                <i :class="category.icon"></i>
              </div>
              <div class="category-info">
                <h3>{{ category.name }}</h3>
                <p>{{ tools.filter(t => t.category === category.id).length }} tools</p>
              </div>
              <div class="category-arrow">
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="toolkit-container">
        <!-- 工具分类导航 (当选择了分类但未选择工具时显示) -->
        <div v-if="activeCategory && !activeTool" class="category-nav">
          <div class="nav-header">
            <button @click="backToHome" class="back-btn">
              <i class="fas fa-arrow-left"></i>
              <span>Back to Home</span>
            </button>
            <div class="nav-title">
              <div class="nav-icon">
                <i :class="toolCategories.find(cat => cat.id === activeCategory)?.icon"></i>
              </div>
              <h2>{{ getCurrentCategoryName() }}</h2>
            </div>
          </div>
        </div>

        <!-- 工具网格 -->
        <div v-if="filteredTools.length > 0 && activeCategory" class="tools-grid">
          <div 
            v-for="tool in filteredTools" 
            :key="tool.id"
            :class="['tool-card', { active: activeTool === tool.id }]"
            @click="selectTool(tool)"
          >
            <div class="tool-icon">
              <i :class="tool.icon"></i>
            </div>
            <div class="tool-info">
              <h3>{{ tool.name }}</h3>
              <p>{{ tool.description }}</p>
              <div class="tool-tags">
                <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态显示 -->
        <div v-else-if="activeCategory && filteredTools.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>No tools found</h3>
          <p>No tools available for the "{{ getCurrentCategoryName() }}" category yet.</p>
          <p class="coming-soon">More tools coming soon!</p>
        </div>
  
        <!-- 工具内容区域 -->
        <div v-if="activeTool" class="tool-content">
          <div class="tool-header">
            <div class="tool-header-left">
              <div class="tool-header-icon">
                <i :class="selectedTool?.icon"></i>
              </div>
              <div class="tool-header-info">
                <h2 class="tool-title">{{ selectedTool?.name }}</h2>
                <p class="tool-description">{{ selectedTool?.description }}</p>
                <div class="tool-header-tags">
                  <span v-for="tag in selectedTool?.tags" :key="tag" class="header-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="tool-header-actions">
              <button @click="closeTool" class="close-btn" title="返回工具列表">
                <i class="fas fa-arrow-left"></i>
                <span>返回</span>
              </button>
            </div>
          </div>
          
          <!-- 动态组件加载不同工具 -->
          <component 
            :is="selectedTool?.component" 
            v-if="selectedTool?.component"
            :key="selectedTool.id"
          />
          
          <!-- 默认内容 -->
          <div v-else class="tool-placeholder">
            <i :class="selectedTool?.icon"></i>
            <h3>{{ selectedTool?.name }}</h3>
            <p>{{ selectedTool?.description }}</p>
            <p class="coming-soon">Coming Soon...</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useRoute, useRouter } from 'vue-router';
  
  // 导入工具组件
  import JsonFormatter from '../components/tools/JsonFormatter.vue';
  import Base64Converter from '../components/tools/Base64Converter.vue';
  import UrlEncoder from '../components/tools/UrlEncoder.vue';
  import TimestampConverter from '../components/tools/TimestampConverter.vue';
  import HashGenerator from '../components/tools/HashGenerator.vue';
  import UuidGenerator from '../components/tools/UuidGenerator.vue';
  import StringGenerator from '../components/tools/StringGenerator.vue';
  import JiraExtractor from '../components/tools/JiraExtractor.vue';
  
  const store = useStore();
  const route = useRoute();
  const router = useRouter();
  
  // 响应式数据
  const activeCategory = ref('');  // 初始为空，表示显示头部介绍页面
  const activeTool = ref<string | null>(null);
  const showHeader = ref(true);  // 控制是否显示头部
  
  // 工具分类
  const toolCategories = ref([
    { id: 'text', name: 'Text Tools', icon: 'fas fa-font' },
    { id: 'converter', name: 'Converters', icon: 'fas fa-exchange-alt' },
    { id: 'generator', name: 'Generators', icon: 'fas fa-magic' },
    { id: 'encoder', name: 'Encoders', icon: 'fas fa-lock' },
    { id: 'network', name: 'Network', icon: 'fas fa-network-wired' },
    { id: 'dev', name: 'Development', icon: 'fas fa-code' }
  ]);
  
  // 工具列表
  const tools = ref([
    // Text Tools
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Format, validate and beautify JSON data',
      icon: 'fab fa-js-square',
      category: 'text',
      tags: ['JSON', 'Format', 'Validate'],
      component: JsonFormatter
    },
    {
      id: 'text-diff',
      name: 'Text Diff',
      description: 'Compare two text blocks and highlight differences',
      icon: 'fas fa-copy',
      category: 'text',
      tags: ['Diff', 'Compare', 'Text']
    },
    {
      id: 'string-generator',
      name: 'String Generator',
      description: 'Generate random strings with custom length and character sets',
      icon: 'fas fa-dice',
      category: 'text',
      tags: ['String', 'Random', 'Generate'],
      component: StringGenerator
    },
    {
      id: 'jira-extractor',
      name: 'JIRA Extractor',
      description: 'Extract JIRA ticket numbers and generate search expressions',
      icon: 'fas fa-tags',
      category: 'text',
      tags: ['JIRA', 'Regex', 'Extract'],
      component: JiraExtractor
    },
    
    // Converters
    {
      id: 'base64-converter',
      name: 'Base64 Converter',
      description: 'Encode and decode Base64 strings',
      icon: 'fas fa-exchange-alt',
      category: 'converter',
      tags: ['Base64', 'Encode', 'Decode'],
      component: Base64Converter
    },
    {
      id: 'url-encoder',
      name: 'URL Encoder/Decoder',
      description: 'Encode and decode URL components',
      icon: 'fas fa-link',
      category: 'converter',
      tags: ['URL', 'Encode', 'Decode'],
      component: UrlEncoder
    },
    {
      id: 'timestamp-converter',
      name: 'Timestamp Converter',
      description: 'Convert between timestamp and human readable date',
      icon: 'fas fa-clock',
      category: 'converter',
      tags: ['Timestamp', 'Date', 'Time'],
      component: TimestampConverter
    },
    
    // Generators
    {
      id: 'uuid-generator',
      name: 'UUID Generator',
      description: 'Generate various types of UUIDs',
      icon: 'fas fa-fingerprint',
      category: 'generator',
      tags: ['UUID', 'GUID', 'ID'],
      component: UuidGenerator
    },
    {
      id: 'password-generator',
      name: 'Password Generator',
      description: 'Generate secure random passwords',
      icon: 'fas fa-key',
      category: 'generator',
      tags: ['Password', 'Security', 'Random']
    },
    
    // Encoders
    {
      id: 'hash-generator',
      name: 'Hash Generator',
      description: 'Generate MD5, SHA1, SHA256 and other hashes',
      icon: 'fas fa-hashtag',
      category: 'encoder',
      tags: ['Hash', 'MD5', 'SHA'],
      component: HashGenerator
    },
    {
      id: 'jwt-decoder',
      name: 'JWT Decoder',
      description: 'Decode and verify JSON Web Tokens',
      icon: 'fas fa-shield',
      category: 'encoder',
      tags: ['JWT', 'Token', 'Auth']
    },
    
    // Network
    {
      id: 'ip-lookup',
      name: 'IP Lookup',
      description: 'Get information about IP addresses',
      icon: 'fas fa-globe',
      category: 'network',
      tags: ['IP', 'Location', 'Network']
    },
    {
      id: 'port-scanner',
      name: 'Port Scanner',
      description: 'Scan open ports on target hosts',
      icon: 'fas fa-wifi',
      category: 'network',
      tags: ['Port', 'Scan', 'Network']
    },
    
    // Development
    {
      id: 'regex-tester',
      name: 'Regex Tester',
      description: 'Test and debug regular expressions',
      icon: 'fas fa-search',
      category: 'dev',
      tags: ['Regex', 'Pattern', 'Test']
    },
    {
      id: 'api-tester',
      name: 'API Tester',
      description: 'Test REST APIs with custom requests',
      icon: 'fas fa-plug',
      category: 'dev',
      tags: ['API', 'HTTP', 'REST']
    }
  ]);
   // 计算属性
  const filteredTools = computed(() => {
    if (!activeCategory.value) {
      return [];  // 如果没有选择分类，返回空数组
    }
    return tools.value.filter(tool => tool.category === activeCategory.value);
  });

  const selectedTool = computed(() => {
    return tools.value.find(tool => tool.id === activeTool.value);
  });

  const popularTools = computed(() => {
    // 返回一些热门工具
    return tools.value.filter(tool => 
      ['jira-extractor', 'string-generator'].includes(tool.id)
    ).slice(0, 4);
  });

  // 新增：判断是否显示头部
  const shouldShowHeader = computed(() => {
    return !activeCategory.value && !activeTool.value;
  });
  
  // 方法
  const selectTool = (tool: any) => {
    activeTool.value = tool.id;
  };

  const selectCategory = (categoryId: string) => {
    activeCategory.value = categoryId;
    showHeader.value = false;
    // 更新 URL 参数
    router.push({ query: { category: categoryId } });
  };

  const closeTool = () => {
    activeTool.value = null;
  };

  const backToHome = () => {
    activeCategory.value = '';
    activeTool.value = null;
    showHeader.value = true;
    // 清除 URL 参数
    router.push({ query: {} });
  };

  const getCurrentCategoryName = () => {
    const category = toolCategories.value.find(cat => cat.id === activeCategory.value);
    return category ? category.name : activeCategory.value;
  };
  
  // 生命周期
  onMounted(() => {
    store.dispatch('updatePageTitle', 'ToolKit');
    store.dispatch('initializeCategories', {
      route: 'toolkit',
      categories: toolCategories.value
    });
    
    // 根据URL查询参数设置初始分类（如果有的话）
    const categoryFromQuery = route.query.category as string;
    if (categoryFromQuery && toolCategories.value.some(cat => cat.id === categoryFromQuery)) {
      activeCategory.value = categoryFromQuery;
      showHeader.value = false;
    }
  });

  // 监听路由查询参数变化
  watch(() => route.query.category, (newCategory) => {
    if (newCategory && typeof newCategory === 'string') {
      activeCategory.value = newCategory;
      showHeader.value = false;
    } else if (!newCategory) {
      // 如果查询参数被清除，回到首页
      backToHome();
    }
  });
  </script>
  
  <style scoped>
  .toolkit-view {
    width: 100%;
    border-radius: 12px;
    min-height: 100vh;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #f0fdf4 100%);
  }

  /* 页面头部样式 */
  .toolkit-header {
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f0fdf4 100%);
    overflow: hidden;
    padding: 3rem 1.5rem 2rem;
    margin-bottom: 0;
    border-radius: 12px;
    border: 1px solid rgba(16, 185, 129, 0.1);
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.08);
  }

  /* 背景装饰 */
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

  .header-stats {
    flex-shrink: 0;
  }

  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 16px;
    transition: all 0.3s ease;
    min-width: 180px;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  }

  .stat-item:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(16, 185, 129, 0.25);
    transform: translateX(-5px);
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
  }

  .stat-icon {
    position: relative;
    width: 45px;
    height: 45px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  }

  .stat-pulse {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    background: rgba(16, 185, 129, 0.3);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
    margin-bottom: 0.25rem;
    text-shadow: none;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* 快速访问栏 */
  .quick-access {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  }

  .quick-access-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #374151;
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .quick-access-title i {
    color: #f59e0b;
  }

  .quick-tools {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .quick-tool {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 0.5rem;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.05);
  }

  .quick-tool:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(16, 185, 129, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.1);
  }

  .quick-tool i {
    font-size: 1.25rem;
    color: #10b981;
  }

  .quick-tool span {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    line-height: 1.2;
  }

  /* 工具分类选择 */
  .categories-section {
    margin-top: 2rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  }

  .categories-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #374151;
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .categories-title i {
    color: #f59e0b;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .category-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.05);
  }

  .category-card:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(16, 185, 129, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
  }

  .category-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  }

  .category-info {
    flex: 1;
  }

  .category-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .category-info p {
    margin: 0;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .category-arrow {
    color: #9ca3af;
    font-size: 0.875rem;
    transition: transform 0.2s ease;
  }

  .category-card:hover .category-arrow {
    transform: translateX(4px);
  }
  
  .toolkit-container {
    width: 100%;
    margin: 0 auto;
    padding: 0 1.5rem 2rem;
  }

  /* 分类导航 */
  .category-nav {
    margin-bottom: 2rem;
    padding: 1.5rem 0;
  }

  .nav-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    color: #64748b;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .back-btn:hover {
    background: #f8fafc;
    border-color: #10b981;
    color: #10b981;
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  }

  .back-btn i {
    font-size: 0.875rem;
  }

  .nav-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .nav-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.125rem;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  }

  .nav-title h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }
  
  /* 工具网格 */
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    width: 100%;
    padding: 1.5rem 0;
    align-items: start;
  }
  
  .tool-card {
    background: #fff;
    border-radius: 16px;
    padding: 1.25rem;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    min-height: 180px;
    width: 100%;
  }
  
  .tool-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    border-color: #10b981;
  }
  
  .tool-card.active {
    border-color: #10b981;
    background: #ecfdf5;
  }
  
  .tool-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  }
  
  .tool-icon i {
    font-size: 1rem;
    color: #fff;
  }
  
  .tool-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  
  .tool-info h3 {
    margin: 0 0 0.375rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .tool-info p {
    margin: 0 0 0.5rem 0;
    color: #64748b;
    font-size: 0.75rem;
    line-height: 1.3;
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .tool-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-top: auto;
    min-height: 20px;
  }
  
  .tag {
    padding: 0.125rem 0.375rem;
    background: #f1f5f9;
    border-radius: 3px;
    font-size: 0.625rem;
    color: #475569;
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
  }
  
  /* 工具内容区域 */
  .tool-content {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1.75rem 2rem;
    min-height: 120px;
    border-bottom: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    position: relative;
    overflow: hidden;
  }

  .tool-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444);
    background-size: 200% 100%;
    animation: gradientShift 3s ease-in-out infinite;
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .tool-header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .tool-header-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    position: relative;
  }

  .tool-header-icon::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 14px;
    z-index: -1;
    opacity: 0.3;
    filter: blur(8px);
  }

  .tool-header-icon i {
    font-size: 1.25rem;
    color: white;
    z-index: 2;
    position: relative;
  }

  .tool-header-info {
    flex: 1;
    min-width: 0;
  }

  .tool-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
  }

  .tool-description {
    margin: 0 0 0.5rem 0;
    color: #64748b;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .tool-header-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .header-tag {
    padding: 0.25rem 0.75rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 16px;
    font-size: 0.75rem;
    color: #3b82f6;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .header-tag:hover {
    background: rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
  }

  .tool-header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .close-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.875rem;
    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.25);
  }

  .close-btn:hover {
    background: linear-gradient(135deg, #4b5563, #374151);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.35);
  }

  .close-btn:active {
    transform: translateY(0);
  }

  .close-btn i {
    font-size: 0.875rem;
  }
  
  .tool-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }
  
  .tool-placeholder i {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 1rem;
  }
  
  .tool-placeholder h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: #475569;
  }
  
  .tool-placeholder p {
    margin: 0 0 0.5rem 0;
    color: #64748b;
  }
  
  .coming-soon {
    color: #f59e0b !important;
    font-weight: 600;
  }

  /* 空状态样式 */
  .empty-state {
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

  .empty-state h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #475569;
    font-weight: 600;
  }

  .empty-state p {
    margin: 0 0 0.5rem 0;
    color: #64748b;
    font-size: 1rem;
  }
  
  /* 响应式设计 */
  /* 响应式设计 */
  @media (min-width: 1400px) {
    .tools-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
  }

  @media (max-width: 1200px) {
    .tools-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    
    .toolkit-container {
      padding: 0 1rem 2rem;
    }
  }

  @media (max-width: 768px) {
    .toolkit-header {
      padding: 2rem 1rem 1.5rem;
    }

    .header-main {
      flex-direction: column;
      gap: 2rem;
      align-items: center;
      text-align: center;
    }

    .header-info {
      max-width: 100%;
    }

    .title-section {
      justify-content: center;
    }

    .title-icon {
      width: 50px;
      height: 50px;
    }

    .title-icon i {
      font-size: 1.25rem;
    }

    .main-title {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
      justify-content: center;
    }

    .feature-badges {
      justify-content: center;
    }

    .stats-container {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .stat-item {
      flex: none;
      min-width: 140px;
      padding: 0.75rem 1rem;
    }

    .stat-icon {
      width: 35px;
      height: 35px;
      font-size: 1rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .quick-access {
      padding: 1.25rem;
    }

    .quick-tools {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .quick-tool {
      padding: 0.75rem 0.5rem;
    }

    .quick-tool i {
      font-size: 1rem;
    }

    .quick-tool span {
      font-size: 0.7rem;
    }
    
    .tools-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }

    .tool-card {
      padding: 1rem;
      min-height: 160px;
    }

    .tool-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 0.75rem;
    }

    .tool-icon i {
      font-size: 0.875rem;
    }

    .tool-info h3 {
      font-size: 0.875rem;
    }

    .tool-info p {
      font-size: 0.75rem;
    }

    /* 工具头部移动端适配 */
    .tool-header {
      padding: 1rem 1.5rem;
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .tool-header-left {
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
      text-align: center;
    }

    .tool-header-icon {
      width: 40px;
      height: 40px;
    }

    .tool-header-icon i {
      font-size: 1.125rem;
    }

    .tool-title {
      font-size: 1.25rem;
    }

    .tool-description {
      font-size: 0.8rem;
    }

    .tool-header-tags {
      justify-content: center;
    }

    .tool-header-actions {
      justify-content: center;
    }

    .categories-section {
      margin-top: 1.5rem;
      padding: 1.25rem;
    }

    .categories-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .category-card {
      padding: 0.875rem 1rem;
    }

    .category-icon {
      width: 35px;
      height: 35px;
      font-size: 1rem;
    }

    .category-info h3 {
      font-size: 0.9rem;
    }

    .category-info p {
      font-size: 0.75rem;
    }

    .nav-header {
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .back-btn {
      padding: 0.625rem 0.875rem;
      font-size: 0.875rem;
    }

    .nav-icon {
      width: 35px;
      height: 35px;
      font-size: 1rem;
    }

    .nav-title h2 {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 480px) {
    .toolkit-header {
      padding: 1.5rem 0.75rem 1.25rem;
    }

    .title-section {
      flex-direction: column;
      gap: 0.75rem;
    }

    .title-icon {
      width: 45px;
      height: 45px;
    }

    .main-title {
      font-size: 1.75rem;
    }

    .title-normal {
      margin-left: 0;
    }

    .subtitle {
      font-size: 0.9rem;
    }

    .feature-badges {
      gap: 0.5rem;
    }

    .feature-badge {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .stats-container {
      gap: 0.5rem;
    }

    .stat-item {
      min-width: 120px;
      padding: 0.625rem 0.75rem;
    }

    .stat-icon {
      width: 30px;
      height: 30px;
      font-size: 0.875rem;
    }

    .stat-number {
      font-size: 1.25rem;
    }

    .stat-label {
      font-size: 0.7rem;
    }

    .quick-tools {
      grid-template-columns: repeat(4, 1fr);
      gap: 0.375rem;
    }

    .quick-tool {
      padding: 0.625rem 0.25rem;
    }

    .quick-tool i {
      font-size: 0.875rem;
    }

    .quick-tool span {
      font-size: 0.65rem;
    }

    .tools-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
    }

    .tool-card {
      min-height: 140px;
      padding: 0.875rem;
    }

    .tool-icon {
      width: 28px;
      height: 28px;
      margin-bottom: 0.5rem;
    }

    .tool-icon i {
      font-size: 0.75rem;
    }

    .tool-info h3 {
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
    }

    .tool-info p {
      font-size: 0.7rem;
      margin-bottom: 0.375rem;
    }

    .tag {
      font-size: 0.6rem;
      padding: 0.15rem 0.35rem;
    }

    /* 工具头部超小屏幕适配 */
    .tool-header {
      padding: 0.875rem 1rem;
    }

    .tool-header-icon {
      width: 36px;
      height: 36px;
    }

    .tool-header-icon i {
      font-size: 1rem;
    }

    .tool-title {
      font-size: 1.125rem;
    }

    .tool-description {
      font-size: 0.75rem;
    }

    .header-tag {
      padding: 0.2rem 0.6rem;
      font-size: 0.7rem;
    }

    .categories-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .category-card {
      padding: 0.75rem 0.875rem;
    }

    .category-icon {
      width: 30px;
      height: 30px;
      font-size: 0.875rem;
    }

    .category-info h3 {
      font-size: 0.85rem;
    }

    .category-info p {
      font-size: 0.7rem;
    }

    .back-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }

    .nav-icon {
      width: 30px;
      height: 30px;
      font-size: 0.875rem;
    }

    .nav-title h2 {
      font-size: 1.125rem;
    }

    .close-btn {
      padding: 0.5rem 0.875rem;
      font-size: 0.75rem;
    }

    .close-btn span {
      display: none;
    }
  }
  </style>
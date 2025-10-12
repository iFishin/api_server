# 🤖 AGENTS.md

## 📋 项目概述

**API Server** 是一个基于 Vue3 + TypeScript + Express 的全栈开发平台，提供完整的前后端一体化解决方案。

### 🏗️ 核心架构
- **前端**: Vue 3 + TypeScript + Vite + Router
- **后端**: Express + TypeScript + SQLite + WebDAV
- **构建**: Vite + TypeScript Compiler + 自定义构建脚本
- **部署**: Docker + Nginx + PM2 + Shell Scripts
- **测试**: Vitest + Coverage + Performance Testing
- **开发工具**: 完整的脚本工具链和诊断系统

---

## 🎯 AI 代理指导原则

### 核心原则

- **非必要不创建文件**: 优先使用现有文件和结构，避免创建冗余文档
- **尽量少输出文档**: 直接修改代码和配置，减少不必要的说明文档
- **代码优于文档**: 让代码自解释，注释简洁明了

### 代码风格与架构

- 遵循 TypeScript 严格模式
- 使用 ESM 模块系统 (前端) 和 CommonJS (后端)
- 前端采用 Vue 3 Composition API
- 后端使用 Express 中间件架构
- 数据库使用 SQLite 轻量级方案

### 文件组织

- **前端代码**: `src/` 目录，组件化开发
- **后端代码**: `server/` 目录，MVC 架构
- **构建输出**: `dist/` 目录，包含完整部署包
- **配置文件**: 根目录和 `config/` 目录
- **文档**: `docs/` 目录，分类详细文档
- **脚本**: `scripts/` 目录，自动化工具集

---

## 🛠️ 项目技术栈

### 前端技术栈
```json
{
  "framework": "Vue 3.5.13",
  "language": "TypeScript 5.7.3",
  "build": "Vite 6.0.11",
  "routing": "Vue Router 4.5.0",
  "ui": "自定义组件 + FontAwesome",
  "editor": "Monaco Editor",
  "utils": "@vueuse/core"
}
```

### 后端技术栈
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 4.21.2",
  "language": "TypeScript 5.7.3",
  "database": "SQLite3 5.1.7",
  "auth": "自定义认证",
  "file": "WebDAV + Multer",
  "security": "Helmet + CORS"
}
```

### 构建与部署
```json
{
  "bundler": "Vite + TypeScript Compiler",
  "container": "Docker + Docker Compose",
  "proxy": "Nginx 反向代理",
  "process": "PM2 进程管理",
  "ssl": "Let's Encrypt / 自签名证书"
}
```

### 测试框架
```json
{
  "unit": "Vitest 3.2.4",
  "coverage": "@vitest/coverage-v8",
  "ui": "@vitest/ui (可视化界面)",
  "performance": "自定义性能测试脚本"
}
```

---

## 📁 目录结构详解

```
api_server/
├── 🎨 前端代码
│   ├── src/
│   │   ├── components/        # Vue 组件
│   │   ├── views/            # 页面视图
│   │   ├── router/           # 路由配置
│   │   ├── store/            # 状态管理
│   │   ├── assets/           # 静态资源
│   │   ├── types/            # TypeScript 类型定义
│   │   └── utils/            # 工具函数
│   └── public/               # 公共静态文件
│
├── ⚙️ 后端代码
│   └── server/
│       ├── controllers/      # 控制器
│       ├── models/          # 数据模型
│       ├── routes/          # 路由定义
│       ├── services/        # 业务逻辑
│       ├── middlewares/     # 中间件
│       ├── utils/           # 工具函数
│       ├── tests/           # 测试文件
│       ├── public/          # 服务器静态文件
│       ├── temps/           # 临时文件
│       └── certs/           # SSL 证书
│
├── 🔧 自动化脚本
│   └── scripts/
│       ├── deployment/      # 部署脚本
│       │   ├── deploy.sh           # 主部署脚本
│       │   ├── nginx-deploy.sh     # Nginx 部署
│       │   ├── start-production.sh # 生产启动
│       │   └── restart-production.sh # 重启服务
│       ├── testing/         # 测试脚本
│       │   ├── test-menu.sh        # 测试菜单
│       │   ├── test-ui.sh          # UI 测试
│       │   ├── test-coverage.sh    # 覆盖率测试
│       │   └── test-performance.sh # 性能测试
│       ├── diagnosis/       # 诊断脚本
│       │   ├── diagnose-lan.sh     # 网络诊断
│       │   └── network-diagnose.sh # 网络检查
│       ├── maintenance/     # 维护脚本
│       │   └── cleanup-files.sh    # 文件清理
│       └── utils/           # 工具脚本
│           ├── build.js            # 构建脚本
│           ├── diagnose.js         # 诊断工具
│           ├── quick-run-check.js  # 快速检查
│           ├── test-build.js       # 构建测试
│           └── tcp-server.js       # TCP 服务器
│
├── 📚 项目文档
│   └── docs/
│       ├── guides/          # 使用指南
│       ├── development/     # 开发文档
│       ├── deployment/      # 部署文档
│       ├── configuration/   # 配置文档
│       └── reports/         # 项目报告
│
├── ⚙️ 配置文件
│   ├── config/
│   │   ├── docker-compose.yml    # Docker 编排
│   │   ├── nginx.conf           # Nginx 配置
│   │   └── lighthouserc.json    # 性能测试配置
│   ├── vite.config.ts          # Vite 配置
│   ├── vitest.config.ts        # 测试配置
│   ├── tsconfig.json           # TypeScript 配置
│   ├── Dockerfile              # Docker 镜像
│   └── package.json            # 项目配置
│
├── 📄 模板文件
│   └── templates/
│       └── maintenance.html      # 维护页面模板
│
└── 🗃️ 数据文件
    ├── database.db             # SQLite 数据库
    ├── dicts/                  # 字典文件
    ├── logs/                   # 日志文件
    └── temps/                  # 临时文件
```

---

## 🚀 核心功能模块

### 1. 前端功能
- **Vue 3 应用**: 现代化的 SPA 单页应用
- **TypeScript 支持**: 完整的类型检查和智能提示
- **组件化开发**: 可复用的 Vue 组件库
- **路由管理**: Vue Router 动态路由
- **状态管理**: Vuex/Pinia 状态管理
- **代码编辑器**: Monaco Editor 集成
- **拖拽功能**: Vue Draggable 支持

### 2. 后端 API
- **RESTful API**: 标准的 REST 接口设计
- **文件管理**: WebDAV 协议支持
- **数据库操作**: SQLite 轻量级数据库
- **文件上传**: Multer 文件处理
- **安全防护**: Helmet + CORS 安全中间件
- **日志记录**: Morgan 访问日志
- **静态服务**: Express 静态文件服务

### 3. 构建系统
- **前端构建**: Vite 现代化构建工具
- **后端编译**: TypeScript Compiler
- **全栈构建**: 自定义 build.js 脚本
- **代码检查**: TypeScript 类型检查
- **资源优化**: Vite 自动优化和压缩

### 4. 测试框架
- **单元测试**: Vitest 现代测试框架
- **覆盖率测试**: 代码覆盖率报告
- **可视化测试**: Vitest UI 界面
- **性能测试**: 自定义性能基准测试
- **集成测试**: 完整的端到端测试

### 5. 部署方案
- **本地部署**: Node.js 直接运行
- **Docker 部署**: 容器化部署方案
- **Nginx 代理**: 反向代理和负载均衡
- **SSL 支持**: HTTPS 安全连接
- **进程管理**: PM2 生产级进程管理

---

## 📋 npm 脚本命令

### 🛠️ 开发相关
```bash
npm run dev              # 同时启动前后端开发服务器
npm run frontend         # 仅启动前端开发服务器 (Vite)
npm run backend          # 仅启动后端开发服务器 (Express)
npm run start_server     # 启动后端服务器 (TypeScript)
```

### 🏗️ 构建相关
```bash
npm run build            # 全栈项目构建 (使用 build.js)
npm run build:frontend   # 仅构建前端 (Vite)
npm run build:backend    # 仅构建后端 (TypeScript)
npm run build-only       # 纯前端构建
npm run type-check       # TypeScript 类型检查
```

### 🚀 生产部署
```bash
npm run start            # 启动生产服务器 (3000端口)
npm run start:prod       # 生产模式启动 (3000端口)
npm run start:80         # 生产模式启动 (80端口)
npm run start:dev        # 开发模式启动
npm run serve            # 构建并启动生产服务器
npm run preview          # 本地预览构建结果
```

### 🧪 测试相关
```bash
npm run test             # 交互式测试模式
npm run test:run         # 运行所有测试
npm run test:ui          # 启动可视化测试界面
npm run test:coverage    # 详细覆盖率测试
npm run test:watch       # 监听模式测试
npm run test:overtime    # 加班计算功能测试
npm run test:performance # 性能基准测试
npm run test:cleanup     # 清理测试环境
npm run test:menu        # 测试菜单脚本
npm run test:legacy      # 遗留测试脚本
```

### 🐳 Docker 相关
```bash
npm run docker:build    # 构建 Docker 镜像
npm run docker:run      # 运行 Docker 容器
npm run docker:compose  # 使用 Docker Compose 启动
npm run docker:down     # 停止 Docker Compose 服务
npm run docker:logs     # 查看 Docker 日志
npm run deploy          # 构建并部署 (Docker)
```

### 🔍 检查工具
```bash
npm run check           # 完整环境检查
npm run check:dev       # 开发环境检查
npm run check:prod      # 生产环境检查
npm run check:docker    # Docker 环境检查
npm run check:ports     # 端口占用检查
```

### 📦 部署管理
```bash
npm run deploy:start    # 启动生产部署
npm run deploy:stop     # 停止生产服务
npm run deploy:restart  # 重启生产服务
npm run deploy:restart:detailed # 详细重启过程
```

### 🧪 构建测试
```bash
npm run test:build      # 测试构建过程
npm run test:preview    # 测试预览构建结果
```

---

## 🔧 开发工具链

### 诊断工具
- **diagnose.js**: 环境诊断和问题检测
- **quick-run-check.js**: 快速环境检查
- **network-diagnose.sh**: 网络连接诊断

### 构建工具
- **build.js**: 全栈项目构建脚本
- **test-build.js**: 构建测试和验证
- **quick-test.js**: 快速部署测试

### 部署工具
- **deploy.sh**: 主部署脚本
- **nginx-deploy.sh**: Nginx 配置部署
- **docker-compose.yml**: 容器编排配置

### 测试工具
- **test-menu.sh**: 测试功能菜单
- **test-ui.sh**: 可视化测试界面
- **test-coverage.sh**: 代码覆盖率测试

---

## 🌐 网络配置

### 端口配置
- **开发环境**: 
  - 前端: 5173 (Vite)
  - 后端: 3000 (Express)
- **生产环境**:
  - HTTP: 80 或 3000
  - HTTPS: 443 或 3443
- **测试环境**:
  - Vitest UI: 51204

### 访问地址
- **开发**: `http://localhost:5173`
- **生产**: `http://localhost:3000`
- **Nginx代理**: `http://localhost` (80端口)
- **HTTPS**: `https://localhost` (443端口)

---

## 🗄️ 数据库结构

### SQLite 数据库
- **文件位置**: `database.db`
- **类型**: SQLite3 轻量级数据库
- **用途**: 用户数据、配置信息、日志记录

### 数据字典
- **位置**: `dicts/` 目录
- **格式**: JSON 文件
- **用途**: 配置字典、静态数据

---

## 🔒 安全配置

### 安全中间件
- **Helmet**: HTTP 安全头设置
- **CORS**: 跨域资源共享控制
- **Morgan**: 访问日志记录

### SSL/TLS
- **证书位置**: `server/certs/`
- **支持类型**: Let's Encrypt、自签名证书
- **配置脚本**: `nginx-deploy.sh cert`

---

## 📊 性能监控

### 测试工具
- **Lighthouse**: 性能评估 (`lighthouserc.json`)
- **Vitest**: 单元测试性能
- **自定义脚本**: 性能基准测试

### 日志管理
- **访问日志**: Morgan 中间件
- **错误日志**: 自定义错误处理
- **服务日志**: `logs/server.log`

---

## 🐛 最近修复记录 (2025年9月21日)

### InfiniteNavView 组件修复详情

#### 🔍 问题诊断过程

1. **问题现象**: 无限导航视图中所有网格元素消失，页面空白
2. **根本原因**: 动态网格计算系统实现错误，computed属性返回空数组
3. **调试方法**:
   - 添加控制台调试输出追踪网格生成
   - 使用可视化调试样式（红色边框、黄色背景）
   - 检查组件生命周期和响应式数据

#### 🛠️ 技术解决方案

**修复策略**: 从复杂的动态网格系统回退到可靠的静态网格系统

1. **网格生成算法优化**:

```typescript
// 创建 11x11 的超大静态网格，确保四周连续
const grids = computed<Grid[]>(() => {
    const result: Grid[] = [];
    for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
            result.push({
                offsetX: i * gridSize.width,
                offsetY: j * gridSize.height
            });
        }
    }
    return result; // 121个网格项，覆盖范围 -4000px 到 +4000px
});
```

2. **智能边界重置机制**:

```typescript
// 当位置偏移过远时重置到视觉等效位置
function updatePosition(deltaX: number, deltaY: number) {
    position.x += deltaX;
    position.y += deltaY;
    
    const resetThreshold = 5000;
    if (Math.abs(position.x) > resetThreshold || Math.abs(position.y) > resetThreshold) {
        const newX = ((position.x % gridSize.width) + gridSize.width) % gridSize.width;
        const newY = ((position.y % gridSize.height) + gridSize.height) % gridSize.height;
        position.x = newX;
        position.y = newY;
    }
}
```

3. **画布尺寸优化**:

```css
.infinite-canvas {
    width: 10000px; /* 从100000px优化到10000px */
    height: 10000px;
    margin-left: -5000px;
    margin-top: -5000px;
}
```

4. **调试系统增强**:

```vue
<!-- 实时调试信息显示 -->
<div class="grid-count">
    网格数量: {{ grids.length }} | 导航项: {{ navItems.length }}
</div>
```

#### 🎨 用户体验改进

1. **无限滚动体验**:
   - 支持所有方向的连续滚动
   - 智能边界重置保持视觉连续性
   - 消除滚动时的空白区域

2. **交互优化**:
   - 左键/右键拖拽支持
   - 滚轮移动响应
   - 键盘导航快捷键
   - 惯性滑动效果

3. **视觉反馈**:
   - 实时位置坐标显示
   - 网格状态信息
   - 拖拽状态指示器

#### 📊 性能优化

1. **内存管理**: 固定网格数量（121个），避免动态计算开销
2. **渲染优化**: 画布尺寸合理化，提高浏览器渲染性能
3. **事件处理**: 优化拖拽和滚动事件响应

#### 🔧 技术亮点

- **Vue 3 Composition API**: 响应式状态管理
- **TypeScript 严格模式**: 类型安全保证
- **CSS Transform**: 硬件加速的平滑动画
- **Event Handling**: 多设备输入支持（鼠标、触摸、键盘）
- **Computed Properties**: 响应式网格计算

### 🗺️ 小地图功能全面优化 (2025年9月21日)

#### 🎯 优化背景

用户反馈小地图与实际布局不符，需要增强导航功能的准确性和交互性。经过系统性优化，实现了完全交互式的小地图导航系统。

#### 🚀 核心功能实现

1. **动态网格布局同步**:

```typescript
// 小地图网格完全匹配主网格布局
const miniViewportStyle = computed(() => {
    const layout = optimalGridLayout.value;
    const mapRect = { width: 220, height: 120 };
    
    // 计算当前视口在网格中的相对位置
    const totalWidth = layout.cols * (layout.groupWidth + 20);
    const totalHeight = layout.rows * (layout.groupHeight + 20);
    
    // 视口大小相对于总网格的比例
    const viewportWidthRatio = viewport.width / totalWidth;
    const viewportHeightRatio = viewport.height / totalHeight;
    
    return {
        width: `${mapRect.width * viewportWidthRatio}px`,
        height: `${mapRect.height * viewportHeightRatio}px`,
        left: `${-translateX.value / totalWidth * mapRect.width}px`,
        top: `${-translateY.value / totalHeight * mapRect.height}px`
    };
});
```

2. **精确点击导航系统**:

```typescript
// 小地图点击处理 - 支持精确位置导航
function handleMiniMapClick(event: MouseEvent) {
    event.stopPropagation();
    
    const miniMapElement = event.currentTarget as HTMLElement;
    const rect = miniMapElement.getBoundingClientRect();
    
    // 计算点击在小地图中的相对位置 (0-1)
    const clickX = (event.clientX - rect.left) / rect.width;
    const clickY = (event.clientY - rect.top) / rect.height;
    
    // 转换为网格坐标并导航
    const layout = optimalGridLayout.value;
    const targetGridX = clickX * layout.cols;
    const targetGridY = clickY * layout.rows;
    
    const groupIndex = Math.floor(targetGridY) * layout.cols + Math.floor(targetGridX);
    
    if (groupIndex >= 0 && groupIndex < groupedNavItems.value.length) {
        navigateToGroup(groupIndex);
    }
}
```

3. **分组导航增强**:

```typescript
// 智能分组导航 - 平滑动画过渡
function navigateToGroup(groupIndex: number) {
    const layout = optimalGridLayout.value;
    
    // 计算分组在网格中的精确位置
    const row = Math.floor(groupIndex / layout.cols);
    const col = groupIndex % layout.cols;
    
    // 计算目标位置（让分组居中显示）
    const groupWidth = layout.groupWidth + 20;
    const groupHeight = layout.groupHeight + 20;
    
    const targetX = -(col * groupWidth + groupWidth / 2 - viewport.width / 2);
    const targetY = -(row * groupHeight + groupHeight / 2 - viewport.height / 2);
    
    // 平滑动画到目标位置
    animateToPosition(targetX, targetY);
}
```

#### 🎨 用户界面增强

1. **交互式小地图模板**:

```vue
<div class="mini-map-content">
    <div 
        class="mini-grid"
        :style="{
            gridTemplateColumns: `repeat(${optimalGridLayout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${optimalGridLayout.rows}, 1fr)`
        }"
        @click="handleMiniMapClick"
    >
        <div 
            v-for="(group, groupIndex) in groupedNavItems" 
            :key="groupIndex"
            class="mini-group"
            :style="{ backgroundColor: group.config.color }"
            @click.stop="navigateToGroup(groupIndex)"
            :title="`${group.config.name} (${group.items.length}项)`"
        >
            <i :class="group.config.icon"></i>
            <span class="mini-group-count">{{ group.items.length }}</span>
        </div>
    </div>
    <!-- 实时视口指示器 -->
    <div class="mini-viewport" :style="miniViewportStyle" title="当前视口"></div>
    <div class="mini-center" title="网格中心 (0,0)"></div>
</div>
```

2. **增强的视觉效果**:

```css
.mini-map-content {
    cursor: crosshair;
    transition: all 0.2s ease;
}

.mini-map-content:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.08);
}

.mini-group:hover {
    opacity: 1;
    transform: scale(1.15);
    z-index: 2;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
}
```

#### 📊 功能特性总结

1. **精确导航**:
   - ✅ 点击小地图任意位置进行导航
   - ✅ 智能定位到最接近的分组
   - ✅ 平滑动画过渡效果

2. **实时同步**:
   - ✅ 小地图完全反映实际网格布局
   - ✅ 动态视口指示器
   - ✅ 实时坐标系映射

3. **用户体验**:
   - ✅ 悬停效果和视觉反馈
   - ✅ 分组信息提示
   - ✅ 直观的可视化导航

4. **技术亮点**:
   - ✅ Vue 3 响应式计算属性
   - ✅ TypeScript 严格类型检查
   - ✅ 硬件加速的 CSS 动画
   - ✅ 事件冒泡控制和精确点击处理

#### 🔍 代码质量保证

- **TypeScript 编译**: 无错误通过类型检查
- **响应式设计**: 支持移动端和桌面端
- **性能优化**: 使用 computed 属性减少重复计算
- **用户体验**: 提供直观的视觉反馈和交互提示

#### 🎯 应用价值

这次小地图优化显著提升了 InfiniteNavView 组件的可用性，用户现在可以：

1. **快速导航**: 直接点击小地图跳转到目标区域
2. **精确定位**: 实时了解当前位置和目标位置
3. **高效浏览**: 通过分组颜色和图标快速识别内容
4. **流畅体验**: 享受平滑的动画过渡和视觉反馈

这个功能将无限导航视图从单纯的展示工具升级为强大的交互式导航系统，为用户提供了卓越的浏览和导航体验。

---

## 🎯 AI 代理开发建议

### 代码规范

1. **TypeScript 优先**: 所有新代码使用 TypeScript
2. **组件化开发**: Vue 组件要可复用和可测试
3. **RESTful 设计**: API 遵循 REST 设计原则
4. **错误处理**: 完善的错误处理和日志记录
5. **安全第一**: 所有用户输入都要验证和清理

### 文件命名

- **组件**: PascalCase (如 `UserProfile.vue`)
- **工具**: camelCase (如 `userUtils.ts`)
- **路由**: kebab-case (如 `user-profile`)
- **脚本**: kebab-case (如 `test-build.sh`)

### 提交规范

- **功能**: `feat: 添加用户管理功能`
- **修复**: `fix: 修复登录验证问题`
- **文档**: `docs: 更新API文档`
- **样式**: `style: 优化按钮样式`
- **重构**: `refactor: 重构用户服务`

### 测试要求

- **单元测试**: 核心业务逻辑要有测试覆盖
- **集成测试**: API 接口要有集成测试
- **E2E 测试**: 关键用户流程要有端到端测试
- **性能测试**: 关键接口要有性能基准

---

## 📞 支持与维护

### 文档位置

- **使用指南**: `docs/guides/`
- **开发文档**: `docs/development/`
- **部署文档**: `docs/deployment/`
- **API 文档**: 待完善

### 常见问题

1. **构建失败**: 运行 `npm run check` 诊断
2. **端口冲突**: 使用 `npm run check:ports` 检查
3. **依赖问题**: 删除 `node_modules` 重新安装
4. **Docker 问题**: 检查 Docker 服务状态

### 维护脚本

- **清理**: `scripts/maintenance/cleanup-files.sh`
- **诊断**: `node scripts/utils/diagnose.js`
- **检查**: `node scripts/utils/quick-run-check.js`

---

## 🎉 项目特色

1. **全栈一体**: 前后端统一构建和部署
2. **TypeScript 全栈**: 前后端都使用 TypeScript
3. **现代化工具链**: Vite + Vitest + Docker
4. **完整的脚本工具**: 自动化开发、测试、部署
5. **详细的文档**: 完善的项目文档和指南
6. **灵活部署**: 支持多种部署方式
7. **安全可靠**: 完整的安全防护和错误处理

---

最后更新: 2025年9月21日

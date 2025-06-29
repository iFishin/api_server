# 🚀 API_Server - All-in-One Development Platform

[![Build Status](https://github.com/你的用户名/api_server/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/你的用户名/api_server/actions)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://hub.docker.com/)
[![Vue 3](https://img.shields.io/badge/vue-3.x-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)

现代化的全栈开发平台，集成多协议API测试、工具集、文档管理于一体。采用Vue3 + TypeScript + Node.js技术栈，提供美观的用户界面和强大的后端服务。

## ✨ 特性

- 🧪 **多协议支持** - HTTP/TCP/UDP/MQTT统一接口测试
- ⚡ **即时测试** - API模拟与自动化测试
- 🔗 **工作流集成** - 文档、测试、部署一体化
- 📊 **数据分析** - 性能监控与分析仪表板
- 🛠️ **开发工具** - 字符串生成、Base64转换、JSON格式化等
- 📁 **WebDAV支持** - 文件管理和共享
- 🎨 **现代UI** - 绿白配色主题，毛玻璃效果，响应式设计

## 🏗️ 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP客户端
- **Monaco Editor** - 代码编辑器

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **TypeScript** - 类型安全开发
- **SQLite** - 轻量级数据库
- **WebDAV** - 文件共享协议
- **MQTT** - 物联网消息协议

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 8+
- Git

### 一键检查环境

```bash
# 快速环境检查（推荐首次使用）
npm run check

# 或直接运行
node quick-run-check.js check
```

### 本地开发

```bash
# 克隆项目
git clone https://github.com/你的用户名/api_server.git
cd api_server

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 查看前端界面，后端API运行在 `http://localhost:3000`

## 📋 常用命令速查表

| 场景 | 命令 | 说明 |
|------|------|------|
| **环境检查** | `npm run check` | 完整环境检查 |
| | `npm run check:dev` | 检查开发环境 |
| | `npm run check:prod` | 检查生产环境 |
| | `npm run check:ports` | 检查端口占用 |
| **开发** | `npm run dev` | 前后端同时启动 |
| | `npm run frontend` | 只启动前端 |
| | `npm run backend` | 只启动后端 |
| **构建** | `npm run build` | 完整构建 |
| | `npm run type-check` | 类型检查 |
| **生产** | `npm run start:prod` | 生产服务器(3000端口) |
| | `npm run start:80` | 标准端口(80/443) |
| | `npm run preview` | 构建并预览 |
| **Docker** | `npm run docker:compose` | Docker Compose部署 |
| | `npm run docker:build` | 构建Docker镜像 |
| | `npm run docker:run` | 运行Docker容器 |
| **工具** | `./deploy.sh` | 一键部署脚本 |
| | `node test-build.js` | 构建测试工具 |
| | `node diagnose.js` | 环境诊断工具 |

### 开发命令

```bash
# 前端开发
npm run frontend

# 后端开发
npm run backend

# 同时启动前后端
npm run dev

# 类型检查
npm run type-check

# 运行测试
npm run test
```

## 📦 构建和部署

### 快速检查

```bash
# 检查各种运行环境
npm run check:dev      # 开发环境
npm run check:prod     # 生产环境
npm run check:docker   # Docker环境
npm run check:ports    # 端口占用
```

### 方法一：本地生产部署

```bash
# 构建项目
npm run build

# 启动生产服务器（端口3000）
npm run start:prod

# 启动标准端口（80/443，需要管理员权限）
sudo npm run start:80

# 构建并预览
npm run preview
```

### 方法二：Docker部署（推荐）

```bash
# Docker Compose一键部署
npm run docker:compose

# 单容器部署
npm run docker:build
npm run docker:run

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

### 方法三：一键部署脚本

```bash
# 交互式部署（支持多种方式）
./deploy.sh

# 构建测试
node test-build.js preview

# 环境诊断
node diagnose.js
```
cd dist
npm install --production
npm start
```

### 方法二：Docker部署（推荐）

```bash
# 使用部署脚本（推荐）
./deploy.sh

# 或手动构建
npm run docker:build
npm run docker:run

# 使用Docker Compose
npm run docker:compose
```

### 方法三：一键部署

```bash
# 构建并部署
npm run deploy

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 🐳 Docker部署详情

### Docker Compose（推荐）

```yaml
# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 服务配置

- **主应用**: `localhost:3000`
- **Nginx代理**: `localhost:80`
- **健康检查**: `/api/health`

### 环境变量

```bash
# 复制环境变量模板
cp .env.example .env.production

# 修改生产环境配置
vim .env.production
```

## 🔧 配置说明

### 前端配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

### 后端配置

```bash
# .env.production
NODE_ENV=production
PORT=3000
DB_PATH=./database.db
```

## 📊 监控和维护

### 健康检查

```bash
# 应用健康状态
curl http://localhost:3000/api/health

# Docker容器状态
docker-compose ps
```

### 日志管理

```bash
# 查看应用日志
docker-compose logs -f api-server

# 查看Nginx日志
docker-compose logs -f nginx
```

### 性能监控

- CPU和内存使用情况
- API响应时间
- 请求量统计
- 错误率监控

## 🛠️ 开发指南

### 项目结构

```
api_server/
├── src/                    # 前端源码
│   ├── components/         # Vue组件
│   ├── views/             # 页面视图
│   ├── router/            # 路由配置
│   └── utils/             # 工具函数
├── server/                # 后端源码
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── services/         # 业务逻辑
│   └── middlewares/      # 中间件
├── dist/                 # 构建产物
├── docker-compose.yml    # Docker编排
├── Dockerfile           # Docker镜像
└── build.js            # 构建脚本
```

### 添加新功能

1. **前端页面**：在 `src/views/` 添加新页面
2. **API接口**：在 `server/routes/` 添加路由
3. **业务逻辑**：在 `server/services/` 实现逻辑
4. **数据模型**：在 `server/models/` 定义模型

### 代码规范

- 使用TypeScript进行类型安全开发
- 遵循Vue 3 Composition API规范
- 使用ESLint和Prettier格式化代码
- 编写单元测试和集成测试

## 🔒 安全配置

### 生产环境

```bash
# 修改默认密钥
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key

# 启用HTTPS
SSL_ENABLED=true
SSL_CERT_PATH=./server/certs/server.crt
SSL_KEY_PATH=./server/certs/server.key
```

### 防火墙配置

```bash
# 开放必要端口
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # API服务
```

## � 文档导航

| 文档 | 说明 | 推荐阅读顺序 |
|------|------|-------------|
| [RUN-GUIDE.md](./RUN-GUIDE.md) | 🚀 **运行指南** - 各种环境运行方式 | ⭐ 首次使用必读 |
| [RUN-EXAMPLES.md](./RUN-EXAMPLES.md) | 🎯 **运行示例** - 详细示例和最佳实践 | ⭐ 实战参考 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 🌐 **部署指南** - 生产环境部署说明 | 部署时阅读 |
| [PORTS-DEPLOYMENT.md](./PORTS-DEPLOYMENT.md) | 🔧 **端口配置** - 端口配置详解 | 配置参考 |
| [TEST-BUILD.md](./TEST-BUILD.md) | 🧪 **构建测试** - 构建和测试说明 | 开发参考 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 🤝 **贡献指南** - 开发规范和流程 | 贡献代码前阅读 |

### 快速工具

```bash
# 环境检查工具
npm run check              # 完整检查
node quick-run-check.js    # 原始命令

# 构建测试工具  
node test-build.js preview # 构建并预览
node test-build.js check   # 检查构建结果

# 诊断工具
node diagnose.js          # 环境诊断

# 一键部署
./deploy.sh              # 交互式部署
```

## �🚧 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 查看端口占用情况
   npm run check:ports
   
   # 查找占用进程
   lsof -i :3000
   
   # 杀死进程
   kill -9 <PID>
   
   # 使用不同端口
   HTTP_PORT=4000 npm run dev
   ```

2. **Docker容器无法启动**
   ```bash
   # 查看详细日志
   npm run docker:logs
   
   # 重新构建镜像
   docker-compose up --build
   
   # 检查Docker环境
   npm run check:docker
   ```

3. **构建失败**
   ```bash
   # 检查TypeScript错误
   npm run type-check
   
   # 清理并重新安装依赖
   rm -rf node_modules package-lock.json
   npm install
   
   # 重新构建
   npm run build
   ```

4. **权限错误**
   ```bash
   # 添加执行权限
   chmod +x deploy.sh
   chmod +x quick-run-check.js
   
   # 使用sudo运行标准端口
   sudo npm run start:80
   ```

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0 (2025-01-01)
- ✨ 初始版本发布
- 🎨 美观的绿白配色主题
- 🔧 完整的前后端分离架构
- 📦 Docker容器化支持
- 🛠️ 丰富的开发工具集

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙋‍♂️ 支持

- 📧 邮件: [support@example.com](mailto:support@example.com)
- 🐛 问题反馈: [GitHub Issues](https://github.com/你的用户名/api_server/issues)
- 📖 文档: [项目Wiki](https://github.com/你的用户名/api_server/wiki)

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！

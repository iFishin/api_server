# API Server 项目

Vue3 + TypeScript + Express 全栈 API 服务器，支持前后端一体化部署。

## 📁 项目结构

```
├── src/                    # 前端源码 (Vue3 + TypeScript)
├── server/                 # 后端源码 (Express + TypeScript)
├── public/                 # 静态资源
├── dist/                   # 构建输出
├── docs/                   # 📚 项目文档
│   ├── guides/            # 使用指南
│   ├── development/       # 开发文档
│   ├── deployment/        # 部署文档
│   ├── configuration/     # 配置文档
│   └── reports/           # 项目报告
├── scripts/               # 🔧 项目脚本
│   ├── deployment/        # 部署脚本
│   ├── diagnosis/         # 诊断脚本
│   ├── maintenance/       # 维护脚本
│   └── utils/             # 工具脚本
├── config/                # ⚙️ 配置文件
│   ├── nginx.conf         # Nginx 配置
│   ├── docker-compose.yml # Docker 配置
│   └── lighthouserc.json  # Lighthouse 配置
├── templates/             # 📄 模板文件
│   └── maintenance.html   # 维护页面模板
└── ...                    # 其他项目文件
```

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 分别启动前后端
npm run frontend  # 前端开发服务器
npm run backend   # 后端开发服务器
```

### 生产环境

```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start:prod  # 3000端口
npm run start:80    # 80端口 (需要sudo)
```

## 🐳 Docker 部署

```bash
# 使用 Docker Compose
npm run docker:compose

# 或手动构建
npm run docker:build
npm run docker:run
```

## 🌐 Nginx 反向代理

支持通过 Nginx 代理 80/443 端口到 3000 端口：

```bash
# 生成SSL证书
./scripts/deployment/nginx-deploy.sh cert

# 部署 Nginx 配置
sudo ./scripts/deployment/nginx-deploy.sh deploy

# 测试配置
./scripts/deployment/nginx-deploy.sh test
```

访问地址：
- HTTP: `http://localhost` (80端口)
- HTTPS: `https://localhost` (443端口)
- 直接访问: `http://localhost:3000`

## 📖 文档

- [使用指南](docs/guides/) - 详细的使用说明
- [部署指南](docs/deployment/) - 生产环境部署
- [开发文档](docs/development/) - 开发者指南
- [配置说明](docs/configuration/) - 配置文件说明

## 🔧 脚本工具

### 部署脚本
- `scripts/deployment/nginx-deploy.sh` - Nginx 部署工具
- `scripts/deployment/start-production.sh` - 生产环境启动
- `scripts/deployment/deploy.sh` - 通用部署脚本
- `scripts/deployment/deploy-80.sh` - 80端口部署

### 诊断工具
- `scripts/diagnosis/network-diagnose.sh` - 网络诊断
- `scripts/diagnosis/cors-diagnose.sh` - CORS 诊断
- `scripts/diagnosis/diagnose-lan.sh` - 局域网诊断

### 维护工具
- `scripts/maintenance/cleanup-files.sh` - 文件清理
- `scripts/maintenance/test-error-pages.sh` - 错误页面测试

### 工具脚本
- `scripts/utils/build.js` - 构建脚本
- `scripts/utils/quick-run-check.js` - 快速检查工具
- `scripts/utils/test-build.js` - 构建测试

## 🛠️ 功能特性

- ✅ Vue3 + TypeScript 前端
- ✅ Express + TypeScript 后端
- ✅ 前后端一体化部署
- ✅ Nginx 反向代理支持
- ✅ SSL/HTTPS 支持
- ✅ Docker 容器化部署
- ✅ 局域网访问支持
- ✅ WebDAV 文件服务
- ✅ MQTT 消息服务
- ✅ 文件上传功能
- ✅ 用户管理系统
- ✅ API 接口文档
- ✅ 自动化脚本工具

## ⚙️ 环境配置

- `NODE_ENV` - 运行环境 (development/production)
- `HTTP_PORT` - HTTP 端口 (默认3000)
- `HTTPS_PORT` - HTTPS 端口 (默认3443)
- `API_BASE_URL` - API 基础地址
- `CORS_ORIGIN` - CORS 允许来源

详细配置请参考 [配置文档](docs/configuration/)。

## 🔍 健康检查

- **API状态**: `GET /health`
- **用户接口**: `GET /api/users`
- **WebDAV**: `PROPFIND /webdav`

## 📝 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎贡献代码，请查看 [贡献指南](docs/development/CONTRIBUTING.md)。

## 📞 支持

如有问题，请查看：
1. [使用指南](docs/guides/)
2. [FAQ](docs/guides/FAQ.md)
3. [故障排除](docs/deployment/TROUBLESHOOTING.md)

# 🚀 API Server 运行指南

本文档提供了 Vue3 + TS + Node.js 全栈项目的完整运行说明，支持开发、生产、Docker 等多种环境。

## 📋 目录

- [快速开始](#快速开始)
- [开发环境](#开发环境)
- [生产环境](#生产环境)
- [Docker 部署](#docker-部署)
- [端口配置](#端口配置)
- [一键脚本](#一键脚本)
- [常见问题](#常见问题)

## 🏃 快速开始

### 第一次使用

```bash
# 1. 安装依赖
npm install

# 2. 复制环境配置
cp .env.example .env

# 3. 开发模式（前后端同时启动）
npm run dev
```

访问：http://localhost:5173 （前端开发服务器）
后端API：http://localhost:3000

---

## 🛠️ 开发环境

### 1. 前端开发
```bash
# 只启动前端开发服务器
npm run frontend
```
- 访问：http://localhost:5173
- 支持热重载、Vue DevTools
- API 代理到后端服务器

### 2. 后端开发
```bash
# 只启动后端服务器
npm run backend
```
- API：http://localhost:3000
- HTTPS：https://localhost:3443（如有证书）
- 支持 TypeScript 热重载

### 3. 前后端联调
```bash
# 同时启动前后端（推荐）
npm run dev
```
- 前端：http://localhost:5173
- 后端：http://localhost:3000
- 自动代理 API 请求

### 4. 测试运行
```bash
# 运行测试套件
npm run test
```

---

## 🌐 生产环境

### 方式一：本地构建 + Node.js 运行

```bash
# 1. 构建项目
npm run build

# 2. 启动生产服务器（默认端口）
npm run start:prod
```
- 访问：http://localhost:3000
- HTTPS：https://localhost:3443

```bash
# 启动标准端口（80/443）
npm run start:80
```
- 访问：http://localhost
- HTTPS：https://localhost（需要证书）

### 方式二：预览模式
```bash
# 构建并启动预览（模拟生产环境）
npm run preview
```
- 自动进入 `dist` 目录
- 安装生产依赖
- 启动服务器

### 方式三：自定义端口
```bash
# 开发环境端口运行生产代码
npm run start:dev

# 或者手动指定端口
NODE_ENV=production HTTP_PORT=8080 HTTPS_PORT=8443 npm run start:prod
```

---

## 🐳 Docker 部署

### 方式一：Docker 单容器
```bash
# 1. 构建镜像
npm run docker:build

# 2. 运行容器（标准端口）
npm run docker:run
```
- 访问：http://localhost
- HTTPS：https://localhost

### 方式二：Docker Compose（推荐）
```bash
# 启动完整服务栈
npm run docker:compose

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

### 手动 Docker 命令
```bash
# 构建
docker build -t api-server .

# 运行（自定义端口）
docker run -p 8080:80 -p 8443:443 api-server

# 运行（标准端口）
docker run -p 80:80 -p 443:443 api-server

# 后台运行
docker run -d --name api-server -p 80:80 -p 443:443 api-server
```

---

## 🔧 端口配置

### 环境变量优先级
1. 命令行环境变量（最高优先级）
2. `.env.production` 文件
3. `.env` 文件
4. 默认值（最低优先级）

### 端口变量说明
```bash
# HTTP 端口
HTTP_PORT=80          # 生产环境默认
HTTP_PORT=3000        # 开发环境默认

# HTTPS 端口
HTTPS_PORT=443        # 生产环境默认
HTTPS_PORT=3443       # 开发环境默认

# 兼容变量
PORT=3000             # 向后兼容，等同于 HTTP_PORT
```

### 常用端口配置
```bash
# 开发环境
HTTP_PORT=3000 HTTPS_PORT=3443 npm run start:prod

# 测试环境
HTTP_PORT=8080 HTTPS_PORT=8443 npm run start:prod

# 生产环境（标准端口）
npm run start:80

# 生产环境（自定义端口）
HTTP_PORT=80 HTTPS_PORT=443 npm run start:prod
```

---

## 🎯 一键脚本

### 1. 部署脚本
```bash
# 一键部署（交互式选择）
./deploy.sh

# 或者
npm run deploy
```

支持的部署方式：
- 本地 Node.js 部署
- Docker 容器部署
- Docker Compose 部署
- Nginx 反向代理部署

### 2. 测试脚本
```bash
# 本地打包测试
node test-build.js build      # 构建
node test-build.js preview    # 构建并预览
node test-build.js check      # 检查构建结果
node test-build.js clean      # 清理构建文件
```

### 3. 诊断脚本
```bash
# 环境诊断
node diagnose.js
```
自动检查：
- Node.js 版本
- 依赖安装
- 端口占用
- 服务健康状态

---

## 🚀 生产部署最佳实践

### 1. Nginx 反向代理
```bash
# 启动 Node.js 服务器（非标准端口）
npm run start:prod

# 配置 Nginx 反向代理到 3000 端口
# 参考 nginx.conf 配置文件
```

### 2. PM2 进程管理
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start npm --name "api-server" -- run start:prod

# 保存配置
pm2 save
pm2 startup
```

### 3. SSL 证书配置
```bash
# 1. 生成自签名证书（开发）
openssl req -x509 -newkey rsa:4096 -keyout server/certs/server.key -out server/certs/server.crt -days 365 -nodes

# 2. 使用 Let's Encrypt（生产）
certbot --nginx -d yourdomain.com

# 3. 配置证书路径
# 修改 .env.production 中的证书路径
```

---

## ❓ 常见问题

### Q1: 开发环境启动失败
```bash
# 检查端口占用
lsof -i :3000
lsof -i :5173

# 清理 node_modules
rm -rf node_modules package-lock.json
npm install
```

### Q2: 生产环境构建失败
```bash
# 检查 TypeScript 错误
npm run type-check

# 重新构建
npm run build
```

### Q3: Docker 容器无法访问
```bash
# 检查端口映射
docker ps
docker logs api-server

# 重新构建镜像
docker build --no-cache -t api-server .
```

### Q4: 权限错误
```bash
# Linux/macOS 添加执行权限
chmod +x deploy.sh
chmod +x test-build.js

# Windows 使用 Git Bash 或 WSL
```

### Q5: 模块找不到错误
```bash
# 重新安装依赖
npm ci

# 检查 TypeScript 路径别名
npm run type-check
```

### Q6: 端口被占用错误
```bash
# 错误信息：Error: listen EADDRINUSE: address already in use :::1883

# 1. 检查占用端口的进程
npm run check:ports
lsof -i :1883    # 或其他被占用的端口
lsof -i :3000
lsof -i :5173

# 2. 杀死占用进程
kill <PID>       # 使用 lsof 显示的 PID

# 3. 或者杀死所有 node 进程（谨慎使用）
pkill -f node

# 4. 重新启动服务
npm run dev      # 开发环境
npm run start:prod  # 生产环境
```

### Q7: 生产环境权限错误
```bash
# 错误信息：Error: listen EACCES: permission denied 0.0.0.0:80

# 解决方案1：使用非特权端口
HTTP_PORT=3000 HTTPS_PORT=3443 npm run start:prod

# 解决方案2：使用 sudo（不推荐）
sudo npm run start:80

# 解决方案3：使用 Nginx 反向代理（推荐）
npm run start:prod  # 启动在 3000 端口
# 然后配置 Nginx 代理 80 -> 3000
```

---

## 📚 相关文档

- [部署指南](./DEPLOYMENT.md) - 详细部署说明
- [端口配置](./PORTS-DEPLOYMENT.md) - 端口配置详解
- [构建测试](./TEST-BUILD.md) - 构建测试说明
- [贡献指南](./CONTRIBUTING.md) - 开发贡献说明

---

## 📞 技术支持

如果遇到问题，请按以下顺序排查：

1. 运行 `node diagnose.js` 检查环境
2. 查看相关文档
3. 检查端口占用和权限
4. 查看服务器日志
5. 提交 Issue 反馈

**祝你使用愉快！** 🎉

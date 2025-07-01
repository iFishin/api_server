# 🎯 运行示例与最佳实践

本文档提供了详细的运行示例和最佳实践，帮助你快速掌握各种运行方式。

## 📋 目录

- [快速检查](#快速检查)
- [开发环境运行](#开发环境运行)
- [生产环境运行](#生产环境运行)
- [Docker 运行](#docker-运行)
- [端口配置示例](#端口配置示例)
- [常见场景](#常见场景)
- [故障排除](#故障排除)

---

## 🔍 快速检查

在开始运行之前，使用快速检查工具来验证环境：

```bash
# 完整环境检查（推荐首次使用）
npm run check

# 或者使用原始命令
node quick-run-check.js check
```

**输出示例：**
```
🔍 开始完整环境检查...

📦 检查依赖...
✅ Node.js: v18.17.0
✅ npm: 9.6.7
✅ package.json 存在
✅ node_modules 存在

🔌 检查端口占用...
⚪ API Server (开发) (3000) - 端口空闲
⚪ Vite Dev Server (5173) - 端口空闲
⚪ HTTP (生产) (80) - 端口空闲

🏗️  检查构建文件...
❌ dist/index.html 不存在
💡 提示：运行 npm run build 来构建项目

✅ 检查完成！
```

### 其他检查命令

```bash
# 检查开发环境
npm run check:dev

# 检查生产环境
npm run check:prod

# 检查 Docker 环境
npm run check:docker

# 检查端口占用
npm run check:ports
```

---

## 🛠️ 开发环境运行

### 方式一：前后端同时启动（推荐）

```bash
# 1. 安装依赖（首次）
npm install

# 2. 启动开发环境
npm run dev
```

**启动过程：**
```
> concurrently "vite" "ts-node -r tsconfig-paths/register -P server/tsconfig.json server/server.ts"

[0] VITE v4.4.5  ready in 1234 ms
[0] ➜  Local:   http://localhost:5173/
[0] ➜  Network: use --host to expose

[1] 🚀 开发服务器启动
[1] HTTP 服务器运行在: http://localhost:3000
[1] HTTPS 服务器运行在: https://localhost:3443
```

**访问地址：**
- 前端开发服务器：http://localhost:5173
- 后端 API 服务器：http://localhost:3000
- WebDAV 服务：http://localhost:3000/webdav
- MQTT Broker：mqtt://localhost:1883

### 方式二：分别启动

```bash
# 终端 1：启动前端
npm run frontend

# 终端 2：启动后端
npm run backend
```

### 验证开发环境

```bash
# 检查服务状态
curl http://localhost:3000/api/health
curl http://localhost:5173

# 查看开发环境状态
npm run check:dev
```

---

## 🌐 生产环境运行

### 第一步：构建项目

```bash
# 执行完整构建
npm run build
```

**构建过程：**
```
🏗️  开始构建 API Server...

📦 清理构建目录...
✅ 清理完成

🔨 构建前端...
✅ 前端构建完成

🔧 构建后端...
✅ 后端构建完成

📝 生成生产配置...
✅ 生产配置生成完成

🎉 构建完成！输出目录: dist/
```

**构建结果：**
```
dist/
├── index.html              # 前端入口
├── assets/                 # 前端资源
├── package.json           # 生产环境依赖
├── server/                # 后端代码
│   ├── server.js          # 服务器入口
│   ├── app.js             # Express 应用
│   └── ...               # 其他后端文件
└── ...
```

### 第二步：选择运行方式

#### 方式1：默认端口运行

```bash
# 启动生产服务器（端口 3000/3443）
npm run start:prod
```

**输出示例：**
```
🚀 生产服务器启动
环境: production
HTTP 端口: 3000
HTTPS 端口: 3443
服务器运行在: http://localhost:3000
```

#### 方式2：标准端口运行

```bash
# 启动标准端口（80/443）
npm run start:80

# 需要 sudo 权限
sudo npm run start:80
```

#### 方式3：预览模式

```bash
# 构建并启动预览（自动安装生产依赖）
npm run preview
```

**预览过程：**
```
🔨 构建项目...
✅ 构建完成

📦 安装生产依赖...
✅ 依赖安装完成

🚀 启动预览服务器...
服务器运行在: http://localhost:3000
```

### 验证生产环境

```bash
# 检查服务状态
curl http://localhost:3000/api/health

# 查看生产环境状态
npm run check:prod

# 性能测试
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000
```

---

## 🐳 Docker 运行

### 方式一：Docker 单容器

```bash
# 1. 构建 Docker 镜像
npm run docker:build

# 或者手动构建
docker build -t api-server .
```

**构建过程：**
```
[+] Building 45.2s (12/12) FINISHED
 => [internal] load build definition from Dockerfile
 => [internal] load .dockerignore
 => [stage-0 1/6] FROM node:18-alpine
 => [stage-0 2/6] WORKDIR /app
 => [stage-0 3/6] COPY package*.json ./
 => [stage-0 4/6] RUN npm ci --only=production
 => [stage-0 5/6] COPY dist/ ./
 => [stage-0 6/6] EXPOSE 80 443
 => exporting to image
 => => naming to docker.io/library/api-server:latest
```

```bash
# 2. 运行容器（标准端口）
npm run docker:run

# 或者自定义端口
docker run -p 8080:80 -p 8443:443 api-server

# 后台运行
docker run -d --name api-server -p 80:80 -p 443:443 api-server
```

### 方式二：Docker Compose（推荐）

```bash
# 启动完整服务栈
npm run docker:compose

# 等效于
docker-compose up -d
```

**Docker Compose 输出：**
```
Creating network "api_server_default" with the default driver
Creating api_server_app_1 ... done
```

```bash
# 查看服务状态
docker-compose ps

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

### Docker 验证

```bash
# 检查容器状态
docker ps

# 检查容器日志
docker logs api-server

# 测试服务
curl http://localhost/api/health

# Docker 环境检查
npm run check:docker
```

---

## 🔧 端口配置示例

### 环境变量配置

创建 `.env` 文件：
```bash
# 开发环境端口
HTTP_PORT=3000
HTTPS_PORT=3443

# 生产环境端口（可选）
# HTTP_PORT=80
# HTTPS_PORT=443

# 其他服务端口
MQTT_PORT=1883
WEBDAV_PORT=3000
```

### 不同场景的端口配置

#### 开发环境
```bash
# 使用默认开发端口
npm run dev

# 自定义开发端口
HTTP_PORT=4000 HTTPS_PORT=4443 npm run dev
```

#### 测试环境
```bash
# 使用测试端口
HTTP_PORT=8080 HTTPS_PORT=8443 npm run start:prod
```

#### 生产环境
```bash
# 标准 Web 端口
npm run start:80

# 自定义生产端口
HTTP_PORT=3000 HTTPS_PORT=3443 npm run start:prod
```

#### Docker 环境
```bash
# 标准端口映射
docker run -p 80:80 -p 443:443 api-server

# 自定义端口映射
docker run -p 8080:80 -p 8443:443 api-server

# 使用环境变量
docker run -e HTTP_PORT=80 -e HTTPS_PORT=443 -p 80:80 -p 443:443 api-server
```

---

## 🎯 常见场景

### 场景1：本地开发调试

```bash
# 1. 克隆项目
git clone <repository>
cd api_server

# 2. 安装依赖
npm install

# 3. 启动开发环境
npm run dev

# 4. 验证服务
npm run check:dev
```

### 场景2：生产环境部署

```bash
# 1. 构建项目
npm run build

# 2. 启动生产服务器
npm run start:prod

# 3. 验证部署
npm run check:prod
curl http://localhost:3000/api/health
```

### 场景3：Docker 容器化部署

```bash
# 1. 构建并启动
npm run docker:compose

# 2. 验证部署
docker-compose ps
curl http://localhost/api/health

# 3. 查看日志
npm run docker:logs
```

### 场景4：Nginx 反向代理

```bash
# 1. 启动 Node.js 服务（非标准端口）
npm run start:prod

# 2. 配置 Nginx（参考 nginx.conf）
sudo cp nginx.conf /etc/nginx/sites-available/api-server
sudo ln -s /etc/nginx/sites-available/api-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 3. 验证代理
curl http://localhost
```

### 场景5：PM2 进程管理

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 构建项目
npm run build

# 3. 启动服务
pm2 start ecosystem.config.js

# 4. 保存配置
pm2 save
pm2 startup
```

---

## 🚨 故障排除

### 问题1：端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**
```bash
# 查看端口占用
npm run check:ports
lsof -i :3000

# 杀死占用进程
kill -9 <PID>

# 或使用不同端口
HTTP_PORT=4000 npm run dev
```

### 问题2：依赖安装失败

**错误信息：**
```
npm ERR! peer dep missing
```

**解决方案：**
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用 npm ci
npm ci
```

### 问题3：构建失败

**错误信息：**
```
TypeScript error in server/app.ts
```

**解决方案：**
```bash
# 检查 TypeScript 错误
npm run type-check

# 查看详细错误
npx tsc -p server/tsconfig.json --noEmit

# 修复后重新构建
npm run build
```

### 问题4：Docker 构建失败

**错误信息：**
```
failed to solve with frontend dockerfile.v0
```

**解决方案：**
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建（无缓存）
docker build --no-cache -t api-server .

# 检查 Dockerfile 语法
docker build --dry-run -t api-server .
```

### 问题5：权限错误

**错误信息：**
```
EACCES: permission denied
```

**解决方案：**
```bash
# Linux/macOS：添加执行权限
chmod +x deploy.sh
chmod +x quick-run-check.js

# 使用 sudo 运行标准端口
sudo npm run start:80

# 或使用非特权端口
HTTP_PORT=8080 npm run start:prod
```

---

## 📚 进阶技巧

### 1. 自动化部署

```bash
# 创建部署脚本
#!/bin/bash
npm run build
npm run docker:build
docker-compose up -d
```

### 2. 健康检查

```bash
# 服务健康检查
curl -f http://localhost:3000/api/health || exit 1

# 集成到 CI/CD
npm run build
npm run start:prod &
sleep 5
curl -f http://localhost:3000/api/health
```

### 3. 性能优化

```bash
# 生产环境优化
NODE_ENV=production \
HTTP_PORT=80 \
HTTPS_PORT=443 \
npm run start:prod

# 启用压缩和缓存
export ENABLE_COMPRESSION=true
export CACHE_MAX_AGE=86400
```

### 4. 日志管理

```bash
# 查看实时日志
npm run docker:logs

# 查看特定服务日志
docker-compose logs -f app

# 日志轮转
pm2 install pm2-logrotate
```

---

## 🎉 总结

**快速启动流程：**

1. **开发环境：** `npm install` → `npm run dev`
2. **生产环境：** `npm run build` → `npm run start:prod`
3. **Docker 部署：** `npm run docker:compose`
4. **故障排除：** `npm run check` → 根据提示解决问题

**最佳实践：**

- 使用 `npm run check` 进行环境检查
- 开发阶段使用 `npm run dev`
- 生产部署使用 Docker Compose
- 配置 Nginx 反向代理用于生产环境
- 使用 PM2 进行进程管理
- 定期执行健康检查

**记住：** 每次部署前都要运行检查工具确保环境正常！

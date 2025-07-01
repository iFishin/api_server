# 标准端口部署指南

## 🚀 端口配置说明

本项目支持灵活的端口配置，既可以在开发环境使用非特权端口，也可以在生产环境使用标准端口（80/443）。

## � 局域网访问配置

### 网络监听配置
服务器已配置为监听 `0.0.0.0`，支持：
- **本地访问**: http://localhost:3000, http://127.0.0.1:3000
- **局域网访问**: http://[局域网IP]:3000

### CORS 跨域策略
已配置支持以下来源：
- **本地源**: localhost, 127.0.0.1
- **局域网私有IP段**:
  - 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
  - 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)  
  - 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)

### 获取局域网IP
```bash
# Linux/macOS
ip addr show | grep -E "inet [0-9]" | grep -v "127.0.0.1"
# 或
ifconfig | grep "inet " | grep -v "127.0.0.1"

# Windows
ipconfig | findstr "IPv4"
```

### 局域网访问测试
1. 启动服务: `npm run start:prod`
2. 获取服务器局域网IP (如: 192.168.1.100)
3. 从其他设备访问: http://192.168.1.100:3000
4. 测试API: http://192.168.1.100:3000/api/health
5. 使用测试页面: 打开 `cors-test.html` 进行完整测试

## �🏗️ 架构说明

### 开发环境（双端口）
- **前端开发服务器**: http://localhost:5173 (Vite)
- **后端 API 服务器**: http://localhost:3000 (Node.js)

### 生产环境（单端口一体化）
- **前后端一体化服务**: http://localhost:3000
  - 前端页面: http://localhost:3000/
  - API 接口: http://localhost:3000/api/
  - WebDAV: http://localhost:3000/webdav/
  - 其他服务: MQTT(1883), TCP(9001), UDP(9000)

**重要：** 打包后前端被编译成静态文件，由 Node.js 服务器统一提供服务，不再需要独立的前端端口！

## 📋 端口配置选项

### 开发环境
- **前端**: 5173 (Vite 开发服务器)
- **后端**: 3000 (Node.js Express)
- **HTTPS**: 3443 (如有 SSL 证书)

### 生产环境（一体化服务）
- **主服务**: 3000 (默认) 或 80 (标准)
- **HTTPS**: 3443 (默认) 或 443 (标准)
- **其他服务**:
  - MQTT: 1883
  - MQTTS: 8883  
  - TCP: 9001
  - UDP: 9000

## 🛠️ 部署方式

### 方式一：本地部署（推荐用于开发）

```bash
# 开发模式（端口 3000/3443）
npm run dev

# 生产模式（端口 3000/3443）
npm run build
npm run start:prod

# 生产模式（标准端口 80/443）- 需要管理员权限
npm run build
sudo npm run start:80
```

### 方式二：Docker 部署（推荐用于生产）

```bash
# 构建镜像
npm run docker:build

# 运行容器（标准端口）
docker run -d \
  --name api-server \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/database.db:/app/database.db \
  -v $(pwd)/server/certs:/app/server/certs:ro \
  -e NODE_ENV=production \
  -e HTTP_PORT=80 \
  -e HTTPS_PORT=443 \
  api-server

# 或使用 docker-compose
docker-compose up -d
```

### 方式三：系统服务部署

#### 1. 创建 systemd 服务文件

```bash
sudo nano /etc/systemd/system/api-server.service
```

```ini
[Unit]
Description=API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/your/api_server
Environment=NODE_ENV=production
Environment=HTTP_PORT=80
Environment=HTTPS_PORT=443
ExecStart=/usr/bin/node dist/server/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 2. 启用服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable api-server
sudo systemctl start api-server
sudo systemctl status api-server
```

## 🔒 SSL/HTTPS 配置

### 自签名证书（开发环境）

```bash
# 创建证书目录
mkdir -p server/certs

# 生成自签名证书
openssl req -x509 -newkey rsa:4096 -keyout server/certs/server.key -out server/certs/server.crt -days 365 -nodes
```

### Let's Encrypt 证书（生产环境）

```bash
# 安装 certbot
sudo apt install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem server/certs/server.key
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem server/certs/server.crt

# 设置证书权限
sudo chown $USER:$USER server/certs/server.*
```

## 🌐 Nginx 反向代理（可选）

如果您不想直接使用 Node.js 处理 80/443 端口，可以使用 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # HTTP 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ⚠️ 权限说明

### Linux/Unix 系统

- **端口 1-1023**: 需要管理员权限（root）
- **端口 1024+**: 普通用户可以使用

### 推荐的权限处理方式

1. **使用 Docker**：容器内部使用标准端口，主机映射到标准端口
2. **使用反向代理**：Node.js 使用非特权端口，Nginx/Apache 处理标准端口
3. **使用 authbind**：允许普通用户绑定特权端口

## 🧪 测试部署

### 1. 测试标准端口（需要 sudo）

```bash
# 构建项目
npm run build

# 启动标准端口服务
sudo HTTP_PORT=80 HTTPS_PORT=443 NODE_ENV=production node dist/server/server.js
```

### 2. 验证服务

```bash
# 测试 HTTP
curl http://localhost/api/health

# 测试 HTTPS（如果有证书）
curl -k https://localhost/api/health
```

### 3. 检查端口占用

```bash
# 检查端口是否被占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   sudo lsof -i :80
   sudo lsof -i :443
   ```

2. **权限被拒绝**
   - 确保使用 sudo 运行
   - 或使用 Docker 部署
   - 或配置反向代理

3. **证书问题**
   - 检查证书文件路径和权限
   - 确保证书格式正确

4. **前端页面被覆盖问题** ⚠️
   
   **问题描述**: 生产环境下访问根路径 `/` 时，显示的是后端测试页面而不是 Vue 前端页面。
   
   **原因**: `dist/server/public/index.html` 文件覆盖了前端的 `dist/index.html`。
   
   **解决方案**:
   - 确保 `dist/server/public` 目录不存在或已删除
   - 修改 `build.js`，在复制server资源时排除 `public` 目录
   - 确保 `server/app.ts` 中生产环境只挂载 `dist` 目录作为静态资源
   
   **验证方法**:
   ```bash
   # 构建项目
   npm run build
   
   # 检查不应存在 dist/server/public 目录
   ls -la dist/server/ | grep public
   
   # 启动服务
   npm run start:prod
   
   # 验证前端页面（应包含 Vue 应用的 div id="app"）
   curl http://localhost:3000/ | grep "div id=\"app\""
   
   # 验证API正常
   curl http://localhost:3000/api/health
   ```

4. **防火墙设置**
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 80
   sudo ufw allow 443
   
   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-port=80/tcp
   sudo firewall-cmd --permanent --add-port=443/tcp
   sudo firewall-cmd --reload
   ```

## 📊 监控和日志

### 检查服务状态

```bash
# systemd 服务
sudo systemctl status api-server

# Docker 容器
docker logs api-server

# PM2 进程管理
pm2 logs api-server
```

### 性能监控

```bash
# 检查端口连接
ss -tuln | grep -E ':(80|443)'

# 检查进程资源使用
top -p $(pgrep -f "node.*server")
```

---

**注意**: 在生产环境中使用标准端口时，请确保：
1. 有适当的安全措施（防火墙、SSL证书等）
2. 定期更新和维护
3. 监控服务运行状态
4. 备份重要数据

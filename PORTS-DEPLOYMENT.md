# 标准端口部署指南

## 🚀 端口配置说明

本项目支持灵活的端口配置，既可以在开发环境使用非特权端口，也可以在生产环境使用标准端口（80/443）。

## 📋 端口配置选项

### 开发环境（默认）
- HTTP: 3000
- HTTPS: 3443

### 生产环境（标准端口）
- HTTP: 80
- HTTPS: 443

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

# 多服务路径路由部署指南

## 📖 概述

本文档介绍如何使用单个域名通过路径前缀来访问多个后端服务，避免申请多个子域名的复杂性。

## 🎯 方案优势

### ✅ 为什么使用路径路由？

1. **简化域名管理**
   - 只需一个域名：`st-shortrange.quecinfo.com`
   - 无需申请多个子域名
   - 统一的 SSL 证书管理

2. **用户友好的 URL**
   ```
   ❌ 不友好: https://st-shortrange.quecinfo.com:3000
   ❌ 不友好: https://st-shortrange.quecinfo.com:3001
   ✅ 友好:   https://st-shortrange.quecinfo.com/api/
   ✅ 友好:   https://st-shortrange.quecinfo.com/service1/
   ✅ 友好:   https://st-shortrange.quecinfo.com/grafana/
   ```

3. **安全性增强**
   - 统一的入口控制
   - 隐藏后端服务的真实端口
   - 便于实施认证和访问控制

4. **易于维护**
   - 集中配置管理
   - 便于添加/删除服务
   - 统一的日志和监控

## 🏗️ 架构设计

```
客户端请求
    ↓
域名: st-shortrange.quecinfo.com (HTTPS/443)
    ↓
Nginx 反向代理
    ├─ /api/        → 后端服务 (localhost:3000)
    ├─ /webdav/     → 后端服务 (localhost:3000)
    ├─ /service1/   → 服务1 (localhost:3001)
    ├─ /service2/   → 服务2 (localhost:3002)
    ├─ /grafana/    → Grafana (localhost:3003)
    └─ /           → 前端应用 (localhost:3000)
```

## 📋 使用示例

### 当前配置的服务路径

| 路径 | 后端服务 | 用途 | 示例 URL |
|------|---------|------|----------|
| `/api/` | localhost:3000 | 主 API 服务 | `https://st-shortrange.quecinfo.com/api/health` |
| `/webdav/` | localhost:3000 | WebDAV 文件服务 | `https://st-shortrange.quecinfo.com/webdav/` |
| `/` | localhost:3000 | Vue 前端应用 | `https://st-shortrange.quecinfo.com/` |

### 如何添加新服务

假设你有一个新的服务运行在 `localhost:3001`，你想通过 `https://st-shortrange.quecinfo.com/service1/` 访问：

#### 1. 在 Nginx 配置中添加 upstream

```nginx
# 在 http 块中添加
upstream service1 {
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 16;
}
```

#### 2. 添加 location 块

```nginx
# 在 server 块中添加（HTTPS 443）
location /service1/ {
    # 保留路径前缀
    proxy_pass http://service1;
    
    # 或者去掉路径前缀（注意末尾斜杠）
    # proxy_pass http://service1/;
    
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Prefix /service1;
    
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    proxy_connect_timeout 10s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

#### 3. 重载 Nginx 配置

```bash
# 测试配置是否正确
sudo nginx -t

# 重载配置（不中断服务）
sudo nginx -s reload
```

## 🔧 路径传递策略

### 策略 1: 保留路径前缀（推荐）

```nginx
location /service1/ {
    proxy_pass http://service1;
}
```

**效果**：
- 前端请求：`/service1/api/users`
- 后端收到：`/service1/api/users`

**适用场景**：
- 后端服务支持 base path 配置
- 多个服务可能有相同的路由路径

### 策略 2: 去掉路径前缀

```nginx
location /service1/ {
    proxy_pass http://service1/;  # 注意末尾的斜杠
}
```

**效果**：
- 前端请求：`/service1/api/users`
- 后端收到：`/api/users`

**适用场景**：
- 后端服务不支持 base path
- 不想修改后端代码

### 策略 3: 路径重写

```nginx
location /old-service/ {
    rewrite ^/old-service/(.*) /new-path/$1 break;
    proxy_pass http://service1;
}
```

**效果**：
- 前端请求：`/old-service/api/users`
- 后端收到：`/new-path/api/users`

## 🚀 部署步骤

### 步骤 1: 备份现有配置

```bash
# 备份当前的 Nginx 配置
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
```

### 步骤 2: 部署新配置

```bash
# 复制新配置文件
sudo cp /usr/api_server/config/nginx-multi-service.conf /etc/nginx/nginx.conf

# 或者使用 sites-available/sites-enabled 方式（推荐）
sudo cp /usr/api_server/config/nginx-multi-service.conf /etc/nginx/sites-available/st-shortrange

# 创建软链接
sudo ln -sf /etc/nginx/sites-available/st-shortrange /etc/nginx/sites-enabled/

# 删除默认配置（如果存在）
sudo rm -f /etc/nginx/sites-enabled/default
```

### 步骤 3: 修改配置中的证书路径

```bash
# 编辑配置文件
sudo nano /etc/nginx/nginx.conf

# 或
sudo nano /etc/nginx/sites-available/st-shortrange
```

找到 SSL 证书配置部分，修改为你的实际证书路径：

```nginx
# 如果使用项目自带的证书
ssl_certificate /usr/api_server/server/certs/server.crt;
ssl_certificate_key /usr/api_server/server/certs/server.key;

# 如果使用 Let's Encrypt 证书
# ssl_certificate /etc/letsencrypt/live/st-shortrange.quecinfo.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/st-shortrange.quecinfo.com/privkey.pem;
```

### 步骤 4: 测试配置

```bash
# 测试 Nginx 配置语法
sudo nginx -t

# 应该看到类似输出：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 步骤 5: 重启 Nginx

```bash
# 平滑重载（推荐，不中断服务）
sudo nginx -s reload

# 或完全重启
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

### 步骤 6: 验证服务

```bash
# 测试 HTTP 自动重定向到 HTTPS
curl -I http://st-shortrange.quecinfo.com
# 应该返回 301 重定向

# 测试 HTTPS 主页
curl -k https://st-shortrange.quecinfo.com/

# 测试 API 端点
curl -k https://st-shortrange.quecinfo.com/api/health

# 测试 WebDAV
curl -k https://st-shortrange.quecinfo.com/webdav/
```

## 🎨 前端应用适配

如果你的前端应用需要访问不同的服务，需要相应调整：

### Vue/React 应用配置

```javascript
// config.js 或 .env 文件
const API_BASE_URL = 'https://st-shortrange.quecinfo.com/api';
const SERVICE1_BASE_URL = 'https://st-shortrange.quecinfo.com/service1';
const WEBDAV_BASE_URL = 'https://st-shortrange.quecinfo.com/webdav';

// 使用示例
fetch(`${API_BASE_URL}/users`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### Axios 配置

```javascript
import axios from 'axios';

// 主 API 实例
const apiClient = axios.create({
  baseURL: 'https://st-shortrange.quecinfo.com/api',
  timeout: 10000,
});

// 其他服务实例
const service1Client = axios.create({
  baseURL: 'https://st-shortrange.quecinfo.com/service1',
  timeout: 10000,
});
```

## 🔒 SSL 证书配置

### 选项 1: 使用 Let's Encrypt（推荐用于生产）

```bash
# 安装 certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 获取证书（nginx 插件会自动配置）
sudo certbot --nginx -d st-shortrange.quecinfo.com

# 或者使用 standalone 模式（需要临时停止 nginx）
sudo systemctl stop nginx
sudo certbot certonly --standalone -d st-shortrange.quecinfo.com
sudo systemctl start nginx

# 自动续期（certbot 会自动添加 cron job）
sudo certbot renew --dry-run
```

### 选项 2: 使用自签名证书（开发/测试环境）

```bash
# 创建证书目录
sudo mkdir -p /usr/api_server/server/certs

# 生成自签名证书
sudo openssl req -x509 -nodes -days 365 \
  -newkey rsa:4096 \
  -keyout /usr/api_server/server/certs/server.key \
  -out /usr/api_server/server/certs/server.crt \
  -subj "/C=CN/ST=State/L=City/O=Organization/CN=st-shortrange.quecinfo.com"

# 设置权限
sudo chmod 600 /usr/api_server/server/certs/server.key
sudo chmod 644 /usr/api_server/server/certs/server.crt
```

## 📊 监控和日志

### 查看日志

```bash
# 实时查看访问日志
sudo tail -f /var/log/nginx/st-shortrange_ssl_access.log

# 实时查看错误日志
sudo tail -f /var/log/nginx/st-shortrange_ssl_error.log

# 查看特定路径的请求
sudo grep "/service1/" /var/log/nginx/st-shortrange_ssl_access.log

# 查看错误状态码
sudo grep " 404 " /var/log/nginx/st-shortrange_ssl_error.log
sudo grep " 502 " /var/log/nginx/st-shortrange_ssl_error.log
```

### 性能监控

```bash
# 查看 Nginx 进程
ps aux | grep nginx

# 查看连接统计
sudo netstat -tulpn | grep nginx

# 查看活动连接
echo "show stats" | sudo socat unix-connect:/var/run/nginx.sock stdio
```

## 🐛 常见问题排查

### 问题 1: 404 Not Found

**症状**：访问 `https://st-shortrange.quecinfo.com/service1/` 返回 404

**排查步骤**：

```bash
# 1. 检查后端服务是否运行
sudo netstat -tulpn | grep 3001

# 2. 检查 Nginx 配置是否正确
sudo nginx -t

# 3. 检查日志
sudo tail -f /var/log/nginx/st-shortrange_ssl_error.log

# 4. 测试后端服务直接访问
curl http://localhost:3001/

# 5. 检查 upstream 配置
grep -A 5 "upstream service1" /etc/nginx/nginx.conf
```

**解决方案**：
- 确保后端服务正在运行
- 检查 upstream 配置的端口是否正确
- 确认 location 配置的路径匹配规则

### 问题 2: 502 Bad Gateway

**症状**：访问服务返回 502 错误

**原因**：
- 后端服务未启动
- 后端服务崩溃
- 端口配置错误
- 防火墙阻止

**排查步骤**：

```bash
# 1. 检查后端服务状态
systemctl status your-service

# 2. 尝试直接访问后端
curl http://localhost:3000/api/health

# 3. 查看 Nginx 错误日志
sudo tail -50 /var/log/nginx/st-shortrange_ssl_error.log

# 4. 检查 SELinux（如果启用）
sudo getenforce
sudo ausearch -m avc -ts recent
```

**解决方案**：
- 启动后端服务
- 检查后端日志找出崩溃原因
- 修正端口配置
- 配置防火墙/SELinux 规则

### 问题 3: WebSocket 连接失败

**症状**：WebSocket 连接无法建立

**解决方案**：确保配置了 WebSocket 支持

```nginx
location /api/ {
    proxy_pass http://api_server;
    
    # 必须配置这些
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 问题 4: 静态资源 404

**症状**：前端应用加载，但 CSS/JS 文件 404

**原因**：前端应用的资源路径配置错误

**解决方案**：

1. 检查前端构建配置（Vue/React）

```javascript
// vite.config.js 或 vue.config.js
export default {
  base: '/',  // 确保是 '/' 而不是 '/app/' 等
}
```

2. 确保 Nginx 有静态资源匹配规则

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    proxy_pass http://api_server;
    # ... 其他配置
}
```

### 问题 5: CORS 跨域错误

**症状**：浏览器控制台显示 CORS 错误

**解决方案**：

1. 在后端服务中配置 CORS（推荐）

```javascript
// Express.js 示例
app.use(cors({
  origin: 'https://st-shortrange.quecinfo.com',
  credentials: true
}));
```

2. 或在 Nginx 中添加 CORS 头

```nginx
location /api/ {
    # ... 其他配置
    
    # CORS 配置
    add_header Access-Control-Allow-Origin "https://st-shortrange.quecinfo.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # 处理 OPTIONS 预检请求
    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

## 📝 最佳实践

### 1. 路径命名规范

```
✅ 推荐:
/api/           # API 服务
/admin/         # 管理后台
/grafana/       # 监控服务
/docs/          # 文档服务

❌ 不推荐:
/api-service/   # 太长
/s1/           # 不直观
/service_1/    # 使用下划线
```

### 2. 安全建议

```nginx
# 限制请求速率
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... 其他配置
}

# 隐藏敏感路径（管理接口等）
location /admin/ {
    # IP 白名单
    allow 10.0.0.0/8;
    allow 192.168.0.0/16;
    deny all;
    
    # 或使用 HTTP Basic Auth
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://api_server;
}
```

### 3. 性能优化

```nginx
# 启用缓存（针对特定内容）
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/public/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_cache_lock on;
    
    proxy_pass http://api_server;
}
```

### 4. 日志管理

```bash
# 定期轮转日志
sudo nano /etc/logrotate.d/nginx

# 添加配置
/var/log/nginx/st-shortrange*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

## 🔄 迁移现有服务

如果你已经有服务在运行，需要迁移到新的路径路由：

### 迁移步骤

1. **同时支持旧端口和新路径**（过渡期）

```nginx
# 保留旧的端口访问（临时）
server {
    listen 3000;
    server_name st-shortrange.quecinfo.com;
    
    location / {
        proxy_pass http://api_server;
    }
}

# 新的路径路由
server {
    listen 443 ssl;
    server_name st-shortrange.quecinfo.com;
    
    location /api/ {
        proxy_pass http://api_server;
    }
}
```

2. **通知用户更新 URL**

3. **监控旧端口访问量**

```bash
# 查看旧端口访问量
sudo grep ":3000" /var/log/nginx/access.log | wc -l
```

4. **逐步关闭旧端口**

## 📚 参考资料

- [Nginx 反向代理文档](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Nginx 路径重写](http://nginx.org/en/docs/http/ngx_http_rewrite_module.html)
- [Let's Encrypt 证书申请](https://letsencrypt.org/getting-started/)

## 💡 总结

使用路径路由方案的关键点：

1. ✅ **简单**: 只需要一个域名和一个 SSL 证书
2. ✅ **灵活**: 轻松添加/删除服务
3. ✅ **友好**: 用户无需记住端口号
4. ✅ **安全**: 统一的入口控制和加密
5. ✅ **标准**: 符合 RESTful API 和微服务架构最佳实践

---

**需要帮助？** 如有问题，请查看日志文件或联系系统管理员。

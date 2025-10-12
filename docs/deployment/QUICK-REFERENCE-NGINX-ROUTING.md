# 🚀 Nginx 路径路由快速参考

## 一分钟快速部署

```bash
# 1. 运行自动部署脚本
sudo /usr/api_server/scripts/deployment/deploy-nginx-routing.sh

# 2. 完成！现在可以通过以下地址访问：
# https://st-shortrange.quecinfo.com/          # 前端应用
# https://st-shortrange.quecinfo.com/api/      # API 服务
# https://st-shortrange.quecinfo.com/webdav/   # WebDAV
```

## 添加新服务（3步）

### 示例：添加一个运行在 3001 端口的服务

```bash
# 1. 编辑 Nginx 配置
sudo nano /etc/nginx/nginx.conf
```

在 `http` 块中添加 upstream：

```nginx
upstream my_service {
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 16;
}
```

在 `server` 块中添加 location（在 `location /` 之前）：

```nginx
location /myservice/ {
    proxy_pass http://my_service;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

```bash
# 2. 测试配置
sudo nginx -t

# 3. 重载 Nginx
sudo nginx -s reload
```

现在可以通过 `https://st-shortrange.quecinfo.com/myservice/` 访问！

## 常用命令

```bash
# 测试配置
sudo nginx -t

# 重载配置（不中断服务）
sudo nginx -s reload

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 实时查看访问日志
sudo tail -f /var/log/nginx/st-shortrange_ssl_access.log

# 实时查看错误日志
sudo tail -f /var/log/nginx/st-shortrange_ssl_error.log

# 查看特定服务的访问
sudo grep "/myservice/" /var/log/nginx/st-shortrange_ssl_access.log
```

## 路径传递对比

### 保留路径前缀（默认）

```nginx
location /myservice/ {
    proxy_pass http://my_service;  # 注意：末尾没有 /
}
```

- 外部: `https://domain.com/myservice/api/test`
- 后端: `http://localhost:3001/myservice/api/test`

### 去掉路径前缀

```nginx
location /myservice/ {
    proxy_pass http://my_service/;  # 注意：末尾有 /
}
```

- 外部: `https://domain.com/myservice/api/test`
- 后端: `http://localhost:3001/api/test`

## 故障排查

### 502 Bad Gateway

```bash
# 1. 检查后端服务是否运行
sudo netstat -tulpn | grep 3001

# 2. 查看错误日志
sudo tail -50 /var/log/nginx/st-shortrange_ssl_error.log

# 3. 测试后端服务
curl http://localhost:3001/
```

### 404 Not Found

```bash
# 1. 检查 location 配置
sudo grep -A 10 "location /myservice/" /etc/nginx/nginx.conf

# 2. 检查 upstream 配置
sudo grep -A 3 "upstream my_service" /etc/nginx/nginx.conf

# 3. 重载配置
sudo nginx -t && sudo nginx -s reload
```

### WebSocket 不工作

确保配置了这些头：

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

## 服务路径规划建议

| 路径 | 用途 | 示例 |
|------|------|------|
| `/api/` | 主 API 服务 | REST API |
| `/admin/` | 管理后台 | 管理界面 |
| `/grafana/` | 监控服务 | Grafana |
| `/prometheus/` | 指标收集 | Prometheus |
| `/docs/` | 文档服务 | API 文档 |
| `/static/` | 静态资源 | 图片、文件 |
| `/ws/` | WebSocket | 实时通信 |

## 安全加固

### IP 白名单

```nginx
location /admin/ {
    allow 10.0.0.0/8;
    allow 192.168.0.0/16;
    deny all;
    
    proxy_pass http://admin_service;
}
```

### HTTP Basic 认证

```bash
# 创建密码文件
sudo htpasswd -c /etc/nginx/.htpasswd admin

# 在 nginx 配置中添加
location /admin/ {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://admin_service;
}
```

### 请求速率限制

```nginx
# 在 http 块中定义
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在 location 块中使用
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://api_server;
}
```

## 性能优化

### 启用缓存

```nginx
# 在 http 块中定义缓存路径
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

# 在 location 块中使用
location /api/public/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout updating;
    
    proxy_pass http://api_server;
}
```

### 连接复用

```nginx
upstream api_server {
    server 127.0.0.1:3000;
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}

location /api/ {
    proxy_pass http://api_server;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
}
```

## Let's Encrypt 证书

```bash
# 1. 安装 certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. 获取证书（自动配置 nginx）
sudo certbot --nginx -d st-shortrange.quecinfo.com

# 3. 测试自动续期
sudo certbot renew --dry-run

# 4. 手动续期
sudo certbot renew
```

## 配置文件位置

```bash
主配置: /etc/nginx/nginx.conf
站点配置: /etc/nginx/sites-available/
已启用站点: /etc/nginx/sites-enabled/
日志目录: /var/log/nginx/
证书目录: /usr/api_server/server/certs/
```

## 更多资源

- 完整文档: `/usr/api_server/docs/deployment/MULTI-SERVICE-ROUTING.md`
- Nginx 配置: `/usr/api_server/config/nginx-multi-service.conf`
- 部署脚本: `/usr/api_server/scripts/deployment/deploy-nginx-routing.sh`
- Nginx 官方文档: http://nginx.org/en/docs/

---

**提示**: 修改配置后始终先测试再重载：`sudo nginx -t && sudo nginx -s reload`

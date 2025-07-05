# Nginx 反向代理部署指南

本文档介绍如何使用 Nginx 作为反向代理，将 80/443 端口的请求转发到运行在 3000 端口的 API 服务器。

## 错误页面配置

### 统一错误处理

所有HTTP错误码（404、500、502、503、504）都会重定向到维护页面：

- **维护页面位置**: `/var/www/html/errPage/maintenance.html`
- **支持的错误码**: 404, 500, 502, 503, 504
- **特殊功能**: 自动重试、健康检查集成

### 维护页面特性

1. **美观界面**: 现代化的设计和动画效果
2. **自动重试**: 每30秒检查服务状态
3. **智能检测**: 当服务恢复时自动跳转
4. **响应式设计**: 支持移动设备
5. **用户友好**: 清晰的错误信息和操作指引

### 自定义维护页面

修改 `maintenance.html` 文件来自定义维护页面：

```bash
# 编辑维护页面模板
vim maintenance.html

# 重新部署
sudo ./nginx-deploy.sh deploy
```

## 配置概述

- **后端服务**: 运行在 3000 端口
- **Nginx 代理**: 监听 80 端口 (HTTP) 和 443 端口 (HTTPS)
- **访问方式**: 
  - HTTP: `http://localhost` (80端口)
  - HTTPS: `https://localhost` (443端口，需要SSL证书)
  - 直接访问: `http://localhost:3000` (仍然可用)

## 快速部署

### 1. 确保 API 服务器运行

```bash
# 构建项目
npm run build

# 启动API服务器在3000端口
npm run start:prod
```

### 2. 生成SSL证书 (可选)

```bash
# 生成自签名SSL证书
./nginx-deploy.sh cert
```

### 3. 部署 Nginx 配置

```bash
# 测试配置
./nginx-deploy.sh test

# 部署配置并重启服务
sudo ./nginx-deploy.sh deploy
```

### 4. 验证部署

```bash
# 检查服务状态
./nginx-deploy.sh status

# 测试访问
curl http://localhost/health
curl http://localhost/api/users
curl -k https://localhost/health  # HTTPS (如果配置了证书)
```

## 详细配置说明

### Nginx 配置特性

1. **负载均衡**: 上游服务器配置，支持故障转移
2. **静态文件优化**: 缓存策略、Gzip压缩
3. **安全头**: XSS防护、CSRF防护等
4. **WebSocket支持**: 完整的WebSocket代理
5. **SSL/TLS**: 现代化的SSL配置
6. **日志记录**: 详细的访问和错误日志

### 路由配置

| 路径 | 描述 | 缓存策略 |
|------|------|----------|
| `/` | 主应用 (SPA) | 无缓存 |
| `/api/*` | API接口 | 无缓存 |
| `/webdav/*` | WebDAV服务 | 无缓存 |
| `/health` | 健康检查 | 无缓存 |
| `静态资源` | CSS/JS/图片等 | 1年缓存 |
| `/favicon.ico` | 网站图标 | 7天缓存 |

### 环境变量配置

#### `.env.production` 关键配置

```bash
# 后端监听端口 (nginx代理目标)
HTTP_PORT=3000
HTTPS_PORT=3443

# API配置 (nginx代理后的访问地址)
API_BASE_URL=http://localhost
CORS_ORIGIN=http://localhost
```

#### 前端API自动适配

前端会根据访问端口自动选择API地址：

- `5173/8080` → `http://localhost:3000` (开发环境)
- `3000` → `http://localhost:3000` (直接访问)
- `80/443/无端口` → `http://localhost` (nginx代理)

## 部署脚本说明

### `nginx-deploy.sh` 命令

```bash
# 测试nginx配置
./nginx-deploy.sh test

# 部署nginx配置
./nginx-deploy.sh deploy

# 生成SSL证书
./nginx-deploy.sh cert

# 检查状态
./nginx-deploy.sh status

# 重启nginx
./nginx-deploy.sh restart

# 显示帮助
./nginx-deploy.sh help
```

### 脚本功能

1. **配置测试**: 验证nginx配置语法
2. **自动备份**: 部署前备份现有配置
3. **目录创建**: 创建必要的日志目录
4. **SSL证书**: 生成自签名证书
5. **服务管理**: 重启和状态检查
6. **连通性测试**: 验证代理功能

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查3000端口
   lsof -i :3000
   
   # 检查80端口
   sudo lsof -i :80
   ```

2. **Nginx配置错误**
   ```bash
   # 测试配置
   sudo nginx -t
   
   # 查看错误日志
   sudo tail -f /var/log/nginx/error.log
   ```

3. **SSL证书问题**
   ```bash
   # 检查证书文件
   ls -la server/certs/
   
   # 重新生成证书
   ./nginx-deploy.sh cert
   ```

4. **API代理失败**
   ```bash
   # 检查API服务器
   curl http://localhost:3000/health
   
   # 检查nginx代理
   curl http://localhost/health
   ```

### 日志位置

- **Nginx访问日志**: `/var/log/nginx/api_server_access.log`
- **Nginx错误日志**: `/var/log/nginx/api_server_error.log`
- **SSL访问日志**: `/var/log/nginx/api_server_ssl_access.log`
- **SSL错误日志**: `/var/log/nginx/api_server_ssl_error.log`

### 性能优化

1. **启用Gzip压缩**: 已在配置中启用
2. **静态文件缓存**: 设置了合理的缓存策略
3. **Keep-Alive连接**: 配置了连接池
4. **HTTP/2支持**: HTTPS使用HTTP/2协议

## 安全考虑

1. **SSL配置**: 使用现代化的TLS设置
2. **安全头**: 配置了XSS、CSRF等防护
3. **CORS策略**: 适当的跨域设置
4. **文件上传限制**: 10MB上传限制
5. **超时设置**: 合理的超时时间

## 生产环境建议

1. **使用真实SSL证书**: 替换自签名证书
2. **配置域名**: 替换localhost为实际域名
3. **启用HSTS**: 取消HSTS配置的注释
4. **监控日志**: 设置日志轮转和监控
5. **防火墙配置**: 只开放必要端口

## 扩展配置

### 多域名支持

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    # 配置内容...
}
```

### 负载均衡

```nginx
upstream api_server {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```

### 缓存服务器

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

location /api/static/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 1h;
    # 其他配置...
}
```

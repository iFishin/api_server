# 已部署服务配置说明

## 📋 当前部署的服务列表

| 服务名称 | 访问路径 | 后端端口 | 说明 |
|---------|---------|---------|------|
| 主 API 服务 | `/api/` | 3000 | RESTful API 接口 |
| WebDAV | `/webdav/` | 3000 | 文件管理服务 |
| 青龙面板 | `/qinglong/` | 5700 | 定时任务管理平台 |
| 1Panel | `/1panel/` | 8080 | 服务器管理面板 |
| OpenList | `/openlist/` | 9090 | 列表管理服务 |
| 前端应用 | `/` | 3000 | Vue SPA 应用 |

## 🌐 访问地址

### 主域名
```
https://st-shortrange.quecinfo.com
```

### 各服务访问地址

#### 1. 主 API 服务
```
https://st-shortrange.quecinfo.com/api/
```
- **功能**: RESTful API 接口
- **健康检查**: `https://st-shortrange.quecinfo.com/api/health`
- **文档**: 查看 API 文档

#### 2. WebDAV 文件服务
```
https://st-shortrange.quecinfo.com/webdav/
```
- **功能**: 文件上传、下载、管理
- **支持**: WebDAV 协议
- **客户端**: 支持各种 WebDAV 客户端

#### 3. 青龙面板 (QingLong)
```
https://st-shortrange.quecinfo.com/qinglong/
```
- **功能**: 定时任务管理、脚本调度
- **后端端口**: 5700
- **特性**: 
  - 支持多种脚本语言
  - Web 界面管理
  - 定时任务调度
  - 日志查看

#### 4. 1Panel 管理面板
```
https://st-shortrange.quecinfo.com/1panel/
```
- **功能**: 服务器管理、运维工具
- **后端端口**: 8080
- **特性**:
  - 系统监控
  - 应用管理
  - 文件管理
  - 数据库管理

#### 5. OpenList 服务
```
https://st-shortrange.quecinfo.com/openlist/
```
- **功能**: 列表管理服务
- **后端端口**: 9090
- **特性**:
  - 数据管理
  - 列表操作
  - API 接口

#### 6. 前端应用
```
https://st-shortrange.quecinfo.com/
```
- **功能**: Vue SPA 单页应用
- **特性**: 
  - 无限导航画布
  - API 测试工具
  - 响应式设计

## 🔧 服务管理

### 检查服务状态

```bash
# 检查青龙面板
curl -I http://localhost:5700
sudo netstat -tulpn | grep 5700

# 检查 1Panel
curl -I http://localhost:8080
sudo netstat -tulpn | grep 8080

# 检查 OpenList
curl -I http://localhost:9090
sudo netstat -tulpn | grep 9090

# 检查主 API 服务
curl -I http://localhost:3000
sudo netstat -tulpn | grep 3000
```

### 启动服务

```bash
# 青龙面板（示例，根据实际安装方式调整）
docker start qinglong
# 或
systemctl start qinglong

# 1Panel
systemctl start 1panel

# OpenList（根据实际情况）
systemctl start openlist
# 或
cd /path/to/openlist && npm start

# 主 API 服务
cd /usr/api_server && npm run start:prod
```

### 停止服务

```bash
# 青龙面板
docker stop qinglong
# 或
systemctl stop qinglong

# 1Panel
systemctl stop 1panel

# OpenList
systemctl stop openlist

# 主 API 服务
pkill -f "node.*server.js"
```

### 重启服务

```bash
# 青龙面板
docker restart qinglong
# 或
systemctl restart qinglong

# 1Panel
systemctl restart 1panel

# OpenList
systemctl restart openlist

# 主 API 服务
cd /usr/api_server && npm run start:prod
```

## 🔍 日志查看

### Nginx 日志

```bash
# 访问日志（查看所有服务的访问情况）
sudo tail -f /var/log/nginx/st-shortrange_ssl_access.log

# 错误日志
sudo tail -f /var/log/nginx/st-shortrange_ssl_error.log

# 查看特定服务的访问
sudo grep "/qinglong/" /var/log/nginx/st-shortrange_ssl_access.log
sudo grep "/1panel/" /var/log/nginx/st-shortrange_ssl_access.log
sudo grep "/openlist/" /var/log/nginx/st-shortrange_ssl_access.log
```

### 服务日志

```bash
# 青龙面板日志
docker logs -f qinglong
# 或
journalctl -u qinglong -f

# 1Panel 日志
journalctl -u 1panel -f

# OpenList 日志
journalctl -u openlist -f
# 或根据实际位置
tail -f /path/to/openlist/logs/app.log

# 主 API 服务日志
tail -f /usr/api_server/logs/server.log
```

## 🐛 故障排查

### 502 Bad Gateway

如果访问某个服务返回 502 错误：

```bash
# 1. 检查后端服务是否运行
sudo netstat -tulpn | grep [端口号]

# 2. 测试后端服务直接访问
curl http://localhost:[端口号]

# 3. 查看 Nginx 错误日志
sudo tail -50 /var/log/nginx/st-shortrange_ssl_error.log

# 4. 检查服务状态
systemctl status [服务名]
docker ps | grep [服务名]
```

### 404 Not Found

如果访问返回 404：

```bash
# 1. 检查 Nginx 配置
sudo nginx -t

# 2. 查看 location 配置
sudo grep -A 15 "location /qinglong/" /etc/nginx/nginx.conf

# 3. 重载 Nginx
sudo nginx -s reload
```

### 服务启动失败

```bash
# 查看详细错误信息
journalctl -xe

# 查看服务状态
systemctl status [服务名]

# 检查端口占用
sudo lsof -i :[端口号]
```

## ⚙️ 服务特定配置

### 青龙面板配置

如果青龙面板需要配置 base path：

1. 编辑青龙配置文件
2. 设置 `BASE_PATH=/qinglong`
3. 重启服务

### 1Panel 配置

1Panel 通常支持反向代理，确保：
- 后端正确响应代理请求
- WebSocket 连接正常

### OpenList 配置

根据 OpenList 的实际框架调整配置：
- 如果是 Node.js 应用，可能需要设置环境变量
- 如果有 base path 配置，设置为 `/openlist`

## 🔒 安全建议

### 1. 限制访问

如果某些服务只需内网访问，可以添加 IP 白名单：

```nginx
location /qinglong/ {
    # IP 白名单
    allow 10.0.0.0/8;
    allow 192.168.0.0/16;
    deny all;
    
    proxy_pass http://qinglong/;
    # ... 其他配置
}
```

### 2. 添加认证

为管理面板添加 HTTP Basic 认证：

```bash
# 创建密码文件
sudo htpasswd -c /etc/nginx/.htpasswd admin

# 在 Nginx 配置中添加
location /1panel/ {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://onepanel/;
    # ... 其他配置
}
```

### 3. 速率限制

防止暴力破解和 DDoS 攻击：

```nginx
# 在 http 块中定义
limit_req_zone $binary_remote_addr zone=admin_limit:10m rate=5r/s;

# 在 location 块中使用
location /qinglong/ {
    limit_req zone=admin_limit burst=10 nodelay;
    proxy_pass http://qinglong/;
}
```

## 📊 性能优化

### 启用缓存

对于静态资源：

```nginx
location ~* ^/(qinglong|1panel|openlist)/.+\.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    proxy_pass http://api_server;
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

### 连接池优化

在 upstream 配置中：

```nginx
upstream qinglong {
    server 127.0.0.1:5700 max_fails=3 fail_timeout=30s;
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}
```

## 🔄 更新和维护

### 更新 Nginx 配置

```bash
# 1. 备份现有配置
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# 2. 编辑配置
sudo nano /etc/nginx/nginx.conf

# 3. 测试配置
sudo nginx -t

# 4. 重载配置
sudo nginx -s reload
```

### 添加新服务

参考 `/usr/api_server/docs/deployment/QUICK-REFERENCE-NGINX-ROUTING.md` 中的步骤

### 删除服务

1. 从 Nginx 配置中删除对应的 upstream 和 location
2. 测试并重载配置
3. 停止并删除后端服务

## 📞 支持和文档

- **完整部署文档**: `/usr/api_server/docs/deployment/MULTI-SERVICE-ROUTING.md`
- **快速参考**: `/usr/api_server/docs/deployment/QUICK-REFERENCE-NGINX-ROUTING.md`
- **架构图**: `/usr/api_server/docs/deployment/ARCHITECTURE-DIAGRAM.txt`
- **Nginx 配置**: `/usr/api_server/config/nginx-multi-service.conf`

## 🎯 快速测试

部署完成后，运行以下命令测试所有服务：

```bash
#!/bin/bash

DOMAIN="st-shortrange.quecinfo.com"

echo "测试所有服务..."
echo ""

# 测试主页
echo "1. 测试主页:"
curl -k -I https://${DOMAIN}/ | head -1

# 测试 API
echo "2. 测试 API:"
curl -k https://${DOMAIN}/api/health

# 测试青龙
echo "3. 测试青龙面板:"
curl -k -I https://${DOMAIN}/qinglong/ | head -1

# 测试 1Panel
echo "4. 测试 1Panel:"
curl -k -I https://${DOMAIN}/1panel/ | head -1

# 测试 OpenList
echo "5. 测试 OpenList:"
curl -k -I https://${DOMAIN}/openlist/ | head -1

echo ""
echo "测试完成！"
```

保存为 `test-services.sh` 并运行：

```bash
chmod +x test-services.sh
./test-services.sh
```

---

**最后更新**: 2025年10月12日

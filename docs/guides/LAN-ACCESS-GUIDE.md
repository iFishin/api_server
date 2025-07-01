# 局域网访问故障排查指南

## 🔍 快速检查清单

### 1. 确认服务器状态
```bash
# 检查服务是否运行
curl -s "http://localhost:3000/api/health"

# 检查端口监听状态
lsof -i :3000

# 确认监听地址（应该显示 0.0.0.0:3000）
netstat -tlnp | grep :3000
```

### 2. 获取服务器IP地址
```bash
# Linux/macOS 获取局域网IP
ip addr show | grep -E "inet [0-9]" | grep -v "127.0.0.1"
# 或者
hostname -I

# Windows 获取局域网IP
ipconfig | findstr "IPv4"
```

### 3. 防火墙检查
```bash
# Ubuntu/Debian - 检查UFW
sudo ufw status

# 如果UFW活动且阻止端口3000，允许端口访问：
sudo ufw allow 3000

# 检查iptables规则
sudo iptables -L INPUT

# CentOS/RHEL - 检查firewalld
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

### 4. 网络连通性测试
```bash
# 在服务器上测试局域网访问
curl -s "http://[局域网IP]:3000/api/health"

# 从其他设备ping服务器
ping [服务器IP]

# 检查端口是否可达（从其他设备）
telnet [服务器IP] 3000
# 或者
nc -zv [服务器IP] 3000
```

## 🚀 完整启动流程

### 步骤1：构建项目
```bash
cd /usr/api_server
npm run build
```

### 步骤2：启动生产服务器
```bash
npm run start:prod
```

### 步骤3：验证本地访问
```bash
curl "http://localhost:3000/api/health"
curl "http://localhost:3000/" | head -5
```

### 步骤4：获取并测试局域网IP
```bash
# 获取IP（示例：10.55.131.77）
MY_IP=$(hostname -I | awk '{print $1}')
echo "服务器局域网IP: $MY_IP"

# 测试局域网访问
curl "http://$MY_IP:3000/api/health"
curl "http://$MY_IP:3000/" | head -5
```

## 🌐 客户端访问测试

### 从其他设备访问
1. **前端页面**: http://[服务器IP]:3000
2. **API接口**: http://[服务器IP]:3000/api/health
3. **WebDAV**: http://[服务器IP]:3000/webdav/

### 浏览器控制台测试
```javascript
// 在浏览器控制台中执行
fetch('http://[服务器IP]:3000/api/health')
  .then(response => response.json())
  .then(data => console.log('✅ API访问成功:', data))
  .catch(error => console.log('❌ API访问失败:', error));
```

## 🛠️ 常见问题解决

### 问题1：Connection refused
**原因**: 服务未启动或端口错误
**解决**: 
```bash
lsof -i :3000  # 检查端口占用
npm run start:prod  # 重新启动服务
```

### 问题2：No route to host
**原因**: 防火墙阻止或网络路由问题
**解决**:
```bash
sudo ufw allow 3000  # 开放端口
ping [服务器IP]  # 检查网络连通性
```

### 问题3：CORS错误
**原因**: 跨域策略限制
**解决**: 已配置支持私有网络IP段，检查console.log输出

### 问题4：404错误
**原因**: 静态文件路径配置错误
**解决**: 确保dist目录完整，重新构建项目

## 📊 服务端口说明

| 服务 | 端口 | 协议 | 用途 |
|------|------|------|------|
| 主服务 | 3000 | HTTP | 前端页面 + API |
| HTTPS | 3443 | HTTPS | 安全连接（如有证书）|
| MQTT | 1883 | TCP | MQTT消息代理 |
| MQTTS | 8883 | TCP | 安全MQTT |
| TCP服务 | 9001 | TCP | 自定义TCP服务 |
| UDP服务 | 9000 | UDP | 自定义UDP服务 |

## 🔧 高级配置

### 标准端口部署（需要管理员权限）
```bash
# 使用标准HTTP端口80
sudo npm run start:80

# 检查权限问题
sudo netstat -tlnp | grep :80
```

### 网络安全配置
```bash
# 只允许特定IP段访问（可选）
sudo iptables -A INPUT -p tcp --dport 3000 -s 192.168.0.0/16 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j DROP
```

## 📝 成功访问标志

当一切正常时，你应该看到：
- ✅ 本地访问：http://localhost:3000 显示Vue应用界面
- ✅ 局域网访问：http://[IP]:3000 显示相同界面
- ✅ API响应：`{"status":"OK","timestamp":"...","environment":"production"}`
- ✅ 无CORS错误：浏览器控制台无跨域错误信息

## 🆘 如果仍然无法访问

1. **重启网络服务**：
   ```bash
   sudo systemctl restart networking
   ```

2. **检查SELinux**（CentOS/RHEL）：
   ```bash
   getenforce  # 如果是Enforcing，可能需要配置策略
   ```

3. **检查Docker网络**（如果使用Docker）：
   ```bash
   docker network ls
   ```

4. **查看详细日志**：
   ```bash
   # 在服务器终端查看实时日志
   npm run start:prod
   ```

5. **使用网络抓包**：
   ```bash
   sudo tcpdump -i any port 3000
   ```

---

💡 **提示**: 如果在公司或学校网络中，可能存在网络策略限制，需要联系网络管理员。

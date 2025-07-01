# 🚀 部署文档

本文档详细介绍了如何部署 API_Server 到各种环境。

## 📋 部署选项

1. [本地部署](#本地部署)
2. [Docker部署](#docker部署)
3. [云平台部署](#云平台部署)
4. [Kubernetes部署](#kubernetes部署)

## 🏠 本地部署

### 系统要求

- Node.js 18+
- npm 8+
- 至少 2GB RAM
- 10GB 可用磁盘空间

### 部署步骤

1. **下载发布包**
   ```bash
   # 从GitHub Releases下载
   wget https://github.com/你的用户名/api_server/releases/latest/download/api-server-latest.tar.gz
   tar -xzf api-server-latest.tar.gz
   cd api-server
   ```

2. **安装依赖**
   ```bash
   npm install --production
   ```

3. **配置环境**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   vim .env
   ```

4. **启动服务**
   ```bash
   npm start
   ```

5. **设置开机自启** (使用 systemd)
   ```bash
   sudo tee /etc/systemd/system/api-server.service > /dev/null <<EOF
   [Unit]
   Description=API Server
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/api-server
   ExecStart=/usr/bin/node server/server.js
   Restart=always
   RestartSec=10
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl enable api-server
   sudo systemctl start api-server
   ```

## 🐳 Docker部署

### 单容器部署

```bash
# 构建镜像
docker build -t api-server .

# 运行容器
docker run -d \
  --name api-server \
  -p 3000:3000 \
  -v $(pwd)/data:/app/database.db \
  -v $(pwd)/uploads:/app/server/uploads \
  --restart unless-stopped \
  api-server
```

### Docker Compose部署（推荐）

```bash
# 启动服务栈
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 配置文件说明

```yaml
# docker-compose.yml
version: '3.8'

services:
  api-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
      - ./uploads:/app/server/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api-server
    restart: unless-stopped
```

## ☁️ 云平台部署

### AWS部署

#### 使用 EC2

1. **创建EC2实例**
   ```bash
   # 选择 Ubuntu 20.04 LTS
   # 实例类型: t3.small 或更高
   # 安全组: 开放 22, 80, 443, 3000 端口
   ```

2. **安装Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu
   ```

3. **部署应用**
   ```bash
   git clone https://github.com/你的用户名/api_server.git
   cd api_server
   docker-compose up -d
   ```

#### 使用 ECS (Fargate)

```json
{
  "family": "api-server",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::账户ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api-server",
      "image": "ghcr.io/你的用户名/api_server:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/api-server",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

#### 使用 Cloud Run

```bash
# 构建并推送镜像
gcloud builds submit --tag gcr.io/PROJECT_ID/api-server

# 部署到 Cloud Run
gcloud run deploy api-server \
  --image gcr.io/PROJECT_ID/api-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1
```

### Microsoft Azure

#### 使用 Container Instances

```bash
# 创建资源组
az group create --name api-server-rg --location eastus

# 部署容器
az container create \
  --resource-group api-server-rg \
  --name api-server \
  --image ghcr.io/你的用户名/api_server:latest \
  --dns-name-label api-server-unique \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

## ☸️ Kubernetes部署

### 部署清单

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: api-server

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api-server
        image: ghcr.io/你的用户名/api_server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-server-service
  namespace: api-server
spec:
  selector:
    app: api-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-server-ingress
  namespace: api-server
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: api-server-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-server-service
            port:
              number: 80
```

### 部署步骤

```bash
# 应用配置
kubectl apply -f k8s/

# 查看状态
kubectl get pods -n api-server

# 查看日志
kubectl logs -f deployment/api-server -n api-server

# 扩缩容
kubectl scale deployment api-server --replicas=5 -n api-server
```

## 📊 监控和日志

### Prometheus监控

```yaml
# k8s/monitoring.yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: api-server-monitor
  namespace: api-server
spec:
  selector:
    matchLabels:
      app: api-server
  endpoints:
  - port: http
    path: /metrics
```

### 日志收集

```yaml
# 使用 Fluentd 收集日志
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  # ... Fluentd 配置
```

## 🔒 SSL/HTTPS配置

### 使用 Let's Encrypt

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 性能优化

### 应用层优化

1. **启用 Gzip 压缩**
2. **使用 CDN**
3. **数据库连接池**
4. **缓存策略**

### 系统层优化

```bash
# 调整 Node.js 内存限制
node --max-old-space-size=4096 server/server.js

# 使用 PM2 进程管理
npm install -g pm2
pm2 start ecosystem.config.js
```

### 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_created_at ON logs(created_at);

-- 定期清理日志
DELETE FROM logs WHERE created_at < datetime('now', '-30 days');
```

## 🚨 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo kill -9 PID
   ```

2. **内存不足**
   ```bash
   free -h
   # 增加 swap 空间或升级内存
   ```

3. **磁盘空间不足**
   ```bash
   df -h
   # 清理日志文件
   sudo journalctl --vacuum-time=7d
   ```

### 日志分析

```bash
# 查看应用日志
tail -f logs/app.log

# 查看 Docker 日志
docker logs api-server

# 查看系统日志
sudo journalctl -u api-server -f
```

## 📈 扩展和集群

### 水平扩展

```bash
# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml api-server

# Kubernetes HPA
kubectl autoscale deployment api-server --cpu-percent=50 --min=1 --max=10
```

### 负载均衡

```nginx
upstream api_servers {
    server api-server-1:3000;
    server api-server-2:3000;
    server api-server-3:3000;
}

server {
    location / {
        proxy_pass http://api_servers;
    }
}
```

---

需要更多帮助？查看我们的 [FAQ](FAQ.md) 或 [提交问题](https://github.com/你的用户名/api_server/issues)。

#!/bin/bash

# API Server 生产环境启动脚本
set -e

PROJECT_ROOT="/usr/api_server"
DIST_DIR="$PROJECT_ROOT/dist"
PID_DIR="$PROJECT_ROOT/pids"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 启动 API Server 生产环境...${NC}"

# 创建 PID 目录
mkdir -p "$PID_DIR"

# 检查 dist 目录是否存在
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}❌ 错误: $DIST_DIR 目录不存在，请先运行 npm run build${NC}"
    exit 1
fi

# 停止现有服务
echo -e "${YELLOW}🛑 停止现有服务...${NC}"

# 停止 Node.js 服务
if [ -f "$PID_DIR/server.pid" ]; then
    PID=$(cat "$PID_DIR/server.pid")
    if kill -0 "$PID" 2>/dev/null; then
        echo "停止 Node.js 服务 (PID: $PID)"
        kill "$PID"
        sleep 2
    fi
    rm -f "$PID_DIR/server.pid"
fi

# 强制停止残留进程
pkill -f "node.*server/server.js" || true

# 检查并启动 Nginx
echo -e "${BLUE}🌐 检查 Nginx...${NC}"
if ! systemctl is-active --quiet nginx; then
    echo "启动 Nginx..."
    sudo systemctl start nginx
else
    echo "Nginx 已运行"
fi

# 复制 Nginx 配置（如果需要）
NGINX_CONFIG="$PROJECT_ROOT/config/nginx.conf"
if [ -f "$NGINX_CONFIG" ]; then
    echo -e "${YELLOW}📝 建议使用项目中的 Nginx 配置:${NC}"
    echo "sudo cp $NGINX_CONFIG /etc/nginx/sites-available/api-server"
    echo "sudo ln -sf /etc/nginx/sites-available/api-server /etc/nginx/sites-enabled/"
    echo "sudo nginx -t && sudo systemctl reload nginx"
fi

# 启动 Node.js 服务
echo -e "${GREEN}🟢 启动 Node.js 服务...${NC}"
cd "$PROJECT_ROOT"

# 设置环境变量
export NODE_ENV=production
export HTTP_PORT=3000
export HTTPS_PORT=3443

# 后台启动 Node.js 服务
nohup node dist/server/server.js > "$PROJECT_ROOT/logs/server.log" 2>&1 &
SERVER_PID=$!

# 保存 PID
echo "$SERVER_PID" > "$PID_DIR/server.pid"

# 等待服务启动
echo "等待服务启动..."
sleep 3

# 检查服务状态
if kill -0 "$SERVER_PID" 2>/dev/null; then
    echo -e "${GREEN}✅ Node.js 服务启动成功 (PID: $SERVER_PID)${NC}"
else
    echo -e "${RED}❌ Node.js 服务启动失败${NC}"
    exit 1
fi

# 测试服务
echo -e "${BLUE}🔍 测试服务...${NC}"
sleep 2

# 获取当前机器的IP地址
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "本机IP地址: $LOCAL_IP"

# 测试直接访问
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务 (localhost:3000) 正常${NC}"
else
    echo -e "${RED}❌ 后端服务 (localhost:3000) 异常${NC}"
fi

# 测试IP访问
if curl -s http://$LOCAL_IP:3000/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务 ($LOCAL_IP:3000) 正常${NC}"
else
    echo -e "${RED}❌ 后端服务 ($LOCAL_IP:3000) 异常${NC}"
fi

# 测试 Nginx 代理
if curl -s http://localhost/health > /dev/null; then
    echo -e "${GREEN}✅ Nginx 代理 (localhost:80) 正常${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx 代理可能需要配置${NC}"
fi

# 测试 Nginx IP 访问
if curl -s http://$LOCAL_IP/health > /dev/null; then
    echo -e "${GREEN}✅ Nginx 代理 ($LOCAL_IP:80) 正常${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx IP 访问可能需要配置${NC}"
fi

echo -e "${GREEN}🎉 启动完成！${NC}"
echo -e "${BLUE}📋 服务信息:${NC}"
echo "  - 前端访问: http://localhost 或 http://$LOCAL_IP"
echo "  - API 接口: http://localhost/api/ 或 http://$LOCAL_IP/api/"
echo "  - WebDAV: http://localhost/webdav/ 或 http://$LOCAL_IP/webdav/"
echo "  - 直接后端: http://localhost:3000 或 http://$LOCAL_IP:3000"
echo "  - HTTPS: https://localhost:3443 或 https://$LOCAL_IP:3443"
echo ""
echo -e "${YELLOW}🌐 局域网访问说明:${NC}"
echo "  - 使用 $LOCAL_IP 可从局域网其他设备访问"
echo "  - 确保防火墙允许 80, 3000, 3443 端口"
echo "  - 如果无法访问，请检查 Nginx 配置"
echo ""
echo -e "${BLUE}📝 管理命令:${NC}"
echo "  - 查看日志: tail -f $PROJECT_ROOT/logs/server.log"
echo "  - 停止服务: $PROJECT_ROOT/scripts/deployment/stop-production.sh"
echo "  - 重启服务: $PROJECT_ROOT/scripts/deployment/restart-production.sh"
echo "  - 配置局域网访问: $PROJECT_ROOT/scripts/deployment/configure-lan-access.sh"

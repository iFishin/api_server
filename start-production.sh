#!/bin/bash

# API_Server 生产环境启动脚本
# 用于在 80 端口启动服务

echo "🚀 正在启动 API_Server 生产环境..."

# 检查端口是否被占用
if lsof -i :80 >/dev/null 2>&1; then
    echo "⚠️  端口 80 已被占用，正在停止现有进程..."
    sudo pkill -f "node server/server.js"
    sleep 2
fi

# 检查 MQTT 端口
if lsof -i :1883 >/dev/null 2>&1; then
    echo "⚠️  MQTT 端口 1883 已被占用，正在停止现有进程..."
    sudo pkill -f ":1883"
    sleep 1
fi

# 进入构建目录
cd /usr/api_server/dist

# 启动服务器
echo "🌐 启动服务器在端口 80..."
sudo NODE_ENV=production HTTP_PORT=80 HTTPS_PORT=443 node server/server.js &

# 等待服务器启动
sleep 3

# 检查服务器状态
if curl -s http://localhost/api/health > /dev/null; then
    echo "✅ 服务器启动成功！"
    echo "📱 本地访问: http://localhost"
    echo "🌍 局域网访问: http://10.55.131.77"
    echo "🔧 API 健康检查: http://localhost/api/health"
    echo ""
    echo "🛑 停止服务器: sudo pkill -f 'node server/server.js'"
else
    echo "❌ 服务器启动失败，请检查日志"
fi

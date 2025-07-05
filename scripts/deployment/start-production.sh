#!/bin/bash

# API_Server 生产环境启动脚本
# 用于在 3000 端口启动服务（无需管理员权限）

echo "🚀 正在启动 API_Server 生产环境..."

# 检查端口是否被占用
if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用，正在停止现有进程..."
    pkill -f "node server/server.js"
    sleep 2
fi

# 检查 MQTT 端口
if lsof -i :1883 >/dev/null 2>&1; then
    echo "⚠️  MQTT 端口 1883 已被占用，正在停止现有进程..."
    pkill -f ":1883"
    sleep 1
fi

# 进入构建目录
cd /usr/api_server/dist

# 启动服务器
echo "🌐 启动服务器在端口 3000..."
NODE_ENV=production HTTP_PORT=3000 HTTPS_PORT=3443 node server/server.js &

# 等待服务器启动
sleep 3

# 检查服务器状态
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 服务器启动成功！"
    echo "📱 本地访问: http://localhost:3000"
    echo "🌍 局域网访问: http://10.55.131.77:3000"
    echo "🔧 API 健康检查: http://localhost:3000/api/health"
    echo ""
    echo "🛑 停止服务器: pkill -f 'node server/server.js'"
else
    echo "❌ 服务器启动失败，请检查日志"
fi

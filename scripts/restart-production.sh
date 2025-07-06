#!/bin/bash

# API Server 生产环境重启脚本
PROJECT_ROOT="/usr/api_server"

echo "🔄 重启 API Server..."

# 停止服务
"$PROJECT_ROOT/scripts/stop-production.sh"

# 等待完全停止
sleep 2

# 启动服务
"$PROJECT_ROOT/scripts/start-production.sh"

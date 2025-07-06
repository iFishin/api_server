#!/bin/bash

# API Server 生产环境停止脚本
set -e

PROJECT_ROOT="/usr/api_server"
PID_DIR="$PROJECT_ROOT/pids"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 停止 API Server 生产环境...${NC}"

# 停止 Node.js 服务
if [ -f "$PID_DIR/server.pid" ]; then
    PID=$(cat "$PID_DIR/server.pid")
    if kill -0 "$PID" 2>/dev/null; then
        echo "停止 Node.js 服务 (PID: $PID)"
        kill "$PID"
        
        # 等待进程退出
        for i in {1..10}; do
            if ! kill -0 "$PID" 2>/dev/null; then
                break
            fi
            echo "等待进程退出... ($i/10)"
            sleep 1
        done
        
        # 如果还在运行，强制终止
        if kill -0 "$PID" 2>/dev/null; then
            echo "强制终止进程..."
            kill -9 "$PID"
        fi
    fi
    rm -f "$PID_DIR/server.pid"
fi

# 强制停止残留进程
echo "清理残留进程..."
pkill -f "node.*server/server.js" || true

echo -e "${GREEN}✅ 服务已停止${NC}"

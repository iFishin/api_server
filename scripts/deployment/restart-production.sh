#!/bin/bash

# API Server 生产环境重启脚本
set -e

PROJECT_ROOT="/usr/api_server"
SCRIPT_DIR="$PROJECT_ROOT/scripts/deployment"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 重启 API Server 生产环境...${NC}"

# 检查脚本是否存在
if [ ! -f "$SCRIPT_DIR/stop-production.sh" ]; then
    echo -e "${RED}❌ 错误: 停止脚本不存在 $SCRIPT_DIR/stop-production.sh${NC}"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/start-production.sh" ]; then
    echo -e "${RED}❌ 错误: 启动脚本不存在 $SCRIPT_DIR/start-production.sh${NC}"
    exit 1
fi

# 确保脚本有执行权限
chmod +x "$SCRIPT_DIR/stop-production.sh"
chmod +x "$SCRIPT_DIR/start-production.sh"

# 步骤1: 停止服务
echo -e "${YELLOW}📍 步骤 1/2: 停止现有服务...${NC}"
if "$SCRIPT_DIR/stop-production.sh"; then
    echo -e "${GREEN}✅ 服务停止成功${NC}"
else
    echo -e "${RED}❌ 服务停止失败${NC}"
    exit 1
fi

# 等待一下确保完全停止
echo "等待服务完全停止..."
sleep 2

# 步骤2: 启动服务
echo -e "${YELLOW}📍 步骤 2/2: 启动服务...${NC}"
if "$SCRIPT_DIR/start-production.sh"; then
    echo -e "${GREEN}✅ 服务启动成功${NC}"
    echo -e "${GREEN}🎉 重启完成！${NC}"
else
    echo -e "${RED}❌ 服务启动失败${NC}"
    exit 1
fi

echo -e "${GREEN}🔄 重启脚本执行完成！${NC}"

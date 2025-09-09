#!/bin/bash

# API Server 生产环境重启脚本（带详细状态检查）
set -e

PROJECT_ROOT="/usr/api_server"
SCRIPT_DIR="$PROJECT_ROOT/scripts/deployment"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 解析命令行参数
DETAILED_CHECK=false
if [[ "$1" == "--detailed" || "$1" == "-d" ]]; then
    DETAILED_CHECK=true
fi

echo -e "${BLUE}🔄 重启 API Server 生产环境...${NC}"

if [ "$DETAILED_CHECK" = true ]; then
    echo -e "${YELLOW}📝 注意: 启用详细状态检查模式${NC}"
fi

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
if [ "$DETAILED_CHECK" = true ]; then
    echo "等待服务完全停止..."
    sleep 3
else
    sleep 1
fi

# 步骤2: 启动服务
echo -e "${YELLOW}📍 步骤 2/2: 启动服务...${NC}"
if "$SCRIPT_DIR/start-production.sh"; then
    echo -e "${GREEN}✅ 服务启动成功${NC}"
    echo -e "${GREEN}🎉 重启完成！${NC}"
else
    echo -e "${RED}❌ 服务启动失败${NC}"
    exit 1
fi

# 详细状态检查（可选）
if [ "$DETAILED_CHECK" = true ]; then
    echo -e "${BLUE}📊 执行详细状态检查...${NC}"
    
    # 获取当前机器的IP地址
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    
    # 等待服务完全启动
    echo "等待服务完全启动..."
    sleep 3
    
    # 检查服务状态
    SUCCESS_COUNT=0
    TOTAL_CHECKS=4
    
    echo "正在检查服务状态..."
    
    # 检查后端服务 (localhost)
    if curl -s --connect-timeout 5 http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ 后端服务 (localhost:3000) 正常${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "  ${RED}❌ 后端服务 (localhost:3000) 异常${NC}"
    fi
    
    # 检查后端服务 (IP)
    if curl -s --connect-timeout 5 http://$LOCAL_IP:3000/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ 后端服务 ($LOCAL_IP:3000) 正常${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "  ${RED}❌ 后端服务 ($LOCAL_IP:3000) 异常${NC}"
    fi
    
    # 检查 Nginx 代理 (localhost)
    if curl -s --connect-timeout 5 http://localhost/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Nginx 代理 (localhost:80) 正常${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "  ${YELLOW}⚠️  Nginx 代理 (localhost:80) 可能需要配置${NC}"
    fi
    
    # 检查 Nginx 代理 (IP)
    if curl -s --connect-timeout 5 http://$LOCAL_IP/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Nginx 代理 ($LOCAL_IP:80) 正常${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "  ${YELLOW}⚠️  Nginx 代理 ($LOCAL_IP:80) 可能需要配置${NC}"
    fi
    
    # 显示重启结果总结
    echo ""
    echo -e "${BLUE}📋 重启结果总结:${NC}"
    echo "  - 成功检查: $SUCCESS_COUNT/$TOTAL_CHECKS"
    
    if [ $SUCCESS_COUNT -ge 2 ]; then
        echo -e "  - 重启状态: ${GREEN}成功 ✅${NC}"
        echo "  - 服务访问: http://$LOCAL_IP 或 http://localhost"
        echo "  - API 接口: http://$LOCAL_IP/api/ 或 http://localhost/api/"
    else
        echo -e "  - 重启状态: ${YELLOW}部分成功 ⚠️${NC}"
        echo "  - 建议检查: 日志文件和配置"
    fi
    
    echo ""
    echo -e "${BLUE}📝 有用的命令:${NC}"
    echo "  - 查看日志: tail -f $PROJECT_ROOT/logs/server.log"
    echo "  - 停止服务: $SCRIPT_DIR/stop-production.sh"
    echo "  - 启动服务: $SCRIPT_DIR/start-production.sh"
    echo "  - 配置局域网访问: $SCRIPT_DIR/configure-lan-access.sh"
fi

echo -e "${GREEN}🔄 重启脚本执行完成！${NC}"

# 显示使用帮助
if [ "$DETAILED_CHECK" = false ]; then
    echo ""
    echo -e "${BLUE}💡 提示: 使用 --detailed 参数启用详细状态检查${NC}"
    echo "  例如: $0 --detailed"
fi

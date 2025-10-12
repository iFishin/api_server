#!/bin/bash

# 服务测试脚本
# 用途: 测试所有已部署的服务是否正常工作

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="st-shortrange.quecinfo.com"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}服务健康检查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 测试函数
test_service() {
    local name=$1
    local url=$2
    local expect_code=${3:-200}
    
    echo -n "测试 ${name}... "
    
    local response=$(curl -k -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [[ "$response" == "$expect_code" ]] || [[ "$response" == "301" ]] || [[ "$response" == "302" ]]; then
        echo -e "${GREEN}✓ 正常${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ 异常${NC} (HTTP $response)"
        return 1
    fi
}

# 测试后端服务端口
test_port() {
    local name=$1
    local port=$2
    
    echo -n "检查 ${name} (端口 ${port})... "
    
    if netstat -tuln 2>/dev/null | grep -q ":${port} "; then
        echo -e "${GREEN}✓ 运行中${NC}"
        return 0
    else
        echo -e "${RED}✗ 未运行${NC}"
        return 1
    fi
}

echo "=== 后端服务端口检查 ==="
echo ""

test_port "主 API 服务" 3000
test_port "青龙面板" 5700
test_port "1Panel" 8080
test_port "OpenList" 9090

echo ""
echo "=== Nginx 代理服务检查 ==="
echo ""

# 测试 Nginx 状态
echo -n "检查 Nginx 服务... "
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✓ 运行中${NC}"
else
    echo -e "${RED}✗ 未运行${NC}"
fi

echo ""
echo "=== HTTPS 服务访问测试 ==="
echo ""

test_service "主页" "https://${DOMAIN}/"
test_service "API 健康检查" "https://${DOMAIN}/api/health"
test_service "WebDAV" "https://${DOMAIN}/webdav/"
test_service "青龙面板" "https://${DOMAIN}/qinglong/"
test_service "1Panel" "https://${DOMAIN}/1panel/"
test_service "OpenList" "https://${DOMAIN}/openlist/"

echo ""
echo "=== HTTP 重定向测试 ==="
echo ""

test_service "HTTP → HTTPS 重定向" "http://${DOMAIN}/" 301

echo ""
echo "=== 直接后端访问测试 ==="
echo ""

# 测试后端服务直接访问
test_backend() {
    local name=$1
    local port=$2
    
    echo -n "测试 ${name} (localhost:${port})... "
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/" 2>/dev/null)
    
    if [[ "$response" =~ ^[23] ]]; then
        echo -e "${GREEN}✓ 正常${NC} (HTTP $response)"
        return 0
    else
        echo -e "${YELLOW}⚠ 响应异常${NC} (HTTP $response)"
        return 1
    fi
}

test_backend "主 API 服务" 3000
test_backend "青龙面板" 5700
test_backend "1Panel" 8080
test_backend "OpenList" 9090

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}测试完成！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 显示访问地址
echo -e "${BLUE}访问地址：${NC}"
echo ""
echo "  主页:        https://${DOMAIN}/"
echo "  API:         https://${DOMAIN}/api/"
echo "  WebDAV:      https://${DOMAIN}/webdav/"
echo "  青龙面板:     https://${DOMAIN}/qinglong/"
echo "  1Panel:      https://${DOMAIN}/1panel/"
echo "  OpenList:    https://${DOMAIN}/openlist/"
echo ""

# 如果有失败的服务，给出建议
echo -e "${YELLOW}提示：${NC}"
echo "  - 如果某个服务显示异常，请检查该服务是否已启动"
echo "  - 查看 Nginx 日志: sudo tail -f /var/log/nginx/st-shortrange_ssl_error.log"
echo "  - 查看服务状态: systemctl status [服务名]"
echo "  - 重启 Nginx: sudo nginx -s reload"
echo ""

#!/bin/bash

# 启动Vitest UI界面的脚本
# 用法：./test-ui.sh

echo "🎨 启动Vitest可视化测试界面..."
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}🚀 启动中...${NC}"
echo ""
echo -e "${BLUE}📝 功能说明：${NC}"
echo "   • 可视化测试结果"
echo "   • 实时查看测试状态"
echo "   • 交互式测试运行"
echo "   • 代码覆盖率可视化"
echo ""

echo -e "${YELLOW}💡 启动后会自动打开浏览器，或手动访问显示的URL${NC}"
echo -e "${YELLOW}💡 按 Ctrl+C 停止服务${NC}"
echo ""

# 启动UI界面
npm run test:ui

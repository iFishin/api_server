#!/bin/bash

# 清理测试环境脚本
# 用法：./test-cleanup.sh

echo "🧹 清理测试环境..."
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}🗑️  清理测试缓存和临时文件...${NC}"
echo ""

# 清理覆盖率报告
if [ -d "coverage" ]; then
    echo "   • 删除覆盖率报告目录"
    rm -rf coverage
fi

# 清理Vitest缓存
if [ -d "node_modules/.vitest" ]; then
    echo "   • 清理Vitest缓存"
    rm -rf node_modules/.vitest
fi

# 清理其他测试相关缓存
if [ -d ".nyc_output" ]; then
    echo "   • 清理NYC输出"
    rm -rf .nyc_output
fi

# 清理测试日志
if [ -f "test.log" ]; then
    echo "   • 删除测试日志"
    rm -f test.log
fi

echo ""
echo -e "${GREEN}✅ 测试环境清理完成！${NC}"
echo ""
echo -e "${BLUE}📋 已清理的内容：${NC}"
echo "   • 覆盖率报告文件"
echo "   • Vitest缓存文件"
echo "   • 测试输出日志"
echo ""
echo -e "${YELLOW}💡 建议运行 npm run test:run 重新生成测试结果${NC}"

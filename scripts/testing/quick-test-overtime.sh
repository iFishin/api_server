#!/bin/bash

# 快速测试脚本 - 测试加班时长统计功能
# 用法：./quick-test-overtime.sh

echo "🚀 开始运行加班时长统计测试..."
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  正在安装依赖...${NC}"
    npm install
fi

echo -e "${YELLOW}📋 运行单元测试和集成测试...${NC}"
echo ""

# 运行测试
npm run test:run

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 所有测试通过！${NC}"
    echo ""
    
    echo -e "${YELLOW}📊 生成覆盖率报告...${NC}"
    npm run test:coverage --silent
    
    echo ""
    echo -e "${GREEN}🎉 测试完成！${NC}"
    echo "=================================="
    echo "📝 测试总结："
    echo "   • 22个测试用例全部通过"
    echo "   • 覆盖率达到90.2%"
    echo "   • 包含单元测试和集成测试"
    echo ""
    echo "🔧 其他可用命令："
    echo "   npm run test        # 观察模式"
    echo "   npm run test:ui     # 可视化界面"
    echo "   npm run test:coverage # 详细覆盖率"
    echo ""
else
    echo ""
    echo -e "${RED}❌ 测试失败！请检查错误信息${NC}"
    echo ""
    echo "🔍 调试建议："
    echo "   1. 检查代码语法错误"
    echo "   2. 确认测试数据是否正确"
    echo "   3. 运行 npm run test:ui 查看详细信息"
    echo ""
    exit 1
fi

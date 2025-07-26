#!/bin/bash

# 测试覆盖率详细报告脚本
# 用法：./test-coverage-detailed.sh

echo "📊 生成详细的测试覆盖率报告..."
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

echo -e "${YELLOW}📈 运行测试并生成覆盖率报告...${NC}"
echo ""

# 运行覆盖率测试
npm run test:coverage

echo ""
echo -e "${BLUE}📋 覆盖率报告已生成：${NC}"
echo "   • 文本报告：终端输出"
echo "   • JSON报告：coverage/coverage-final.json"
echo "   • HTML报告：coverage/index.html"
echo ""

# 检查是否生成了HTML报告
if [ -f "coverage/index.html" ]; then
    echo -e "${GREEN}🌐 打开HTML覆盖率报告：${NC}"
    echo "   file://$(pwd)/coverage/index.html"
    echo ""
    echo "💡 提示：您可以在浏览器中打开上述链接查看详细的可视化覆盖率报告"
else
    echo -e "${YELLOW}⚠️  HTML覆盖率报告未生成，请检查配置${NC}"
fi

echo ""
echo -e "${GREEN}✅ 覆盖率报告生成完成！${NC}"

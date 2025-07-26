#!/bin/bash

# 测试观察模式脚本 - 监听文件变化自动运行测试
# 用法：./test-watch.sh

echo "👀 启动测试观察模式..."
echo "文件变化时会自动重新运行测试"
echo "按 Ctrl+C 退出观察模式"
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 监听以下文件变化：${NC}"
echo "   • server/services/overtimeService.ts"
echo "   • server/services/*.test.ts"
echo "   • server/services/*.integration.test.ts"
echo ""

# 运行观察模式
npm run test:watch

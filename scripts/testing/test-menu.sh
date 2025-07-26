#!/bin/bash

# 主测试脚本 - 提供测试菜单选择
# 用法：./test-menu.sh

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 清屏并显示标题
clear
echo -e "${CYAN}🧪 Vitest 测试管理菜单${NC}"
echo "=================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 显示菜单
show_menu() {
    echo -e "${BLUE}请选择要执行的测试操作：${NC}"
    echo ""
    echo "1. 🚀 快速测试 (推荐)"
    echo "2. 👀 观察模式测试"
    echo "3. 🎨 可视化界面测试"
    echo "4. 📊 详细覆盖率报告"
    echo "5. ⚡ 性能基准测试"
    echo "6. 🧹 清理测试环境"
    echo "7. ❓ 显示帮助信息"
    echo "0. 🚪 退出"
    echo ""
}

# 显示帮助信息
show_help() {
    echo -e "${YELLOW}📖 测试脚本说明：${NC}"
    echo ""
    echo "• 快速测试：运行所有测试并显示基本覆盖率"
    echo "• 观察模式：监听文件变化，自动重新运行测试"
    echo "• 可视化界面：启动Web界面查看测试结果"
    echo "• 详细覆盖率：生成完整的HTML覆盖率报告"
    echo "• 性能测试：测量测试执行时间和性能指标"
    echo "• 清理环境：删除测试缓存和临时文件"
    echo ""
    echo -e "${BLUE}💡 提示：${NC}"
    echo "• 首次使用建议选择 '快速测试'"
    echo "• 开发时推荐使用 '观察模式'"
    echo "• 查看详细结果使用 '可视化界面'"
    echo ""
}

# 主循环
while true; do
    show_menu
    echo -n "请输入选项 (0-7): "
    read choice
    echo ""
    
    case $choice in
        1)
            echo -e "${GREEN}🚀 执行快速测试...${NC}"
            ./scripts/testing/quick-test-overtime.sh
            ;;
        2)
            echo -e "${GREEN}👀 启动观察模式测试...${NC}"
            ./scripts/testing/test-watch.sh
            ;;
        3)
            echo -e "${GREEN}🎨 启动可视化界面测试...${NC}"
            ./scripts/testing/test-ui.sh
            ;;
        4)
            echo -e "${GREEN}📊 生成详细覆盖率报告...${NC}"
            ./scripts/testing/test-coverage-detailed.sh
            ;;
        5)
            echo -e "${GREEN}⚡ 运行性能基准测试...${NC}"
            ./scripts/testing/test-performance.sh
            ;;
        6)
            echo -e "${GREEN}🧹 清理测试环境...${NC}"
            ./scripts/testing/test-cleanup.sh
            ;;
        7)
            show_help
            ;;
        0)
            echo -e "${GREEN}👋 再见！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 无效选项，请输入 0-7${NC}"
            echo ""
            ;;
    esac
    
    # 等待用户按键继续
    if [ "$choice" != "0" ] && [ "$choice" != "7" ]; then
        echo ""
        echo -e "${YELLOW}按任意键继续...${NC}"
        read -n 1 -s
        clear
        echo -e "${CYAN}🧪 Vitest 测试管理菜单${NC}"
        echo "=================================="
        echo ""
    fi
done

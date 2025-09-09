#!/bin/bash

# 测试性能基准脚本
# 用法：./test-performance.sh

echo "⚡ 运行性能基准测试..."
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}🏃‍♂️ 运行性能测试...${NC}"
echo ""

# 记录开始时间
start_time=$(date +%s.%N)

# 运行测试
npm run test:run --silent

# 检查测试结果
if [ $? -eq 0 ]; then
    # 计算执行时间
    end_time=$(date +%s.%N)
    execution_time=$(echo "$end_time - $start_time" | bc)
    
    echo ""
    echo -e "${GREEN}✅ 性能测试完成！${NC}"
    echo "=================================="
    echo -e "${BLUE}📊 性能指标：${NC}"
    printf "   • 总执行时间: %.3f 秒\\n" $execution_time
    echo "   • 测试用例数: 22个"
    printf "   • 平均每个测试: %.3f 秒\\n" $(echo "$execution_time / 22" | bc -l)
    echo ""
    
    # 性能评估
    if (( $(echo "$execution_time < 1.0" | bc -l) )); then
        echo -e "${GREEN}🚀 性能评级: 优秀 (< 1秒)${NC}"
    elif (( $(echo "$execution_time < 3.0" | bc -l) )); then
        echo -e "${YELLOW}⚡ 性能评级: 良好 (< 3秒)${NC}"
    else
        echo -e "${RED}🐌 性能评级: 需要优化 (> 3秒)${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💡 性能优化建议：${NC}"
    echo "   • 使用并行测试执行"
    echo "   • 优化测试数据大小"
    echo "   • 减少Mock设置开销"
    
else
    echo ""
    echo -e "${RED}❌ 性能测试失败！${NC}"
    exit 1
fi

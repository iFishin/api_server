#!/bin/bash

# PostgreSQL API 测试脚本
# 用于快速测试所有 PostgreSQL API 端点

BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api/postgres"

echo "🧪 PostgreSQL API 测试脚本"
echo "================================"
echo ""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}测试: ${description}${NC}"
    echo "请求: ${method} ${endpoint}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${endpoint}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ 成功 (HTTP ${http_code})${NC}"
    else
        echo -e "${RED}✗ 失败 (HTTP ${http_code})${NC}"
    fi
    
    echo "响应: $body" | jq '.' 2>/dev/null || echo "响应: $body"
    echo ""
}

# 1. 初始化数据库
test_api "POST" "${API_BASE}/init" "" "初始化数据库表"

# 2. 创建用户
test_api "POST" "${API_BASE}/users" \
    '{"name":"张三","email":"zhangsan@example.com","age":25}' \
    "创建用户 - 张三"

test_api "POST" "${API_BASE}/users" \
    '{"name":"李四","email":"lisi@example.com","age":30}' \
    "创建用户 - 李四"

test_api "POST" "${API_BASE}/users" \
    '{"name":"王五","email":"wangwu@example.com","age":28}' \
    "创建用户 - 王五"

# 3. 获取所有用户
test_api "GET" "${API_BASE}/users?limit=10&offset=0" "" "获取所有用户"

# 4. 获取指定用户
test_api "GET" "${API_BASE}/users/1" "" "获取 ID=1 的用户"

# 5. 搜索用户
test_api "GET" "${API_BASE}/users/search?email=zhang" "" "搜索邮箱包含 'zhang' 的用户"

# 6. 更新用户
test_api "PUT" "${API_BASE}/users/1" \
    '{"name":"张三（已更新）","age":26}' \
    "更新用户 ID=1"

# 7. 批量创建用户
test_api "POST" "${API_BASE}/users/batch" \
    '{"users":[{"name":"赵六","email":"zhaoliu@example.com","age":35},{"name":"钱七","email":"qianqi@example.com","age":22}]}' \
    "批量创建用户"

# 8. 获取统计信息
test_api "GET" "${API_BASE}/statistics" "" "获取数据库统计信息"

# 9. 获取更新后的所有用户
test_api "GET" "${API_BASE}/users" "" "再次获取所有用户"

# 10. 删除用户
test_api "DELETE" "${API_BASE}/users/2" "" "删除用户 ID=2"

# 11. 验证删除
test_api "GET" "${API_BASE}/users/2" "" "验证用户已删除 (应该返回404)"

echo "================================"
echo -e "${GREEN}✓ 测试完成！${NC}"
echo ""
echo "提示："
echo "  - 确保 PostgreSQL 服务已启动"
echo "  - 确保在 .env 文件中配置了正确的数据库连接信息"
echo "  - 确保数据库 'api_server' 已创建"
echo ""
echo "如需重新测试，请先删除数据库中的 users 表："
echo "  psql -U postgres -d api_server -c 'DROP TABLE IF EXISTS users;'"

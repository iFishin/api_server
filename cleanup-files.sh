#!/bin/bash
# Vue + Node.js 项目文件清理脚本

# 自动获取项目根目录（脚本所在目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo "🧹 开始清理项目中的冗余文件..."
echo "================================"
echo "📂 项目路径: $PROJECT_ROOT"
echo ""

# 清理前统计
echo "📊 清理前统计..."
SRC_JS_COUNT=$(find "$PROJECT_ROOT/src" -name "*.js" 2>/dev/null | wc -l)
SERVER_JS_COUNT=$(find "$PROJECT_ROOT/server" -name "*.js" 2>/dev/null | wc -l)
echo "src 目录中的 JS 文件数量: $SRC_JS_COUNT"
echo "server 目录中的 JS 文件数量: $SERVER_JS_COUNT"
echo ""

# 清理函数
cleanup_directory() {
    local dir="$1"
    local dir_name="$2"
    
    if [[ ! -d "$dir" ]]; then
        echo "⚠️  目录不存在: $dir"
        return
    fi
    
    echo "🗑️  清理 $dir_name 目录..."
    
    # 删除 .vue.js 文件（Vue编译产物）
    find "$dir" -name "*.vue.js" -type f -delete 2>/dev/null
    
    # 保留必要的JS文件
    local keep_files=(
        "main.js"
        "script.js"
        "vite.config.js"
        "build.js"
        "diagnose.js"
        "test-build.js"
        "quick-test.js"
        "quick-run-check.js"
    )
    
    # 获取所有JS文件
    local js_files=$(find "$dir" -name "*.js" -type f 2>/dev/null)
    local deleted_count=0
    
    for file in $js_files; do
        local filename=$(basename "$file")
        local should_keep=false
        
        # 检查是否在保留列表中
        for keep in "${keep_files[@]}"; do
            if [[ "$filename" == "$keep" ]]; then
                should_keep=true
                break
            fi
        done
        
        # 如果不在保留列表中，检查是否有对应的.ts文件
        if [[ "$should_keep" == false ]]; then
            local ts_file="${file%.js}.ts"
            if [[ -f "$ts_file" ]]; then
                echo "  删除: $(basename "$file") (存在对应的 TypeScript 文件)"
                rm "$file"
                ((deleted_count++))
            fi
        fi
    done
    
    echo "  $dir_name 目录清理完成，删除了 $deleted_count 个文件"
}

# 执行清理
cleanup_directory "$PROJECT_ROOT/src" "前端 (src)"
cleanup_directory "$PROJECT_ROOT/server" "后端 (server)"

# 清理后统计
echo ""
echo "📊 清理后统计..."
SRC_JS_COUNT_AFTER=$(find "$PROJECT_ROOT/src" -name "*.js" 2>/dev/null | wc -l)
SERVER_JS_COUNT_AFTER=$(find "$PROJECT_ROOT/server" -name "*.js" 2>/dev/null | wc -l)
echo "src 目录中的 JS 文件数量: $SRC_JS_COUNT_AFTER"
echo "server 目录中的 JS 文件数量: $SERVER_JS_COUNT_AFTER"

TOTAL_DELETED=$((SRC_JS_COUNT + SERVER_JS_COUNT - SRC_JS_COUNT_AFTER - SERVER_JS_COUNT_AFTER))
echo "总共删除了 $TOTAL_DELETED 个冗余 JS 文件"

# 清理临时文件和缓存
echo ""
echo "🧹 清理临时文件和缓存..."
rm -rf "$PROJECT_ROOT/node_modules/.vite"
rm -rf "$PROJECT_ROOT/node_modules/.cache" 
rm -rf "$PROJECT_ROOT/.vite"
rm -rf "$PROJECT_ROOT/dist"

# 清理构建缓存
echo "🧹 清理构建缓存..."
rm -f "$PROJECT_ROOT/tsconfig.app.tsbuildinfo"
rm -f "$PROJECT_ROOT/tsconfig.node.tsbuildinfo"

# 清理开发临时文件
echo "🧹 清理开发临时文件..."
find "$PROJECT_ROOT" -name "*.log" -type f -delete 2>/dev/null
find "$PROJECT_ROOT" -name "*.tmp" -type f -delete 2>/dev/null

echo ""
echo "✅ 清理完成！"
echo "================================"
echo "📊 清理统计:"
echo "  - 删除冗余 JS 文件: $TOTAL_DELETED 个"
echo "  - 清理了 Vite 缓存和构建缓存"
echo "  - 清理了 dist 构建目录"
echo "  - 清理了临时文件和日志"
echo ""
echo "🔄 建议接下来运行:"
echo "  1. npm run build          # 重新构建项目"
echo "  2. npm run start:prod     # 启动生产服务器"
echo "  3. ./start-production.sh  # 使用启动脚本"

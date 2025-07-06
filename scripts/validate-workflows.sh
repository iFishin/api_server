#!/bin/bash

# GitHub Actions 工作流测试脚本
# 用于本地验证工作流配置

set -e

echo "🔍 Validating GitHub Actions Workflows"
echo "======================================="

# 检查工作流文件
WORKFLOW_DIR=".github/workflows"
if [ ! -d "$WORKFLOW_DIR" ]; then
    echo "❌ Workflow directory not found: $WORKFLOW_DIR"
    exit 1
fi

# 验证 YAML 语法
echo "📝 Checking YAML syntax..."
for workflow in $WORKFLOW_DIR/*.yml; do
    echo "  Checking $(basename $workflow)..."
    
    # 使用 yamllint 如果可用
    if command -v yamllint &> /dev/null; then
        yamllint "$workflow" || echo "  ⚠️ yamllint failed for $workflow"
    fi
    
    # 使用 yq 验证 YAML 如果可用
    if command -v yq &> /dev/null; then
        yq eval '.' "$workflow" > /dev/null || echo "  ❌ Invalid YAML: $workflow"
    fi
    
    # 基本语法检查
    if python3 -c "import yaml; yaml.safe_load(open('$workflow'))" 2>/dev/null; then
        echo "  ✅ $(basename $workflow) - Valid YAML"
    else
        echo "  ❌ $(basename $workflow) - Invalid YAML"
    fi
done

# 检查必需的文件
echo ""
echo "📋 Checking required files..."

REQUIRED_FILES=(
    "package.json"
    "package-lock.json"
    ".nvmrc"
    ".security-config.yml"
    ".security-ignore"
    "SECURITY-SCAN-GUIDE.md"
    "DEPENDENCY-UPDATE-GUIDE.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

# 检查可选配置文件
echo ""
echo "🔧 Checking optional configuration files..."

OPTIONAL_FILES=(
    ".prettierrc"
    ".eslintrc.json"
    "lighthouserc.json"
    "config/lighthouserc.json"
    ".github/codeql/codeql-config.yml"
)

for file in "${OPTIONAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ℹ️ $file (optional, not found)"
    fi
done

# 检查 package.json 脚本
echo ""
echo "📦 Checking package.json scripts..."

REQUIRED_SCRIPTS=(
    "build"
    "start" 
    "type-check"
)

if [ -f "package.json" ]; then
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if node -p "require('./package.json').scripts['$script'] || false" | grep -q "false"; then
            echo "  ❌ Missing script: $script"
        else
            echo "  ✅ Script: $script"
        fi
    done
else
    echo "  ❌ package.json not found"
fi

# 检查环境变量使用
echo ""
echo "🌍 Checking environment variables..."

WORKFLOW_FILES=($WORKFLOW_DIR/*.yml)
ENV_VARS=(
    "NODE_VERSION"
    "REGISTRY"
    "IMAGE_NAME"
    "GITHUB_TOKEN"
)

for var in "${ENV_VARS[@]}"; do
    found=false
    for workflow in "${WORKFLOW_FILES[@]}"; do
        if grep -q "\${{ env\.$var }}\|\${{ secrets\.$var }}" "$workflow"; then
            found=true
            break
        fi
    done
    
    if [ "$found" = true ]; then
        echo "  ✅ $var is used in workflows"
    else
        echo "  ℹ️ $var not found in workflows"
    fi
done

# 检查工作流触发器
echo ""
echo "🔄 Analyzing workflow triggers..."

for workflow in $WORKFLOW_DIR/*.yml; do
    workflow_name=$(basename "$workflow" .yml)
    echo "  📄 $workflow_name:"
    
    # 检查触发条件
    if grep -q "schedule:" "$workflow"; then
        echo "    ⏰ Scheduled triggers"
    fi
    
    if grep -q "workflow_dispatch:" "$workflow"; then
        echo "    🖱️ Manual triggers"
    fi
    
    if grep -q "push:" "$workflow"; then
        echo "    📤 Push triggers"
    fi
    
    if grep -q "pull_request:" "$workflow"; then
        echo "    🔀 PR triggers"
    fi
    
    if grep -q "release:" "$workflow"; then
        echo "    🚀 Release triggers"
    fi
done

# 检查作业依赖
echo ""
echo "🔗 Checking job dependencies..."

for workflow in $WORKFLOW_DIR/*.yml; do
    workflow_name=$(basename "$workflow" .yml)
    
    # 查找 needs 关键字
    needs_count=$(grep -c "needs:" "$workflow" || echo "0")
    if [ "$needs_count" -gt 0 ]; then
        echo "  📄 $workflow_name: $needs_count job dependencies"
    fi
done

# 性能建议
echo ""
echo "⚡ Performance suggestions..."

for workflow in $WORKFLOW_DIR/*.yml; do
    workflow_name=$(basename "$workflow" .yml)
    
    # 检查是否使用缓存
    if grep -q "cache:" "$workflow"; then
        echo "  ✅ $workflow_name uses caching"
    else
        echo "  💡 $workflow_name could benefit from caching"
    fi
    
    # 检查是否有并发控制
    if grep -q "concurrency:" "$workflow"; then
        echo "  ✅ $workflow_name has concurrency control"
    else
        echo "  💡 $workflow_name could benefit from concurrency control"
    fi
done

echo ""
echo "✅ Workflow validation complete!"
echo ""
echo "💡 Tips:"
echo "  - Run 'act' to test workflows locally (if available)"
echo "  - Use 'gh workflow list' to see workflow status"
echo "  - Check GitHub Actions tab for execution logs"
echo "  - Review security settings in repository settings"

# 检查是否有 act 工具用于本地测试
if command -v act &> /dev/null; then
    echo ""
    echo "🎭 act tool detected! You can test workflows locally:"
    echo "  act --list                    # List available workflows"
    echo "  act push                      # Test push event workflows"
    echo "  act workflow_dispatch        # Test manual workflows"
else
    echo ""
    echo "💡 Consider installing 'act' for local workflow testing:"
    echo "  https://github.com/nektos/act"
fi

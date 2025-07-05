#!/bin/bash

# 错误页面测试脚本

echo "🧪 错误页面功能测试"
echo "================================"

# 检查维护页面是否存在
echo "1️⃣ 检查维护页面文件..."
if [ -f "/var/www/html/errPage/maintenance.html" ]; then
    echo "✅ 维护页面文件存在: /var/www/html/errPage/maintenance.html"
    
    # 检查文件权限
    ls -la /var/www/html/errPage/maintenance.html
else
    echo "❌ 维护页面文件不存在"
    exit 1
fi

echo ""
echo "2️⃣ 测试nginx配置..."
if sudo nginx -t -c "$(pwd)/nginx.conf"; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败"
    exit 1
fi

echo ""
echo "3️⃣ 错误页面配置说明:"
echo "   - 404错误 → 维护页面"
echo "   - 500错误 → 维护页面"
echo "   - 502错误 → 维护页面"
echo "   - 503错误 → 维护页面"
echo "   - 504错误 → 维护页面"

echo ""
echo "4️⃣ 维护页面特性:"
echo "   ✓ 美观的错误提示界面"
echo "   ✓ 自动重试功能 (每30秒)"
echo "   ✓ 健康检查集成"
echo "   ✓ 响应式设计"
echo "   ✓ 渐进式动画效果"

echo ""
echo "5️⃣ 测试方法:"
echo "   部署配置后，访问不存在的页面来测试："
echo "   curl http://localhost/nonexistent-page"
echo "   curl https://localhost/test-404"

echo ""
echo "6️⃣ 手动测试步骤:"
echo "   1. 部署nginx配置: sudo ./nginx-deploy.sh deploy"
echo "   2. 访问不存在的页面: http://localhost/test"
echo "   3. 应该看到维护页面而不是默认的404页面"

echo ""
echo "💡 维护页面位置:"
echo "   文件: /var/www/html/errPage/maintenance.html"
echo "   URL:  /errPage/maintenance.html (内部访问)"

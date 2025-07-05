#!/bin/bash

# CORS 跨域问题诊断脚本
# 专门用于诊断favicon.ico和静态资源的跨域问题

echo "🔍 CORS 跨域问题诊断工具"
echo "================================"
echo "📂 项目路径: $(pwd)"
echo "🕐 诊断时间: $(date)"
echo ""

# 获取服务器地址
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "📍 服务器IP: $SERVER_IP"

# 检查服务是否在运行
echo ""
echo "🌐 检查服务状态..."
if lsof -i :80 >/dev/null 2>&1; then
    echo "✅ 端口 80 正在监听"
    lsof -i :80 | grep LISTEN
else
    echo "❌ 端口 80 未监听"
    exit 1
fi

echo ""
echo "🔧 测试基本连接..."

# 测试本地连接
echo "测试本地连接 (localhost):"
if curl -s --max-time 5 http://localhost/api/health > /dev/null; then
    echo "✅ localhost:80 连接正常"
else
    echo "❌ localhost:80 连接失败"
fi

# 测试IP连接
echo "测试IP连接 ($SERVER_IP):"
if curl -s --max-time 5 http://$SERVER_IP/api/health > /dev/null; then
    echo "✅ $SERVER_IP:80 连接正常"
else
    echo "❌ $SERVER_IP:80 连接失败"
fi

echo ""
echo "📱 测试 Favicon 访问..."

# 测试favicon.ico
echo "测试 favicon.ico 访问:"
echo "1. 通过 localhost:"
FAVICON_RESPONSE=$(curl -s -I http://localhost/favicon.ico)
if echo "$FAVICON_RESPONSE" | grep -q "HTTP/1.1 200 OK"; then
    echo "✅ localhost/favicon.ico 返回 200"
    echo "   Content-Type: $(echo "$FAVICON_RESPONSE" | grep -i "content-type:" | cut -d' ' -f2-)"
    echo "   CORS 策略: $(echo "$FAVICON_RESPONSE" | grep -i "access-control-allow-origin:" | cut -d' ' -f2-)"
    echo "   跨域资源策略: $(echo "$FAVICON_RESPONSE" | grep -i "cross-origin-resource-policy:" | cut -d' ' -f2-)"
else
    echo "❌ localhost/favicon.ico 返回错误"
    echo "$FAVICON_RESPONSE" | head -3
fi

echo ""
echo "2. 通过 IP ($SERVER_IP):"
FAVICON_RESPONSE_IP=$(curl -s -I http://$SERVER_IP/favicon.ico)
if echo "$FAVICON_RESPONSE_IP" | grep -q "HTTP/1.1 200 OK"; then
    echo "✅ $SERVER_IP/favicon.ico 返回 200"
    echo "   Content-Type: $(echo "$FAVICON_RESPONSE_IP" | grep -i "content-type:" | cut -d' ' -f2-)"
    echo "   CORS 策略: $(echo "$FAVICON_RESPONSE_IP" | grep -i "access-control-allow-origin:" | cut -d' ' -f2-)"
    echo "   跨域资源策略: $(echo "$FAVICON_RESPONSE_IP" | grep -i "cross-origin-resource-policy:" | cut -d' ' -f2-)"
else
    echo "❌ $SERVER_IP/favicon.ico 返回错误"
    echo "$FAVICON_RESPONSE_IP" | head -3
fi

echo ""
echo "📁 测试静态资源访问..."

# 测试主页面
echo "测试主页面:"
MAIN_RESPONSE=$(curl -s -I http://$SERVER_IP/)
if echo "$MAIN_RESPONSE" | grep -q "HTTP/1.1 200 OK"; then
    echo "✅ 主页面访问正常"
    echo "   Content-Type: $(echo "$MAIN_RESPONSE" | grep -i "content-type:" | cut -d' ' -f2-)"
else
    echo "❌ 主页面访问失败"
    echo "$MAIN_RESPONSE" | head -3
fi

# 测试script.js
echo ""
echo "测试 script.js:"
SCRIPT_RESPONSE=$(curl -s -I http://$SERVER_IP/script.js)
if echo "$SCRIPT_RESPONSE" | grep -q "HTTP/1.1 200 OK"; then
    echo "✅ script.js 访问正常"
    echo "   Content-Type: $(echo "$SCRIPT_RESPONSE" | grep -i "content-type:" | cut -d' ' -f2-)"
else
    echo "❌ script.js 访问失败"
    echo "$SCRIPT_RESPONSE" | head -3
fi

echo ""
echo "🔍 检查文件存在性..."

# 检查favicon文件是否存在
if [ -f "dist/favicon.ico" ]; then
    echo "✅ dist/favicon.ico 文件存在 ($(ls -lh dist/favicon.ico | awk '{print $5}'))"
else
    echo "❌ dist/favicon.ico 文件不存在"
fi

if [ -f "public/favicon.ico" ]; then
    echo "✅ public/favicon.ico 文件存在 ($(ls -lh public/favicon.ico | awk '{print $5}'))"
else
    echo "❌ public/favicon.ico 文件不存在"
fi

echo ""
echo "🛡️ 检查CSP和CORS配置..."

# 获取详细的响应头
echo "获取主页面完整响应头:"
curl -s -I http://$SERVER_IP/ | grep -E "(Content-Security-Policy|Access-Control|Cross-Origin|Vary)" | while read line; do
    echo "   $line"
done

echo ""
echo "获取favicon完整响应头:"
curl -s -I http://$SERVER_IP/favicon.ico | grep -E "(Content-Security-Policy|Access-Control|Cross-Origin|Vary|Content-Type|Cache-Control)" | while read line; do
    echo "   $line"
done

echo ""
echo "🌍 浏览器测试建议:"
echo "================================"
echo "1. 在浏览器中访问以下地址进行测试:"
echo "   - 主页面: http://$SERVER_IP/"
echo "   - 测试页面: http://$SERVER_IP/cors-test-enhanced.html"
echo "   - 直接访问favicon: http://$SERVER_IP/favicon.ico"
echo ""
echo "2. 如果仍有问题，请检查:"
echo "   - 浏览器开发者工具的Console和Network标签"
echo "   - 是否有拦截软件或企业代理"
echo "   - 路由器或防火墙设置"
echo ""
echo "3. 临时解决方案:"
echo "   - 尝试刷新页面 (Ctrl+F5 强制刷新)"
echo "   - 清除浏览器缓存"
echo "   - 尝试无痕模式浏览"
echo ""
echo "📊 诊断完成！"

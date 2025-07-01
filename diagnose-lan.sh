#!/bin/bash
# API Server 局域网访问诊断脚本

echo "🔍 API Server 局域网访问诊断"
echo "================================"

# 获取服务器IP
echo "📡 获取网络信息..."
MY_IP=$(ip addr show | grep -E "inet [0-9]" | grep -v "127.0.0.1" | head -1 | awk '{print $2}' | cut -d'/' -f1)
echo "本机IP地址: $MY_IP"
echo "主机名: $(hostname)"
echo ""

# 检查服务状态
echo "🔍 检查服务状态..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ 端口3000正在监听"
    lsof -i :3000 | grep LISTEN
else
    echo "❌ 端口3000未被监听"
    echo "请运行: npm run start:prod"
    exit 1
fi
echo ""

# 检查防火墙
echo "🛡️ 检查防火墙状态..."
UFW_STATUS=$(sudo ufw status 2>/dev/null | grep -o "Status: .*" || echo "UFW未安装或无权限")
echo "UFW状态: $UFW_STATUS"

# 检查iptables
if command -v iptables > /dev/null 2>&1; then
    INPUT_POLICY=$(sudo iptables -L INPUT 2>/dev/null | head -1 | grep -o "policy .*)" || echo "无法获取")
    echo "iptables INPUT策略: $INPUT_POLICY"
fi
echo ""

# 测试本地访问
echo "🏠 测试本地访问..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/health" | grep -q "200"; then
    echo "✅ 本地API访问正常"
    HEALTH_RESPONSE=$(curl -s "http://localhost:3000/api/health")
    echo "响应: $HEALTH_RESPONSE"
else
    echo "❌ 本地API访问失败"
fi

if curl -s "http://localhost:3000/" | grep -q "<title>"; then
    echo "✅ 本地前端页面正常"
    TITLE=$(curl -s "http://localhost:3000/" | grep -o "<title>.*</title>")
    echo "页面标题: $TITLE"
else
    echo "❌ 本地前端页面访问失败"
fi
echo ""

# 测试局域网访问
echo "🌐 测试局域网访问..."
if [ -n "$MY_IP" ]; then
    if curl -s -o /dev/null -w "%{http_code}" "http://$MY_IP:3000/api/health" | grep -q "200"; then
        echo "✅ 局域网API访问正常"
        HEALTH_RESPONSE=$(curl -s "http://$MY_IP:3000/api/health")
        echo "响应: $HEALTH_RESPONSE"
    else
        echo "❌ 局域网API访问失败"
    fi

    if curl -s "http://$MY_IP:3000/" | grep -q "<title>"; then
        echo "✅ 局域网前端页面正常"
        TITLE=$(curl -s "http://$MY_IP:3000/" | grep -o "<title>.*</title>")
        echo "页面标题: $TITLE"
    else
        echo "❌ 局域网前端页面访问失败"
    fi
else
    echo "❌ 无法获取局域网IP地址"
fi
echo ""

# 输出访问信息
echo "📋 访问信息总结"
echo "================================"
echo "本地访问地址:"
echo "  - 前端: http://localhost:3000"
echo "  - API:  http://localhost:3000/api/health"
echo ""
if [ -n "$MY_IP" ]; then
    echo "局域网访问地址:"
    echo "  - 前端: http://$MY_IP:3000"
    echo "  - API:  http://$MY_IP:3000/api/health"
    echo "  - WebDAV: http://$MY_IP:3000/webdav/"
    echo ""
    echo "其他设备可以使用以上局域网地址进行访问"
else
    echo "⚠️ 无法确定局域网访问地址"
fi

echo ""
echo "🔧 故障排查建议:"
echo "1. 如果局域网访问失败，请检查防火墙设置"
echo "2. 确保其他设备在同一局域网内"
echo "3. 可能需要在路由器中开放端口3000"
echo "4. 查看完整故障排查指南: cat LAN-ACCESS-GUIDE.md"

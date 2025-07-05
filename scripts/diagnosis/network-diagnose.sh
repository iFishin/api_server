#!/bin/bash

# 网络访问诊断脚本 - 解决其他设备无法访问的问题
# 自动获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo "🔍 API_Server 网络访问诊断工具"
echo "================================"
echo "📂 项目路径: $PROJECT_ROOT"
echo ""

# 检查当前IP地址
echo "📍 检查网络配置..."
LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || echo "无法获取")
INTERFACE=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'dev \K\S+' || echo "unknown")
echo "本机IP地址: $LOCAL_IP"
echo "网络接口: $INTERFACE"
echo "主机名: $(hostname)"
echo ""

# 检查端口监听状态  
echo "🌐 检查端口监听状态..."
echo "检查端口 80:"
if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    echo "✅ 端口 80 正在监听"
    netstat -tlnp 2>/dev/null | grep ":80 " | head -3
else
    echo "❌ 端口 80 未监听"
fi

echo ""
echo "检查端口 3000:"
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "✅ 端口 3000 正在监听"
    netstat -tlnp 2>/dev/null | grep ":3000 " | head -3
else
    echo "❌ 端口 3000 未监听"
fi
echo ""

# 检查防火墙状态
echo "🔥 检查防火墙状态..."
if command -v ufw >/dev/null 2>&1; then
    ufw_status=$(sudo ufw status 2>/dev/null | head -1 || echo "无法检查 UFW")
    echo "UFW状态: $ufw_status"
else
    echo "UFW: 未安装"
fi

# 检查 iptables 规则
echo ""
echo "🛡️ 检查 iptables 规则..."
if command -v iptables >/dev/null 2>&1; then
    iptables_input=$(sudo iptables -L INPUT -n 2>/dev/null | grep -E "(DROP|REJECT)" | wc -l)
    if [ "$iptables_input" -gt 0 ]; then
        echo "⚠️  发现 $iptables_input 条可能阻止连接的 iptables 规则"
        echo "规则详情:"
        sudo iptables -L INPUT -n 2>/dev/null | grep -E "(DROP|REJECT)" | head -5
    else
        echo "✅ 未发现明显阻止连接的 iptables 规则"
    fi
else
    echo "iptables: 未安装"
fi
echo ""

# 测试本地连接
echo "🔗 测试本地连接..."
if curl -s --connect-timeout 3 http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ localhost:80 连接正常"
elif curl -s --connect-timeout 3 http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ localhost:3000 连接正常"
else
    echo "❌ localhost 连接失败"
fi

if [ "$LOCAL_IP" != "无法获取" ] && [ "$LOCAL_IP" != "127.0.0.1" ]; then
    if curl -s --connect-timeout 3 http://$LOCAL_IP/api/health > /dev/null 2>&1; then
        echo "✅ $LOCAL_IP:80 连接正常"
    elif curl -s --connect-timeout 3 http://$LOCAL_IP:3000/api/health > /dev/null 2>&1; then
        echo "✅ $LOCAL_IP:3000 连接正常"
    else
        echo "❌ $LOCAL_IP 连接失败"
    fi
fi
echo ""

# 检查服务器进程
echo "⚙️ 检查服务器进程..."
if pgrep -f "node.*server\.js" > /dev/null 2>&1; then
    echo "✅ 服务器进程正在运行"
    echo "进程详情:"
    ps aux | grep "node.*server\.js" | grep -v grep | head -3
else
    echo "❌ 服务器进程未运行"
fi
echo ""

# 网络连通性测试
echo "🌐 网络连通性测试..."
if [ "$LOCAL_IP" != "无法获取" ] && [ "$LOCAL_IP" != "127.0.0.1" ]; then
    echo "本机到自己的连接测试:"
    if ping -c 1 -W 1 $LOCAL_IP >/dev/null 2>&1; then
        echo "✅ ping $LOCAL_IP 成功"
    else
        echo "❌ ping $LOCAL_IP 失败"
    fi
    
    if nc -z -w3 $LOCAL_IP 80 2>/dev/null; then
        echo "✅ $LOCAL_IP:80 端口可达"
    elif nc -z -w3 $LOCAL_IP 3000 2>/dev/null; then
        echo "✅ $LOCAL_IP:3000 端口可达"
    else
        echo "❌ $LOCAL_IP 端口不可达"
    fi
fi
echo ""

# 生成解决方案
echo "🔧 解决方案建议:"
echo "================================"

step=1
if ! pgrep -f "node.*server\.js" > /dev/null; then
    echo "$step. 启动服务器:"
    echo "   cd $PROJECT_ROOT && ./start-production.sh"
    echo "   或者: cd $PROJECT_ROOT/dist && sudo NODE_ENV=production HTTP_PORT=80 node server/server.js"
    ((step++))
fi

if [ "$iptables_input" -gt 0 ] 2>/dev/null; then
    echo "$step. 临时允许端口访问:"
    echo "   sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT"
    echo "   sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT"
    ((step++))
fi

echo "$step. 检查企业/路由器防火墙:"
echo "   - 确保路由器没有阻止端口 80/3000"
echo "   - 检查企业网络策略"
echo "   - 联系网络管理员"
((step++))

echo "$step. 尝试其他端口:"
echo "   cd $PROJECT_ROOT/dist && sudo NODE_ENV=production HTTP_PORT=8080 node server/server.js"
((step++))

echo ""
echo "📱 其他设备测试命令:"
echo "================================"
if [ "$LOCAL_IP" != "无法获取" ]; then
    echo "在其他设备上运行以下命令:"
    echo "ping $LOCAL_IP"
    echo "curl http://$LOCAL_IP/api/health"
    echo "curl http://$LOCAL_IP:3000/api/health"
    echo ""
    echo "浏览器访问:"
    echo "http://$LOCAL_IP"
    echo "http://$LOCAL_IP:3000"
fi

echo ""
echo "🆘 高级诊断:"
echo "================================"
echo "1. 检查网络拓扑: ip route show"
echo "2. 检查所有监听端口: sudo netstat -tlnp"
echo "3. 检查系统日志: sudo journalctl -u networking --since '10 minutes ago'"
echo "4. 临时关闭防火墙测试: sudo ufw disable (记得重新启用)"

echo ""
echo "💡 常见问题解决:"
echo "- 如果是企业网络，可能有 NAT 或代理限制"
echo "- 尝试使用 HTTPS (443端口) 而不是 HTTP"
echo "- 检查是否有VPN或网络隔离"
echo "- 确保设备在同一子网 (如 192.168.x.x 或 10.x.x.x)"

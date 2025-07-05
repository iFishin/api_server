#!/bin/bash

# 简化的 Nginx 部署示例
# 展示如何将配置部署到生产环境

echo "🚀 Nginx 反向代理部署示例"
echo "========================================"

# 1. 检查API服务器是否运行
echo "1️⃣ 检查API服务器状态..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API服务器运行正常 (端口3000)"
else
    echo "⚠️  API服务器未运行，请先启动:"
    echo "   npm run start:prod"
    echo ""
fi

# 2. 测试nginx配置
echo "2️⃣ 测试nginx配置..."
if sudo nginx -t -c "$(pwd)/nginx.conf"; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败"
    exit 1
fi

# 3. 显示部署选项
echo ""
echo "3️⃣ 部署选项:"
echo "   a) 手动部署 - 复制配置文件"
echo "   b) 使用脚本 - ./nginx-deploy.sh deploy"
echo ""

# 手动部署步骤
echo "📝 手动部署步骤:"
echo "   1. 备份现有配置:"
echo "      sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup"
echo ""
echo "   2. 复制新配置:"
echo "      sudo cp nginx.conf /etc/nginx/nginx.conf"
echo ""
echo "   3. 测试配置:"
echo "      sudo nginx -t"
echo ""
echo "   4. 重启服务:"
echo "      sudo systemctl restart nginx"
echo ""
echo "   5. 检查状态:"
echo "      sudo systemctl status nginx"
echo ""

# 测试命令
echo "🧪 测试命令:"
echo "   HTTP访问:  curl http://localhost/health"
echo "   API测试:   curl http://localhost/api/users"
echo "   HTTPS访问: curl -k https://localhost/health"
echo ""

# 访问地址
echo "🌐 访问地址:"
echo "   主页:      http://localhost"
echo "   API:       http://localhost/api/users" 
echo "   WebDAV:    http://localhost/webdav"
echo "   健康检查:  http://localhost/health"
echo ""

if [ -f "server/certs/server.crt" ]; then
    echo "   HTTPS主页: https://localhost"
    echo "   HTTPS API: https://localhost/api/users"
    echo ""
fi

echo "💡 提示:"
echo "   - 后端服务运行在3000端口"
echo "   - Nginx代理80端口到3000端口"
echo "   - 前端会自动适配API地址"
echo "   - 如需HTTPS，请确保SSL证书存在"

#!/bin/bash

# Nginx 配置部署脚本
# 用于部署和管理 nginx 反向代理配置

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
NGINX_CONF="$PROJECT_ROOT/config/nginx.conf"
API_SERVER_PORT=3000

echo "🔧 Nginx 配置部署工具"
echo "================================"

# 检查nginx是否安装
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        echo "❌ Nginx 未安装，请先安装 nginx"
        echo "Ubuntu/Debian: sudo apt update && sudo apt install nginx"
        echo "CentOS/RHEL: sudo yum install nginx 或 sudo dnf install nginx"
        exit 1
    fi
    echo "✅ Nginx 已安装: $(nginx -v 2>&1)"
}

# 检查API服务器是否运行
check_api_server() {
    if ! curl -s http://localhost:$API_SERVER_PORT/health > /dev/null 2>&1; then
        echo "⚠️  API 服务器 (端口 $API_SERVER_PORT) 未运行"
        echo "请先启动 API 服务器: npm run start:prod"
        return 1
    fi
    echo "✅ API 服务器运行正常 (端口 $API_SERVER_PORT)"
}

# 测试nginx配置
test_config() {
    echo "🧪 测试 nginx 配置..."
    
    if nginx -t -c "$NGINX_CONF"; then
        echo "✅ Nginx 配置测试通过"
        return 0
    else
        echo "❌ Nginx 配置测试失败"
        return 1
    fi
}

# 创建必要的目录
create_directories() {
    echo "📁 创建必要目录..."
    
    # 创建日志目录
    sudo mkdir -p /var/log/nginx
    sudo chown -R www-data:www-data /var/log/nginx 2>/dev/null || sudo chown -R nginx:nginx /var/log/nginx 2>/dev/null || true
    
    # 创建错误页面目录
    sudo mkdir -p /var/www/html/errPage
    
    # 部署维护页面
    if [ -f "$PROJECT_ROOT/templates/maintenance.html" ]; then
        sudo cp "$PROJECT_ROOT/templates/maintenance.html" /var/www/html/errPage/maintenance.html
    else
        echo "⚠️  维护页面模板不存在，使用默认页面"
        cat << 'EOF' | sudo tee /var/www/html/errPage/maintenance.html > /dev/null
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>系统维护中</title></head>
<body style="font-family:Arial;text-align:center;padding:50px;">
<h1>🔧 系统维护中</h1>
<p>抱歉，系统正在维护中，请稍后重试。</p>
<a href="javascript:location.reload()">刷新页面</a>
</body></html>
EOF
    fi
    
    # 设置权限
    sudo chown -R www-data:www-data /var/www/html/errPage 2>/dev/null || sudo chown -R nginx:nginx /var/www/html/errPage 2>/dev/null || true
    
    # 检查SSL证书目录
    if [ ! -d "$PROJECT_ROOT/server/certs" ]; then
        echo "⚠️  SSL 证书目录不存在: $PROJECT_ROOT/server/certs"
        echo "如需HTTPS，请先生成SSL证书"
    fi
    
    echo "✅ 目录创建完成"
}

# 备份现有配置
backup_config() {
    local backup_file="/etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)"
    
    if [ -f "/etc/nginx/nginx.conf" ]; then
        echo "📦 备份现有配置到: $backup_file"
        sudo cp /etc/nginx/nginx.conf "$backup_file"
    fi
}

# 部署配置
deploy_config() {
    echo "🚀 部署 nginx 配置..."
    
    # 备份现有配置
    backup_config
    
    # 复制新配置
    sudo cp "$NGINX_CONF" /etc/nginx/nginx.conf
    
    # 测试配置
    if ! sudo nginx -t; then
        echo "❌ 配置部署失败，恢复备份"
        if ls /etc/nginx/nginx.conf.backup.* 1> /dev/null 2>&1; then
            latest_backup=$(ls -t /etc/nginx/nginx.conf.backup.* | head -n1)
            sudo cp "$latest_backup" /etc/nginx/nginx.conf
        fi
        exit 1
    fi
    
    echo "✅ 配置部署成功"
}

# 重启nginx服务
restart_nginx() {
    echo "🔄 重启 nginx 服务..."
    
    if sudo systemctl restart nginx; then
        echo "✅ Nginx 重启成功"
        
        # 检查服务状态
        if sudo systemctl is-active nginx > /dev/null; then
            echo "✅ Nginx 服务运行正常"
        else
            echo "❌ Nginx 服务启动失败"
            sudo systemctl status nginx
            exit 1
        fi
    else
        echo "❌ Nginx 重启失败"
        sudo systemctl status nginx
        exit 1
    fi
}

# 测试代理功能
test_proxy() {
    echo "🧪 测试代理功能..."
    
    # 等待服务启动
    sleep 2
    
    # 测试HTTP
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/health | grep -q "200"; then
        echo "✅ HTTP 代理 (端口80) 工作正常"
    else
        echo "❌ HTTP 代理 (端口80) 测试失败"
    fi
    
    # 测试API
    if curl -s http://localhost/api/users | grep -q "\["; then
        echo "✅ API 代理工作正常"
    else
        echo "❌ API 代理测试失败"
    fi
    
    # 测试HTTPS (如果证书存在)
    if [ -f "$SCRIPT_DIR/server/certs/server.crt" ] && [ -f "$SCRIPT_DIR/server/certs/server.key" ]; then
        if curl -k -s -o /dev/null -w "%{http_code}" https://localhost/health | grep -q "200"; then
            echo "✅ HTTPS 代理 (端口443) 工作正常"
        else
            echo "⚠️  HTTPS 代理测试失败 (可能是证书问题)"
        fi
    else
        echo "ℹ️  跳过HTTPS测试 (证书文件不存在)"
    fi
}

# 显示状态信息
show_status() {
    echo ""
    echo "🎉 部署完成！"
    echo "================================"
    echo "HTTP 访问: http://localhost"
    echo "HTTPS 访问: https://localhost (如果配置了证书)"
    echo "API 测试: http://localhost/api/users"
    echo "健康检查: http://localhost/health"
    echo ""
    echo "服务状态:"
    echo "- API Server: http://localhost:$API_SERVER_PORT"
    echo "- Nginx: $(sudo systemctl is-active nginx)"
    echo ""
    echo "配置文件: /etc/nginx/nginx.conf"
    echo "日志目录: /var/log/nginx/"
}

# 生成自签名SSL证书
generate_ssl_cert() {
    local cert_dir="$PROJECT_ROOT/server/certs"
    
    echo "🔐 生成自签名SSL证书..."
    
    mkdir -p "$cert_dir"
    
    # 生成私钥
    openssl genrsa -out "$cert_dir/server.key" 2048
    
    # 生成证书请求
    openssl req -new -key "$cert_dir/server.key" -out "$cert_dir/server.csr" -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
    
    # 生成自签名证书
    openssl x509 -req -days 365 -in "$cert_dir/server.csr" -signkey "$cert_dir/server.key" -out "$cert_dir/server.crt"
    
    # 清理临时文件
    rm "$cert_dir/server.csr"
    
    # 设置权限
    chmod 600 "$cert_dir/server.key"
    chmod 644 "$cert_dir/server.crt"
    
    echo "✅ SSL证书生成完成"
    echo "证书位置: $cert_dir/server.crt"
    echo "私钥位置: $cert_dir/server.key"
}

# 主函数
main() {
    case "${1:-help}" in
        "test")
            check_nginx
            test_config
            ;;
        "deploy")
            check_nginx
            check_api_server || echo "⚠️  API服务器未运行，但继续部署nginx配置"
            create_directories
            test_config
            deploy_config
            restart_nginx
            test_proxy
            show_status
            ;;
        "cert")
            if command -v openssl &> /dev/null; then
                generate_ssl_cert
            else
                echo "❌ OpenSSL 未安装，无法生成证书"
                exit 1
            fi
            ;;
        "status")
            check_nginx
            check_api_server
            echo "Nginx状态: $(sudo systemctl is-active nginx)"
            ;;
        "restart")
            restart_nginx
            ;;
        "help"|*)
            echo "用法: $0 [command]"
            echo ""
            echo "命令:"
            echo "  test     - 测试nginx配置"
            echo "  deploy   - 部署nginx配置并重启服务"
            echo "  cert     - 生成自签名SSL证书"
            echo "  status   - 检查服务状态"
            echo "  restart  - 重启nginx服务"
            echo "  help     - 显示帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 test           # 测试配置"
            echo "  $0 cert           # 生成SSL证书"
            echo "  $0 deploy         # 部署配置"
            ;;
    esac
}

main "$@"

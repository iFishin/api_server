#!/bin/bash

# Nginx 多服务路径路由部署脚本
# 用途: 自动化部署 Nginx 配置，支持通过路径访问多个服务
# 使用: sudo ./deploy-nginx-routing.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="st-shortrange.quecinfo.com"
PROJECT_DIR="/usr/api_server"
NGINX_CONFIG_SOURCE="${PROJECT_DIR}/config/nginx-multi-service.conf"
CERT_DIR="${PROJECT_DIR}/server/certs"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 权限运行
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 sudo 运行此脚本"
        exit 1
    fi
    log_success "权限检查通过"
}

# 检查 Nginx 是否安装
check_nginx() {
    log_info "检查 Nginx 安装状态..."
    
    if ! command -v nginx &> /dev/null; then
        log_warning "Nginx 未安装，正在安装..."
        apt-get update
        apt-get install -y nginx
        log_success "Nginx 安装完成"
    else
        local version=$(nginx -v 2>&1 | grep -oP 'nginx/\K[0-9.]+')
        log_success "Nginx 已安装 (版本: $version)"
    fi
}

# 备份现有配置
backup_config() {
    log_info "备份现有 Nginx 配置..."
    
    local backup_dir="/etc/nginx/backups"
    mkdir -p "$backup_dir"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    if [ -f /etc/nginx/nginx.conf ]; then
        cp /etc/nginx/nginx.conf "${backup_dir}/nginx.conf.backup.${timestamp}"
        log_success "配置已备份到: ${backup_dir}/nginx.conf.backup.${timestamp}"
    fi
    
    if [ -d /etc/nginx/sites-enabled ]; then
        cp -r /etc/nginx/sites-enabled "${backup_dir}/sites-enabled.backup.${timestamp}"
        log_success "站点配置已备份"
    fi
}

# 检查 SSL 证书
check_ssl_cert() {
    log_info "检查 SSL 证书..."
    
    if [ ! -f "${CERT_DIR}/server.crt" ] || [ ! -f "${CERT_DIR}/server.key" ]; then
        log_warning "SSL 证书不存在，正在生成自签名证书..."
        
        mkdir -p "$CERT_DIR"
        
        openssl req -x509 -nodes -days 365 \
            -newkey rsa:4096 \
            -keyout "${CERT_DIR}/server.key" \
            -out "${CERT_DIR}/server.crt" \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=${DOMAIN}" \
            2>/dev/null
        
        chmod 600 "${CERT_DIR}/server.key"
        chmod 644 "${CERT_DIR}/server.crt"
        
        log_success "自签名证书已生成"
        log_warning "⚠️  生产环境请使用 Let's Encrypt 证书！"
    else
        log_success "SSL 证书已存在"
        
        # 检查证书是否即将过期
        local expiry_date=$(openssl x509 -enddate -noout -in "${CERT_DIR}/server.crt" | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry_date" +%s)
        local now_epoch=$(date +%s)
        local days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))
        
        if [ $days_left -lt 30 ]; then
            log_warning "证书将在 ${days_left} 天后过期，请及时更新"
        else
            log_info "证书有效期还有 ${days_left} 天"
        fi
    fi
}

# 部署 Nginx 配置
deploy_config() {
    log_info "部署 Nginx 配置..."
    
    if [ ! -f "$NGINX_CONFIG_SOURCE" ]; then
        log_error "配置文件不存在: $NGINX_CONFIG_SOURCE"
        exit 1
    fi
    
    # 方式1: 直接替换主配置（简单但不推荐）
    # cp "$NGINX_CONFIG_SOURCE" /etc/nginx/nginx.conf
    
    # 方式2: 使用 sites-available/sites-enabled（推荐）
    mkdir -p /etc/nginx/sites-available
    mkdir -p /etc/nginx/sites-enabled
    
    # 复制配置文件（只复制 server 块）
    local site_config="/etc/nginx/sites-available/${DOMAIN}"
    
    # 从源配置中提取 server 块并创建新配置
    cat > "$site_config" << 'EOF'
# 此文件由自动部署脚本生成
# 请勿手动编辑，所有修改将在下次部署时被覆盖
EOF
    
    # 直接复制完整配置
    cp "$NGINX_CONFIG_SOURCE" /etc/nginx/nginx.conf
    
    log_success "配置文件已部署"
}

# 测试配置
test_config() {
    log_info "测试 Nginx 配置..."
    
    if nginx -t 2>&1 | grep -q "successful"; then
        log_success "Nginx 配置测试通过"
        return 0
    else
        log_error "Nginx 配置测试失败"
        nginx -t
        return 1
    fi
}

# 创建日志目录
create_log_dir() {
    log_info "创建日志目录..."
    
    mkdir -p /var/log/nginx
    chown -R www-data:adm /var/log/nginx
    
    log_success "日志目录已准备就绪"
}

# 重载 Nginx
reload_nginx() {
    log_info "重载 Nginx 服务..."
    
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        log_success "Nginx 已重载"
    else
        systemctl start nginx
        log_success "Nginx 已启动"
    fi
    
    # 设置开机自启
    systemctl enable nginx
}

# 检查后端服务
check_backend_services() {
    log_info "检查后端服务状态..."
    
    local services=(
        "3000:主 API 服务"
        "5700:青龙面板 (QingLong)"
        "8080:1Panel 管理面板"
        "9090:OpenList 服务"
    )
    
    local all_ok=true
    
    for service in "${services[@]}"; do
        local port=$(echo $service | cut -d: -f1)
        local name=$(echo $service | cut -d: -f2)
        
        if netstat -tuln 2>/dev/null | grep -q ":${port} "; then
            log_success "✓ ${name} (端口 ${port}) 正在运行"
        else
            log_warning "✗ ${name} (端口 ${port}) 未运行"
            all_ok=false
        fi
    done
    
    if ! $all_ok; then
        log_warning "部分后端服务未运行，请启动相应服务"
    fi
}

# 测试部署
test_deployment() {
    log_info "测试部署..."
    
    # 等待 Nginx 完全启动
    sleep 2
    
    # 测试 HTTPS
    log_info "测试 HTTPS 访问..."
    if curl -k -s -o /dev/null -w "%{http_code}" https://localhost/ | grep -q "200\|301\|302"; then
        log_success "✓ HTTPS 服务正常"
    else
        log_warning "✗ HTTPS 服务可能有问题"
    fi
    
    # 测试 HTTP 重定向
    log_info "测试 HTTP 到 HTTPS 重定向..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "301"; then
        log_success "✓ HTTP 重定向正常"
    else
        log_warning "✗ HTTP 重定向可能有问题"
    fi
    
    # 测试 API 端点
    log_info "测试 API 端点..."
    if curl -k -s https://localhost/api/health | grep -q "healthy\|ok"; then
        log_success "✓ API 端点响应正常"
    else
        log_warning "✗ API 端点可能有问题"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}部署完成！${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${BLUE}访问地址：${NC}"
    echo "  主页:        https://${DOMAIN}/"
    echo "  API:         https://${DOMAIN}/api/"
    echo "  WebDAV:      https://${DOMAIN}/webdav/"
    echo "  青龙面板:     https://${DOMAIN}/qinglong/"
    echo "  1Panel:      https://${DOMAIN}/1panel/"
    echo "  OpenList:    https://${DOMAIN}/openlist/"
    echo ""
    echo -e "${BLUE}常用命令：${NC}"
    echo "  查看状态: sudo systemctl status nginx"
    echo "  重启服务: sudo systemctl restart nginx"
    echo "  重载配置: sudo nginx -s reload"
    echo "  测试配置: sudo nginx -t"
    echo "  查看日志: sudo tail -f /var/log/nginx/st-shortrange_ssl_access.log"
    echo ""
    echo -e "${YELLOW}注意事项：${NC}"
    echo "  1. 如果使用自签名证书，浏览器会显示安全警告"
    echo "  2. 生产环境请使用 Let's Encrypt 证书"
    echo "  3. 确保所有后端服务正在运行"
    echo "  4. 防火墙需要开放 80 和 443 端口"
    echo ""
    echo -e "${BLUE}添加新服务：${NC}"
    echo "  1. 编辑配置文件: /etc/nginx/nginx.conf"
    echo "  2. 添加 upstream 和 location 块"
    echo "  3. 测试配置: sudo nginx -t"
    echo "  4. 重载服务: sudo nginx -s reload"
    echo ""
    echo -e "详细文档: ${PROJECT_DIR}/docs/deployment/MULTI-SERVICE-ROUTING.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}Nginx 多服务路径路由部署脚本${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    check_root
    check_nginx
    backup_config
    check_ssl_cert
    create_log_dir
    deploy_config
    
    if test_config; then
        reload_nginx
        check_backend_services
        test_deployment
        show_deployment_info
    else
        log_error "部署失败，请检查配置文件"
        log_info "可以恢复备份: cp /etc/nginx/backups/nginx.conf.backup.* /etc/nginx/nginx.conf"
        exit 1
    fi
}

# 运行主函数
main

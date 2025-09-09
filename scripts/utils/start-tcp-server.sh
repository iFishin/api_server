#!/bin/bash

# 高精度TCP服务器启动脚本
# 用途：启动TCP服务器进行网络延迟测试

set -e

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UTILS_DIR="$SCRIPT_DIR"

# 默认配置
DEFAULT_PORT=8890
DEFAULT_HOST="0.0.0.0"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${BLUE}=== 高精度TCP服务器启动脚本 ===${NC}"
    echo ""
    echo "用途：启动高精度TCP服务器进行网络延迟和响应时间测试"
    echo ""
    echo "使用方法："
    echo "  $0 [选项]"
    echo ""
    echo "选项："
    echo "  -p, --port PORT     指定监听端口 (默认: $DEFAULT_PORT)"
    echo "  -h, --host HOST     指定监听地址 (默认: $DEFAULT_HOST)"
    echo "  --client PORT HOST  启动测试客户端连接到指定服务器"
    echo "  --help              显示此帮助信息"
    echo ""
    echo "示例："
    echo "  $0                           # 使用默认配置启动服务器"
    echo "  $0 -p 9999                   # 在端口9999启动服务器"
    echo "  $0 -p 8888 -h 192.168.1.100 # 在指定地址和端口启动服务器"
    echo "  $0 --client 8888 localhost  # 启动测试客户端"
    echo ""
    echo "功能特性："
    echo "  • 纳秒级高精度时间戳记录"
    echo "  • 100字节数据往返时间测试"
    echo "  • 3秒响应超时检测"
    echo "  • 详细日志和汇总报告生成"
    echo ""
}

# 检查Node.js是否安装
check_nodejs() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到Node.js，请先安装Node.js${NC}"
        exit 1
    fi
}

# 启动TCP服务器
start_server() {
    local port=$1
    local host=$2
    
    echo -e "${GREEN}正在启动高精度TCP服务器...${NC}"
    echo -e "${YELLOW}监听地址: ${host}:${port}${NC}"
    echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
    echo ""
    
    # 启动服务器
    node "$UTILS_DIR/tcp-server.js" "$port" "$host"
}

# 启动测试客户端
start_client() {
    local port=$1
    local host=$2
    
    echo -e "${GREEN}正在启动TCP测试客户端...${NC}"
    echo -e "${YELLOW}连接目标: ${host}:${port}${NC}"
    echo -e "${YELLOW}按 Ctrl+C 断开连接${NC}"
    echo ""
    
    # 启动客户端
    node "$UTILS_DIR/tcp-client.js" "$port" "$host"
}

# 主函数
main() {
    local port=$DEFAULT_PORT
    local host=$DEFAULT_HOST
    local mode="server"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--port)
                port="$2"
                shift 2
                ;;
            -h|--host)
                host="$2"
                shift 2
                ;;
            --client)
                mode="client"
                if [[ $# -ge 3 ]]; then
                    port="$2"
                    host="$3"
                    shift 3
                else
                    echo -e "${RED}错误: --client 需要指定端口和主机地址${NC}"
                    exit 1
                fi
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}错误: 未知参数 $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查Node.js
    check_nodejs
    
    # 验证端口号
    if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
        echo -e "${RED}错误: 无效的端口号 $port${NC}"
        exit 1
    fi
    
    # 启动相应模式
    if [ "$mode" = "server" ]; then
        start_server "$port" "$host"
    elif [ "$mode" = "client" ]; then
        start_client "$port" "$host"
    fi
}

# 运行主函数
main "$@"

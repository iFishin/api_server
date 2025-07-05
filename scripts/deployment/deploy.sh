#!/bin/bash

# API_Server 部署脚本
set -e

echo "🚀 开始部署 API_Server..."

# 配置变量
PROJECT_NAME="api-server"
BUILD_DIR="dist"
DOCKER_IMAGE="api-server:latest"

# 检查必要工具
command -v node >/dev/null 2>&1 || { echo "❌ 需要安装 Node.js"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ 需要安装 npm"; exit 1; }

echo "📦 安装依赖..."
npm ci

echo "🔨 构建项目..."
npm run build

echo "✅ 构建完成！"

# 选择部署方式
echo ""
echo "请选择部署方式："
echo "1) 本地部署 (Node.js)"
echo "2) Docker 部署"
echo "3) Docker Compose 部署 (推荐)"
echo "4) 仅构建，不部署"

read -p "请输入选择 (1-4): " deploy_choice

case $deploy_choice in
  1)
    echo "🚀 启动本地部署..."
    cd $BUILD_DIR
    npm install --production
    echo "✅ 部署完成！运行以下命令启动服务："
    echo "cd $BUILD_DIR && npm start"
    ;;
    
  2)
    echo "🐳 构建 Docker 镜像..."
    docker build -t $DOCKER_IMAGE .
    echo "✅ Docker 镜像构建完成！运行以下命令启动容器："
    echo "docker run -d -p 3000:3000 --name $PROJECT_NAME $DOCKER_IMAGE"
    ;;
    
  3)
    echo "🐳 使用 Docker Compose 部署..."
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build
    echo "✅ Docker Compose 部署完成！"
    echo "📊 查看日志: docker-compose logs -f"
    echo "🌐 访问地址: http://localhost"
    ;;
    
  4)
    echo "✅ 构建完成！构建文件位于 $BUILD_DIR 目录"
    ;;
    
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac

echo ""
echo "🎉 部署流程完成！"
echo ""
echo "📖 常用命令："
echo "- 查看运行状态: docker-compose ps"
echo "- 查看日志: docker-compose logs -f"
echo "- 停止服务: docker-compose down"
echo "- 重启服务: docker-compose restart"
echo ""

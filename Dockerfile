# 多阶段构建 Dockerfile
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiserver -u 1001

# 复制构建产物
COPY --from=builder /app/dist ./
COPY --from=builder /app/package-lock.json ./package-lock.json

# 安装生产依赖
RUN npm ci --omit=dev && npm cache clean --force

# 创建必要目录并设置权限
RUN mkdir -p /app/server/temps /app/server/uploads && \
    chown -R apiserver:nodejs /app

# 切换到非 root 用户
USER apiserver

# 设置环境变量
ENV NODE_ENV=production
ENV HTTP_PORT=3000
ENV HTTPS_PORT=3443

# 暴露应用端口，80/443 由 compose 中的 Nginx 容器提供
EXPOSE 3000 3443 1883 8883

# 健康检查（使用环境变量端口）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.HTTP_PORT || 3000; require('http').get(\`http://localhost:\${port}/api/health\`, (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 启动应用
CMD ["npm", "run", "start:prod"]

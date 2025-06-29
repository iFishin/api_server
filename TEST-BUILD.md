# 本地打包测试指南

## 快速开始

### 方法一：一键预览（推荐）
```bash
npm run preview
```
这个命令会自动构建项目并启动预览服务器。

### 方法二：分步操作
```bash
# 1. 构建项目
npm run build

# 2. 进入构建目录并安装依赖
cd dist
npm install --production

# 3. 启动服务器
npm start
```

### 方法三：使用测试工具
```bash
# 构建项目
node test-build.js build

# 构建并预览
node test-build.js preview

# 检查构建结果
node test-build.js check

# 清理构建文件
node test-build.js clean
```

## 测试步骤详解

### 1. 构建验证
```bash
# 执行构建
npm run build
# 或
node build.js
```

**预期结果：**
- ✅ 看到构建成功信息
- ✅ 生成 `dist` 目录
- ✅ 包含前端文件（HTML、CSS、JS）
- ✅ 包含后端编译文件
- ✅ 生成生产环境 package.json

### 2. 本地预览测试
```bash
npm run preview
```

**预期结果：**
- ✅ 依赖安装成功
- ✅ 服务器启动在 http://localhost:3000
- ✅ 能够正常访问主页
- ✅ 所有功能页面正常工作

### 3. 功能测试清单

访问 http://localhost:3000 后，请验证：

#### 主页 (/)
- ✅ 绿白渐变背景显示正常
- ✅ 毛玻璃效果正常
- ✅ 动态装饰元素显示
- ✅ 无滚动条，全屏显示
- ✅ 响应式布局在不同屏幕尺寸下正常

#### 功能页面
- ✅ HTTP API 测试页面 (/http-api)
- ✅ TCP/UDP API 页面 (/tcp-udp-api)
- ✅ MQTT API 页面 (/mqtt-api)
- ✅ WebDAV 文件管理 (/webdav)
- ✅ 工具箱页面 (/toolkit)
- ✅ 用户管理页面 (/users-api)

#### 工具箱功能
- ✅ JSON 格式化
- ✅ Base64 编码/解码
- ✅ URL 编码/解码
- ✅ 时间戳转换
- ✅ UUID 生成器
- ✅ 哈希生成器
- ✅ 字符串生成器
- ✅ JIRA 提取器

### 4. 性能测试

#### 构建大小检查
```bash
node test-build.js check
```

**预期指标：**
- index.html < 5KB
- 主要 CSS 文件 < 50KB
- 主要 JS 文件 < 500KB
- 总构建大小 < 5MB

#### Lighthouse 性能测试
```bash
# 启动服务器
npm run preview

# 在另一个终端运行（需要安装 @lhci/cli）
npx lhci autorun
```

## 常见问题解决

### 问题1：构建失败
```bash
# 清理 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 清理构建目录重新构建
node test-build.js clean
npm run build
```

### 问题2：服务器启动失败
```bash
# 检查端口占用
lsof -i :3000

# 或使用其他端口
PORT=3001 npm start
```

### 问题3：前端文件无法访问
```bash
# 检查 dist 目录结构
ls -la dist/
ls -la dist/assets/

# 检查服务器日志
npm run preview 2>&1 | tee server.log
```

### 问题4：API 接口报错
```bash
# 检查数据库文件
ls -la dist/database.db

# 检查环境变量
cat dist/.env.example
```

## 部署前检查清单

- [ ] 本地构建成功
- [ ] 本地预览正常
- [ ] 所有页面功能正常
- [ ] 响应式布局正常
- [ ] API 接口正常
- [ ] 静态资源加载正常
- [ ] 无控制台错误
- [ ] 性能指标达标

## 自动化测试

添加到 CI/CD 流程的测试命令：

```bash
# 构建测试
npm run build

# 检查构建结果
node test-build.js check

# 启动服务器测试（后台）
cd dist && npm install --production --silent
nohup npm start &

# 等待服务器启动
sleep 5

# 健康检查
curl -f http://localhost:3000/ || exit 1

# 停止服务器
pkill -f "node server/server.js"
```

## 提示

1. **首次测试**：建议使用 `node test-build.js preview` 获得详细的测试信息
2. **快速测试**：日常开发中使用 `npm run preview` 即可
3. **问题排查**：使用 `node test-build.js check` 检查构建完整性
4. **清理环境**：测试前使用 `node test-build.js clean` 确保干净环境

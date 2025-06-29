# 🤝 贡献指南

感谢您对 API_Server 项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、测试、反馈等。

## 📋 开始之前

### 行为准则

请阅读并遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。我们致力于为所有参与者提供友好、安全和包容的环境。

### 开发环境

- Node.js 18+
- npm 8+
- Git
- Docker (可选，用于容器化测试)

## 🚀 快速开始

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 fork 项目
   git clone https://github.com/你的用户名/api_server.git
   cd api_server
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 提交指南

### 提交消息格式

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 类型 (type)

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档修改
- `style`: 代码格式修改（不影响代码功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖修改
- `ci`: CI配置文件和脚本修改
- `chore`: 其他不修改src或test文件的更改

#### 示例

```bash
feat(api): add user authentication endpoint
fix(ui): resolve mobile responsive layout issue
docs(readme): update installation instructions
```

### 代码规范

1. **TypeScript**: 使用严格的类型检查
2. **ESLint**: 遵循项目的ESLint配置
3. **Prettier**: 使用统一的代码格式
4. **测试**: 为新功能编写测试

### 提交前检查

```bash
# 运行代码检查
npm run type-check

# 运行测试
npm run test

# 构建检查
npm run build
```

## 🔄 开发流程

### 1. 问题反馈

- 使用 [GitHub Issues](https://github.com/你的用户名/api_server/issues)
- 提供详细的问题描述
- 包含复现步骤
- 提供环境信息

### 2. 功能开发

1. **讨论**: 在 Issue 中讨论新功能
2. **设计**: 如果是大功能，先提供设计文档
3. **开发**: 创建功能分支进行开发
4. **测试**: 编写和运行测试
5. **文档**: 更新相关文档

### 3. Pull Request

1. **创建PR**: 从功能分支创建PR到main分支
2. **描述**: 提供清晰的PR描述
3. **检查**: 确保CI检查通过
4. **审查**: 等待代码审查
5. **合并**: 审查通过后合并

#### PR模板

```markdown
## 📝 更改说明

简要描述这个PR的目的和更改内容。

## 🔗 相关Issue

Fixes #(issue编号)

## 📋 更改类型

- [ ] Bug修复
- [ ] 新功能
- [ ] 重大更改 (会破坏现有功能的更改)
- [ ] 文档更新

## 🧪 测试

- [ ] 现有测试通过
- [ ] 添加了新测试
- [ ] 手动测试通过

## 📚 文档

- [ ] 更新了相关文档
- [ ] 更新了API文档
- [ ] 更新了README

## ✅ 检查清单

- [ ] 代码遵循项目规范
- [ ] 进行了自我代码审查
- [ ] 添加了必要的注释
- [ ] 更新了版本号（如适用）
```

## 🏗️ 项目结构

```
api_server/
├── src/                    # 前端源码
│   ├── components/         # Vue组件
│   ├── views/             # 页面视图
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript类型定义
├── server/                # 后端源码
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── services/         # 业务逻辑
│   ├── middlewares/      # 中间件
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript类型定义
├── tests/                # 测试文件
├── docs/                 # 文档
├── .github/              # GitHub配置
│   └── workflows/        # CI/CD工作流
└── docker/               # Docker配置
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定测试
npm run test -- --grep "用户API"

# 覆盖率报告
npm run test:coverage
```

### 编写测试

1. **单元测试**: 测试单个函数或组件
2. **集成测试**: 测试模块间的交互
3. **端到端测试**: 测试完整的用户流程

### 测试规范

- 使用描述性的测试名称
- 遵循 AAA 模式 (Arrange, Act, Assert)
- 保持测试简单和专注
- 使用适当的测试工具和库

## 📖 文档

### 文档类型

1. **API文档**: 使用JSDoc注释
2. **用户文档**: Markdown格式
3. **开发文档**: 技术设计和架构
4. **变更日志**: 记录版本变更

### 文档规范

- 保持文档与代码同步
- 使用清晰的语言和结构
- 提供代码示例
- 包含屏幕截图（如适用）

## 🚀 发布流程

### 版本管理

我们使用 [Semantic Versioning](https://semver.org/):

- `MAJOR`: 不兼容的API更改
- `MINOR`: 向后兼容的功能添加
- `PATCH`: 向后兼容的错误修复

### 发布步骤

1. **准备**: 确保所有测试通过
2. **版本**: 更新版本号
3. **标签**: 创建Git标签
4. **发布**: 自动构建和部署

## 🤔 需要帮助？

- 📧 发送邮件到: [maintainers@example.com](mailto:maintainers@example.com)
- 💬 在 [GitHub Discussions](https://github.com/你的用户名/api_server/discussions) 提问
- 🐛 在 [GitHub Issues](https://github.com/你的用户名/api_server/issues) 报告问题

## 🙏 感谢

感谢所有为这个项目做出贡献的人！

- [贡献者列表](https://github.com/你的用户名/api_server/graphs/contributors)
- [赞助商](https://github.com/sponsors/你的用户名)

---

再次感谢您的贡献！🎉

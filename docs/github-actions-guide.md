# GitHub Actions 工作流配置指南

本文档详细介绍了项目中的 GitHub Actions 工作流配置，包括安全扫描、依赖更新、CI/CD 流水线、Node.js 测试和发布流程。

## 📋 工作流概览

| 工作流 | 文件 | 触发条件 | 主要功能 | 并发控制 |
|--------|------|----------|----------|----------|
| 🔒 安全扫描 | `security.yml` | 每日定时、手动、Push/PR | 多类型安全扫描、漏洞检测 | ✅ 可取消 |
| 📦 依赖更新 | `dependencies.yml` | 每周定时、手动 | 自动依赖更新、安全补丁 | ✅ 不取消 |
| 🚀 CI/CD | `ci-cd.yml` | Push、PR、Release | 持续集成、部署流水线 | ✅ 按分支 |
| 🧪 Node.js 测试 | `node.js.yml` | 手动、Push、PR | 多平台测试、代码质量 | ✅ 可取消 |
| 📋 发布 | `release.yml` | Tag、手动 | 自动发布、版本管理 | ✅ 不取消 |

## 🎯 新增功能特性 (v2.0)

### 🔧 并发控制
所有工作流现在都配置了并发控制，确保资源的合理使用：
- **security.yml**: `cancel-in-progress: true` - 允许取消进行中的扫描
- **dependencies.yml**: `cancel-in-progress: false` - 避免依赖更新状态不一致
- **ci-cd.yml**: 按分支分组，避免冲突
- **release.yml**: `cancel-in-progress: false` - 避免部分发布状态
- **node.js.yml**: 支持并行测试，提高效率

### 📁 新增配置文件
```
.prettierrc           # 代码格式化配置（新增）
.eslintrc.json        # ESLint 代码检查配置（新增）
.github/codeql/       # CodeQL 安全分析配置（新增）
scripts/validate-workflows.sh  # 本地验证脚本（新增）
```

### 1. 🔒 Security Scan (`security.yml`)

**触发条件：**
- 每天凌晨 2:00（完整扫描）
- 每周一早上 8:00（完整扫描）
- 推送到 main/develop 分支
- 对 main 分支的 PR
- 手动触发（支持选择扫描类型和严重等级）

**主要功能：**
- **依赖安全扫描**：使用 npm audit 检查依赖漏洞
- **代码安全扫描**：使用 CodeQL 进行静态代码分析
- **密钥扫描**：使用 TruffleHog 检测泄露的密钥
- **Docker 镜像安全扫描**：使用 Trivy 扫描容器漏洞
- **许可证合规检查**：验证依赖包许可证合规性
- **自动修复**：自动修复可修复的安全问题并创建 PR
- **问题跟踪**：为无法自动修复的问题创建 Issue

**配置文件：**
- `.security-config.yml`：安全扫描配置
- `.security-ignore`：安全扫描忽略规则
- `.github/codeql/codeql-config.yml`：CodeQL 配置

### 2. 🔄 Dependency Updates (`dependencies.yml`)

**触发条件：**
- 每周一早上 8:00（minor 更新）
- 每月 1 号（major 更新检查）
- 手动触发（支持选择更新类型）

**主要功能：**
- **依赖分析**：检查可用的依赖更新
- **分类更新**：按 patch/minor/major 分类处理
- **安全更新优先**：优先处理安全相关更新
- **全面测试**：类型检查、构建测试、单元测试
- **自动 PR**：创建包含详细信息的 PR
- **验证失败处理**：为失败的更新创建 Issue
- **干运行模式**：支持预览模式

**更新策略：**
- `patch`：补丁版本更新（安全修复）
- `minor`：次版本更新（向后兼容的新功能）
- `major`：主版本更新（可能包含破坏性变更）
- `all`：所有可用更新

### 3. 🏗️ CI/CD Pipeline (`ci-cd.yml`)

**触发条件：**
- 推送到 main/develop 分支
- 标签推送 (v*.*.*)
- 对 main/develop 分支的 PR
- Release 发布
- 手动触发（支持环境选择）

**流水线阶段：**

#### Quality Check 阶段
- 类型检查（TypeScript）
- 代码格式化检查（Prettier）
- 代码风格检查（ESLint）
- 安全审计（npm audit）

#### Test 阶段
- 单元测试矩阵（支持多种测试类型）
- 集成测试（API 健康检查）
- 测试覆盖率报告
- 上传测试结果

#### Build 阶段
- 多环境构建支持
- 构建验证和分析
- 构建产物大小跟踪
- 构建缓存优化

#### Docker Build 阶段
- 多架构镜像构建（amd64/arm64）
- 安全扫描（Trivy）
- 镜像元数据和标签
- 镜像缓存优化

#### Deployment 阶段
- 开发环境部署（develop 分支）
- 生产环境部署（main 分支）
- 健康检查和验证
- 部署后监控

#### Performance Test 阶段
- Lighthouse CI 性能测试
- 性能报告生成
- 性能趋势分析

#### Cleanup 阶段
- 工作流总结报告
- 旧构建产物清理
- 资源使用统计

### 4. 🧪 Node.js CI (`node.js.yml`)

**触发条件：**
- 推送到 main/develop 分支（限相关文件）
- 对 main/develop 分支的 PR
- 手动触发（支持操作系统选择）

**测试矩阵：**
- **Node.js 版本**：18.x, 20.x, 22.x
- **操作系统**：Ubuntu, Windows, macOS（可选）
- **测试类型**：单元测试、集成测试

**主要功能：**
- **多平台兼容性测试**
- **环境信息收集**
- **依赖缓存优化**
- **代码质量检查**
- **构建验证**
- **测试覆盖率**
- **安全审计**
- **平台特定测试**
- **集成测试**：API 端点测试、协议测试
- **部署就绪检查**：生产构建验证

### 5. 🚀 Release (`release.yml`)

**触发条件：**
- 推送版本标签 (v*.*.*)
- 手动触发（支持版本和选项配置）

**发布流程：**

#### Pre-release Validation 阶段
- 版本格式验证
- 分支权限检查
- 版本唯一性验证
- 预发布版本检测
- 最终测试验证
- 自动生成 Changelog

#### Build and Release 阶段
- 生产构建
- 发布包创建
- 源码包生成
- 发布资产上传

#### Docker Release 阶段
- 多架构镜像构建
- 镜像标签管理
- SBOM 生成
- 镜像安全扫描

#### Production Deployment 阶段
- 生产环境部署
- 健康检查验证
- 部署通知

## 🔧 配置文件

### 环境变量
```yaml
# 通用配置
NODE_VERSION: '18'
REGISTRY: ghcr.io
IMAGE_NAME: ${{ github.repository }}

# CI/CD 特定
DOCKER_BUILDKIT: 1
CACHE_VERSION: v1

# Security 特定  
AUDIT_LEVEL: 'moderate'
ALLOWED_LICENSES: 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;Unlicense;0BSD'
FORBIDDEN_LICENSES: 'GPL-3.0;AGPL-3.0;LGPL-3.0'
```

### 必需的 GitHub Secrets
```yaml
# 可选但推荐
CODECOV_TOKEN: # Codecov 集成
DOCKERHUB_USERNAME: # Docker Hub 推送
DOCKERHUB_TOKEN: # Docker Hub 认证
```

### 环境配置
工作流支持以下环境：
- `development`：开发环境
- `staging`：测试环境  
- `production`：生产环境

## 📊 工作流优化特性

### 性能优化
- **并发控制**：避免重复运行
- **依赖缓存**：npm 和 Docker 层缓存
- **构建产物缓存**：跨工作流共享
- **有条件执行**：智能跳过不必要的作业

### 错误处理
- **继续执行**：某些失败不会阻止整个流程
- **重试机制**：网络错误自动重试
- **详细报告**：失败原因和解决建议
- **问题跟踪**：自动创建 Issue 和 PR

### 监控和报告
- **实时摘要**：GitHub 摘要中的详细报告
- **构建产物**：测试结果、覆盖率报告、日志
- **性能跟踪**：构建大小、测试时间趋势
- **安全报告**：漏洞扫描和合规检查

## 🚀 使用指南

### 开发工作流
1. **功能开发**：在 feature 分支开发
2. **创建 PR**：触发质量检查和测试
3. **合并到 develop**：触发开发环境部署
4. **合并到 main**：触发生产环境部署

### 发布流程
1. **准备发布**：确保所有测试通过
2. **创建标签**：`git tag v1.0.0 && git push origin v1.0.0`
3. **自动发布**：Release 工作流自动执行
4. **验证部署**：检查生产环境健康状态

### 安全维护
- **定期检查**：每日安全扫描报告
- **及时更新**：每周依赖更新 PR
- **漏洞响应**：自动修复或手动处理 Issue

### 故障排除
- **检查日志**：工作流详细日志和摘要
- **查看 Issue**：自动创建的问题跟踪
- **手动触发**：使用 workflow_dispatch 调试
- **环境变量**：检查配置和密钥设置

## 📋 维护清单

### 定期维护
- [ ] 检查工作流执行状态
- [ ] 更新 Node.js 版本
- [ ] 审查安全扫描结果
- [ ] 检查依赖更新 PR
- [ ] 更新文档和配置

### 问题处理
- [ ] 处理安全漏洞 Issue
- [ ] 解决构建失败
- [ ] 更新过时的依赖
- [ ] 优化工作流性能

这些工作流提供了完整的 DevOps 自动化解决方案，确保代码质量、安全性和可靠的部署流程。

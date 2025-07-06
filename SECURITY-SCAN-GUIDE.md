# 🔒 安全扫描配置指南

## 概述

本项目配置了全面的安全扫描系统，包括依赖漏洞扫描、代码安全分析、Docker镜像扫描和许可证合规检查。

## 🛠️ 配置要求

### GitHub Secrets (可选)

为了启用高级功能，您可以在GitHub仓库的Settings > Secrets中配置以下变量：

| 变量名 | 描述 | 是否必需 |
|--------|------|----------|
| `SLACK_SECURITY_WEBHOOK` | Slack安全通知Webhook URL | 可选 |
| `SECURITY_EMAIL` | 安全通知邮箱地址 | 可选 |
| `GITHUB_TOKEN` | GitHub访问令牌 (自动提供) | 自动 |

### 本地环境变量

无需特殊配置，GitHub Actions会自动处理大部分设置。

## 🔍 扫描类型

### 1. 依赖安全扫描 (`dependency-scan`)
- **功能**: 扫描npm依赖中的已知漏洞
- **工具**: `npm audit`
- **配置**: 扫描中等及以上严重级别的漏洞
- **自动修复**: 启用，会自动创建PR修复漏洞

### 2. 代码安全扫描 (`code-scan`)
- **功能**: 静态代码分析，检测安全漏洞和代码质量问题
- **工具**: GitHub CodeQL
- **语言**: JavaScript, TypeScript
- **报告**: 结果上传到GitHub Security标签页

### 3. Docker镜像扫描 (`docker-scan`)
- **功能**: 扫描Docker镜像中的漏洞
- **工具**: Trivy + TruffleHog
- **扫描级别**: CRITICAL, HIGH, MEDIUM
- **密钥扫描**: 检测代码中的硬编码密钥和敏感信息

### 4. 许可证合规扫描 (`license-scan`)
- **功能**: 检查依赖包的许可证合规性
- **工具**: license-checker
- **策略**: 见下方许可证配置

## 📋 许可证策略

### ✅ 允许的许可证
- MIT
- Apache-2.0
- BSD-2-Clause / BSD-3-Clause
- ISC
- Unlicense
- 0BSD

### ❌ 禁用的许可证
- GPL-3.0 / GPL-2.0
- AGPL-3.0 / AGPL-1.0
- LGPL-3.0 / LGPL-2.1

## 🔧 触发条件

### 自动触发
- **每日扫描**: 每天凌晨2点自动运行
- **代码推送**: 推送到main分支时触发
- **Pull Request**: 创建或更新PR时触发

### 手动触发
在GitHub Actions页面点击"Run workflow"按钮

## 📊 结果查看

### GitHub Security
1. 进入仓库的 **Security** 标签页
2. 查看 **Security advisories** 和 **Code scanning alerts**

### GitHub Actions
1. 进入 **Actions** 标签页
2. 选择 **Security Scan** 工作流
3. 查看具体的扫描报告和摘要

## 🚨 处理安全问题

### 自动修复
- 系统会自动尝试修复低风险漏洞
- 修复结果以PR形式提交，需要人工审查

### 手动处理
1. **高风险漏洞**: 立即处理，更新相关依赖
2. **中风险漏洞**: 在下个版本中修复
3. **误报**: 添加到 `.security-ignore` 文件中

## 📁 配置文件

- `.security-config.yml`: 安全扫描主配置
- `.security-ignore`: 忽略误报的规则
- `.nvmrc`: Node.js版本锁定
- `package.json`: 包含license-checker依赖

## 🔄 自定义配置

### 修改扫描严重级别
编辑 `.github/workflows/security.yml` 中的 `AUDIT_LEVEL` 环境变量：
```yaml
env:
  AUDIT_LEVEL: 'high'  # low, moderate, high, critical
```

### 添加许可证白名单
编辑 `ALLOWED_LICENSES` 环境变量：
```yaml
env:
  ALLOWED_LICENSES: 'MIT;Apache-2.0;BSD-3-Clause;新许可证'
```

### 排除扫描路径
在 `.security-ignore` 文件中添加要排除的路径或文件模式。

## 📞 支持

如果遇到安全扫描相关问题：

1. 检查GitHub Actions日志
2. 查看 `.security-config.yml` 配置
3. 参考本文档的故障排除部分
4. 联系项目维护者

---

> ⚠️ **注意**: 安全扫描只是安全策略的一部分。请确保遵循其他安全最佳实践，如定期更新依赖、使用强密码、启用双因素认证等。

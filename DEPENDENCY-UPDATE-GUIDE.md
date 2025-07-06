# 🔄 依赖更新自动化指南

## 概述

本项目配置了自动化的依赖更新系统，可以定期检查并更新npm依赖包，确保项目安全性和稳定性。

## 🔑 Token配置

### GITHUB_TOKEN (无需手动设置)

✅ **自动提供**: `${{ secrets.GITHUB_TOKEN }}` 是GitHub Actions自动提供的令牌

✅ **无需配置**: 无需在GitHub Settings > Secrets中手动创建

✅ **足够权限**: 具有以下权限：
- 读取代码
- 创建和管理Pull Request
- 提交代码变更
- 访问仓库基本信息

### 🚀 高级配置 (可选)

如果您需要更高级的功能，可以考虑创建Personal Access Token (PAT)：

#### 何时需要PAT？
- 触发其他工作流 (GITHUB_TOKEN有限制)
- 访问其他仓库
- 需要管理员级别权限

#### 创建PAT步骤：
1. GitHub Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. 选择权限：`repo`, `workflow`
4. 复制生成的token
5. 在仓库 Settings > Secrets > Actions 中创建 `PAT_TOKEN`

## ⚙️ 工作流配置

### 触发条件
- **定时运行**: 每周一早上8点
- **手动触发**: GitHub Actions页面点击"Run workflow"

### 更新策略
- **安全更新**: 自动应用补丁版本更新 (如 1.0.1 → 1.0.2)
- **兼容更新**: 自动应用次版本更新 (如 1.0.0 → 1.1.0)
- **主版本**: 不自动更新，需要手动处理

### 验证流程
1. **类型检查**: TypeScript类型验证
2. **测试运行**: 执行npm test (如果存在)
3. **构建测试**: 执行npm run build
4. **创建PR**: 所有检查通过后创建Pull Request

## 📊 使用方法

### 查看更新状态
1. 进入GitHub仓库
2. 点击 **Actions** 标签页
3. 选择 **Dependency Updates** 工作流
4. 查看最新运行结果

### 处理更新PR
1. 工作流会自动创建PR (如果有更新)
2. PR标题格式: `🔄 Automated dependency updates - YYYY-MM-DD`
3. 包含详细的更新信息和验证结果
4. **请仔细审查**后再合并

### 手动触发更新
```bash
# 在GitHub Actions页面点击 "Run workflow" 按钮
# 或使用GitHub CLI (需要安装gh命令)
gh workflow run "Dependency Updates"
```

## 🛠️ 自定义配置

### 修改更新频率
编辑 `.github/workflows/dependencies.yml`:
```yaml
on:
  schedule:
    # 每天检查 (不推荐，太频繁)
    - cron: '0 8 * * *'
    # 每两周检查
    - cron: '0 8 */14 * *'
    # 每月1号检查
    - cron: '0 8 1 * *'
```

### 排除特定依赖
在 `package.json` 中添加：
```json
{
  "overrides": {
    "package-name": "^1.0.0"
  }
}
```

### 添加审查者
编辑工作流文件，取消注释并修改：
```yaml
reviewers: |
  your-username
  teammate-username
```

## 📋 最佳实践

### ✅ 推荐做法
- **定期审查**: 及时处理自动创建的PR
- **测试验证**: 合并前在本地测试更新
- **逐步更新**: 不要一次性更新过多依赖
- **备份重要**: 更新前确保有工作的备份

### ❌ 避免事项
- 不要盲目合并所有更新PR
- 不要忽略构建或测试失败
- 不要在生产部署前跳过测试
- 不要禁用安全更新

## 🚨 故障排除

### PR创建失败
**原因**: 权限不足或token过期
**解决**: 检查GITHUB_TOKEN权限，确保workflow有write权限

### 测试失败
**原因**: 依赖更新导致兼容性问题
**解决**: 
1. 查看具体错误信息
2. 手动回滚有问题的依赖
3. 逐个更新排查问题

### 构建失败
**原因**: 新版本依赖的API变化
**解决**:
1. 查看依赖的CHANGELOG
2. 更新相关代码适配新API
3. 考虑锁定问题依赖版本

## 📞 支持

遇到问题时：
1. 查看GitHub Actions日志
2. 检查PR中的详细错误信息
3. 参考本文档的故障排除部分
4. 联系项目维护者

---

> 💡 **提示**: 依赖更新是维护项目安全性的重要环节，建议定期关注并处理更新PR。

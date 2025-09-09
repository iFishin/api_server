# 测试目录结构说明

## 📁 目录结构

```
tests/
├── index.ts                                 # 测试入口文件
├── config.ts                               # 测试配置和工具函数
└── services/
    ├── overtimeService.test.ts             # 加班服务单元测试
    └── overtimeService.integration.test.ts # 加班服务集成测试
```

## 🎯 组织原则

### 1. 按模块分类
- `services/` - 服务层测试
- `controllers/` - 控制器层测试（未来扩展）
- `models/` - 数据模型测试（未来扩展）
- `utils/` - 工具函数测试（未来扩展）

### 2. 测试文件命名规范
- `*.test.ts` - 单元测试
- `*.integration.test.ts` - 集成测试
- `*.e2e.test.ts` - 端到端测试（未来扩展）

### 3. 导入路径规范
测试文件中导入被测试模块使用相对路径：
```typescript
import { functionName } from '../../server/services/moduleName';
```

## 🛠️ 配置文件

### tests/config.ts
包含：
- 通用Mock配置
- 测试数据模板
- 测试工具函数

### tests/index.ts  
统一导出所有测试模块，方便管理。

## 🚀 使用方法

### 运行所有测试
```bash
npm run test:run
```

### 运行特定测试文件
```bash
# 运行加班服务测试
npx vitest tests/services/overtimeService.test.ts

# 运行集成测试
npx vitest tests/services/overtimeService.integration.test.ts
```

### 观察模式
```bash
npm run test:watch
```

### 可视化界面
```bash
npm run test:ui
```

## 📊 当前测试状态

- ✅ **22个测试用例**全部通过
- ✅ **90.2%的代码覆盖率**
- ✅ 单元测试 + 集成测试
- ✅ 真实场景模拟

## 🎯 扩展指南

### 添加新的服务测试
1. 在 `tests/services/` 下创建对应的测试文件
2. 使用相对路径导入被测试的服务
3. 在 `tests/index.ts` 中添加导出

### 添加新的测试分类
1. 在 `tests/` 下创建新的目录（如 `controllers/`）
2. 按照相同的命名规范创建测试文件
3. 更新 `tests/index.ts` 导出新的测试模块

### 示例：添加控制器测试
```typescript
// tests/controllers/overtimeController.test.ts
import { describe, it, expect } from 'vitest';
import { someControllerFunction } from '../../server/controllers/overtimeController';

describe('OvertimeController', () => {
  it('should handle requests correctly', () => {
    // 测试代码
  });
});
```

## 🔧 工具和配置

### Vitest配置路径
- `vitest.config.ts` - 主要Vitest配置
- `vite.config.ts` - Vite集成配置

### 别名配置
- `@tests` - 指向 `./tests` 目录
- `@server` - 指向 `./server` 目录

## 💡 最佳实践

1. **保持测试独立性** - 每个测试都应该能够独立运行
2. **清理测试状态** - 使用 `beforeEach` 和 `afterEach` 清理状态
3. **有意义的测试名称** - 测试描述应该清楚说明测试的目的
4. **适当的测试粒度** - 单元测试应该专注于单个函数或方法
5. **使用共享配置** - 利用 `tests/config.ts` 共享测试数据和工具

## 🎉 总结

新的测试目录结构提供了：
- 🗂️ 清晰的文件组织
- 🔧 统一的配置管理
- 🚀 易于扩展的架构
- 📊 完整的测试覆盖

这种结构使得测试文件易于查找、管理和维护，为项目的长期发展奠定了良好的基础。

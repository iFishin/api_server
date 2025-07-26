# Vitest 测试框架使用指南

## 概述

本项目已成功集成 Vitest 测试框架，专门用于测试加班时长统计脚本 (`overtimeService.ts`)。Vitest 是一个快速、轻量级的现代测试框架，与 Vite 生态系统完美集成。

## 安装的依赖

- `vitest` - 核心测试框架
- `@vitest/ui` - 可视化测试界面
- `@vitest/coverage-v8` - 代码覆盖率工具

## 可用的测试命令

### 基本测试命令

```bash
# 运行所有测试（一次性）
npm run test:run

# 观察模式运行测试（文件变化时自动重新运行）
npm run test

# 启动可视化测试界面
npm run test:ui

# 运行测试并生成覆盖率报告
npm run test:coverage

# 观察模式运行测试
npm run test:watch
```

### 遗留测试命令

```bash
# 运行旧版测试（保持向后兼容）
npm run test:legacy
```

## 测试文件结构

```
server/services/
├── overtimeService.ts                    # 被测试的源文件
├── overtimeService.test.ts               # 单元测试
└── overtimeService.integration.test.ts   # 集成测试
```

## 测试覆盖范围

### 1. 单元测试 (`overtimeService.test.ts`)

涵盖以下测试场景：

#### processOvertimeJson 方法测试
- ✅ 工作日加班费用计算
- ✅ 周末加班费用计算  
- ✅ 节假日加班费用计算
- ✅ 矿工时间处理（工作日不足8小时）
- ✅ 弹性上班时间处理
- ✅ 迟到情况处理
- ✅ 个人假期扣减
- ✅ 参数验证和错误处理
- ✅ 多天混合加班记录

#### processPunchRecords 方法测试
- ✅ 打卡记录处理
- ✅ 不足记录的处理
- ✅ 多次打卡记录处理

#### calculateOvertime 兼容性测试
- ✅ 旧版API兼容性

#### 边界条件测试
- ✅ 午休时间边界情况
- ✅ 异地打卡记录
- ✅ API获取节假日信息失败的兜底逻辑

#### 性能测试
- ✅ 大量记录处理性能（100条记录 < 5秒）

#### 数据验证测试
- ✅ 时间格式验证
- ✅ 日期类型规范化

### 2. 集成测试 (`overtimeService.integration.test.ts`)

真实场景测试：

#### 真实场景：程序员一周的加班记录
- 包含正常上班、加班到很晚、迟到但加班补回、矿工时间、周末加班等多种情况

#### 真实场景：国庆假期值班  
- 测试节假日3倍工资计算

#### 真实场景：弹性工作制测试
- 测试弹性上下班时间的计算逻辑

## 代码覆盖率

当前 `overtimeService.ts` 的测试覆盖率：
- **语句覆盖率**: 90.2%
- **分支覆盖率**: 80.57% 
- **函数覆盖率**: 100%
- **行覆盖率**: 90.2%

## 配置文件

### vitest.config.ts
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['server/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/**/*.ts'],
      exclude: ['server/**/*.test.ts', 'server/**/*.spec.ts']
    }
  }
})
```

### vite.config.ts 测试配置
```typescript
export default defineConfig({
  // ... 其他配置
  test: {
    globals: true,
    environment: 'node',
    include: [
      'server/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ]
  }
})
```

## 使用示例

### 编写新的测试

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processOvertimeJson } from './overtimeService';

describe('新功能测试', () => {
  beforeEach(() => {
    // 每个测试前的设置
    vi.clearAllMocks();
  });

  it('应该正确处理特定场景', async () => {
    const testData = {
      hourlyRate: 30,
      customData: [
        {
          date: '2024-01-15',
          startTime: '09:00:00',
          endTime: '20:00:00',
          dayType: '工作日'
        }
      ]
    };

    const result = await processOvertimeJson(testData);
    
    expect(result).toContain('工作日加班收入');
  });
});
```

### Mock 外部依赖

```typescript
// Mock fetch API
global.fetch = vi.fn();

beforeEach(() => {
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: async () => ({
      code: 0,
      holiday: {}
    })
  });
});
```

## 最佳实践

### 1. 测试组织
- 使用 `describe` 组织相关测试
- 使用清晰的测试描述
- 按功能模块分组测试

### 2. 测试数据
- 使用真实场景的测试数据
- 覆盖边界条件和异常情况
- 测试各种输入组合

### 3. 断言策略
- 使用明确的断言
- 测试预期的输出格式
- 验证数值计算的准确性

### 4. Mock 策略
- Mock 外部依赖（如API调用）
- 保持Mock的简单和可维护
- 为失败场景提供Mock

## 故障排除

### 常见问题

1. **测试运行缓慢**
   - 检查是否有无限循环
   - 减少测试数据规模
   - 使用 `vi.clearAllMocks()` 清理状态

2. **覆盖率报告不准确**
   - 确保测试文件不在覆盖率统计中
   - 检查 include/exclude 配置

3. **异步测试失败**
   - 使用 `async/await`
   - 设置合适的超时时间
   - 正确处理 Promise

### 调试技巧

```typescript
// 启用详细日志
console.log('测试数据:', testData);

// 使用 console.table 查看对象
console.table(result);

// 检查中间计算结果
expect(intermediateResult).toBeDefined();
```

## 持续集成

测试可以集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run Tests
  run: npm run test:run

- name: Generate Coverage Report  
  run: npm run test:coverage
```

## 总结

Vitest 测试框架已成功为加班时长统计脚本提供了全面的测试覆盖，包括：

- ✅ 22个测试用例，100%通过
- ✅ 90.2%的代码覆盖率
- ✅ 单元测试和集成测试
- ✅ 可视化测试界面
- ✅ 覆盖率报告
- ✅ 性能测试
- ✅ 真实场景模拟

这确保了加班计算逻辑的正确性和可靠性，为代码重构和功能扩展提供了安全保障。

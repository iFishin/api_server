/**
 * 加班时长统计服务的集成测试
 * 测试实际场景下的加班计算功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processOvertimeJson } from '../../server/services/overtimeService';

// Mock fetch API for integration tests
global.fetch = vi.fn();

describe('OvertimeService 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock 成功的节假日API响应
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        holiday: {
          '2024-10-01': { holiday: true, name: '国庆节', wage: 3, date: '2024-10-01' },
          '2024-10-02': { holiday: true, name: '国庆节', wage: 3, date: '2024-10-02' },
          '2024-10-03': { holiday: true, name: '国庆节', wage: 3, date: '2024-10-03' }
        }
      })
    });
  });

  it('真实场景：程序员一周的加班记录', async () => {
    const weeklyData = {
      hourlyRate: 35,
      customData: [
        // 周一正常上班
        {
          date: '2024-10-14',
          startTime: '09:15:00',
          endTime: '18:30:00',
          dayType: '工作日'
        },
        // 周二加班到很晚
        {
          date: '2024-10-15',
          startTime: '09:00:00',
          endTime: '22:30:00',
          dayType: '工作日'
        },
        // 周三迟到但加班补回来
        {
          date: '2024-10-16',
          startTime: '10:30:00',
          endTime: '20:30:00',
          dayType: '工作日'
        },
        // 周四矿工（请假半天）
        {
          date: '2024-10-17',
          startTime: '13:30:00',
          endTime: '18:00:00',
          dayType: '工作日'
        },
        // 周五正常但加班1小时
        {
          date: '2024-10-18',
          startTime: '09:00:00',
          endTime: '20:00:00',
          dayType: '工作日'
        },
        // 周六加班（紧急需求）
        {
          date: '2024-10-19',
          startTime: '10:00:00',
          endTime: '17:00:00',
          dayType: '周末'
        }
      ]
    };
    
    const result = await processOvertimeJson(weeklyData);
    
    console.log('一周加班统计结果：\n', result);
    
    // 验证结果包含预期内容
    expect(result).toContain('工作日加班收入');
    expect(result).toContain('周末加班收入');
    expect(result).toContain('总餐补');
    expect(result).toContain('迟到次数');
    // 检查工作日加班时长，应该有正数值（代表正常加班）和负数的影响（矿工时间影响了总和）
    expect(result).toContain('工作日加班时长: 2.25小时');
  });

  it('真实场景：国庆假期值班', async () => {
    const holidayData = {
      hourlyRate: 40,
      customData: [
        // 国庆节值班
        {
          date: '2024-10-01',
          startTime: '09:00:00',
          endTime: '18:00:00',
          dayType: '节假日'
        },
        // 国庆假期第二天值班
        {
          date: '2024-10-02',
          startTime: '10:00:00',
          endTime: '16:00:00',
          dayType: '节假日'
        }
      ]
    };
    
    const result = await processOvertimeJson(holidayData);
    
    console.log('国庆值班统计结果：\n', result);
    
    // 验证节假日3倍工资
    expect(result).toContain('节假日加班收入');
    expect(result).toContain('总餐补: 40.00元'); // 两天都超过4小时
  });

  it('真实场景：弹性工作制测试', async () => {
    const flexibleData = {
      hourlyRate: 32,
      customData: [
        // 早上8:30上班，晚上6:30下班（正好8小时+1.5小时午休）
        {
          date: '2024-10-21',
          startTime: '08:30:00',
          endTime: '18:30:00',
          dayType: '工作日'
        },
        // 晚上9:30上班，晚上7:00下班（晚到1小时，正好8小时+1.5小时午休）
        {
          date: '2024-10-22',
          startTime: '09:30:00',
          endTime: '19:00:00',
          dayType: '工作日'
        },
        // 早上9:00上班，晚上8:30下班（1.5小时加班）
        {
          date: '2024-10-23',
          startTime: '09:00:00',
          endTime: '20:30:00',
          dayType: '工作日'
        }
      ]
    };
    
    const result = await processOvertimeJson(flexibleData);
    
    console.log('弹性工作制统计结果：\n', result);
    
    // 验证弹性工作时间计算
    expect(result).toContain('工作日加班收入');
    expect(result).toContain('迟到次数: 0次'); // 9:30前不算迟到
  });
});

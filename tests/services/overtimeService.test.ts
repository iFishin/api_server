/**
 * 加班时长统计服务的单元测试
 * 使用 Vitest 框架进行测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  processOvertimeJson, 
  processPunchRecords,
  calculateOvertime 
} from '../../server/services/overtimeService';

// Mock fetch API
global.fetch = vi.fn();

describe('OvertimeService 加班时长统计测试', () => {
  beforeEach(() => {
    // 清除所有mock状态
    vi.clearAllMocks();
    
    // Mock节假日API响应
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        holiday: {
          '2024-01-01': { holiday: true, name: '元旦', wage: 3, date: '2024-01-01' },
          '2024-12-25': { holiday: false, name: '圣诞节', date: '2024-12-25' },
          '2024-06-15': { holiday: false, rest: 0, date: '2024-06-15' }, // 周六调休上班
          '2024-06-16': { holiday: false, rest: 1, date: '2024-06-16' }  // 周日正常休息
        }
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('processOvertimeJson 方法测试', () => {
    it('应该正确计算工作日加班费用', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '09:00:00',
            endTime: '20:30:00', // 19:00后1.5小时加班
            dayType: '工作日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('工作日加班收入');
      expect(result).toContain('45.00元'); // 1.5小时 × 1倍 × 30元/小时
      expect(result).toContain('餐补');
      expect(result).toContain('20.00元'); // 超过1小时的工作日加班餐补
    });

    it('应该正确计算周末加班费用', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-20', // 周六
            startTime: '09:00:00',
            endTime: '18:00:00', // 7.5小时工作（扣除1.5小时午休）
            dayType: '周末'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('周末加班收入');
      // 7.5小时 × 1.5倍 × 30元/小时 = 337.5元
      expect(result).toContain('337.50元');
      expect(result).toContain('餐补');
      expect(result).toContain('20.00元'); // 超过4小时的周末加班餐补
    });

    it('应该正确计算节假日加班费用', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-01', // 元旦
            startTime: '09:00:00',
            endTime: '17:00:00', // 6.5小时工作（扣除1.5小时午休）
            dayType: '节假日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('节假日加班收入');
      // 6.5小时 × 3倍 × 30元/小时 = 585元
      expect(result).toContain('585.00元');
      expect(result).toContain('餐补');
      expect(result).toContain('20.00元'); // 超过4小时的节假日加班餐补
    });

    it('应该正确处理矿工时间（工作日不足8小时）', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '09:30:00',
            endTime: '17:00:00', // 实际工作6小时，矿工2小时
            dayType: '工作日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('矿工时间');
      expect(result).toContain('工作日加班收入: -60.00元'); // -2小时 × 1倍 × 30元/小时
      expect(result).toContain('总餐补: 0.00元'); // 没有加班不给餐补
    });

    it('应该正确处理弹性上班时间', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '08:30:00', // 最早上班时间
            endTime: '20:00:00', // 19:00后1小时加班
            dayType: '工作日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('工作日加班收入: 30.00元'); // 1小时 × 1倍 × 30元/小时
      expect(result).toContain('餐补');
      expect(result).toContain('20.00元');
    });

    it('应该正确处理迟到情况', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '10:00:00', // 迟到30分钟（9:30后）
            endTime: '20:00:00',
            dayType: '工作日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('当前迟到次数: 1次');
      expect(result).toContain('当前迟到时长: 30分钟');
    });

    it('应该正确处理个人假期扣减', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '09:00:00',
            endTime: '21:00:00', // 19:00后2小时加班
            dayType: '工作日'
          }
        ],
        personalLeaveHours: 1 // 1小时个人假期
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('实际加班薪资: 30.00元'); // (2-1)小时 × 1倍 × 30元/小时
      expect(result).toContain('扣减后加班时长: 1.00小时');
    });

    it('应该抛出错误当缺少必要参数时', async () => {
      const invalidData = {
        hourlyRate: 0, // 无效的工资基数
        customData: []
      };

      await expect(processOvertimeJson(invalidData)).rejects.toThrow('缺少必要参数或参数格式错误');
    });

    it('应该正确处理多天混合加班记录', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15', // 工作日
            startTime: '09:00:00',
            endTime: '20:00:00', // 1小时加班
            dayType: '工作日'
          },
          {
            date: '2024-01-20', // 周末
            startTime: '09:00:00',
            endTime: '15:00:00', // 4.5小时工作
            dayType: '周末'
          },
          {
            date: '2024-01-01', // 节假日
            startTime: '10:00:00',
            endTime: '16:00:00', // 4.5小时工作
            dayType: '节假日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('工作日加班收入: 30.00元'); // 1小时 × 1倍 × 30
      expect(result).toContain('周末加班收入: 202.50元'); // 4.5小时 × 1.5倍 × 30
      expect(result).toContain('节假日加班收入: 405.00元'); // 4.5小时 × 3倍 × 30
      expect(result).toContain('总餐补: 60.00元'); // 工作日20 + 周末20 + 节假日20
    });
  });

  describe('processPunchRecords 方法测试', () => {
    it('应该正确处理打卡记录', async () => {
      const punchRecords = [
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-15 09:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-15 20:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      expect(result).toContain('工作日加班收入');
      expect(result).toContain('30.00元'); // 1小时 × 1倍 × 30元/小时
    });

    it('应该正确处理打卡记录不足的情况（创建矿工记录）', async () => {
      const punchRecords = [
        // 只有一次打卡记录
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-15 09:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        }
      ];

      // 现在不再抛出错误，而是创建矿工记录
      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该包含矿工相关信息
      expect(result).toContain('矿工');
      expect(result).toContain('扣除');
      expect(result).toContain('李在赣神魔？'); // 矿工评级
    });

    it('应该正确处理同一天多次打卡记录', async () => {
      const punchRecords = [
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-15 08:30:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-15 12:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '3',
          CARDTIME: '2024-01-15 13:30:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '4',
          CARDTIME: '2024-01-15 20:30:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该取第一条和最后一条记录计算加班
      expect(result).toContain('工作日加班收入');
      expect(result).toContain('45.00元'); // 1.5小时 × 1倍 × 30元/小时
    });
  });

  describe('calculateOvertime 兼容性测试', () => {
    it('应该正确处理旧版API调用', async () => {
      const result = await calculateOvertime(8, 30, '', '2024-01');
      
      expect(result).toContain('工作日加班收入');
      expect(result).toContain('0.00元'); // 没有加班
    });
  });

  describe('边界条件测试', () => {
    it('应该正确处理午休时间边界情况', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '11:30:00',
            endTime: '14:00:00', // 跨越午休时间
            dayType: '工作日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      // 2.5小时 - 1.5小时午休 = 1小时实际工作，矿工7小时
      expect(result).toContain('矿工时间');
      expect(result).toContain('-210.00元'); // -7小时 × 1倍 × 30元/小时
    });

    it('应该正确处理异地打卡记录', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '09:00:00',
            endTime: '异地打卡', // 异地打卡标记
            dayType: '工作日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('总加班时长: 0.00小时');
    });

    it('应该正确处理API获取节假日信息失败的情况', async () => {
      // Mock API失败
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const punchRecords = [
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-20 09:00:00', // 周六
          SHIFTTERM: '2024-01-20',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-20 18:00:00',
          SHIFTTERM: '2024-01-20',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该使用基本的周末判断逻辑
      expect(result).toContain('周末加班收入');
    });
  });

  describe('性能测试', () => {
    it('应该能快速处理大量记录', async () => {
      const largeTestData = {
        hourlyRate: 30,
        customData: Array.from({ length: 100 }, (_, i) => ({
          date: `2024-01-${(i % 30 + 1).toString().padStart(2, '0')}`,
          startTime: '09:00:00',
          endTime: '20:00:00',
          dayType: i % 3 === 0 ? '工作日' : i % 3 === 1 ? '周末' : '节假日'
        }))
      };

      const startTime = Date.now();
      const result = await processOvertimeJson(largeTestData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(result).toContain('总加班薪资');
    });
  });

  describe('数据验证测试', () => {
    it('应该正确验证时间格式', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '9:00', // 没有秒
            endTime: '20:00:00',
            dayType: '工作日'
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      // 应该能正确处理不同的时间格式
      expect(result).toContain('工作日加班收入');
    });

    it('应该正确处理日期类型规范化', async () => {
      const testData = {
        hourlyRate: 30,
        customData: [
          {
            date: '2024-01-15',
            startTime: '09:00:00',
            endTime: '20:00:00',
            dayType: 'weekday' // 英文类型
          },
          {
            date: '2024-01-20',
            startTime: '09:00:00',
            endTime: '18:00:00',
            dayType: '星期六' // 中文描述
          }
        ]
      };

      const result = await processOvertimeJson(testData);
      
      expect(result).toContain('工作日加班收入');
      expect(result).toContain('周末加班收入');
    });
  });
});

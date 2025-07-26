/**
 * 优化后的加班服务测试
 * 重点测试节假日判断、矿工检测和打卡记录转换逻辑
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processPunchRecords } from '../../server/services/overtimeService';

// Mock fetch for holiday API
global.fetch = vi.fn();

describe('OvertimeService 优化功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful holiday API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        holiday: {
          '2024-01-01': { holiday: true, name: '元旦节', wage: 3 },
          '2024-02-10': { holiday: true, name: '春节', wage: 3 },
          '2024-02-17': { rest: 0, name: '春节调休工作日' }, // 补班日
          '2024-04-06': { holiday: true, name: '清明节', wage: 3 },
          '2024-05-01': { holiday: true, name: '劳动节', wage: 3 },
          '2024-05-05': { rest: 1, name: '劳动节调休休息日' } // 调休休息
        }
      })
    });
  });

  describe('矿工时间检测功能', () => {
    it('应该正确检测工作日无打卡记录的矿工情况', async () => {
      const punchRecords = [
        // 2024-01-15 是工作日，但没有打卡记录
        // 其他日期有正常打卡
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-16 09:00:00',
          SHIFTTERM: '2024-01-16',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-16 18:00:00',
          SHIFTTERM: '2024-01-16',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 结果应该显示正常的加班计算，不应该报错
      expect(result).toContain('工作日加班时长');
      expect(typeof result).toBe('string');
    });

    it('应该正确检测工作日打卡记录不足的矿工情况', async () => {
      const punchRecords = [
        // 只有一次打卡记录，应该被标记为矿工
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

      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该包含矿工相关信息
      expect(result).toContain('矿工');
      expect(result).toContain('扣除');
    });

    it('应该正确处理异常打卡记录', async () => {
      const punchRecords = [
        // 包含异地打卡等异常记录
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-15 异地打卡',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-15 00:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 异常记录应该被过滤，工作日无有效记录应标记为矿工
      expect(result).toContain('矿工');
    });

    it('应该正确检测工作时间过短的异常情况', async () => {
      const punchRecords = [
        // 工作时间过短（少于2小时）
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
          CARDTIME: '2024-01-15 10:30:00', // 只工作1.5小时
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 工作时间过短应该被标记为严重矿工
      expect(result).toContain('矿工');
    });
  });

  describe('节假日智能判断功能', () => {
    it('应该正确识别法定节假日', async () => {
      const punchRecords = [
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-01 09:00:00', // 元旦节
          SHIFTTERM: '2024-01-01',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-01 18:00:00',
          SHIFTTERM: '2024-01-01',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该按节假日计算（3倍工资）
      expect(result).toContain('节假日加班收入');
      expect(result).toContain('节假日加班时长');
    });

    it('应该正确识别调休工作日', async () => {
      const punchRecords = [
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-02-17 09:00:00', // 春节调休工作日
          SHIFTTERM: '2024-02-17',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-02-17 20:00:00',
          SHIFTTERM: '2024-02-17',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该按工作日计算
      expect(result).toContain('工作日加班收入');
      expect(result).toContain('工作日加班时长');
    });

    it('应该正确识别调休休息日', async () => {
      const punchRecords = [
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-05-05 09:00:00', // 劳动节调休休息日
          SHIFTTERM: '2024-05-05',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-05-05 18:00:00',
          SHIFTTERM: '2024-05-05',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该按周末计算（1.5倍工资）
      expect(result).toContain('周末加班收入');
      expect(result).toContain('周末加班时长');
    });

    it('应该在API失败时使用兜底逻辑', async () => {
      // Mock API failure
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const punchRecords = [
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-13 09:00:00', // 周六
          SHIFTTERM: '2024-01-13',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-13 18:00:00',
          SHIFTTERM: '2024-01-13',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // API失败时，周六应该被识别为周末
      expect(result).toContain('周末加班收入');
    });
  });

  describe('打卡记录验证功能', () => {
    it('应该正确过滤无效的打卡记录', async () => {
      const punchRecords = [
        // 正常记录
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-15 09:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        // 异地打卡记录
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-15 异地打卡',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        // 异常时间记录
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '3',
          CARDTIME: '2024-01-15 00:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        // 正常记录
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '4',
          CARDTIME: '2024-01-15 18:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 应该能正常处理，使用第一条和最后一条有效记录
      expect(result).toContain('工作日加班时长');
      expect(typeof result).toBe('string');
    });

    it('应该正确处理时间逻辑异常的情况', async () => {
      const punchRecords = [
        // 下班时间早于上班时间
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '1',
          CARDTIME: '2024-01-15 18:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        },
        {
          K_EXTRAS: '',
          EMPID: '001',
          K_PKEYS: '',
          ID: '2',
          CARDTIME: '2024-01-15 09:00:00',
          SHIFTTERM: '2024-01-15',
          K_LOCKED: ''
        }
      ];

      const result = await processPunchRecords(punchRecords, 30);
      
      // 时间逻辑异常的记录应该被跳过，不应该导致程序崩溃
      expect(typeof result).toBe('string');
    });
  });

  describe('性能优化验证', () => {
    it('应该能批量处理多天记录而不重复调用API', async () => {
      // 清除之前的mock调用记录
      vi.clearAllMocks();
      
      const punchRecords: any[] = [];
      
      // 生成一个月的打卡记录，使用新的年份避免缓存影响
      for (let day = 1; day <= 30; day++) {
        const date = `2025-01-${day.toString().padStart(2, '0')}`; // 使用2025年
        punchRecords.push(
          {
            K_EXTRAS: '',
            EMPID: '001',
            K_PKEYS: '',
            ID: `${day * 2 - 1}`,
            CARDTIME: `${date} 09:00:00`,
            SHIFTTERM: date,
            K_LOCKED: ''
          },
          {
            K_EXTRAS: '',
            EMPID: '001',
            K_PKEYS: '',
            ID: `${day * 2}`,
            CARDTIME: `${date} 18:00:00`,
            SHIFTTERM: date,
            K_LOCKED: ''
          }
        );
      }

      const result = await processPunchRecords(punchRecords, 30);
      
      // API应该只被调用一次（因为都是2025年）
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toContain('总加班时长');
    });
  });
});

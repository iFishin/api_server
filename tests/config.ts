/**
 * 测试配置文件
 * 统一管理测试相关的配置和工具函数
 */

import { vi } from 'vitest';

// 通用Mock配置
export const setupMocks = () => {
  // Mock fetch API
  global.fetch = vi.fn();
  
  // Mock console.log for cleaner test output (可选)
  // console.log = vi.fn();
};

// 通用测试数据
export const testData = {
  // 基础的加班数据模板
  basicOvertimeData: {
    hourlyRate: 30,
    customData: [
      {
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '20:00:00',
        dayType: '工作日'
      }
    ]
  },
  
  // 节假日API响应模板
  holidayApiResponse: {
    ok: true,
    json: async () => ({
      code: 0,
      holiday: {
        '2024-01-01': { holiday: true, name: '元旦', wage: 3, date: '2024-01-01' },
        '2024-10-01': { holiday: true, name: '国庆节', wage: 3, date: '2024-10-01' }
      }
    })
  }
};

// 测试工具函数
export const testUtils = {
  // 创建打卡记录
  createPunchRecord: (date: string, times: string[]) => {
    return times.map((time, index) => ({
      K_EXTRAS: '',
      EMPID: '001',
      K_PKEYS: '',
      ID: (index + 1).toString(),
      CARDTIME: `${date} ${time}`,
      SHIFTTERM: date,
      K_LOCKED: ''
    }));
  },
  
  // 等待异步操作完成
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

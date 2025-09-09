/**
 * 加班控制器的单元测试
 * 测试HTTP请求处理逻辑
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { handleCalculateOvertime } from '../../server/controllers/overtimeController';
import * as overtimeService from '../../server/services/overtimeService';

// Mock整个服务模块
vi.mock('../../server/services/overtimeService', () => ({
  processOvertimeJson: vi.fn(),
  processPunchRecords: vi.fn()
}));

describe('OvertimeController 测试', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: any;
  let mockStatus: any;

  beforeEach(() => {
    // 清除所有mock状态
    vi.clearAllMocks();
    
    // 设置Response mock
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
  });

  describe('handleCalculateOvertime', () => {
    it('应该正确处理标准加班数据格式', async () => {
      // 准备测试数据
      const overtimeData = {
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

      mockRequest = {
        body: overtimeData,
        query: {}
      };

      // Mock服务方法
      const mockResult = '测试结果';
      (overtimeService.processOvertimeJson as any).mockResolvedValue(mockResult);

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 验证结果
      expect(overtimeService.processOvertimeJson).toHaveBeenCalledWith(overtimeData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ result: mockResult });
    });

    it('应该正确处理打卡记录格式', async () => {
      // 准备打卡记录数据
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

      mockRequest = {
        body: punchRecords,
        query: { hourlyRate: '35' }
      };

      // Mock服务方法
      const mockResult = '打卡记录测试结果';
      (overtimeService.processPunchRecords as any).mockResolvedValue(mockResult);

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 验证结果
      expect(overtimeService.processPunchRecords).toHaveBeenCalledWith(punchRecords, 35);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ result: mockResult });
    });

    it('应该使用默认小时工资当查询参数无效时', async () => {
      // 准备打卡记录数据
      const punchRecords = [
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

      mockRequest = {
        body: punchRecords,
        query: { hourlyRate: 'invalid' } // 无效的小时工资
      };

      // Mock服务方法
      const mockResult = '默认工资测试结果';
      (overtimeService.processPunchRecords as any).mockResolvedValue(mockResult);

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 验证使用了默认工资30
      expect(overtimeService.processPunchRecords).toHaveBeenCalledWith(punchRecords, 30);
    });

    it('应该处理空请求体错误', async () => {
      mockRequest = {
        body: null,
        query: {}
      };

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 验证错误响应
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: '请求体不能为空' });
    });

    it('应该处理服务层错误', async () => {
      const overtimeData = {
        hourlyRate: 30,
        customData: []
      };

      mockRequest = {
        body: overtimeData,
        query: {}
      };

      // Mock服务方法抛出错误
      const mockError = new Error('测试错误');
      (overtimeService.processOvertimeJson as any).mockRejectedValue(mockError);

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 验证错误响应
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: '测试错误' });
    });

    it('应该处理未知格式的数据', async () => {
      // 既不是标准格式也不是打卡记录格式的数据
      const unknownData = {
        someProperty: 'value'
      };

      mockRequest = {
        body: unknownData,
        query: {}
      };

      // Mock服务方法
      const mockResult = '未知格式处理结果';
      (overtimeService.processOvertimeJson as any).mockResolvedValue(mockResult);

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 应该当作标准格式处理
      expect(overtimeService.processOvertimeJson).toHaveBeenCalledWith(unknownData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ result: mockResult });
    });

    it('应该正确识别空的打卡记录数组', async () => {
      const emptyArray: any[] = [];

      mockRequest = {
        body: emptyArray,
        query: {}
      };

      // Mock服务方法
      const mockResult = '空数组处理结果';
      (overtimeService.processOvertimeJson as any).mockResolvedValue(mockResult);

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 空数组应该当作标准格式处理
      expect(overtimeService.processOvertimeJson).toHaveBeenCalledWith(emptyArray);
    });

    it('应该正确识别不包含CARDTIME的数组', async () => {
      const arrayWithoutCardTime = [
        { someField: 'value' },
        { anotherField: 'value2' }
      ];

      mockRequest = {
        body: arrayWithoutCardTime,
        query: {}
      };

      // Mock服务方法
      const mockResult = '非打卡记录数组处理结果';
      (overtimeService.processOvertimeJson as any).mockResolvedValue(mockResult);

      // 执行测试
      await handleCalculateOvertime(mockRequest as Request, mockResponse as Response);

      // 应该当作标准格式处理
      expect(overtimeService.processOvertimeJson).toHaveBeenCalledWith(arrayWithoutCardTime);
    });
  });
});

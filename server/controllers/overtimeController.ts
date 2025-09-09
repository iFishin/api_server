import { Request, Response } from 'express';
import { processOvertimeJson, processPunchRecords, FormattedSummaryResult } from '../services/overtimeService';

/**
 * 控制器：处理加班工资计算请求
 * @param req Express 请求对象
 * @param res Express 响应对象
 */
export const handleCalculateOvertime = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestData = req.body;
    
    // 基本验证
    if (!requestData) {
      res.status(400).json({ error: '请求体不能为空' });
      return;
    }
    
    let result: FormattedSummaryResult;
    
    // 判断数据格式并调用相应的服务方法
    if (Array.isArray(requestData) && requestData.length > 0 && 'CARDTIME' in requestData[0]) {
      // 打卡记录格式
      const hourlyRate = Number(req.query.hourlyRate) || 20; // 默认20元
      const overtimeStartTime = (req.query.overtimeStartTime as string) || '19:00'; // 默认19:00
      const region = req.query.region as string; // 工作地区
      result = await processPunchRecords(requestData, hourlyRate, undefined, overtimeStartTime);
    } else {
      // 标准加班数据格式 - 包含配置参数
      const config = {
        ...requestData,
        hourlyRate: Number(req.query.hourlyRate) || requestData.hourlyRate || 20,
        overtimeStartTime: (req.query.overtimeStartTime as string) || requestData.overtimeStartTime || '19:00',
        region: (req.query.region as string) || requestData.region
      };
      result = await processOvertimeJson(config);
    }
    
    // 直接返回结构化的JSON数据
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('处理计算加班请求时出错:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || '处理加班数据出错',
      timestamp: new Date().toISOString()
    });
  }
};

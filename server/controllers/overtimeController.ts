import { Request, Response } from 'express';
import { processOvertimeJson } from '../services/overtimeService';
import multer from 'multer';

// 直接引入整个模块，以确保可以访问所有导出的函数
import * as overtimeService from '../services/overtimeService';

const upload = multer();

/**
 * 控制器：处理加班工资计算请求
 * @param req Express 请求对象
 * @param res Express 响应对象
 */
export const handleCalculateOvertime = async (req: Request, res: Response): Promise<void> => {
  try {
    // 获取请求数据
    const requestData = req.body;
    
    // 最基本的验证：确保有数据传入
    if (!requestData) {
      res.status(400).send({ error: '请求体不能为空' });
      return;
    }
    
    // 尝试处理数据
    try {
      let result: string;
      
      // 判断数据格式
      if (Array.isArray(requestData) && requestData.length > 0 && 'CARDTIME' in requestData[0]) {
        // 打卡记录格式
        console.log('检测到打卡记录格式，将处理打卡数据');
        
        // 检查函数是否存在于导入的overtimeService中
        console.log('overtimeService可用函数:', Object.keys(overtimeService));
        
        const hourlyRate = Number(req.query.hourlyRate) || 30; // 可以从查询参数获取小时工资基数
        
        // 为了确保我们能调用到这个函数，创建一个新的处理函数
        // 它将直接复用现有的分组和转换功能
        const processPunchData = async (punchRecords: any[], rate: number) => {
          // 按日期分组打卡记录
          const recordsByDate: Record<string, any[]> = {};
          
          for (const record of punchRecords) {
            const date = record.SHIFTTERM;
            if (!recordsByDate[date]) {
              recordsByDate[date] = [];
            }
            recordsByDate[date].push(record);
          }
          
          // 对每一天的记录按打卡时间排序
          for (const date in recordsByDate) {
            recordsByDate[date].sort((a: any, b: any) => {
              return new Date(a.CARDTIME).getTime() - new Date(b.CARDTIME).getTime();
            });
          }
          
          // 转换为标准格式的加班数据
          const customData: any[] = [];
          
          for (const date in recordsByDate) {
            const dayRecords = recordsByDate[date];
            
            if (dayRecords.length < 2) {
              // 如果一天的打卡记录少于2条，无法计算工作时长，跳过
              console.warn(`日期 ${date} 的打卡记录不足，无法计算工作时长`);
              continue;
            }
            
            // 取当天第一条和最后一条记录作为上下班时间
            const firstRecord = dayRecords[0];
            const lastRecord = dayRecords[dayRecords.length - 1];
            
            // 提取时间部分
            const firstTime = firstRecord.CARDTIME.split(' ')[1];
            const lastTime = lastRecord.CARDTIME.split(' ')[1];
            
            // 判断日期类型（默认为工作日）
            let dayType = '工作日';
            
            // 默认判断逻辑：根据日期判断是否为周末
            const dayOfWeek = new Date(date).getDay(); // 0是周日，6是周六
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              dayType = '周末';
            }
            
            customData.push({
              date,
              startTime: firstTime,
              endTime: lastTime,
              dayType
            });
          }
          
          // 使用现有的加班计算功能
          return await processOvertimeJson({
            hourlyRate: rate,
            customData
          });
        };
        
        result = await processPunchData(requestData, hourlyRate);
      } else {
        // 标准加班数据格式
        result = await processOvertimeJson(requestData);
      }
      
      res.status(200).send({ result });
    } catch (processingError: any) {
      res.status(400).send({ 
        error: processingError.message || '处理加班数据出错' 
      });
    }
  } catch (error) {
    console.error('处理计算加班请求时出错:', error);
    res.status(500).send({ error: '内部服务器错误' });
  }
};

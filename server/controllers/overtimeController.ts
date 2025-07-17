import { Request, Response } from 'express';
import { calculateOvertime } from '../services/overtimeService';
import multer from 'multer';

const upload = multer();

/**
 * 控制器：处理加班工资计算请求
 * @param req Express 请求对象
 * @param res Express 响应对象
 */
export const handleCalculateOvertime = async (req: Request, res: Response): Promise<void> => {
  const { hoursWorked, hourlyRate, cookie, yearMonth } = req.body;

  // 验证参数
  if (!hoursWorked || !hourlyRate || !cookie || !yearMonth) {
    res.status(400).send('缺少必要的参数：hoursWorked, hourlyRate, cookie, yearMonth');
    return;
  }

  try {
    // 调用服务层计算加班工资
    const result = await calculateOvertime(Number(hoursWorked), Number(hourlyRate), cookie, yearMonth);

    res.status(200).send({ result });
  } catch (error) {
    console.error('处理计算加班请求时出错:', error);
    res.status(500).send('内部服务器错误');
  }
};

import { exec } from 'child_process';

/**
 * 调用 Python 脚本计算加班工资
 * @param hoursWorked 工作时长
 * @param hourlyRate 每小时工资
 * @param cookie 用户 Cookie
 * @param yearMonth 年月
 * @returns Promise<string> 返回加班工资计算结果
 */
export const calculateOvertime = (hoursWorked: number, hourlyRate: number, cookie: string, yearMonth: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const command = `python ./scripts/overtime_calculator.py ${hoursWorked} ${hourlyRate} ${cookie} ${yearMonth}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing Python script:', error);
        return reject('Failed to execute script');
      }

      if (stderr) {
        console.error('Python script error:', stderr);
        return reject(stderr);
      }

      resolve(stdout.trim());
    });
  });
};

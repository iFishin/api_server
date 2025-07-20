/**
 * 加班计算服务
 * 从Python脚本移植到TypeScript，实现加班时间和薪资的计算
 */

// 定义类型接口
interface OvertimeData {
  hourlyRate: number;
  customData: OvertimeRecord[];
  overwork?: string;
  personalLeaveHours?: number;
  sickLeaveHours?: number;
}

// 打卡记录格式
interface PunchRecord {
  K_EXTRAS: string;
  EMPID: string;
  K_PKEYS: string;
  ID: string;
  CARDTIME: string;  // 格式: "YYYY-MM-DD HH:MM:SS"
  SHIFTTERM: string; // 格式: "YYYY-MM-DD"
  K_LOCKED: string;
}

interface OvertimeRecord {
  date: string;
  startTime: string;
  endTime: string;
  dayType: string; // 接受任何字符串，但内部会映射为 '工作日' | '周末' | '节假日'
}

interface SummaryResult {
  income: {
    totalOvertimePay: number;
    actualOvertimePay: number;
    totalMealAllowance: number;
    workdayOvertimePay: number;
    weekendOvertimePay: number;
    holidayOvertimePay: number;
    totalIncome: number;
    actualTotalIncome: number;
  };
  hours: {
    workdayOvertimeHours: number;
    weekendOvertimeHours: number;
    holidayOvertimeHours: number;
    totalOvertimeHours: number;
    actualOvertimeHours: number;
  };
  attendance: {
    lateCount: number;
    lateMinutes: number;
    requiredWorkdays: number;
    actualWorkdays: number;
  };
  rank: string;
}

/**
 * 处理加班数据（JSON格式）
 * 直接在TypeScript中实现加班计算逻辑，替代Python脚本
 * 
 * @param overtimeData JSON格式的加班数据
 * @returns Promise<string> 返回加班工资计算结果
 */
export const processOvertimeJson = async (overtimeData: OvertimeData): Promise<string> => {
  try {
    // 提取重要参数
    const { hourlyRate, customData, overwork, personalLeaveHours = 0, sickLeaveHours = 0 } = overtimeData;
    
    // 验证必要参数
    if (!hourlyRate || isNaN(Number(hourlyRate))) {
      throw new Error('缺少必要参数或参数格式错误: hourlyRate');
    }
    
    if (!customData || !Array.isArray(customData) || customData.length === 0) {
      throw new Error('缺少有效的加班数据记录');
    }
    
    // 规范化数据
    const normalizedData = customData.map(record => ({
      ...record,
      dayType: normalizeDayType(record.dayType)
    }));
    
    // 处理加班数据
    const result = processCustomOvertimeData(normalizedData, Number(hourlyRate));
    
    // 汇总计算结果
    const summary = summarizeResults(result, personalLeaveHours, sickLeaveHours);
    
    // 格式化输出
    return formatSummary(summary);
    
  } catch (error: any) {
    console.error('处理加班数据出错:', error);
    throw error;
  }
};

/**
 * 处理自定义加班数据
 * 
 * @param customData 自定义加班数据
 * @param hourlyRate 小时工资基数
 * @returns 处理结果
 */
function processCustomOvertimeData(
  customData: OvertimeRecord[], 
  hourlyRate: number
): Array<[string, string, string, string, number, number, number, number, number, number]> {
  const result: Array<[string, string, string, string, number, number, number, number, number, number]> = [];
  let overtimeIncome = 0;
  
  // 按日期处理每条加班记录
  for (const item of customData) {
    const { date, startTime, endTime, dayType } = item;
    
    // 确保时间格式正确
    const firstCheckTime = formatTimeString(startTime);
    const lastCheckTime = formatTimeString(endTime);
    
    // 根据日期类型计算加班费率
    const rate = calculatePayRate(dayType);
    
    // 计算加班时长
    const overtime = calculateOvertimeHours(firstCheckTime, lastCheckTime, dayType);
    
    // 计算加班薪资
    const overtimePay = calculateOvertimePay(overtime, rate, hourlyRate);
    overtimeIncome += overtimePay;
    
    // 计算餐补
    const allowance = calculateAllowance(overtime, dayType);
    
    // 计算总收入
    const totalIncome = overtimePay + allowance;
    
    // 计算迟到时长
    const lateMinutes = calculateLateTime(firstCheckTime, dayType);
    
    // 添加到结果中
    result.push([
      date,
      firstCheckTime,
      lastCheckTime,
      dayType,
      rate,
      overtime,
      overtimePay,
      allowance,
      totalIncome,
      lateMinutes
    ]);
  }
  
  return result;
}

/**
 * 规范化日期类型
 * 
 * @param dayType 原始日期类型字符串
 * @returns 规范化后的日期类型
 */
function normalizeDayType(dayType: string): string {
  // 转为小写并去除空格以便更好匹配
  const normalizedType = dayType.toLowerCase().trim();
  
  // 工作日匹配
  if (normalizedType.includes('工作') || 
      normalizedType.includes('weekday') || 
      normalizedType === 'normal') {
    return '工作日';
  }
  
  // 周末匹配
  if (normalizedType.includes('周末') || 
      normalizedType.includes('星期六') || 
      normalizedType.includes('星期日') || 
      normalizedType.includes('weekend') ||
      normalizedType === 'saturday' ||
      normalizedType === 'sunday') {
    return '周末';
  }
  
  // 节假日匹配
  if (normalizedType.includes('节假') || 
      normalizedType.includes('holiday') || 
      normalizedType.includes('festival')) {
    return '节假日';
  }
  
  // 默认为工作日
  return '工作日';
}

/**
 * 计算加班费率
 * 
 * @param dayType 日期类型
 * @returns 加班费率
 */
function calculatePayRate(dayType: string): number {
  // 工作日加班费1倍, 周末1.5倍, 节假日3倍
  switch (dayType) {
    case '工作日':
      return 1; 
    case '周末':
      return 1.5;
    case '节假日':
      return 3;
    default:
      return 0;
  }
}

/**
 * 计算加班时长
 * 
 * @param firstCheckTime 第一次打卡时间
 * @param lastCheckTime 最后一次打卡时间
 * @param dayType 日期类型
 * @returns 加班时长（小时）
 */
function calculateOvertimeHours(firstCheckTime: string, lastCheckTime: string, dayType: string): number {
  // 检查是否为异地打卡
  if (lastCheckTime.includes('异地打卡')) {
    return 0;
  }
  
  // 解析时间
  const firstTime = parseTimeString(firstCheckTime);
  const lastTime = parseTimeString(lastCheckTime);
  
  if (dayType === '工作日') {
    // 工作日: 18:30后开始计算加班
    const overtimeStartHour = 18;
    const overtimeStartMinute = 30;
    
    // 如果下班时间晚于18:30，计算加班时长
    if (lastTime.hours > overtimeStartHour || 
        (lastTime.hours === overtimeStartHour && lastTime.minutes >= overtimeStartMinute)) {
      
      // 计算加班开始时间点（18:30）对应的分钟数
      const overtimeStartTotalMinutes = overtimeStartHour * 60 + overtimeStartMinute;
      
      // 计算下班时间对应的分钟数
      const lastTimeTotalMinutes = lastTime.hours * 60 + lastTime.minutes;
      
      // 计算加班时长（小时）
      return (lastTimeTotalMinutes - overtimeStartTotalMinutes) / 60;
    }
    
    return 0;
  } else {
    // 周末和节假日: 全天计算加班
    // 计算工作总时长（小时）
    const workTotalMinutes = 
      (lastTime.hours * 60 + lastTime.minutes) - 
      (firstTime.hours * 60 + firstTime.minutes);
      
    // 减去午休时间（如果跨越了午休时间）
    const lunchBreakStart = 12 * 60; // 12:00
    const lunchBreakEnd = 13 * 60;   // 13:00
    
    const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
    const lastTimeMinutes = lastTime.hours * 60 + lastTime.minutes;
    
    let lunchBreakDeduction = 0;
    
    // 如果工作时间跨越了午休时间
    if (firstTimeMinutes < lunchBreakStart && lastTimeMinutes > lunchBreakEnd) {
      lunchBreakDeduction = 60; // 扣除1小时午休
    } else if (firstTimeMinutes < lunchBreakStart && lastTimeMinutes > lunchBreakStart && lastTimeMinutes <= lunchBreakEnd) {
      lunchBreakDeduction = lastTimeMinutes - lunchBreakStart;
    } else if (firstTimeMinutes >= lunchBreakStart && firstTimeMinutes < lunchBreakEnd && lastTimeMinutes > lunchBreakEnd) {
      lunchBreakDeduction = lunchBreakEnd - firstTimeMinutes;
    } else if (firstTimeMinutes >= lunchBreakStart && firstTimeMinutes < lunchBreakEnd && lastTimeMinutes <= lunchBreakEnd) {
      lunchBreakDeduction = lastTimeMinutes - firstTimeMinutes;
    }
    
    return (workTotalMinutes - lunchBreakDeduction) / 60;
  }
}

/**
 * 计算加班薪资
 * 
 * @param overtime 加班时长
 * @param rate 加班费率
 * @param hourlyRate 小时工资基数
 * @returns 加班薪资
 */
function calculateOvertimePay(overtime: number, rate: number, hourlyRate: number): number {
  return overtime * rate * hourlyRate;
}

/**
 * 计算餐补
 * 
 * @param overtime 加班时长
 * @param dayType 日期类型
 * @returns 餐补金额
 */
function calculateAllowance(overtime: number, dayType: string): number {
  // 工作日加班超过1小时给20,周末和节假日超过4小时给20
  if (dayType === '工作日') {
    return overtime >= 1 ? 20 : 0;
  } else {
    return overtime >= 4 ? 20 : 0;
  }
}

/**
 * 计算迟到时间
 * 
 * @param firstCheckTime 第一次打卡时间
 * @param dayType 日期类型
 * @returns 迟到时间（分钟）
 */
function calculateLateTime(firstCheckTime: string, dayType: string): number {
  // 非工作日或异地打卡不计算迟到
  if (dayType !== '工作日' || firstCheckTime.includes('异地打卡')) {
    return 0;
  }
  
  const workStartTime = { hours: 9, minutes: 0 }; // 9:00
  const firstTime = parseTimeString(firstCheckTime);
  
  // 计算迟到分钟
  const workStartTotalMinutes = workStartTime.hours * 60 + workStartTime.minutes;
  const firstTimeTotalMinutes = firstTime.hours * 60 + firstTime.minutes;
  
  return firstTimeTotalMinutes > workStartTotalMinutes 
    ? firstTimeTotalMinutes - workStartTotalMinutes 
    : 0;
}

/**
 * 解析时间字符串
 * 
 * @param timeString 时间字符串，格式如"HH:MM:SS"
 * @returns 解析后的时间对象
 */
function parseTimeString(timeString: string): { hours: number, minutes: number, seconds: number } {
  // 去除可能的异地打卡标记
  const cleanTimeString = timeString.replace(/\(异地打卡\)$/g, '').trim();
  
  // 解析时间
  const timeParts = cleanTimeString.split(':');
  
  return {
    hours: parseInt(timeParts[0], 10) || 0,
    minutes: parseInt(timeParts[1], 10) || 0,
    seconds: timeParts.length > 2 ? parseInt(timeParts[2], 10) || 0 : 0
  };
}

/**
 * 格式化时间字符串
 * 
 * @param timeString 时间字符串
 * @returns 格式化后的时间字符串
 */
function formatTimeString(timeString: string): string {
  // 如果已经是HH:MM:SS格式，则直接返回
  if (/^\d{1,2}:\d{1,2}:\d{1,2}/.test(timeString)) {
    return timeString;
  }
  
  // 如果是HH:MM格式，添加:00
  if (/^\d{1,2}:\d{1,2}$/.test(timeString)) {
    return `${timeString}:00`;
  }
  
  // 其他情况，尝试解析并格式化
  try {
    const time = parseTimeString(timeString);
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  } catch (e) {
    // 无法解析，返回原字符串
    return timeString;
  }
}

/**
 * 汇总计算结果
 * 
 * @param result 处理结果
 * @param personalLeaveHours 个人假期时长
 * @param sickLeaveHours 病假时长
 * @returns 汇总结果
 */
function summarizeResults(
  result: Array<[string, string, string, string, number, number, number, number, number, number]>,
  personalLeaveHours: number,
  sickLeaveHours: number
): SummaryResult {
  // 初始化汇总数据
  let totalOvertimePay = 0;
  let totalMealAllowance = 0;
  let workdayOvertimePay = 0;
  let weekendOvertimePay = 0;
  let holidayOvertimePay = 0;
  let totalIncome = 0;
  let workdayOvertimeHours = 0;
  let weekendOvertimeHours = 0;
  let holidayOvertimeHours = 0;
  let requiredWorkdays = 0;
  let actualWorkdays = 0;
  let lateCount = 0;
  let lateMinutes = 0;

  // 根据结果计算汇总数据
  for (const record of result) {
    const dayType = record[3];
    const overtime = record[5];
    const overtimePay = record[6];
    const allowance = record[7];
    const recordLateMinutes = record[9];
    
    // 累计加班费
    totalOvertimePay += overtimePay;
    
    // 累计餐补
    totalMealAllowance += allowance;
    
    // 按日期类型累计加班时长和收入
    if (dayType === '工作日') {
      workdayOvertimeHours += overtime;
      workdayOvertimePay += overtimePay;
      actualWorkdays += 1;
    } else if (dayType === '周末') {
      weekendOvertimeHours += overtime;
      weekendOvertimePay += overtimePay;
    } else if (dayType === '节假日') {
      holidayOvertimeHours += overtime;
      holidayOvertimePay += overtimePay;
    }
    
    // 累计总收入
    totalIncome += overtimePay + allowance;
    
    // 累计迟到信息
    if (recordLateMinutes > 0) {
      lateCount += 1;
      lateMinutes += recordLateMinutes;
    }
  }
  
  // 计算应出勤天数
  const workdayRecords = result.filter(r => r[3] === '工作日').length;
  const weekendRecords = result.filter(r => r[3] === '周末').length;
  const holidayRecords = result.filter(r => r[3] === '节假日').length;
  requiredWorkdays = workdayRecords;
  
  // 处理假期扣减
  let personalLeaveRemainHours = personalLeaveHours;
  
  // 优先从工作日加班时长中扣减
  let actualWorkdayHours = workdayOvertimeHours - personalLeaveRemainHours;
  if (actualWorkdayHours < 0) {
    personalLeaveRemainHours = -actualWorkdayHours;
    actualWorkdayHours = 0;
  } else {
    personalLeaveRemainHours = 0;
  }
  
  // 其次从周末加班时长中扣减
  let actualWeekendHours = weekendOvertimeHours - personalLeaveRemainHours;
  if (actualWeekendHours < 0) {
    personalLeaveRemainHours = -actualWeekendHours;
    actualWeekendHours = 0;
  } else {
    personalLeaveRemainHours = 0;
  }
  
  // 最后从节假日加班时长中扣减
  let actualHolidayHours = holidayOvertimeHours - personalLeaveRemainHours;
  if (actualHolidayHours < 0) {
    personalLeaveRemainHours = -actualHolidayHours;
    actualHolidayHours = 0;
  } else {
    personalLeaveRemainHours = 0;
  }
  
  // 计算实际加班收入
  const actualWorkdayOvertimePay = actualWorkdayHours * 20; // 假设工作日小时工资为20
  const actualWeekendOvertimePay = actualWeekendHours * 30; // 假设周末小时工资为30
  const actualHolidayOvertimePay = actualHolidayHours * 60; // 假设节假日小时工资为60
  const actualOvertimePay = actualWorkdayOvertimePay + actualWeekendOvertimePay + actualHolidayOvertimePay;
  const actualTotalIncome = actualOvertimePay + totalMealAllowance;
  
  // 评价等级
  let rank = '';
  if (totalOvertimePay < 300) {
    rank = '李在赣神魔？';
  } else if (totalOvertimePay < 500) {
    rank = '不太行';
  } else if (totalOvertimePay < 1000) {
    rank = '一般，建议多加点 冲1000';
  } else if (totalOvertimePay <= 1500) {
    rank = '牛逼';
  } else if (totalOvertimePay < 2000) {
    rank = '逆天';
  } else {
    rank = `你是懂加班的，白加了 ${totalOvertimePay - 2000} 元`;
  }
  
  return {
    income: {
      totalOvertimePay,
      actualOvertimePay,
      totalMealAllowance,
      workdayOvertimePay,
      weekendOvertimePay,
      holidayOvertimePay,
      totalIncome,
      actualTotalIncome
    },
    hours: {
      workdayOvertimeHours,
      weekendOvertimeHours,
      holidayOvertimeHours,
      totalOvertimeHours: workdayOvertimeHours + weekendOvertimeHours + holidayOvertimeHours,
      actualOvertimeHours: actualWorkdayHours + actualWeekendHours + actualHolidayHours
    },
    attendance: {
      lateCount,
      lateMinutes,
      requiredWorkdays,
      actualWorkdays
    },
    rank
  };
}

/**
 * 格式化汇总结果为字符串输出
 * 
 * @param summary 汇总结果
 * @returns 格式化后的字符串
 */
function formatSummary(summary: SummaryResult): string {
  const { income, hours, attendance, rank } = summary;
  
  // 定义表格格式
  const formatNumber = (num: number): string => num.toFixed(2);
  
  // 构建表格
  const incomeTable = [
    `总加班薪资: ${formatNumber(income.totalOvertimePay)}`,
    `实际加班薪资: ${formatNumber(income.actualOvertimePay)}`,
    `总餐补: ${formatNumber(income.totalMealAllowance)}`,
    `工作日加班收入: ${formatNumber(income.workdayOvertimePay)}`,
    `周末加班收入: ${formatNumber(income.weekendOvertimePay)}`,
    `节假日加班收入: ${formatNumber(income.holidayOvertimePay)}`,
    `总收入: ${formatNumber(income.totalIncome)}`,
    `扣减后总收入: ${formatNumber(income.actualTotalIncome)}`
  ].join('\n');
  
  const hoursTable = [
    `工作日加班时长: ${formatNumber(hours.workdayOvertimeHours)} 小时`,
    `周末加班时长: ${formatNumber(hours.weekendOvertimeHours)} 小时`,
    `节假日加班时长: ${formatNumber(hours.holidayOvertimeHours)} 小时`,
    `总加班时长: ${formatNumber(hours.totalOvertimeHours)} 小时`,
    `扣减后加班时长: ${formatNumber(hours.actualOvertimeHours)} 小时`
  ].join('\n');
  
  const attendanceTable = [
    `当前迟到次数: ${attendance.lateCount} 次`,
    `当前迟到时长: ${attendance.lateMinutes} 分钟`,
    `应出勤天数: ${attendance.requiredWorkdays} 天`,
    `实际出勤天数: ${attendance.actualWorkdays} 天`
  ].join('\n');
  
  // 组合输出
  return [
    '\n【收入统计】\n' + incomeTable,
    '\n【工时统计】\n' + hoursTable,
    '\n【考勤统计】\n' + attendanceTable,
    `\n**********************\n义眼丁真，鉴定您的级别为：\n ${rank}\n**********************\n`
  ].join('\n');
}

/**
 * 处理打卡记录数据计算加班
 * 从原始打卡记录中计算加班时间和薪资
 * 
 * @param punchRecords 打卡记录数组
 * @param hourlyRate 小时工资基数
 * @param workdayType 工作日类型设置 (可选，用于指定哪些日期是工作日/周末/节假日)
 * @returns Promise<string> 返回加班工资计算结果
 */
export async function processPunchRecords(
  punchRecords: PunchRecord[], 
  hourlyRate: number = 30,
  workdayType?: Record<string, string>
): Promise<string> {
  try {
    if (!punchRecords || !Array.isArray(punchRecords) || punchRecords.length === 0) {
      throw new Error('缺少有效的打卡记录');
    }

    // 按日期分组打卡记录
    const recordsByDate = groupPunchRecordsByDate(punchRecords);
    
    // 转换为标准格式的加班数据
    const customData = convertToOvertimeRecords(recordsByDate, workdayType);
    
    // 使用原有加班计算逻辑处理
    const overtimeData: OvertimeData = {
      hourlyRate,
      customData
    };
    
    return await processOvertimeJson(overtimeData);
    
  } catch (error: any) {
    console.error('处理打卡记录出错:', error);
    throw error;
  }
};

/**
 * 按日期分组打卡记录
 * 
 * @param punchRecords 打卡记录数组
 * @returns 按日期分组的打卡记录
 */
function groupPunchRecordsByDate(punchRecords: PunchRecord[]): Record<string, PunchRecord[]> {
  const recordsByDate: Record<string, PunchRecord[]> = {};
  
  for (const record of punchRecords) {
    const date = record.SHIFTTERM;
    if (!recordsByDate[date]) {
      recordsByDate[date] = [];
    }
    recordsByDate[date].push(record);
  }
  
  // 对每一天的记录按打卡时间排序
  for (const date in recordsByDate) {
    recordsByDate[date].sort((a, b) => {
      return new Date(a.CARDTIME).getTime() - new Date(b.CARDTIME).getTime();
    });
  }
  
  return recordsByDate;
}

/**
 * 将打卡记录转换为加班记录
 * 
 * @param recordsByDate 按日期分组的打卡记录
 * @param workdayType 指定工作日类型的映射
 * @returns 标准格式的加班记录
 */
function convertToOvertimeRecords(
  recordsByDate: Record<string, PunchRecord[]>,
  workdayType?: Record<string, string>
): OvertimeRecord[] {
  const overtimeRecords: OvertimeRecord[] = [];
  
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
    
    // 判断日期类型（默认为工作日，可通过参数指定）
    let dayType = '工作日';
    
    if (workdayType && workdayType[date]) {
      dayType = workdayType[date]; // 使用指定的日期类型
    } else {
      // 默认判断逻辑：根据日期判断是否为周末
      const dayOfWeek = new Date(date).getDay(); // 0是周日，6是周六
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dayType = '周末';
      }
    }
    
    overtimeRecords.push({
      date,
      startTime: firstTime,
      endTime: lastTime,
      dayType
    });
  }
  
  return overtimeRecords;
}

/**
 * 兼容旧API调用的方法
 * @deprecated 请使用 processOvertimeJson 或 processPunchRecords 代替
 */
export const calculateOvertime = async (
  hoursWorked: number, 
  hourlyRate: number, 
  cookie: string, 
  yearMonth: string
): Promise<string> => {
  try {
    console.warn('calculateOvertime 方法已废弃，请使用 processOvertimeJson 或 processPunchRecords');
    
    // 构造一个最基本的加班记录
    const [year, month] = yearMonth.split('-');
    const day = '01'; // 使用月份的第一天作为默认日期
    
    const overtimeData: OvertimeData = {
      hourlyRate,
      customData: [{
        date: `${year}-${month}-${day}`,
        startTime: '09:00:00',
        endTime: '18:30:00',  // 不计算加班
        dayType: '工作日'
      }]
    };
    
    // 调用新方法处理
    return await processOvertimeJson(overtimeData);
  } catch (error) {
    console.error('旧版API调用出错:', error);
    throw error;
  }
};

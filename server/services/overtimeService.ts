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

// 定义处理结果的接口
interface ProcessedOvertimeRecord {
  date: string;
  startTime: string;
  endTime: string;
  dayType: string;
  payRate: number;
  overtimeHours: number;
  overtimePay: number;
  mealAllowance: number;
  totalIncome: number;
  lateMinutes: number;
}

interface HolidayInfo {
  holiday: boolean;
  name?: string;
  wage?: number;
  date?: string;
  rest?: number;
}

interface HolidayApiResponse {
  code: number;
  holiday: Record<string, HolidayInfo>;
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
    const summary = summarizeResults(result, personalLeaveHours, sickLeaveHours, Number(hourlyRate));
    
    // 格式化输出
    return formatSummary(summary);
    
  } catch (error: any) {
    console.error('处理加班数据出错:', error);
    throw error;
  }
};

/**
 * 处理自定义加班数据（支持矿工时间处理）
 * 
 * @param customData 自定义加班数据
 * @param hourlyRate 小时工资基数
 * @returns 处理结果
 */
function processCustomOvertimeData(
  customData: OvertimeRecord[], 
  hourlyRate: number
): ProcessedOvertimeRecord[] {
  const result: ProcessedOvertimeRecord[] = [];
  let overtimeIncome = 0;
  
  // 按日期处理每条加班记录
  for (const item of customData) {
    const { date, startTime, endTime, dayType } = item;
    
    // 确保时间格式正确
    const firstCheckTime = formatTimeString(startTime);
    const lastCheckTime = formatTimeString(endTime);
    
    // 根据日期类型计算加班费率
    const payRate = calculatePayRate(dayType);
    
    // 计算加班时长（可能为负数，表示矿工时间）
    const overtimeHours = calculateOvertimeHours(firstCheckTime, lastCheckTime, dayType);
    
    // 计算加班薪资（矿工时间会导致负薪资）
    const overtimePay = calculateOvertimePay(overtimeHours, payRate, hourlyRate);
    overtimeIncome += overtimePay;
    
    // 计算餐补（只有正加班时长才有餐补）
    const mealAllowance = overtimeHours > 0 ? calculateAllowance(overtimeHours, dayType) : 0;
    
    // 计算总收入
    const totalIncome = overtimePay + mealAllowance;
    
    // 计算迟到时长
    const lateMinutes = calculateLateTime(firstCheckTime, dayType);
    
    // 记录详细信息用于调试
    if (overtimeHours < 0) {
      console.log(`矿工记录 - 日期: ${date}, 矿工时长: ${Math.abs(overtimeHours).toFixed(2)}小时, 扣除薪资: ${Math.abs(overtimePay).toFixed(2)}元`);
    }
    
    // 添加到结果中
    result.push({
      date,
      startTime: firstCheckTime,
      endTime: lastCheckTime,
      dayType,
      payRate,
      overtimeHours,
      overtimePay,
      mealAllowance,
      totalIncome,
      lateMinutes
    });
  }
  
  return result;
}

// 缓存节假日数据，避免重复请求
const holidayCache = new Map<string, Record<string, HolidayInfo>>();

/**
 * 获取指定年份的节假日信息
 * 
 * @param year 年份
 * @returns 节假日信息
 */
async function getHolidayInfo(year: string): Promise<Record<string, HolidayInfo>> {
  // 检查缓存
  if (holidayCache.has(year)) {
    return holidayCache.get(year)!;
  }
  
  try {
    const response = await fetch(`https://timor.tech/api/holiday/year/${year}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as HolidayApiResponse;
    
    if (data.code !== 0) {
      throw new Error(`API返回错误码: ${data.code}`);
    }
    
    // 缓存结果
    holidayCache.set(year, data.holiday);
    
    return data.holiday;
    
  } catch (error) {
    console.error(`获取${year}年节假日信息失败:`, error);
    
    // 返回空对象，使用基本的周末判断逻辑
    return {};
  }
}

/**
 * 智能判断日期类型（使用在线节假日API）
 * 
 * @param date 日期字符串，格式：YYYY-MM-DD
 * @returns 日期类型：'工作日' | '周末' | '节假日'
 */
async function intelligentDayType(date: string): Promise<string> {
  try {
    const year = date.split('-')[0];
    const holidayInfo = await getHolidayInfo(year);
    
    // 检查是否有该日期的节假日信息
    if (holidayInfo[date]) {
      const dayInfo = holidayInfo[date];
      
      if (dayInfo.holiday) {
        // 是节假日
        return '节假日';
      } else if (dayInfo.rest && dayInfo.rest === 1) {
        // 是调休的休息日（通常是周末）
        return '周末';
      } else {
        // 是调休的工作日
        return '工作日';
      }
    }
    
    // 没有特殊信息，使用基本的周末判断
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return '周末';
    }
    
    return '工作日';
    
  } catch (error) {
    console.error(`判断日期类型失败，使用基本逻辑: ${date}`, error);
    
    // API调用失败时的兜底逻辑
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return '周末';
    }
    
    return '工作日';
  }
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
 * 计算加班时长（支持弹性上下班和矿工时间扣除）
 * 
 * @param firstCheckTime 第一次打卡时间
 * @param lastCheckTime 最后一次打卡时间
 * @param dayType 日期类型
 * @returns 加班时长（小时，可能为负数表示矿工时间）
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
    // 工作日弹性上下班时间配置
    const flexibleStartEarly = { hours: 8, minutes: 30 };  // 最早上班时间 8:30
    const flexibleStartLate = { hours: 9, minutes: 30 };   // 最晚上班时间 9:30
    const requiredWorkHours = 8; // 标准工作时长（不含午休）
    const lunchBreakHours = 1.5;  // 午休时长 1.5小时（12:00-13:30）
    const overtimeStartHour = 19;   // 19:00后开始计算加班
    const overtimeStartMinute = 0;
    
    // 计算实际工作时长（扣除午休）
    const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
    const lastTimeMinutes = lastTime.hours * 60 + lastTime.minutes;
    
    // 计算总在公司时间（分钟）
    const totalMinutesInOffice = lastTimeMinutes - firstTimeMinutes;
    
    // 扣除午休时间（如果跨越了午休时间）
    const lunchBreakStart = 12 * 60; // 12:00
    const lunchBreakEnd = 13.5 * 60;   // 13:30
    
    let lunchBreakDeduction = 0;
    
    // 如果工作时间跨越了午休时间
    if (firstTimeMinutes < lunchBreakStart && lastTimeMinutes > lunchBreakEnd) {
      lunchBreakDeduction = 90; // 扣除1.5小时午休（12:00-13:30）
    } else if (firstTimeMinutes < lunchBreakStart && lastTimeMinutes > lunchBreakStart && lastTimeMinutes <= lunchBreakEnd) {
      lunchBreakDeduction = lastTimeMinutes - lunchBreakStart;
    } else if (firstTimeMinutes >= lunchBreakStart && firstTimeMinutes < lunchBreakEnd && lastTimeMinutes > lunchBreakEnd) {
      lunchBreakDeduction = lunchBreakEnd - firstTimeMinutes;
    } else if (firstTimeMinutes >= lunchBreakStart && firstTimeMinutes < lunchBreakEnd && lastTimeMinutes <= lunchBreakEnd) {
      lunchBreakDeduction = lastTimeMinutes - firstTimeMinutes;
    }
    
    // 实际工作时长（小时）
    const actualWorkHours = Math.max(0, (totalMinutesInOffice - lunchBreakDeduction) / 60);
    
    console.log(`工作日计算 - 上班: ${firstCheckTime}, 下班: ${lastCheckTime}, 实际工作: ${actualWorkHours.toFixed(2)}小时, 要求: ${requiredWorkHours}小时`);
    
    // 计算矿工时间（不足8小时的部分）
    const underworkHours = Math.max(0, requiredWorkHours - actualWorkHours);
    
    // 计算19:00后的加班时间
    const overtimeStartTotalMinutes = overtimeStartHour * 60 + overtimeStartMinute;
    let pureOvertimeHours = 0;
    
    if (lastTimeMinutes > overtimeStartTotalMinutes) {
      // 19:00后的时间才算纯加班
      const overtimeMinutes = lastTimeMinutes - overtimeStartTotalMinutes;
      pureOvertimeHours = overtimeMinutes / 60;
    }
    
    // 最终加班时长 = 纯加班时长 - 矿工时间
    const finalOvertimeHours = pureOvertimeHours - underworkHours;
    
    if (underworkHours > 0) {
      console.log(`矿工时间检测 - 矿工: ${underworkHours.toFixed(2)}小时, 纯加班: ${pureOvertimeHours.toFixed(2)}小时, 最终加班: ${finalOvertimeHours.toFixed(2)}小时`);
    }
    
    return finalOvertimeHours;
  } else {
    // 周末和节假日: 全天计算加班（保持原有逻辑）
    // 计算工作总时长（小时）
    const workTotalMinutes = 
      (lastTime.hours * 60 + lastTime.minutes) - 
      (firstTime.hours * 60 + firstTime.minutes);
      
    // 减去午休时间（如果跨越了午休时间）
    const lunchBreakStart = 12 * 60; // 12:00
    const lunchBreakEnd = 13.5 * 60;   // 13:30
    
    const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
    const lastTimeMinutes = lastTime.hours * 60 + lastTime.minutes;
    
    let lunchBreakDeduction = 0;
    
    // 如果工作时间跨越了午休时间
    if (firstTimeMinutes < lunchBreakStart && lastTimeMinutes > lunchBreakEnd) {
      lunchBreakDeduction = 90; // 扣除1.5小时午休（12:00-13:30）
    } else if (firstTimeMinutes < lunchBreakStart && lastTimeMinutes > lunchBreakStart && lastTimeMinutes <= lunchBreakEnd) {
      lunchBreakDeduction = lastTimeMinutes - lunchBreakStart;
    } else if (firstTimeMinutes >= lunchBreakStart && firstTimeMinutes < lunchBreakEnd && lastTimeMinutes > lunchBreakEnd) {
      lunchBreakDeduction = lunchBreakEnd - firstTimeMinutes;
    } else if (firstTimeMinutes >= lunchBreakStart && firstTimeMinutes < lunchBreakEnd && lastTimeMinutes <= lunchBreakEnd) {
      lunchBreakDeduction = lastTimeMinutes - firstTimeMinutes;
    }
    
    return Math.max(0, (workTotalMinutes - lunchBreakDeduction) / 60);
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
 * @param overtime 加班时长（小时，可能为负数）
 * @param dayType 日期类型
 * @returns 餐补金额
 */
function calculateAllowance(overtime: number, dayType: string): number {
  // 只有正加班时长才有餐补，矿工时间不给餐补
  if (overtime <= 0) {
    return 0;
  }
  
  // 工作日加班超过1小时给20,周末和节假日超过4小时给20
  if (dayType === '工作日') {
    return overtime >= 1 ? 20 : 0;
  } else {
    return overtime >= 4 ? 20 : 0;
  }
}

/**
 * 计算迟到时间（支持弹性上班）
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
  
  // 弹性上班时间：最晚9:30算迟到
  const flexibleLatestStart = { hours: 9, minutes: 30 };
  const firstTime = parseTimeString(firstCheckTime);
  
  // 计算迟到分钟
  const flexibleLatestStartMinutes = flexibleLatestStart.hours * 60 + flexibleLatestStart.minutes;
  const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
  
  const lateMinutes = firstTimeMinutes > flexibleLatestStartMinutes 
    ? firstTimeMinutes - flexibleLatestStartMinutes 
    : 0;
    
  if (lateMinutes > 0) {
    console.log(`迟到计算 - 上班时间: ${firstCheckTime}, 迟到: ${lateMinutes}分钟`);
  }
  
  return lateMinutes;
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
 * 解析时间字符串为 { hours, minutes, seconds }
 * 支持 "HH:MM", "HH:MM:SS" 格式
 */
function parseTimeString(timeString: string): { hours: number; minutes: number; seconds: number } {
  const parts = timeString.split(':');
  if (parts.length === 2) {
    const [hours, minutes] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid time string');
    return { hours, minutes, seconds: 0 };
  } else if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) throw new Error('Invalid time string');
    return { hours, minutes, seconds };
  } else {
    throw new Error('Invalid time string');
  }
}

/**
 * 汇总计算结果
 * 
 * @param result 处理结果
 * @param personalLeaveHours 个人假期时长
 * @param sickLeaveHours 病假时长
 * @param hourlyRate 小时工资基数
 * @returns 汇总结果
 */
function summarizeResults(
  result: ProcessedOvertimeRecord[],
  personalLeaveHours: number,
  sickLeaveHours: number,
  hourlyRate: number
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
    const { dayType, overtimeHours, overtimePay, mealAllowance, lateMinutes: recordLateMinutes } = record;
    
    // 累计加班费
    totalOvertimePay += overtimePay;
    
    // 累计餐补
    totalMealAllowance += mealAllowance;
    
    // 按日期类型累计加班时长和收入
    if (dayType === '工作日') {
      workdayOvertimeHours += overtimeHours;
      workdayOvertimePay += overtimePay;
      actualWorkdays += 1;
    } else if (dayType === '周末') {
      weekendOvertimeHours += overtimeHours;
      weekendOvertimePay += overtimePay;
    } else if (dayType === '节假日') {
      holidayOvertimeHours += overtimeHours;
      holidayOvertimePay += overtimePay;
    }
    
    // 累计总收入
    totalIncome += overtimePay + mealAllowance;
    
    // 累计迟到信息
    if (recordLateMinutes > 0) {
      lateCount += 1;
      lateMinutes += recordLateMinutes;
    }
  }
  
  // 计算应出勤天数
  const workdayRecords = result.filter(r => r.dayType === '工作日').length;
  const weekendRecords = result.filter(r => r.dayType === '周末').length;
  const holidayRecords = result.filter(r => r.dayType === '节假日').length;
  requiredWorkdays = workdayRecords;
  
  // 处理假期扣减逻辑...
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
  
  // 计算实际加班收入（使用正确的费率计算）
  const actualWorkdayOvertimePay = actualWorkdayHours * calculatePayRate('工作日') * hourlyRate;
  const actualWeekendOvertimePay = actualWeekendHours * calculatePayRate('周末') * hourlyRate;
  const actualHolidayOvertimePay = actualHolidayHours * calculatePayRate('节假日') * hourlyRate;
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
    `总加班薪资: ${formatNumber(income.totalOvertimePay)}元 ${income.totalOvertimePay < 0 ? '(含矿工扣除)' : ''}`,
    `实际加班薪资: ${formatNumber(income.actualOvertimePay)}元`,
    `总餐补: ${formatNumber(income.totalMealAllowance)}元`,
    `工作日加班收入: ${formatNumber(income.workdayOvertimePay)}元 ${income.workdayOvertimePay < 0 ? '(矿工扣除)' : ''}`,
    `周末加班收入: ${formatNumber(income.weekendOvertimePay)}元`,
    `节假日加班收入: ${formatNumber(income.holidayOvertimePay)}元`,
    `总收入: ${formatNumber(income.totalIncome)}元`,
    `扣减后总收入: ${formatNumber(income.actualTotalIncome)}元`
  ].join('\n');
  
  const hoursTable = [
    `工作日加班时长: ${formatNumber(hours.workdayOvertimeHours)}小时 ${hours.workdayOvertimeHours < 0 ? '(矿工时间)' : ''}`,
    `周末加班时长: ${formatNumber(hours.weekendOvertimeHours)}小时`,
    `节假日加班时长: ${formatNumber(hours.holidayOvertimeHours)}小时`,
    `总加班时长: ${formatNumber(hours.totalOvertimeHours)}小时`,
    `扣减后加班时长: ${formatNumber(hours.actualOvertimeHours)}小时`
  ].join('\n');
  
  const attendanceTable = [
    `当前迟到次数: ${attendance.lateCount}次`,
    `当前迟到时长: ${attendance.lateMinutes}分钟`,
    `应出勤天数: ${attendance.requiredWorkdays}天`,
    `实际出勤天数: ${attendance.actualWorkdays}天`
  ].join('\n');
  
  // 检查是否有矿工时间
  const hasUnderwork = hours.workdayOvertimeHours < 0 || income.totalOvertimePay < 0;
  const underworkWarning = hasUnderwork ? 
    '\n⚠️  检测到矿工时间！工作日未满8小时会从加班时长中扣除\n' : '';
  
  // 组合输出
  return [
    underworkWarning,
    '\n【收入统计】\n' + incomeTable,
    '\n【工时统计】\n' + hoursTable,
    '\n【考勤统计】\n' + attendanceTable,
    `\n**********************\n义眼丁真，鉴定您的级别为：\n ${rank}\n**********************\n`
  ].join('\n');
}

/**
 * 处理打卡记录数据计算加班（支持智能节假日判断和弹性上下班）
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
    // 转换为标准格式的加班数据（现在是异步的）
    const customData = await convertToOvertimeRecords(recordsByDate, workdayType);
    
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
}

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
 * 将打卡记录转换为加班记录（支持智能节假日判断）
 * 
 * @param recordsByDate 按日期分组的打卡记录
 * @param workdayType 指定工作日类型的映射
 * @returns 标准格式的加班记录
 */
async function convertToOvertimeRecords(
  recordsByDate: Record<string, PunchRecord[]>,
  workdayType?: Record<string, string>
): Promise<OvertimeRecord[]> {
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
    
    // 判断日期类型
    let dayType = '工作日';
    
    if (workdayType && workdayType[date]) {
      dayType = normalizeDayType(workdayType[date]); // 使用指定的日期类型
    } else {
      // 使用智能节假日判断
      dayType = await intelligentDayType(date);
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

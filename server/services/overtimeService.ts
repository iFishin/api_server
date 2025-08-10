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
  overtimeStartTime?: string; // 加班开始时间，格式："HH:MM"，默认"19:00"
  lunchBreakHours?: number; // 午休时长（小时），默认1.5小时
  region?: string; // 工作地区，用于确定在岗时长要求
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
  earlyLeaveMinutes: number;
  attendanceStatus: 'normal' | 'late' | 'early_leave' | 'absent' | 'late_and_early';
  workHours: number;
  deductionHours: number;
  deductionReason: string;
  isUnderwork: boolean;
}

// 每日详细记录接口
interface DailyRecord {
  date: string;
  dayType: string;
  startTime: string;
  endTime: string;
  workHours: number;
  standardWorkHours: number;
  lunchBreakHours: number;
  requiredOfficeHours: number;
  actualOfficeHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  attendanceStatus: string;
  deductionHours: number;
  deductionReason: string;
  overtimeHours: number;
  overtimeStartTime: string;
  pureOvertimeHours: number;
  finalOvertimeHours: number;
  payRate: number;
  overtimePay: number;
  mealAllowance: number;
  totalIncome: number;
  isUnderwork: boolean;
  notes: string[];
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

// 地区在岗时长配置
interface RegionConfig {
  requiredOfficeHours: number; // 最低在岗时长（小时）
  regions: string[]; // 适用地区列表
}

// 预定义地区配置
const REGION_CONFIGS: RegionConfig[] = [
  {
    requiredOfficeHours: 8.5, // 8.5小时
    regions: ['上海', '合肥', '武汉', '办事处']
  },
  {
    requiredOfficeHours: 9.0, // 9小时
    regions: ['桂林', '佛山', '深圳']
  }
];

// 默认配置（如果没有匹配到具体地区）
const DEFAULT_REGION_CONFIG: RegionConfig = {
  requiredOfficeHours: 8.5,
  regions: ['默认']
};

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
    earlyLeaveCount: number;
    earlyLeaveMinutes: number;
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
 * @returns Promise<FormattedSummaryResult> 返回加班工资计算结果
 */
export const processOvertimeJson = async (overtimeData: OvertimeData): Promise<FormattedSummaryResult> => {
  try {
    // 提取重要参数
    const { hourlyRate, customData, overwork, personalLeaveHours = 0, sickLeaveHours = 0, overtimeStartTime = "19:00", region } = overtimeData;

    // 验证必要参数
    if (!hourlyRate || isNaN(Number(hourlyRate))) {
      throw new Error('缺少必要参数或参数格式错误: hourlyRate');
    }
    
    if (!customData || !Array.isArray(customData) || customData.length === 0) {
      throw new Error('缺少有效的加班数据记录');
    }
    
    // 对日期类型进行智能判断和规范化
    const normalizedData: OvertimeRecord[] = [];
    
    for (const record of customData) {
      // 智能判断日期类型
      const intelligentType = await intelligentDayType(record.date);
      // 如果原始数据中有dayType，以原始数据为准，否则使用智能判断结果
      const finalDayType = record.dayType ? normalizeDayType(record.dayType) : intelligentType;
      
      normalizedData.push({
        ...record,
        dayType: finalDayType
      });
    }

    // 处理加班数据
    const result = processCustomOvertimeData(normalizedData, Number(hourlyRate), overtimeStartTime, region);
    
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
 * 根据地区获取在岗时长配置
 * 
 * @param region 地区名称
 * @returns 地区配置
 */
function getRegionConfig(region?: string): RegionConfig {
  if (!region) {
    return DEFAULT_REGION_CONFIG;
  }
  
  for (const config of REGION_CONFIGS) {
    if (config.regions.some(r => region.includes(r))) {
      return config;
    }
  }
  
  return DEFAULT_REGION_CONFIG;
}

/**
 * 处理自定义加班数据（支持旷工时间处理）
 * 
 * @param customData 自定义加班数据
 * @param hourlyRate 小时工资基数
 * @param overtimeStartTime 加班开始时间，格式："HH:MM"，默认"19:00"
 * @param region 工作地区，用于确定在岗时长要求
 * @returns 处理结果
 */
function processCustomOvertimeData(
  customData: OvertimeRecord[], 
  hourlyRate: number,
  overtimeStartTime: string = "19:00",
  region?: string
): ProcessedOvertimeRecord[] {
  const result: ProcessedOvertimeRecord[] = [];
  const dailyRecords: DailyRecord[] = []; // 存储每日详细记录
  let overtimeIncome = 0;
  
  // 设置默认午休时长
  const lunchBreakHours = 1.5; // 固定1.5小时午休
  
  // 按日期处理每条加班记录
  for (const item of customData) {
    const { date, startTime, endTime, dayType } = item;
    
    // 确保时间格式正确
    const firstCheckTime = formatTimeString(startTime);
    const lastCheckTime = formatTimeString(endTime);
    
    // 根据日期类型计算加班费率
    const payRate = calculatePayRate(dayType);
    
    // 计算详细的工时信息
    const detailedCalculation = calculateDetailedWorkHours(
      firstCheckTime, 
      lastCheckTime, 
      dayType, 
      overtimeStartTime,
      region
    );
    
    // 计算加班薪资（旷工时间会导致负薪资）
    const overtimePay = calculateOvertimePay(detailedCalculation.finalOvertimeHours, payRate, hourlyRate);
    overtimeIncome += overtimePay;
    
    // 计算餐补（只有正加班时长才有餐补）
    const mealAllowance = detailedCalculation.finalOvertimeHours > 0 ? 
      calculateAllowance(detailedCalculation.finalOvertimeHours, dayType) : 0;
    
    // 计算总收入
    const totalIncome = overtimePay + mealAllowance;
    
    // 创建每日详细记录
    const dailyRecord: DailyRecord = {
      date,
      dayType,
      startTime: firstCheckTime,
      endTime: lastCheckTime,
      workHours: detailedCalculation.workHours,
      standardWorkHours: detailedCalculation.standardWorkHours,
      lunchBreakHours,
      requiredOfficeHours: detailedCalculation.requiredOfficeHours,
      actualOfficeHours: detailedCalculation.actualOfficeHours,
      lateMinutes: detailedCalculation.lateMinutes,
      earlyLeaveMinutes: detailedCalculation.earlyLeaveMinutes,
      attendanceStatus: detailedCalculation.attendanceStatus,
      deductionHours: detailedCalculation.deductionHours,
      deductionReason: detailedCalculation.deductionReason,
      overtimeHours: detailedCalculation.finalOvertimeHours,
      overtimeStartTime,
      pureOvertimeHours: detailedCalculation.pureOvertimeHours,
      finalOvertimeHours: detailedCalculation.finalOvertimeHours,
      payRate,
      overtimePay,
      mealAllowance,
      totalIncome,
      isUnderwork: detailedCalculation.isUnderwork,
      notes: detailedCalculation.notes
    };
    
    dailyRecords.push(dailyRecord);
    
    // 添加到结果中（保持向后兼容）
    result.push({
      date,
      startTime: firstCheckTime,
      endTime: lastCheckTime,
      dayType,
      payRate,
      overtimeHours: detailedCalculation.finalOvertimeHours,
      overtimePay,
      mealAllowance,
      totalIncome,
      lateMinutes: detailedCalculation.lateMinutes,
      earlyLeaveMinutes: detailedCalculation.earlyLeaveMinutes,
      attendanceStatus: detailedCalculation.attendanceStatus,
      workHours: detailedCalculation.workHours,
      deductionHours: detailedCalculation.deductionHours,
      deductionReason: detailedCalculation.deductionReason,
      isUnderwork: detailedCalculation.isUnderwork
    });
  }
  
  // 输出汇总日志
  logDailySummary(dailyRecords);
  
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
 * 智能判断日期类型（使用在线节假日API，增强逻辑判断）
 * 
 * @param date 日期字符串，格式：YYYY-MM-DD
 * @returns 日期类型：'工作日' | '周末' | '节假日'
 */
async function intelligentDayType(date: string): Promise<string> {
  try {
    // 首先验证日期格式
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.warn(`日期格式不正确: ${date}，使用基本逻辑判断`);
      return getBasicDayType(date);
    }
    
    const year = date.split('-')[0];
    const holidayInfo = await getHolidayInfo(year);
    
    // 构造API中使用的日期格式 MM-DD
    const monthDay = date.substring(5); // 提取 MM-DD 部分
    
    // 检查是否有该日期的节假日信息
    if (holidayInfo[monthDay]) {
      const dayInfo = holidayInfo[monthDay];
      
      // 判断是否为节假日
      if (dayInfo.holiday === true) {
        // 根据wage字段进一步判断节假日类型
        if (dayInfo.wage === 3) {
          return '节假日';
        } else if (dayInfo.wage === 2) {
          return '节假日'; // 调休假期也按节假日处理
        } else {
          return '节假日';
        }
      }
      
      // 判断是否为补班
      if (dayInfo.holiday === false) {
        return '工作日'; // 补班按工作日处理
      }
    }
    
    // 没有特殊信息时，使用基本的周末判断
    const basicType = getBasicDayType(date);
    return basicType;
    
  } catch (error) {
    console.error(`智能判断日期类型失败，使用基本逻辑: ${date}`, error);
    return getBasicDayType(date);
  }
}

/**
 * 基本日期类型判断（兜底逻辑）
 * 
 * @param date 日期字符串
 * @returns 日期类型
 */
function getBasicDayType(date: string): string {
  try {
    const dateObj = new Date(date + 'T00:00:00'); // 添加时间部分避免时区问题
    const dayOfWeek = dateObj.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return '周末';
    }
    
    return '工作日';
  } catch (error) {
    console.error(`基本日期判断失败: ${date}`, error);
    return '工作日'; // 默认返回工作日
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
 * 计算详细工时信息（替代原有的console.log方式）
 */
interface DetailedWorkCalculation {
  workHours: number;
  standardWorkHours: number;
  requiredOfficeHours: number;
  actualOfficeHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  attendanceStatus: 'normal' | 'late' | 'early_leave' | 'absent' | 'late_and_early';
  deductionHours: number;
  deductionReason: string;
  pureOvertimeHours: number;
  finalOvertimeHours: number;
  isUnderwork: boolean;
  notes: string[];
}

/**
 * 计算详细的工时信息
 * 
 * @param firstCheckTime 第一次打卡时间
 * @param lastCheckTime 最后一次打卡时间
 * @param dayType 日期类型
 * @param overtimeStartTime 加班开始时间
 * @param lunchBreakHours 午休时长
 * @param region 工作地区
 * @returns 详细工时计算结果
 */
function calculateDetailedWorkHours(
  firstCheckTime: string,
  lastCheckTime: string,
  dayType: string,
  overtimeStartTime: string = "19:00",
  region?: string
): DetailedWorkCalculation {
  const notes: string[] = [];
  
  // 设置默认午休时长
  const lunchBreakHours = 1.5; // 固定1.5小时午休
  
  // 检查是否为异地打卡
  if (lastCheckTime.includes('异地打卡')) {
    return {
      workHours: 0,
      standardWorkHours: 7.5,
      requiredOfficeHours: 0,
      actualOfficeHours: 0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      attendanceStatus: 'absent',
      deductionHours: 0,
      deductionReason: '异地打卡，不计算工时',
      pureOvertimeHours: 0,
      finalOvertimeHours: 0,
      isUnderwork: false,
      notes: ['异地打卡，不计算工时']
    };
  }
  
  // 解析时间
  const firstTime = parseTimeString(firstCheckTime);
  const lastTime = parseTimeString(lastCheckTime);
  
  if (dayType === '工作日') {
    return calculateWorkdayDetails(firstTime, lastTime, firstCheckTime, lastCheckTime, overtimeStartTime, region, notes);
  } else {
    return calculateWeekendHolidayDetails(firstTime, lastTime, firstCheckTime, lastCheckTime, dayType, notes);
  }
}

/**
 * 计算工作日详细信息
 */
function calculateWorkdayDetails(
  firstTime: { hours: number; minutes: number; seconds: number },
  lastTime: { hours: number; minutes: number; seconds: number },
  firstCheckTime: string,
  lastCheckTime: string,
  overtimeStartTime: string,
  region: string | undefined,
  notes: string[]
): DetailedWorkCalculation {
  const standardWorkHours = 7.5;
  const lunchBreakHours = 1.5; // 固定1.5小时午休
  const regionConfig = getRegionConfig(region);
  const requiredOfficeHours = regionConfig.requiredOfficeHours; // 使用地区配置的在岗时长
  
  const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
  const lastTimeMinutes = lastTime.hours * 60 + lastTime.minutes;
  const actualOfficeHours = (lastTimeMinutes - firstTimeMinutes) / 60;
  
  // 新的弹性考勤规则
  const normalStartTime = 8 * 60 + 30;      // 8:30 正常上班开始时间
  const flexibleEndTime = 9 * 60;           // 9:00 弹性上班结束时间（9:00前都算正常）
  const lateThreshold = 9 * 60 + 30;        // 9:30 迟到阈值（9:30后算迟到）
  const standardEndTime = 17 * 60 + 30;     // 17:30 标准下班时间
  
  // 计算迟到和早退
  let lateMinutes = 0;
  let attendanceType = 'normal'; // 'normal', 'flexible', 'late'
  
  if (firstTimeMinutes <= flexibleEndTime) {
    // 9:00前到岗，正常出勤
    attendanceType = 'normal';
    lateMinutes = 0;
  } else if (firstTimeMinutes <= lateThreshold) {
    // 9:00-9:30，弹性出勤（但会记录弹性分钟数）
    attendanceType = 'flexible';
    lateMinutes = firstTimeMinutes - flexibleEndTime; // 记录弹性使用的分钟数
  } else {
    // 9:30后，迟到
    attendanceType = 'late';
    lateMinutes = firstTimeMinutes - lateThreshold;
  }
  
  // 计算早退（不允许早退，任何早退都要扣除）
  const earlyLeaveMinutes = Math.max(0, standardEndTime - lastTimeMinutes);
  
  // 判断考勤状态
  let attendanceStatus: 'normal' | 'late' | 'early_leave' | 'absent' | 'late_and_early' = 'normal';
  if (attendanceType === 'late' && earlyLeaveMinutes > 0) {
    attendanceStatus = 'late_and_early';
  } else if (attendanceType === 'late') {
    attendanceStatus = 'late';
  } else if (earlyLeaveMinutes > 0) {
    attendanceStatus = 'early_leave';
  }
  
  // 计算扣除工时
  let totalDeduction = 0;
  let deductionReason = '';
  const deductionReasons: string[] = [];
  
  // 迟到扣除（实现惩罚性扣除规则）
  if (attendanceType === 'late') {
    let lateDeduction = 0;
    
    // 确定迟到的具体时间段和扣除规则
    if (firstTimeMinutes <= 10 * 60) {
      // 9:31-10:00(含)到岗：扣除1小时基础工时 + 实际迟到分钟数
      const actualLateMinutes = firstTimeMinutes - lateThreshold; // 从9:30开始计算迟到
      lateDeduction = 1 + (actualLateMinutes / 60); // 1小时基础 + 实际迟到时间
      deductionReasons.push(`迟到扣除：1小时基础工时+${actualLateMinutes}分钟`);
      notes.push(`迟到扣除(9:31-10:00) - 上班时间: ${firstCheckTime}, 迟到: ${actualLateMinutes}分钟, 扣除工时: ${lateDeduction.toFixed(2)}小时 (1小时基础 + ${(actualLateMinutes/60).toFixed(2)}小时迟到)`);
    } else if (firstTimeMinutes <= 10 * 60 + 30) {
      // 10:01-10:30(含)到岗：扣除2小时基础工时 + 实际迟到分钟数
      const actualLateMinutes = firstTimeMinutes - lateThreshold; // 从9:30开始计算迟到
      lateDeduction = 2 + (actualLateMinutes / 60); // 2小时基础 + 实际迟到时间
      deductionReasons.push(`迟到扣除：2小时基础工时+${actualLateMinutes}分钟`);
      notes.push(`迟到扣除(10:01-10:30) - 上班时间: ${firstCheckTime}, 迟到: ${actualLateMinutes}分钟, 扣除工时: ${lateDeduction.toFixed(2)}小时 (2小时基础 + ${(actualLateMinutes/60).toFixed(2)}小时迟到)`);
    } else {
      // 10:31后到岗：视同旷工处理，当日不计入有效工时
      lateDeduction = standardWorkHours; // 扣除全天标准工时
      deductionReasons.push('旷工处理（10:31后到岗）');
      attendanceStatus = 'absent'; // 修改考勤状态为旷工
      notes.push(`旷工处理 - 上班时间: ${firstCheckTime}, 10:31后到岗视为旷工，扣除全天工时: ${lateDeduction.toFixed(2)}小时`);
    }
    
    totalDeduction += lateDeduction;
  } else if (attendanceType === 'flexible') {
    notes.push(`弹性出勤 - 上班时间: ${firstCheckTime}, 使用弹性时间: ${lateMinutes}分钟（不扣除工时）`);
  }
  
  // 早退扣除（任何早退都要扣除）
  if (earlyLeaveMinutes > 0) {
    const earlyLeaveDeduction = earlyLeaveMinutes / 60;
    totalDeduction += earlyLeaveDeduction;
    deductionReasons.push(`早退${earlyLeaveMinutes}分钟`);
    notes.push(`早退扣除 - 下班时间: ${lastCheckTime}, 早退: ${earlyLeaveMinutes}分钟, 扣除工时: ${earlyLeaveDeduction.toFixed(2)}小时`);
  }
  
  // 在岗时长不足扣除
  let underworkDeduction = 0;
  if (actualOfficeHours < requiredOfficeHours) {
    underworkDeduction = requiredOfficeHours - actualOfficeHours;
    totalDeduction += underworkDeduction;
    deductionReasons.push(`在岗时长不足${underworkDeduction.toFixed(2)}小时`);
    notes.push(`在岗不足 - 要求在岗: ${requiredOfficeHours}小时, 实际在岗: ${actualOfficeHours.toFixed(2)}小时, 扣除工时: ${underworkDeduction.toFixed(2)}小时`);
  }
  
  deductionReason = deductionReasons.length > 0 ? deductionReasons.join(' + ') : '无扣除';
  
  // 计算加班
  const overtimeStartParts = overtimeStartTime.split(':');
  const overtimeStartHour = parseInt(overtimeStartParts[0], 10);
  const overtimeStartMinute = parseInt(overtimeStartParts[1] || '0', 10);
  const overtimeStartTotalMinutes = overtimeStartHour * 60 + overtimeStartMinute;
  
  let pureOvertimeHours = 0;
  if (lastTimeMinutes > overtimeStartTotalMinutes) {
    pureOvertimeHours = (lastTimeMinutes - overtimeStartTotalMinutes) / 60;
  }
  
  // 最终加班时长 = 纯加班时长 - 总扣除工时
  let finalOvertimeHours = pureOvertimeHours - totalDeduction;
  let isUnderwork = underworkDeduction > 0;
  
  if (totalDeduction > 0) {
    notes.push(`工时计算 - 纯加班: ${pureOvertimeHours.toFixed(2)}小时, 总扣除: ${totalDeduction.toFixed(2)}小时, 最终加班: ${finalOvertimeHours.toFixed(2)}小时`);
  }
  
  return {
    workHours: Math.max(0, actualOfficeHours - lunchBreakHours - totalDeduction),
    standardWorkHours,
    requiredOfficeHours,
    actualOfficeHours,
    lateMinutes: attendanceType === 'late' ? lateMinutes : 0, // 只有真正迟到才记录
    earlyLeaveMinutes,
    attendanceStatus,
    deductionHours: totalDeduction,
    deductionReason,
    pureOvertimeHours,
    finalOvertimeHours,
    isUnderwork,
    notes
  };
}

/**
 * 计算周末和节假日详细信息
 */
function calculateWeekendHolidayDetails(
  firstTime: { hours: number; minutes: number; seconds: number },
  lastTime: { hours: number; minutes: number; seconds: number },
  firstCheckTime: string,
  lastCheckTime: string,
  dayType: string,
  notes: string[]
): DetailedWorkCalculation {
  const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
  const lastTimeMinutes = lastTime.hours * 60 + lastTime.minutes;
  const workTotalMinutes = lastTimeMinutes - firstTimeMinutes;
  const finalOvertimeHours = Math.max(0, workTotalMinutes / 60);
  
  notes.push(`${dayType}全天计算加班: ${finalOvertimeHours.toFixed(2)}小时`);
  
  return {
    workHours: finalOvertimeHours,
    standardWorkHours: 0,
    requiredOfficeHours: 0,
    actualOfficeHours: finalOvertimeHours,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    attendanceStatus: 'normal',
    deductionHours: 0,
    deductionReason: '无扣除',
    pureOvertimeHours: finalOvertimeHours,
    finalOvertimeHours,
    isUnderwork: false,
    notes
  };
}

/**
 * 输出每日汇总日志
 */
function logDailySummary(dailyRecords: DailyRecord[]): void {
  console.log('\n=== 每日考勤与加班汇总 ===');
  
  let totalWorkdays = 0;
  let totalLateCount = 0;
  let totalEarlyLeaveCount = 0;
  let totalAbsentCount = 0;
  let totalDeductionHours = 0;
  let totalOvertimeHours = 0;
  let totalOvertimePay = 0;
  
  dailyRecords.forEach(record => {
    if (record.dayType === '工作日') {
      totalWorkdays++;
      if (record.lateMinutes > 0) totalLateCount++;
      if (record.earlyLeaveMinutes > 0) totalEarlyLeaveCount++;
      if (record.attendanceStatus === 'absent') totalAbsentCount++;
      totalDeductionHours += record.deductionHours;
    }
    
    totalOvertimeHours += record.finalOvertimeHours;
    totalOvertimePay += record.overtimePay;
    
    // 记录异常情况
    if (record.isUnderwork || record.deductionHours > 0 || record.attendanceStatus !== 'normal') {
      console.log(`${record.date} [${record.dayType}] - ${record.attendanceStatus.toUpperCase()}`);
      console.log(`  上下班: ${record.startTime} - ${record.endTime}`);
      console.log(`  在岗时长: ${record.actualOfficeHours.toFixed(2)}小时`);
      if (record.lateMinutes > 0) console.log(`  迟到: ${record.lateMinutes}分钟`);
      if (record.earlyLeaveMinutes > 0) console.log(`  早退: ${record.earlyLeaveMinutes}分钟`);
      if (record.deductionHours > 0) console.log(`  扣除工时: ${record.deductionHours.toFixed(2)}小时 (${record.deductionReason})`);
      console.log(`  加班时长: ${record.finalOvertimeHours.toFixed(2)}小时, 加班费: ${record.overtimePay.toFixed(2)}元`);
      console.log('  ---');
    }
  });
  
  console.log('\n=== 汇总统计 ===');
  console.log(`工作日天数: ${totalWorkdays}天`);
  console.log(`迟到次数: ${totalLateCount}次`);
  console.log(`早退次数: ${totalEarlyLeaveCount}次`);
  console.log(`旷工次数: ${totalAbsentCount}次`);
  console.log(`总扣除工时: ${totalDeductionHours.toFixed(2)}小时`);
  console.log(`总加班时长: ${totalOvertimeHours.toFixed(2)}小时`);
  console.log(`总加班收入: ${totalOvertimePay.toFixed(2)}元`);
  console.log('===================\n');
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
  // 只有正加班时长才有餐补，旷工时间不给餐补
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
 * 计算迟到时间（支持弹性上班）- 更新版本
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
  
  // 新的弹性上班规则：9:30后算迟到
  const lateThreshold = 9 * 60 + 30; // 9:30
  const firstTime = parseTimeString(firstCheckTime);
  const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
  
  const lateMinutes = firstTimeMinutes > lateThreshold 
    ? firstTimeMinutes - lateThreshold 
    : 0;
    
  return lateMinutes;
}

/**
 * 计算基于迟到规则的工时扣除（小时）- 更新版本
 * 
 * @param firstCheckTime 第一次打卡时间
 * @param dayType 日期类型
 * @returns 应扣除的工时（小时）
 */
function calculateLateDeduction(firstCheckTime: string, dayType: string): number {
  // 非工作日或异地打卡不扣除工时
  if (dayType !== '工作日' || firstCheckTime.includes('异地打卡')) {
    return 0;
  }
  
  const firstTime = parseTimeString(firstCheckTime);
  const firstTimeMinutes = firstTime.hours * 60 + firstTime.minutes;
  
  // 新的弹性上班规则
  const flexibleEndTime = 9 * 60;           // 9:00 弹性结束时间
  const lateThreshold = 9 * 60 + 30;        // 9:30 迟到阈值
  
  if (firstTimeMinutes <= flexibleEndTime) {
    // 9:00前到岗，无扣除
    return 0;
  } else if (firstTimeMinutes <= lateThreshold) {
    // 9:00-9:30，弹性时间，无扣除
    return 0;
  } else {
    // 9:30后到岗，按分钟扣除
    const lateMinutes = firstTimeMinutes - lateThreshold;
    const deductionHours = lateMinutes / 60;
    return deductionHours;
  }
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
  let earlyLeaveCount = 0;
  let totalEarlyLeaveMinutes = 0;

  // 根据结果计算汇总数据
  for (const record of result) {
    const { dayType, overtimeHours, overtimePay, mealAllowance, lateMinutes: recordLateMinutes, earlyLeaveMinutes } = record;
    
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
    
    // 累计早退信息（新增）
    if (earlyLeaveMinutes > 0) {
      earlyLeaveCount += 1;
      totalEarlyLeaveMinutes += earlyLeaveMinutes;
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
      earlyLeaveCount,
      earlyLeaveMinutes: totalEarlyLeaveMinutes,
      requiredWorkdays,
      actualWorkdays
    },
    rank
  };
}

export interface FormattedSummaryResult {
  header: {
    title: string;
    hasUnderwork: boolean;
    underworkWarning?: string;
  };
  income: {
    total: {
      amount: number;
      formatted: string;
      status: string;
      note?: string;
    };
    mealAllowance: {
      amount: number;
      formatted: string;
      status: string;
    };
    totalIncome: {
      amount: number;
      formatted: string;
      status: string;
    };
    actualTotalIncome?: {
      amount: number;
      formatted: string;
      status: string;
    };
    breakdown: {
      workday: {
        amount: number;
        formatted: string;
        status: string;
        note?: string;
      };
      weekend: {
        amount: number;
        formatted: string;
        status: string;
      };
      holiday: {
        amount: number;
        formatted: string;
        status: string;
      };
    };
  };
  hours: {
    workday: {
      hours: number;
      formatted: string;
      status: string;
    };
    weekend: {
      hours: number;
      formatted: string;
      status: string;
    };
    holiday: {
      hours: number;
      formatted: string;
      status: string;
    };
    total: {
      hours: number;
      formatted: string;
      status: string;
    };
    actualTotal?: {
      hours: number;
      formatted: string;
      status: string;
    };
  };
  attendance: {
    workdays: {
      actual: number;
      required: number;
      ratio: string;
    };
    late: {
      count: number;
      minutes: number;
      status: string;
      message: string;
    };
    earlyLeave: {
      count: number;
      minutes: number;
      status: string;
      message: string;
    };
  };
  rank: {
    level: string;
    message: string;
  };
  tips: string[];
}

/**
 * 格式化汇总结果为JSON对象
 * 
 * @param summary 汇总结果
 * @returns 格式化后的JSON对象
 */
function formatSummary(summary: SummaryResult): FormattedSummaryResult {
  const { income, hours, attendance, rank } = summary;
  
  // 格式化数字，根据数值大小选择合适的精度
  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1000) {
      return num.toFixed(0);
    } else if (Math.abs(num) >= 10) {
      return num.toFixed(1);
    } else {
      return num.toFixed(2);
    }
  };
  
  // 判断金额状态
  const getMoneyStatus = (amount: number): string => {
    if (amount < 0) return 'negative';
    if (amount > 1000) return 'excellent';
    if (amount > 500) return 'good';
    return 'normal';
  };
  
  // 判断工时状态
  const getHoursStatus = (hours: number): string => {
    if (hours < 0) return 'underwork';
    if (hours > 60) return 'overwork';
    if (hours > 40) return 'high';
    return 'normal';
  };
  
  // 检查是否有旷工时间
  const hasUnderwork = hours.workdayOvertimeHours < 0 || income.totalOvertimePay < 0;
  
  // 生成智能建议
  const tips: string[] = [];
  if (income.totalOvertimePay < 500) {
    tips.push('建议：增加加班时长，提高收入水平');
  }
  if (hours.workdayOvertimeHours < 0) {
    tips.push('提醒：工作日旷工时间较多，建议调整工作节奏');
  }
  if (attendance.lateCount > 5) {
    tips.push('注意：迟到次数较多，建议改善时间管理');
  }
  if (attendance.earlyLeaveCount > 3) {
    tips.push('注意：早退次数较多，建议合理安排工作时间');
  }
  if (attendance.lateCount > 0 && attendance.earlyLeaveCount > 0) {
    tips.push('提醒：既有迟到又有早退，严重影响工时，建议调整作息');
  }
  if (hours.totalOvertimeHours > 80) {
    tips.push('关注：加班时长较高，注意身体健康');
  }
  
  return {
    header: {
      title: '加班统计报告',
      hasUnderwork,
      underworkWarning: hasUnderwork ? '检测到旷工时间！工作日未满7.5小时会从加班时长中扣除' : undefined
    },
    income: {
      total: {
        amount: income.totalOvertimePay,
        formatted: `${formatNumber(income.totalOvertimePay)}元`,
        status: getMoneyStatus(income.totalOvertimePay),
        note: income.totalOvertimePay < 0 ? '含旷工扣除' : undefined
      },
      mealAllowance: {
        amount: income.totalMealAllowance,
        formatted: `${formatNumber(income.totalMealAllowance)}元`,
        status: getMoneyStatus(income.totalMealAllowance)
      },
      totalIncome: {
        amount: income.totalIncome,
        formatted: `${formatNumber(income.totalIncome)}元`,
        status: getMoneyStatus(income.totalIncome)
      },
      actualTotalIncome: income.actualTotalIncome !== income.totalIncome ? {
        amount: income.actualTotalIncome,
        formatted: `${formatNumber(income.actualTotalIncome)}元`,
        status: getMoneyStatus(income.actualTotalIncome)
      } : undefined,
      breakdown: {
        workday: {
          amount: income.workdayOvertimePay,
          formatted: `${formatNumber(income.workdayOvertimePay)}元`,
          status: getMoneyStatus(income.workdayOvertimePay),
          note: income.workdayOvertimePay < 0 ? '旷工扣除' : undefined
        },
        weekend: {
          amount: income.weekendOvertimePay,
          formatted: `${formatNumber(income.weekendOvertimePay)}元`,
          status: getMoneyStatus(income.weekendOvertimePay)
        },
        holiday: {
          amount: income.holidayOvertimePay,
          formatted: `${formatNumber(income.holidayOvertimePay)}元`,
          status: getMoneyStatus(income.holidayOvertimePay)
        }
      }
    },
    hours: {
      workday: {
        hours: hours.workdayOvertimeHours,
        formatted: `${formatNumber(hours.workdayOvertimeHours)}小时`,
        status: getHoursStatus(hours.workdayOvertimeHours)
      },
      weekend: {
        hours: hours.weekendOvertimeHours,
        formatted: `${formatNumber(hours.weekendOvertimeHours)}小时`,
        status: getHoursStatus(hours.weekendOvertimeHours)
      },
      holiday: {
        hours: hours.holidayOvertimeHours,
        formatted: `${formatNumber(hours.holidayOvertimeHours)}小时`,
        status: getHoursStatus(hours.holidayOvertimeHours)
      },
      total: {
        hours: hours.totalOvertimeHours,
        formatted: `${formatNumber(hours.totalOvertimeHours)}小时`,
        status: getHoursStatus(hours.totalOvertimeHours)
      },
      actualTotal: hours.actualOvertimeHours !== hours.totalOvertimeHours ? {
        hours: hours.actualOvertimeHours,
        formatted: `${formatNumber(hours.actualOvertimeHours)}小时`,
        status: getHoursStatus(hours.actualOvertimeHours)
      } : undefined
    },
    attendance: {
      workdays: {
        actual: attendance.actualWorkdays,
        required: attendance.requiredWorkdays,
        ratio: `${attendance.actualWorkdays}/${attendance.requiredWorkdays}`
      },
      late: {
        count: attendance.lateCount,
        minutes: attendance.lateMinutes,
        status: attendance.lateCount > 0 ? 'has_late' : 'no_late',
        message: attendance.lateCount > 0 ? 
          `${attendance.lateCount}次，共${attendance.lateMinutes}分钟` : 
          '无迟到记录'
      },
      earlyLeave: {
        count: attendance.earlyLeaveCount,
        minutes: attendance.earlyLeaveMinutes,
        status: attendance.earlyLeaveCount > 0 ? 'has_early_leave' : 'no_early_leave',
        message: attendance.earlyLeaveCount > 0 ? 
          `${attendance.earlyLeaveCount}次，共${attendance.earlyLeaveMinutes}分钟` : 
          '无早退记录'
      }
    },
    rank: {
      level: rank.includes('李在赣神魔') ? 'very_low' :
             rank.includes('不太行') ? 'low' :
             rank.includes('一般') ? 'normal' :
             rank.includes('牛逼') ? 'good' :
             rank.includes('逆天') ? 'excellent' :
             rank.includes('懂加班') ? 'expert' : 'unknown',
      message: rank
    },
    tips
  };
}

/**
 * 处理打卡记录数据计算加班（支持智能节假日判断和弹性上下班）
 * 从原始打卡记录中计算加班时间和薪资
 * 
 * @param punchRecords 打卡记录数组
 * @param hourlyRate 小时工资基数
 * @param workdayType 工作日类型设置 (可选，用于指定哪些日期是工作日/周末/节假日)
 * @param overtimeStartTime 加班开始时间，格式："HH:MM"，默认"19:00"
 * @returns Promise<FormattedSummaryResult> 返回加班工资计算结果
 */
export async function processPunchRecords(
  punchRecords: PunchRecord[], 
  hourlyRate: number = 20,
  workdayType?: Record<string, string>,
  overtimeStartTime?: string
): Promise<FormattedSummaryResult> {
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
      customData,
      overtimeStartTime
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
function groupPunchRecordsByDate(
  punchRecords: PunchRecord[]
): Record<string, PunchRecord[]> {
  const recordsByDate: Record<string, PunchRecord[]> = {};
  
  // 添加所有打卡记录
  for (const record of punchRecords) {
    // 检查记录是否有效
    if (!record || typeof record !== 'object' || !record.SHIFTTERM) {
      console.warn('发现无效的打卡记录，跳过:', record);
      continue;
    }
    
    const date = record.SHIFTTERM;
    if (!recordsByDate[date]) {
      recordsByDate[date] = [];
    }
    recordsByDate[date].push(record);
  }
  
  // 对每一天的记录按打卡时间排序，并确保整体按日期顺序排列
  const sortedRecordsByDate: Record<string, PunchRecord[]> = {};
  const sortedDates = Object.keys(recordsByDate).sort();
  
  for (const date of sortedDates) {
    // 对每天内部的打卡记录按时间排序
    recordsByDate[date].sort((a, b) => {
      return new Date(a.CARDTIME).getTime() - new Date(b.CARDTIME).getTime();
    });
    sortedRecordsByDate[date] = recordsByDate[date];
  }
  
  return sortedRecordsByDate;
}

/**
 * 将打卡记录转换为加班记录（支持智能节假日判断和旷工检测）
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
  
  // 获取所有日期并判断类型
  const allDates = Object.keys(recordsByDate);
  const dateTypes = new Map<string, string>();
  
  // 批量判断日期类型，提高性能
  for (const date of allDates) {
    let dayType = '工作日';
    
    if (workdayType && workdayType[date]) {
      dayType = normalizeDayType(workdayType[date]);
    } else {
      // 使用智能节假日判断
      dayType = await intelligentDayType(date);
    }
    
    dateTypes.set(date, dayType);
  }
  
  for (const date in recordsByDate) {
    const dayRecords = recordsByDate[date];
    const dayType = dateTypes.get(date) || '工作日';
    
    // 如果该日期完全没有打卡记录（可能是休假、请假等）
    if (dayRecords.length === 0) {
      if (dayType === '工作日') {
        // 工作日没有任何打卡记录，可能是请假或旷工，标记为全天旷工
        overtimeRecords.push({
          date,
          startTime: '00:00:00',
          endTime: '00:00:00', // 同样的时间表示没有工作，全天旷工
          dayType: '工作日'
        });
      }
      continue;
      
    }
    
    // 检查打卡记录是否充足
    if (dayRecords.length < 2) {
      // 工作日没有足够打卡记录，标记为旷工
      if (dayType === '工作日') {
        // 这样在后续计算中会被识别为旷工时间
        overtimeRecords.push({
          date,
          startTime: '00:00:00',
          endTime: '00:00:00', // 打卡信息不足，记为旷工数据
          dayType: '工作日'
        });
      }
      continue;
      
    }
    
    // 过滤无效打卡记录
    const validRecords = dayRecords.filter(record => {
      // 首先检查 record 本身是否有效
      if (!record || typeof record !== 'object') {
        return false;
      }
      
      const cardTime = record.CARDTIME;
      
      // 检查时间格式是否有效
      if (!cardTime || cardTime.includes('异地打卡') || cardTime.includes('无效')) {
        return false;
      }
      
      // 检查时间格式是否包含空格分隔符
      if (!cardTime.includes(' ')) {
        return false;
      }
      
      // 检查时间是否合理（不能是00:00:00或其他明显异常时间）
      const timeStr = cardTime.split(' ')[1];
      if (!timeStr || timeStr === '00:00:00' || timeStr === '23:59:59') {
        return false;
      }
      
      return true;
    });
    
    if (validRecords.length < 2) {
      // 有效打卡记录不足
      if (dayType === '工作日') {
        overtimeRecords.push({
          date,
          startTime: '00:00:00',
          endTime: '00:00:00',
          dayType: '工作日'
        });
      }
      // 无论是工作日还是非工作日，都要跳过后续处理
      continue;
    }
    
    // 取当天第一条和最后一条有效记录作为上下班时间
    const firstRecord = validRecords[0];
    const lastRecord = validRecords[validRecords.length - 1];
    
    // 额外安全检查
    if (!firstRecord || !lastRecord || !firstRecord.CARDTIME || !lastRecord.CARDTIME) {
      console.warn(`日期 ${date} 的打卡记录数据异常，跳过处理`);
      continue;
    }
    
    // 提取时间部分
    const firstTime = firstRecord.CARDTIME.split(' ')[1];
    const lastTime = lastRecord.CARDTIME.split(' ')[1];
    
    // 验证时间逻辑性
    const startTimeMinutes = parseTimeToMinutes(firstTime);
    const endTimeMinutes = parseTimeToMinutes(lastTime);
    
    // 检查时间是否合理
    if (endTimeMinutes <= startTimeMinutes) {
      console.warn(`日期 ${date} 的时间逻辑异常: 上班时间(${firstTime}) >= 下班时间(${lastTime})，跳过处理`);
      continue;
    }
    
    // 检查是否工作时间过短（少于2小时可能是异常打卡）
    const totalWorkMinutes = endTimeMinutes - startTimeMinutes;
    if (totalWorkMinutes < 120) { // 少于2小时
      console.warn(`日期 ${date} 工作时间过短(${(totalWorkMinutes/60).toFixed(1)}小时)，可能是异常打卡`);
      
      if (dayType === '工作日') {
        // 工作日时间过短，标记为严重旷工
        overtimeRecords.push({
          date,
          startTime: '09:00:00',
          endTime: '15:00:00', // 只工作6小时，严重旷工
          dayType: '工作日'
        });
      }
      continue;
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
 * 将时间字符串转换为分钟数（从00:00开始计算）
 * 
 * @param timeStr 时间字符串，格式：HH:MM:SS
 * @returns 分钟数
 */
function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
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
): Promise<FormattedSummaryResult> => {
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

/**
 * 测试新的迟到扣除规则
 */

const overtimeData = {
  hourlyRate: 20,
  overtimeStartTime: "19:00", // 默认19:00开始计算加班
  customData: [
    // 测试案例1：9:40到岗 - 应扣除1小时+10分钟
    {
      date: "2025-01-20",
      startTime: "09:40:00",
      endTime: "20:00:00",
      dayType: "工作日"
    },
    // 测试案例2：10:15到岗 - 应扣除2小时+45分钟
    {
      date: "2025-01-21",
      startTime: "10:15:00",
      endTime: "21:00:00",
      dayType: "工作日"
    },
    // 测试案例3：11:00到岗 - 旷工处理，扣除全天工时
    {
      date: "2025-01-22",
      startTime: "11:00:00", 
      endTime: "19:30:00",
      dayType: "工作日"
    },
    // 测试案例4：18:30开始计算加班
    {
      date: "2025-01-23",
      startTime: "09:00:00",
      endTime: "20:00:00",
      dayType: "工作日",
      overtimeStartTime: "18:30"
    }
  ]
};

console.log('测试数据:', JSON.stringify(overtimeData, null, 2));

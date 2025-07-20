// 加班计算API示例
const axios = require('axios');

// 测试数据
const testData = {
  hourlyRate: 30,  // 小时工资基数
  customData: [
    {
      date: "2023-05-01",
      startTime: "09:00:00",
      endTime: "20:00:00", 
      dayType: "工作日"  // 也可以写 "weekday"
    },
    {
      date: "2023-05-06", 
      startTime: "10:00:00",
      endTime: "18:00:00",
      dayType: "周末"  // 也可以写 "weekend"
    },
    {
      date: "2023-05-07",
      startTime: "09:30:00",
      endTime: "19:00:00",
      dayType: "节假日"  // 也可以写 "holiday"
    }
  ],
  // 可选参数
  personalLeaveHours: 0,  // 个人请假小时数
  overwork: "加班更多信息"  // 其他说明信息
};

/**
 * 调用加班计算API
 */
async function callOvertimeCalculator() {
  try {
    console.log('发送加班数据到API...');
    
    const response = await axios.post(
      'http://localhost:3000/api/http/overtime/calculate', 
      testData
    );
    
    console.log('API响应结果:');
    console.log(response.data.result);
    
    return response.data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}

// 执行示例
if (require.main === module) {
  callOvertimeCalculator()
    .then(() => console.log('示例完成'))
    .catch(err => console.error('示例出错:', err));
}

/**
 * 加班服务测试文件
 * 测试矿工时间处理、弹性上下班、节假日计算等核心功能
 */

const { processOvertimeJson } = require('../services/overtimeService');

/**
 * 测试矿工时间处理
 */
async function testUnderworkScenarios() {
  console.log('=== 测试矿工时间处理 ===\n');
  
  // 测试案例1：正常上班但下班早（矿工情况）
  const testData1 = {
    hourlyRate: 30,
    customData: [
      {
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '17:00:00',  // 下午5点下班，工作8小时（扣除1.5小时午休=6.5小时），矿工1.5小时
        dayType: '工作日'
      }
    ]
  };
  
  console.log('测试案例1：正常上班但下班早');
  console.log('输入:', JSON.stringify(testData1, null, 2));
  
  try {
    const result1 = await processOvertimeJson(testData1);
    console.log('结果:', result1);
  } catch (error) {
    console.error('错误:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试案例2：迟到且早退（严重矿工）
  const testData2 = {
    hourlyRate: 30,
    customData: [
      {
        date: '2024-01-16',
        startTime: '10:00:00',  // 迟到30分钟
        endTime: '17:30:00',    // 下午5:30下班，实际工作6小时，矿工2小时
        dayType: '工作日'
      }
    ]
  };
  
  console.log('测试案例2：迟到且早退');
  console.log('输入:', JSON.stringify(testData2, null, 2));
  
  try {
    const result2 = await processOvertimeJson(testData2);
    console.log('结果:', result2);
  } catch (error) {
    console.error('错误:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试案例3：正常工作且加班（有加班费）
  const testData3 = {
    hourlyRate: 30,
    customData: [
      {
        date: '2024-01-17',
        startTime: '09:00:00',
        endTime: '20:30:00',    // 晚上8:30下班，19:00后1.5小时加班
        dayType: '工作日'
      }
    ]
  };
  
  console.log('测试案例3：正常工作且加班');
  console.log('输入:', JSON.stringify(testData3, null, 2));
  
  try {
    const result3 = await processOvertimeJson(testData3);
    console.log('结果:', result3);
  } catch (error) {
    console.error('错误:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试案例4：矿工但有加班（加班时长会被矿工时间抵消）
  const testData4 = {
    hourlyRate: 30,
    customData: [
      {
        date: '2024-01-18',
        startTime: '09:30:00',  // 弹性上班时间内
        endTime: '20:00:00',    // 19:00后加班1小时，但实际工作8.5小时，矿工0小时，净加班1小时
        dayType: '工作日'
      }
    ]
  };
  
  console.log('测试案例4：弹性上班且适度加班');
  console.log('输入:', JSON.stringify(testData4, null, 2));
  
  try {
    const result4 = await processOvertimeJson(testData4);
    console.log('结果:', result4);
  } catch (error) {
    console.error('错误:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试案例5：周末工作（无矿工逻辑）
  const testData5 = {
    hourlyRate: 30,
    customData: [
      {
        date: '2024-01-20',  // 假设是周六
        startTime: '10:00:00',
        endTime: '18:00:00',  // 工作6.5小时（扣除午休），按1.5倍计算
        dayType: '周末'
      }
    ]
  };
  
  console.log('测试案例5：周末工作');
  console.log('输入:', JSON.stringify(testData5, null, 2));
  
  try {
    const result5 = await processOvertimeJson(testData5);
    console.log('结果:', result5);
  } catch (error) {
    console.error('错误:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试案例6：多天混合情况
  const testData6 = {
    hourlyRate: 30,
    customData: [
      {
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '17:00:00',  // 矿工1.5小时
        dayType: '工作日'
      },
      {
        date: '2024-01-16',
        startTime: '09:00:00',
        endTime: '21:00:00',  // 加班2小时
        dayType: '工作日'
      },
      {
        date: '2024-01-20',
        startTime: '10:00:00',
        endTime: '16:00:00',  // 周末工作4.5小时
        dayType: '周末'
      }
    ]
  };
  
  console.log('测试案例6：多天混合情况（矿工+加班+周末）');
  console.log('输入:', JSON.stringify(testData6, null, 2));
  
  try {
    const result6 = await processOvertimeJson(testData6);
    console.log('结果:', result6);
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// 执行测试
if (require.main === module) {
  testUnderworkScenarios().catch(console.error);
}

module.exports = {
  testUnderworkScenarios
};

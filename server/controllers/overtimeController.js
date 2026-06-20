"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCalculateOvertime = void 0;
const overtimeService_1 = require("../services/overtimeService");
/**
 * 控制器：处理加班工资计算请求
 * @param req Express 请求对象
 * @param res Express 响应对象
 */
const handleCalculateOvertime = async (req, res) => {
    try {
        const requestData = req.body;
        // 对于GET请求，如果没有body，使用默认的加班数据结构
        if (!requestData && req.method === 'GET') {
            // 从查询参数获取配置
            const hourlyRate = Number(req.query.hourlyRate) || 20;
            const overtimeStartTime = req.query.overtimeStartTime || '19:00';
            const region = req.query.region || 'default';
            // 使用默认的加班数据结构进行演示
            const defaultData = {
                hourlyRate,
                overtimeStartTime,
                region,
                customData: [
                    {
                        date: new Date().toISOString().split('T')[0],
                        startTime: "09:00",
                        endTime: "21:00",
                        dayType: "工作日",
                        isWorkDay: true
                    }
                ]
            };
            const result = await (0, overtimeService_1.processOvertimeJson)(defaultData);
            res.status(200).json({
                success: true,
                data: result,
                message: 'GET请求示例计算完成 - 参数: hourlyRate=' + hourlyRate + ', overtimeStartTime=' + overtimeStartTime,
                timestamp: new Date().toISOString()
            });
            return;
        }
        // 基本验证（POST请求）
        if (!requestData && req.method === 'POST') {
            res.status(400).json({ error: '请求体不能为空' });
            return;
        }
        let result;
        // 判断数据格式并调用相应的服务方法
        if (Array.isArray(requestData) && requestData.length > 0 && 'CARDTIME' in requestData[0]) {
            // 打卡记录格式
            const hourlyRate = Number(req.query.hourlyRate) || 20; // 默认20元
            const overtimeStartTime = req.query.overtimeStartTime || '19:00'; // 默认19:00
            const region = req.query.region; // 工作地区
            result = await (0, overtimeService_1.processPunchRecords)(requestData, hourlyRate, undefined, overtimeStartTime);
        }
        else {
            // 标准加班数据格式 - 包含配置参数
            const config = {
                ...requestData,
                hourlyRate: Number(req.query.hourlyRate) || requestData.hourlyRate || 20,
                overtimeStartTime: req.query.overtimeStartTime || requestData.overtimeStartTime || '19:00',
                region: req.query.region || requestData.region
            };
            result = await (0, overtimeService_1.processOvertimeJson)(config);
        }
        // 直接返回结构化的JSON数据
        res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('处理计算加班请求时出错:', error);
        res.status(500).json({
            success: false,
            error: error.message || '处理加班数据出错',
            timestamp: new Date().toISOString()
        });
    }
};
exports.handleCalculateOvertime = handleCalculateOvertime;

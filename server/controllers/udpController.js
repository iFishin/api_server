"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = start;
exports.stop = stop;
exports.getStatus = getStatus;
exports.setEchoEnabled = setEchoEnabled;
exports.setEchoContent = setEchoContent;
exports.getEcho = getEcho;
exports.send = send;
const udpService_1 = require("../services/udpService");
// 启动 UDP 服务
async function start(req, res) {
    try {
        await udpService_1.udpService.start();
        res.json({
            success: true,
            message: 'UDP server started',
            listening: true,
            port: 9000
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to start UDP server',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 停止 UDP 服务
async function stop(req, res) {
    try {
        await udpService_1.udpService.stop();
        res.json({
            success: true,
            message: 'UDP server stopped',
            listening: false,
            port: 9000
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to stop UDP server',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 获取 UDP 服务状态
function getStatus(req, res) {
    try {
        res.json({
            listening: udpService_1.udpService.isSerListening(),
            port: 9000
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get UDP status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 设置回显功能开关
function setEchoEnabled(req, res) {
    try {
        const { enabled } = req.body;
        if (typeof enabled !== 'boolean') {
            res.status(400).json({ error: 'enabled must be a boolean' });
            return;
        }
        udpService_1.udpService.setEchoEnabled(enabled);
        res.json({ success: true, enabled });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to set UDP echo enabled',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 设置回显内容
function setEchoContent(req, res) {
    try {
        const { content } = req.body;
        udpService_1.udpService.setEchoContent(content);
        res.json({ success: true, content });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to set UDP echo content',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 获取回显配置
function getEcho(req, res) {
    try {
        const config = udpService_1.udpService.getEchoConfig();
        res.json({
            enabled: config.enabled,
            content: config.content
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get UDP echo config',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 发送 UDP 消息
function send(req, res) {
    try {
        const { message, host = '127.0.0.1', port = 9000 } = req.body;
        if (!message) {
            res.status(400).json({ error: 'message is required' });
            return;
        }
        udpService_1.udpService.send(message, port, host);
        res.json({ success: true, message, host, port });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to send UDP message',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

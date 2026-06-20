"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = start;
exports.stop = stop;
exports.getStatus = getStatus;
exports.getClients = getClients;
exports.getSubscriptions = getSubscriptions;
exports.kickClient = kickClient;
exports.publish = publish;
exports.setEchoEnabled = setEchoEnabled;
exports.setEchoContent = setEchoContent;
exports.getEcho = getEcho;
exports.setEcho = setEcho;
exports.getStats = getStats;
const mqttService_1 = require("../services/mqttService");
// 启动 MQTT 服务
async function start(req, res) {
    try {
        await mqttService_1.mqttService.start();
        res.json({
            success: true,
            message: 'MQTT broker started',
            running: true
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to start MQTT broker',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 停止 MQTT 服务
async function stop(req, res) {
    try {
        await mqttService_1.mqttService.stop();
        res.json({
            success: true,
            message: 'MQTT broker stopped',
            running: false
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to stop MQTT broker',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 获取 MQTT 服务状态
function getStatus(req, res) {
    try {
        const detailedStatus = mqttService_1.mqttService.getDetailedStatus();
        const stats = mqttService_1.mqttService.getStats();
        res.json({
            success: true,
            running: mqttService_1.mqttService.isSerListening(),
            ...detailedStatus,
            stats
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get MQTT status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 获取已连接的客户端列表
function getClients(req, res) {
    try {
        const clients = mqttService_1.mqttService.getClients().map(client => ({
            id: client.id,
            connected: client.connected,
            connectedAt: client.connectedAt.toISOString(),
            connectedDuration: Math.floor((Date.now() - client.connectedAt.getTime()) / 1000),
            subscriptions: client.subscriptions,
            subscriptionCount: client.subscriptions.length,
            protocol: client.protocol.toUpperCase()
        }));
        res.json({
            success: true,
            clients,
            total: clients.length
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get MQTT clients',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 获取订阅信息
function getSubscriptions(req, res) {
    try {
        const subscriptions = mqttService_1.mqttService.getSubscriptions();
        res.json({ subscriptions });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get subscriptions',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 踢出客户端
function kickClient(req, res) {
    try {
        const { clientId } = req.body;
        if (!clientId) {
            res.status(400).json({ error: 'clientId is required' });
            return;
        }
        const success = mqttService_1.mqttService.kickClient(clientId);
        if (success) {
            res.json({ success: true, clientId, message: 'Client disconnected' });
        }
        else {
            res.status(404).json({ error: 'Client not found', clientId });
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to kick MQTT client',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 发布消息
function publish(req, res) {
    try {
        const { topic, payload, qos = 0, retain = false } = req.body;
        if (!topic || payload === undefined) {
            res.status(400).json({ error: 'topic and payload are required' });
            return;
        }
        mqttService_1.mqttService.publish(topic, payload, { qos, retain });
        res.json({ success: true, topic, payload, qos, retain });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to publish MQTT message',
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
        mqttService_1.mqttService.setEchoEnabled(enabled);
        res.json({ success: true, enabled });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to set MQTT echo enabled',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 设置回显内容
function setEchoContent(req, res) {
    try {
        const { content } = req.body;
        mqttService_1.mqttService.setEchoContent(content);
        res.json({ success: true, content });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to set MQTT echo content',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 获取回显配置
function getEcho(req, res) {
    try {
        const config = mqttService_1.mqttService.getEchoConfig();
        res.json({
            enabled: config.enabled,
            content: config.content
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get MQTT echo config',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 设置回显配置
function setEcho(req, res) {
    try {
        const { enabled, content } = req.body;
        if (typeof enabled === 'boolean') {
            mqttService_1.mqttService.setEchoEnabled(enabled);
        }
        if (content !== undefined) {
            mqttService_1.mqttService.setEchoContent(content);
        }
        const config = mqttService_1.mqttService.getEchoConfig();
        res.json({
            success: true,
            message: 'Echo configuration updated',
            enabled: config.enabled,
            content: config.content
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to set MQTT echo config',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// 获取服务器统计信息
function getStats(req, res) {
    try {
        const stats = mqttService_1.mqttService.getStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get MQTT stats',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

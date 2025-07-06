import { Request, Response } from 'express'
import { mqttService } from '../services/mqttService'

// 启动 MQTT 服务
export async function start(req: Request, res: Response): Promise<void> {
    try {
        await mqttService.start()
        res.json({ 
            success: true,
            message: 'MQTT broker started',
            running: true
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to start MQTT broker',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 停止 MQTT 服务
export async function stop(req: Request, res: Response): Promise<void> {
    try {
        await mqttService.stop()
        res.json({ 
            success: true,
            message: 'MQTT broker stopped',
            running: false
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to stop MQTT broker',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取 MQTT 服务状态
export function getStatus(req: Request, res: Response): void {
    try {
        const detailedStatus = mqttService.getDetailedStatus()
        const stats = mqttService.getStats()
        res.json({ 
            success: true,
            running: mqttService.isSerListening(),
            ...detailedStatus,
            stats
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get MQTT status',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取已连接的客户端列表
export function getClients(req: Request, res: Response): void {
    try {
        const clients = mqttService.getClients().map(client => ({
            id: client.id,
            connected: client.connected,
            connectedAt: client.connectedAt.toISOString(),
            connectedDuration: Math.floor((Date.now() - client.connectedAt.getTime()) / 1000),
            subscriptions: client.subscriptions,
            subscriptionCount: client.subscriptions.length,
            protocol: client.protocol.toUpperCase()
        }))
        res.json({ 
            success: true,
            clients,
            total: clients.length
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get MQTT clients',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取订阅信息
export function getSubscriptions(req: Request, res: Response): void {
    try {
        const subscriptions = mqttService.getSubscriptions()
        res.json({ subscriptions })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get subscriptions',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 踢出客户端
export function kickClient(req: Request, res: Response): void {
    try {
        const { clientId } = req.body
        if (!clientId) {
            res.status(400).json({ error: 'clientId is required' })
            return
        }
        
        const success = mqttService.kickClient(clientId)
        if (success) {
            res.json({ success: true, clientId, message: 'Client disconnected' })
        } else {
            res.status(404).json({ error: 'Client not found', clientId })
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to kick MQTT client',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 发布消息
export function publish(req: Request, res: Response): void {
    try {
        const { topic, payload, qos = 0, retain = false } = req.body
        if (!topic || payload === undefined) {
            res.status(400).json({ error: 'topic and payload are required' })
            return
        }
        
        mqttService.publish(topic, payload, { qos, retain })
        res.json({ success: true, topic, payload, qos, retain })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to publish MQTT message',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 设置回显功能开关
export function setEchoEnabled(req: Request, res: Response): void {
    try {
        const { enabled } = req.body
        if (typeof enabled !== 'boolean') {
            res.status(400).json({ error: 'enabled must be a boolean' })
            return
        }
        mqttService.setEchoEnabled(enabled)
        res.json({ success: true, enabled })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set MQTT echo enabled',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 设置回显内容
export function setEchoContent(req: Request, res: Response): void {
    try {
        const { content } = req.body
        mqttService.setEchoContent(content)
        res.json({ success: true, content })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set MQTT echo content',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取回显配置
export function getEcho(req: Request, res: Response): void {
    try {
        const config = mqttService.getEchoConfig()
        res.json({
            enabled: config.enabled,
            content: config.content
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get MQTT echo config',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 设置回显配置
export function setEcho(req: Request, res: Response): void {
    try {
        const { enabled, content } = req.body
        
        if (typeof enabled === 'boolean') {
            mqttService.setEchoEnabled(enabled)
        }
        
        if (content !== undefined) {
            mqttService.setEchoContent(content)
        }
        
        const config = mqttService.getEchoConfig()
        res.json({
            success: true,
            message: 'Echo configuration updated',
            enabled: config.enabled,
            content: config.content
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set MQTT echo config',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取服务器统计信息
export function getStats(req: Request, res: Response): void {
    try {
        const stats = mqttService.getStats()
        res.json(stats)
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get MQTT stats',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

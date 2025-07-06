import { Request, Response } from 'express'
import { udpService } from '../services/udpService'

// 启动 UDP 服务
export async function start(req: Request, res: Response): Promise<void> {
    try {
        await udpService.start()
        res.json({ 
            success: true,
            message: 'UDP server started',
            listening: true,
            port: 9000
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to start UDP server',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 停止 UDP 服务
export async function stop(req: Request, res: Response): Promise<void> {
    try {
        await udpService.stop()
        res.json({ 
            success: true,
            message: 'UDP server stopped',
            listening: false,
            port: 9000
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to stop UDP server',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取 UDP 服务状态
export function getStatus(req: Request, res: Response): void {
    try {
        res.json({ 
            listening: udpService.isSerListening(),
            port: 9000
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get UDP status',
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
        udpService.setEchoEnabled(enabled)
        res.json({ success: true, enabled })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set UDP echo enabled',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 设置回显内容
export function setEchoContent(req: Request, res: Response): void {
    try {
        const { content } = req.body
        udpService.setEchoContent(content)
        res.json({ success: true, content })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set UDP echo content',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取回显配置
export function getEcho(req: Request, res: Response): void {
    try {
        const config = udpService.getEchoConfig()
        res.json({
            enabled: config.enabled,
            content: config.content
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get UDP echo config',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 发送 UDP 消息
export function send(req: Request, res: Response): void {
    try {
        const { message, host = '127.0.0.1', port = 9000 } = req.body
        if (!message) {
            res.status(400).json({ error: 'message is required' })
            return
        }
        
        udpService.send(message, port, host)
        res.json({ success: true, message, host, port })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to send UDP message',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

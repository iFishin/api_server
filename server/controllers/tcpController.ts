import { Request, Response } from 'express'
import { tcpService } from '../services/tcpService'

// 启动 TCP 服务
export async function start(req: Request, res: Response): Promise<void> {
    try {
        await tcpService.start()
        res.json({ 
            success: true,
            message: 'TCP server started',
            listening: true,
            port: 9001
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to start TCP server',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 停止 TCP 服务
export async function stop(req: Request, res: Response): Promise<void> {
    try {
        await tcpService.stop()
        res.json({ 
            success: true,
            message: 'TCP server stopped',
            listening: false,
            port: 9001
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to stop TCP server',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取 TCP 服务状态
export function getStatus(req: Request, res: Response): void {
    try {
        res.json({ 
            listening: tcpService.isSerListening(),
            port: 9001
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get TCP status',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取已连接的客户端列表
export function getClients(req: Request, res: Response): void {
    try {
        const clients = tcpService.getClients().map(client => ({
            id: client.id,
            address: client.address,
            port: client.port,
            connected: true,
            connectedAt: client.connectedAt.toISOString(),
            connectedDuration: Math.floor((Date.now() - client.connectedAt.getTime()) / 1000)
        }))
        res.json({ clients })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get TCP clients',
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
        tcpService.setEchoEnabled(enabled)
        res.json({ success: true, enabled })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set TCP echo enabled',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 设置回显内容
export function setEchoContent(req: Request, res: Response): void {
    try {
        const { content } = req.body
        tcpService.setEchoContent(content)
        res.json({ success: true, content })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set TCP echo content',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 获取回显配置
export function getEcho(req: Request, res: Response): void {
    try {
        const config = tcpService.getEchoConfig()
        res.json({
            enabled: config.enabled,
            content: config.content
        })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get TCP echo config',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 向指定客户端发送消息
export function sendToClient(req: Request, res: Response): void {
    try {
        const { clientId, message } = req.body
        if (!clientId || !message) {
            res.status(400).json({ error: 'clientId and message are required' })
            return
        }
        
        const success = tcpService.sendToClient(clientId, message)
        if (success) {
            res.json({ success: true, clientId, message })
        } else {
            res.status(404).json({ error: 'Client not found', clientId })
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to send message to TCP client',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 作为客户端发送消息
export function send(req: Request, res: Response): void {
    try {
        const { message, host = '127.0.0.1', port = 9001 } = req.body
        if (!message) {
            res.status(400).json({ error: 'message is required' })
            return
        }
        
        tcpService.send(message, port, host)
        res.json({ success: true, message, host, port })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to send TCP message',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 断开指定客户端连接
export function disconnectClient(req: Request, res: Response): void {
    try {
        const { clientId } = req.body
        if (!clientId) {
            res.status(400).json({ error: 'clientId is required' })
            return
        }
        
        const success = tcpService.disconnectClient(clientId)
        if (success) {
            res.json({ success: true, clientId, message: 'Client disconnected' })
        } else {
            res.status(404).json({ error: 'Client not found', clientId })
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to disconnect TCP client',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// 关闭所有客户端连接
export function closeAllClients(req: Request, res: Response): void {
    try {
        tcpService.closeAllClients()
        res.json({ success: true, message: 'All clients disconnected' })
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to close TCP clients',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
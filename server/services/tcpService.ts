import net from 'net'

export interface TcpClientInfo {
  id: string
  address: string
  port: number
  socket: net.Socket
  connectedAt: Date
}

export class TcpService {
  private server: net.Server | null = null
  private clients: Map<string, TcpClientInfo> = new Map()
  private echoEnabled: boolean = true
  private echoContent: string | null = null
  private isListening: boolean = false
  private port: number

  constructor(port: number = 9001) {
    this.port = port
    this.createServer()
  }

  private createServer() {
    if (this.server) {
      return
    }
    
    this.server = net.createServer(socket => {
      const clientId = `${socket.remoteAddress}:${socket.remotePort}`
      this.clients.set(clientId, {
        id: clientId,
        address: socket.remoteAddress || '',
        port: socket.remotePort || 0,
        socket,
        connectedAt: new Date()
      })
      console.log(`TCP client connected: ${clientId}`)

      socket.on('data', data => {
        console.log(`TCP received from ${clientId}: ${data.toString()}`)
        // 主动回显功能
        if (this.echoEnabled) {
          const reply = this.echoContent !== null ? this.echoContent : data
          socket.write(reply)
          console.log(`Echoed to ${clientId}: ${reply.toString()}`)
        }
      })

      socket.on('close', () => {
        console.log(`TCP client disconnected: ${clientId}`)
        this.clients.delete(clientId)
      })

      socket.on('error', err => {
        console.error(`TCP client error (${clientId}):`, err)
        this.clients.delete(clientId)
      })
    })
  }

  // 启动TCP服务
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        resolve()
        return
      }
      
      this.createServer()
      if (!this.server) {
        reject(new Error('Failed to create server'))
        return
      }
      
      this.server.listen(this.port, () => {
        this.isListening = true
        console.log(`TCP server listening on port ${this.port}`)
        resolve()
      })
      
      this.server.on('error', (err) => {
        console.error('TCP server error:', err)
        this.isListening = false
        reject(err)
      })
    })
  }

  // 停止TCP服务
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isListening || !this.server) {
        resolve()
        return
      }
      
      // 关闭所有客户端连接
      this.closeAllClients()
      
      // 关闭服务器
      this.server.close(() => {
        this.isListening = false
        this.server = null
        console.log('TCP server stopped')
        resolve()
      })
    })
  }

  // 查询是否正在监听
  isSerListening(): boolean {
    return this.isListening
  }

  // 设置回显开关
  setEchoEnabled(enabled: boolean) {
    this.echoEnabled = enabled
    console.log(`TCP echo enabled: ${enabled}`)
  }

  // 设置自定义回显内容（null 表示回显原始数据）
  setEchoContent(content: string | null) {
    this.echoContent = content
    if (content === null) {
      console.log('TCP echo content set to: 原始数据')
    } else {
      console.log(`TCP echo content set to: ${content}`)
    }
  }

  // 获取回显配置
  getEchoConfig() {
    return {
      enabled: this.echoEnabled,
      content: this.echoContent
    }
  }

  // 主动向指定客户端发送消息
  sendToClient(clientId: string, message: string): boolean {
    const client = this.clients.get(clientId)
    if (client) {
      client.socket.write(message)
      console.log(`Sent to ${clientId}: ${message}`)
      return true
    } else {
      console.warn(`Client ${clientId} not found`)
      return false
    }
  }

  // 主动作为客户端连接其他TCP服务并发送消息
  send(message: string, port: number, host: string) {
    const client = new net.Socket()
    client.connect(port, host, () => {
      client.write(message)
    })
    client.on('data', data => {
      console.log(`TCP response: ${data.toString()}`)
      client.destroy()
    })
    client.on('error', err => {
      console.error('TCP client error:', err)
    })
  }

  // 获取当前所有已连接客户端
  getClients(): TcpClientInfo[] {
    return Array.from(this.clients.values())
  }

  // 断开指定客户端连接
  disconnectClient(clientId: string): boolean {
    const client = this.clients.get(clientId)
    if (client) {
      client.socket.destroy()
      this.clients.delete(clientId)
      console.log(`TCP client ${clientId} disconnected by server`)
      return true
    } else {
      console.warn(`TCP client ${clientId} not found for disconnection`)
      return false
    }
  }

  // 关闭所有客户端连接
  closeAllClients() {
    for (const client of Array.from(this.clients.values())) {
      client.socket.destroy()
    }
    this.clients.clear()
    console.log('All TCP clients disconnected.')
  }
}

export const tcpService = new TcpService(9001)

// 启动服务
tcpService.start().catch(console.error)
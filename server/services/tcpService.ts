import net from 'net'

export interface TcpClientInfo {
  id: string
  address: string
  port: number
  socket: net.Socket
}

export class TcpService {
  private server: net.Server
  private clients: Map<string, TcpClientInfo> = new Map()
  private echoEnabled: boolean = true
  private echoContent: string | null = null
  private isListening: boolean = false

  constructor(port: number = 9001) {
    this.server = net.createServer(socket => {
      const clientId = `${socket.remoteAddress}:${socket.remotePort}`
      this.clients.set(clientId, {
        id: clientId,
        address: socket.remoteAddress || '',
        port: socket.remotePort || 0,
        socket,
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
    this.server.listen(port, () => {
      this.isListening = true
      console.log(`TCP server listening on port ${port}`)
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

  // 主动向指定客户端发送消息
  sendToClient(clientId: string, message: string) {
    const client = this.clients.get(clientId)
    if (client) {
      client.socket.write(message)
      console.log(`Sent to ${clientId}: ${message}`)
    } else {
      console.warn(`Client ${clientId} not found`)
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
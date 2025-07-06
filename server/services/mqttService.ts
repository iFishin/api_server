import net from 'net'
import tls from 'tls'
import fs from 'fs'
import path from 'path'
const aedes: any = require('aedes')

export interface MqttClientInfo {
  id: string
  connected: boolean
  connectedAt: Date
  subscriptions: string[]
  protocol: 'mqtt' | 'mqtts'
}

export interface MqttStats {
  connectedClients: number
  totalSubscriptions: number
  isListening: boolean
  mqttPort: number
  mqttsPort: number
  mqttEnabled: boolean
  mqttsEnabled: boolean
  tlsCertsAvailable: boolean
}

export class MqttService {
  private broker: any
  private mqttServer: net.Server | null = null
  private mqttsServer: tls.Server | null = null
  private echoEnabled: boolean = true
  private echoContent: string | null = null
  private isListening: boolean = false
  private mqttPort: number
  private mqttsPort: number
  private connectedClients: Map<string, MqttClientInfo> = new Map()
  private tlsOptions: any = null

  constructor(mqttPort: number = 1883, mqttsPort: number = 8883) {
    this.mqttPort = mqttPort
    this.mqttsPort = mqttsPort
    this.broker = aedes()
    this.loadTlsCertificates()
    this.setupEventListeners()
    // 不在构造函数中自动启动，改为手动调用start()
  }

  private loadTlsCertificates() {
    try {
      const certPath = path.join(__dirname, '..', 'certs')
      const keyFile = path.join(certPath, 'server.key')
      const certFile = path.join(certPath, 'server.crt')
      const caFile = path.join(certPath, 'ca.crt')

      if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
        this.tlsOptions = {
          key: fs.readFileSync(keyFile),
          cert: fs.readFileSync(certFile),
          requestCert: false, // 不要求客户端证书
          rejectUnauthorized: false // 允许自签名证书
        }
        
        // 如果有CA证书，则加载
        if (fs.existsSync(caFile)) {
          this.tlsOptions.ca = fs.readFileSync(caFile)
        }
        
        console.log('TLS certificates loaded successfully')
      } else {
        console.log('TLS certificates not found, MQTTS will not be available')
      }
    } catch (error) {
      console.error('Failed to load TLS certificates:', error)
      this.tlsOptions = null
    }
  }

  private setupEventListeners() {
    // 事件监听
    this.broker.on('client', (client: any) => {
      console.log('MQTT client connected:', client?.id)
      if (client?.id) {
        // 检测连接协议类型（通过连接流的加密状态判断）
        const protocol = client.conn?.encrypted ? 'mqtts' : 'mqtt'
        this.connectedClients.set(client.id, {
          id: client.id,
          connected: true,
          connectedAt: new Date(),
          subscriptions: [],
          protocol: protocol
        })
        console.log(`Client ${client.id} connected via ${protocol.toUpperCase()}`)
      }
    })

    this.broker.on('clientDisconnect', (client: any) => {
      console.log('MQTT client disconnected:', client?.id)
      if (client?.id) {
        this.connectedClients.delete(client.id)
      }
    })

    this.broker.on('subscribe', (subscriptions: any[], client: any) => {
      console.log(`MQTT client ${client?.id} subscribed:`, subscriptions.map(s => s.topic).join(', '))
      if (client?.id && this.connectedClients.has(client.id)) {
        const clientInfo = this.connectedClients.get(client.id)!
        const topics = subscriptions.map(s => s.topic)
        clientInfo.subscriptions = [...new Set([...clientInfo.subscriptions, ...topics])]
      }
    })

    this.broker.on('unsubscribe', (subscriptions: string[], client: any) => {
      console.log(`MQTT client ${client?.id} unsubscribed:`, subscriptions.join(', '))
      if (client?.id && this.connectedClients.has(client.id)) {
        const clientInfo = this.connectedClients.get(client.id)!
        clientInfo.subscriptions = clientInfo.subscriptions.filter(topic => !subscriptions.includes(topic))
      }
    })

    this.broker.on('publish', (packet: any, client: any) => {
      if (this.echoEnabled && client) {
        const reply = this.echoContent !== null ? this.echoContent : packet.payload
        // 只对非 $SYS 主题进行回显，防止死循环
        if (!packet.topic.startsWith('$SYS')) {
          this.publish(packet.topic + '/echo', reply)
          console.log(`Echoed to ${packet.topic}/echo: ${reply.toString()}`)
        }
      }
      if (client) {
        console.log(`MQTT publish from ${client.id}:`, packet.topic, packet.payload.toString())
      }
    })
  }

  private async startServers(): Promise<void> {
    return new Promise((resolve, reject) => {
      let startedCount = 0
      let expectedCount = 1 // 至少启动MQTT
      if (this.tlsOptions) expectedCount = 2 // 如果有证书，还要启动MQTTS

      const onServerStarted = () => {
        startedCount++
        if (startedCount === expectedCount) {
          this.isListening = true
          resolve()
        }
      }

      const onServerError = (error: any) => {
        console.error('Failed to start MQTT server:', error)
        reject(error)
      }

      try {
        // 启动普通MQTT服务器
        this.mqttServer = net.createServer(this.broker.handle)
        this.mqttServer.on('error', onServerError)
        this.mqttServer.listen(this.mqttPort, () => {
          console.log(`MQTT broker listening on port ${this.mqttPort}`)
          onServerStarted()
        })

        // 启动MQTTS服务器（如果有证书）
        if (this.tlsOptions) {
          this.mqttsServer = tls.createServer(this.tlsOptions, this.broker.handle)
          this.mqttsServer.on('error', onServerError)
          this.mqttsServer.listen(this.mqttsPort, () => {
            console.log(`MQTTS broker listening on port ${this.mqttsPort}`)
            onServerStarted()
          })
        } else {
          console.log('TLS certificates not available, MQTTS server not started')
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // 启动MQTT服务
  async start(): Promise<void> {
    if (this.isListening) {
      console.log('MQTT broker is already running')
      return Promise.resolve()
    }

    try {
      await this.startServers()
      console.log('MQTT broker started successfully')
    } catch (error) {
      console.error('Failed to start MQTT broker:', error)
      throw error
    }
  }

  // 停止MQTT服务
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      let closedCount = 0
      const totalServers = (this.mqttServer ? 1 : 0) + (this.mqttsServer ? 1 : 0)

      if (totalServers === 0) {
        this.isListening = false
        resolve()
        return
      }

      const onServerClosed = () => {
        closedCount++
        if (closedCount === totalServers) {
          this.isListening = false
          this.connectedClients.clear()
          console.log('MQTT broker stopped')
          resolve()
        }
      }

      if (this.mqttServer) {
        this.mqttServer.close(() => {
          this.mqttServer = null
          onServerClosed()
        })
      }

      if (this.mqttsServer) {
        this.mqttsServer.close(() => {
          this.mqttsServer = null
          onServerClosed()
        })
      }
    })
  }

  // 设置回显开关
  setEchoEnabled(enabled: boolean) {
    this.echoEnabled = enabled
    console.log(`MQTT echo enabled: ${enabled}`)
  }

  // 设置自定义回显内容（null 表示回显原始数据）
  setEchoContent(content: string | null) {
    this.echoContent = content
    if (content === null) {
      console.log('MQTT echo content set to: 原始数据')
    } else {
      console.log(`MQTT echo content set to: ${content}`)
    }
  }

  // 获取回显配置
  getEchoConfig() {
    return {
      enabled: this.echoEnabled,
      content: this.echoContent
    }
  }

  // 查询服务是否在监听
  isSerListening(): boolean {
    return this.isListening
  }

  // 主动向指定 topic 发布消息
  publish(topic: string, payload: string | Buffer, opts: any = {}) {
    this.broker.publish(
      {
        topic,
        payload,
        qos: opts.qos || 0,
        retain: opts.retain || false,
      },
      (err: any) => {
        if (err) {
          console.error('MQTT publish error:', err)
        } else {
          console.log(`Published to ${topic}: ${payload}`)
        }
      }
    )
  }

  // 查询当前连接的客户端
  getClients(): MqttClientInfo[] {
    return Array.from(this.connectedClients.values())
  }

  // 查询所有订阅情况
  getSubscriptions(): Record<string, string[]> {
    const result: Record<string, string[]> = {}
    this.connectedClients.forEach((client, clientId) => {
      result[clientId] = client.subscriptions
    })
    return result
  }

  // 踢出指定客户端
  kickClient(clientId: string): boolean {
    if (this.broker.clients[clientId]) {
      this.broker.clients[clientId].close()
      this.connectedClients.delete(clientId)
      console.log(`MQTT client ${clientId} kicked`)
      return true
    }
    return false
  }

  // 获取详细的服务状态
  getDetailedStatus() {
    return {
      isListening: this.isListening,
      mqtt: {
        enabled: this.mqttServer !== null,
        port: this.mqttPort,
        listening: this.mqttServer?.listening || false
      },
      mqtts: {
        enabled: this.mqttsServer !== null,
        port: this.mqttsPort,
        listening: this.mqttsServer?.listening || false,
        tlsAvailable: this.tlsOptions !== null
      },
      clients: {
        total: this.connectedClients.size,
        mqtt: Array.from(this.connectedClients.values()).filter(c => c.protocol === 'mqtt').length,
        mqtts: Array.from(this.connectedClients.values()).filter(c => c.protocol === 'mqtts').length
      },
      echo: {
        enabled: this.echoEnabled,
        content: this.echoContent
      }
    }
  }

  // 获取服务器统计信息
  getStats(): MqttStats {
    return {
      connectedClients: this.connectedClients.size,
      totalSubscriptions: Array.from(this.connectedClients.values()).reduce((total, client) => total + client.subscriptions.length, 0),
      isListening: this.isListening,
      mqttPort: this.mqttPort,
      mqttsPort: this.mqttsPort,
      mqttEnabled: this.mqttServer !== null,
      mqttsEnabled: this.mqttsServer !== null,
      tlsCertsAvailable: this.tlsOptions !== null
    }
  }
}

// 创建服务实例但不立即启动
export const mqttService = new MqttService(1883, 8883)
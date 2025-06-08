import net from 'net'
import tls from 'tls'
import fs from 'fs'
const aedes: any = require('aedes')

export class MqttService {
  private broker: any
  private mqttServer: net.Server
  private mqttsServer: tls.Server
  private echoEnabled: boolean = true
  private echoContent: string | null = null
  private isListening: boolean = false

  constructor(mqttPort: number = 1883, mqttsPort: number = 8883) {
    this.broker = aedes()

    // 普通MQTT
    this.mqttServer = net.createServer(this.broker.handle)
    this.mqttServer.listen(mqttPort, () => {
      this.isListening = true
      console.log(`MQTT broker listening on port ${mqttPort}`)
    })

    // MQTTS（TLS）
    const options = {
      key: fs.readFileSync('server/certs/client.key'),
      cert: fs.readFileSync('server/certs/client.crt'),
      ca: fs.readFileSync('server/certs/ca.crt'),
    }
    this.mqttsServer = tls.createServer(options, this.broker.handle)
    this.mqttsServer.listen(mqttsPort, () => {
      this.isListening = true
      console.log(`MQTTS broker listening on port ${mqttsPort}`)
    })

    // 事件监听
    this.broker.on('client', (client: any) => {
      console.log('MQTT client connected:', client?.id)
    })
    this.broker.on('clientDisconnect', (client: any) => {
      console.log('MQTT client disconnected:', client?.id)
    })
    this.broker.on('subscribe', (subscriptions: any[], client: any) => {
      console.log(`MQTT client ${client?.id} subscribed:`, subscriptions.map(s => s.topic).join(', '))
    })
    this.broker.on('unsubscribe', (subscriptions: string[], client: any) => {
      console.log(`MQTT client ${client?.id} unsubscribed:`, subscriptions.join(', '))
    })
    this.broker.on('publish', (packet: any, client: any) => {
      if (this.echoEnabled && client) {
        const reply = this.echoContent !== null ? this.echoContent : packet.payload
        // 只对非 $SYS 主题进行回显，防止死循环
        if (!packet.topic.startsWith('$SYS')) {
          this.publish(packet.topic, reply)
          console.log(`Echoed to ${packet.topic}: ${reply.toString()}`)
        }
      }
      if (client) {
        console.log(`MQTT publish from ${client.id}:`, packet.topic, packet.payload.toString())
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
  getClients(): string[] {
    return Object.values(this.broker.clients).map((c: any) => c.id)
  }

  // 查询所有订阅情况
  getSubscriptions(): Record<string, string[]> {
    const result: Record<string, string[]> = {}
    for (const clientId in this.broker.clients) {
      const subs = this.broker.clients[clientId].subscriptions
      result[clientId] = Object.keys(subs)
    }
    return result
  }
}

export const mqttService = new MqttService(1883, 8883)
import dgram from 'dgram'

export class UdpService {
  private server: dgram.Socket
  private echoEnabled: boolean = true
  private echoContent: string | null = null
  private isListening: boolean = false

  constructor(port: number = 9000) {
    this.server = dgram.createSocket('udp4')
    this.server.on('message', (msg: Buffer, rinfo) => {
      console.log(`UDP received: ${msg} from ${rinfo.address}:${rinfo.port}`)
      // 回显功能
      if (this.echoEnabled) {
        const reply = this.echoContent !== null ? Buffer.from(this.echoContent) : msg
        this.server.send(reply, rinfo.port, rinfo.address, err => {
          if (err) {
            console.error('UDP echo send error:', err)
          } else {
            console.log(`Echoed to ${rinfo.address}:${rinfo.port}: ${reply.toString()}`)
          }
        })
      }
    })
    this.server.bind(port, () => {
        this.isListening = true
      console.log(`UDP server listening on port ${port}`)
    })
  }

  // 查询是否正在监听
    isSerListening(): boolean {
        return this.isListening
    }

  // 设置回显开关
  setEchoEnabled(enabled: boolean) {
    this.echoEnabled = enabled
    console.log(`UDP echo enabled: ${enabled}`)
  }

  // 设置自定义回显内容（null 表示回显原始数据）
  setEchoContent(content: string | null) {
    this.echoContent = content
    if (content === null) {
      console.log('UDP echo content set to: 原始数据')
    } else {
      console.log(`UDP echo content set to: ${content}`)
    }
  }

  // 主动发送UDP消息
  send(message: string, port: number, host: string) {
    this.server.send(message, port, host, err => {
      if (err) {
        console.error('UDP send error:', err)
      } else {
        console.log(`Sent to ${host}:${port}: ${message}`)
      }
    })
  }
}

export const udpService = new UdpService(9000)
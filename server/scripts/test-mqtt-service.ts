import { mqttService } from '../services/mqttService'
import mqtt from 'mqtt'

async function main() {
  // 启动 broker
  await mqttService.start()

  // 设置回显为原始数据
  mqttService.setEchoEnabled(true)
  mqttService.setEchoContent(null)

  const client = mqtt.connect('mqtt://localhost:1883', { connectTimeout: 5000 })

  client.on('connect', () => {
    console.log('Test MQTT client connected')
    client.subscribe('test/topic', (err) => {
      if (err) {
        console.error('Subscribe error:', err)
        process.exit(1)
      }
      console.log('Subscribed to test/topic')

      // 发布消息
      client.publish('test/topic', 'hello-mqtt', {}, (err) => {
        if (err) {
          console.error('Publish error:', err)
          process.exit(1)
        }
        console.log('Published hello-mqtt to test/topic')
      })
    })
  })

  client.on('message', (topic, message) => {
    console.log(`Client received message on ${topic}: ${message.toString()}`)
    // 关闭连接并停止 broker
    client.end(true, () => {
      mqttService.stop().then(() => {
        console.log('Test finished, broker stopped')
        process.exit(0)
      })
    })
  })

  client.on('error', (err) => {
    console.error('Client error:', err)
    process.exit(1)
  })
}

main().catch(err => {
  console.error('Test script failed:', err)
  process.exit(1)
})

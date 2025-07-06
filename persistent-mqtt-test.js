#!/usr/bin/env node

const mqtt = require('mqtt')

console.log('🚀 Starting persistent MQTT test clients...\n')

// 启动MQTT客户端
const mqttClient = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'persistent_mqtt_client',
  clean: true
})

mqttClient.on('connect', () => {
  console.log('✅ MQTT client connected')
  mqttClient.subscribe(['sensors/+', 'system/+'], (err) => {
    if (!err) {
      console.log('✅ MQTT client subscribed to sensors/+ and system/+')
    }
  })
})

mqttClient.on('message', (topic, message) => {
  console.log(`📨 MQTT received: ${topic} -> ${message.toString()}`)
})

// 启动MQTTS客户端
const fs = require('fs')
const path = require('path')

try {
  const certPath = path.join(__dirname, 'server', 'certs')
  const caFile = path.join(certPath, 'ca.crt')
  
  if (fs.existsSync(caFile)) {
    const mqttsClient = mqtt.connect('mqtts://localhost:8883', {
      clientId: 'persistent_mqtts_client',
      clean: true,
      ca: fs.readFileSync(caFile),
      rejectUnauthorized: false
    })

    mqttsClient.on('connect', () => {
      console.log('✅ MQTTS client connected')
      mqttsClient.subscribe(['secure/+', 'alerts/+'], (err) => {
        if (!err) {
          console.log('✅ MQTTS client subscribed to secure/+ and alerts/+')
        }
      })
    })

    mqttsClient.on('message', (topic, message) => {
      console.log(`📨 MQTTS received: ${topic} -> ${message.toString()}`)
    })
  }
} catch (error) {
  console.error('❌ MQTTS client setup failed:', error.message)
}

console.log('\n🔄 Clients will stay connected. Press Ctrl+C to exit.')

// 定期发送测试消息
setInterval(() => {
  const timestamp = new Date().toISOString()
  mqttClient.publish('sensors/temperature', `{"value": ${Math.random() * 30 + 10}, "timestamp": "${timestamp}"}`)
}, 5000)

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n🔌 Disconnecting clients...')
  mqttClient.end()
  process.exit(0)
})

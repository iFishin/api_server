#!/usr/bin/env node

const mqtt = require('mqtt')

// 测试MQTT连接
async function testMqtt() {
  console.log('Testing MQTT connection...')
  
  const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: 'test_client_' + Math.random().toString(36).substr(2, 9),
    clean: true
  })

  client.on('connect', () => {
    console.log('✅ Connected to MQTT broker')
    
    // 订阅测试主题
    client.subscribe('test/echo', (err) => {
      if (!err) {
        console.log('✅ Subscribed to test/echo')
        
        // 发布测试消息
        setTimeout(() => {
          console.log('📤 Publishing test message...')
          client.publish('test/echo', 'Hello MQTT!')
        }, 500)
      }
    })
  })

  client.on('message', (topic, message) => {
    console.log(`📨 Received message on ${topic}: ${message.toString()}`)
    
    // 断开连接
    setTimeout(() => {
      console.log('🔌 Disconnecting...')
      client.end()
    }, 1000)
  })

  client.on('error', (err) => {
    console.error('❌ MQTT error:', err.message)
    client.end()
  })
}

// 测试MQTTS连接
async function testMqtts() {
  console.log('\nTesting MQTTS connection...')
  
  const fs = require('fs')
  const path = require('path')
  
  try {
    const certPath = path.join(__dirname, 'server', 'certs')
    const caFile = path.join(certPath, 'ca.crt')
    
    if (!fs.existsSync(caFile)) {
      console.log('⚠️  CA certificate not found, skipping MQTTS test')
      return
    }
    
    const client = mqtt.connect('mqtts://localhost:8883', {
      clientId: 'test_client_tls_' + Math.random().toString(36).substr(2, 9),
      clean: true,
      ca: fs.readFileSync(caFile),
      rejectUnauthorized: false // 允许自签名证书
    })

    client.on('connect', () => {
      console.log('✅ Connected to MQTTS broker')
      
      client.subscribe('test/tls', (err) => {
        if (!err) {
          console.log('✅ Subscribed to test/tls')
          
          setTimeout(() => {
            console.log('📤 Publishing TLS test message...')
            client.publish('test/tls', 'Hello MQTTS!')
          }, 500)
        }
      })
    })

    client.on('message', (topic, message) => {
      console.log(`📨 Received TLS message on ${topic}: ${message.toString()}`)
      
      setTimeout(() => {
        console.log('🔌 Disconnecting TLS...')
        client.end()
      }, 1000)
    })

    client.on('error', (err) => {
      console.error('❌ MQTTS error:', err.message)
      client.end()
    })
    
  } catch (error) {
    console.error('❌ MQTTS test failed:', error.message)
  }
}

// 主函数
async function main() {
  console.log('🚀 Starting MQTT/MQTTS tests...\n')
  
  await testMqtt()
  
  setTimeout(async () => {
    await testMqtts()
  }, 3000)
}

main().catch(console.error)

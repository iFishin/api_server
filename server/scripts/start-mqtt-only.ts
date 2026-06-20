import { mqttService } from '../services/mqttService'

const ECHO_ENABLED = process.env.ECHO_ENABLED === 'true'
const ECHO_CONTENT = process.env.ECHO_CONTENT || null
const MQTT_PORT = parseInt(process.env.MQTT_PORT || '1883', 10)
const MQTT_S_PORT = parseInt(process.env.MQTTS_PORT || '8883', 10)

async function main() {
  // 如果需要的话可以在此处重新配置端口（mqttService 构造中已固化端口），
  // 目前使用导出的实例，端口由实例创建时决定。

  console.log(`Starting MQTT broker (echoEnabled=${ECHO_ENABLED}, echoContent=${ECHO_CONTENT})`)

  try {
    if (ECHO_ENABLED) {
      mqttService.setEchoEnabled(true)
      mqttService.setEchoContent(ECHO_CONTENT)
    } else {
      mqttService.setEchoEnabled(false)
    }

    await mqttService.start()
    console.log('MQTT broker started — running. Press Ctrl+C to stop.')
  } catch (err) {
    console.error('Failed to start MQTT broker:', err)
    process.exit(1)
  }

  function shutdown() {
    console.log('Shutting down MQTT broker...')
    mqttService.stop().then(() => process.exit(0)).catch(() => process.exit(1))
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main()

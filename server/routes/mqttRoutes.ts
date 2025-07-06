import { Router } from 'express'
import * as mqttController from '../controllers/mqttController'

const router = Router()

// MQTT 服务控制
router.post('/start', mqttController.start)
router.post('/stop', mqttController.stop)

// MQTT 服务状态和统计
router.get('/status', mqttController.getStatus)
router.get('/stats', mqttController.getStats)

// 客户端管理
router.get('/clients', mqttController.getClients)
router.post('/kick', mqttController.kickClient)

// 订阅管理
router.get('/subscriptions', mqttController.getSubscriptions)

// 消息发布
router.post('/publish', mqttController.publish)

// 回显配置
router.get('/echo', mqttController.getEcho)
router.post('/echo', mqttController.setEcho)
router.post('/echo/enabled', mqttController.setEchoEnabled)
router.post('/echo/content', mqttController.setEchoContent)

export default router

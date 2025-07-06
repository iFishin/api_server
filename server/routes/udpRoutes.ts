import { Router } from 'express'
import * as udpController from '../controllers/udpController'

const router = Router()

// UDP 服务控制
router.post('/start', udpController.start)
router.post('/stop', udpController.stop)

// UDP 服务状态
router.get('/status', udpController.getStatus)

// 回显配置
router.get('/echo', udpController.getEcho)
router.post('/echo/enabled', udpController.setEchoEnabled)
router.post('/echo/content', udpController.setEchoContent)

// 发送消息
router.post('/send', udpController.send)

export default router
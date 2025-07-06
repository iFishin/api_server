import { Router } from 'express'
import * as tcpController from '../controllers/tcpController'

const router = Router()

// TCP 服务控制
router.post('/start', tcpController.start)
router.post('/stop', tcpController.stop)

// TCP 服务状态
router.get('/status', tcpController.getStatus)

// 客户端管理
router.get('/clients', tcpController.getClients)
router.post('/sendToClient', tcpController.sendToClient)
router.post('/disconnectClient', tcpController.disconnectClient)
router.post('/closeAllClients', tcpController.closeAllClients)

// 回显配置
router.get('/echo', tcpController.getEcho)
router.post('/echo/enabled', tcpController.setEchoEnabled)
router.post('/echo/content', tcpController.setEchoContent)

// 客户端发送消息
router.post('/send', tcpController.send)

export default router
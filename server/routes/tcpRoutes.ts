import { Router } from 'express'
import * as tcpController from '@controllers/tcpController'

const router = Router()
router.get('/status', tcpController.getStatus)
router.get('/clients', tcpController.getClients)
router.post('/echo/enabled', tcpController.setEchoEnabled)
// ...其他接口
export default router
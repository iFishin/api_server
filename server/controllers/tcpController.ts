import { tcpService } from '../services/tcpService'

export function getStatus(req: any, res: any) {
    res.json({ listening: tcpService.isSerListening() })
}

export function getClients(req: any, res: any) {
    res.json({ clients: tcpService.getClients() })
}

export function setEchoEnabled(req: any, res: any) {
    tcpService.setEchoEnabled(req.body.enabled)
    res.json({ success: true })
}

// ...其他接口
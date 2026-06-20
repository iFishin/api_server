"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.udpService = exports.UdpService = void 0;
const dgram_1 = __importDefault(require("dgram"));
class UdpService {
    server = null;
    echoEnabled = true;
    echoContent = null;
    isListening = false;
    port;
    constructor(port = 9000) {
        this.port = port;
        this.createServer();
    }
    createServer() {
        if (this.server) {
            return;
        }
        this.server = dgram_1.default.createSocket('udp4');
        this.server.on('message', (msg, rinfo) => {
            console.log(`UDP received: ${msg} from ${rinfo.address}:${rinfo.port}`);
            // 回显功能
            if (this.echoEnabled && this.server) {
                const reply = this.echoContent !== null ? Buffer.from(this.echoContent) : msg;
                this.server.send(reply, rinfo.port, rinfo.address, err => {
                    if (err) {
                        console.error('UDP echo send error:', err);
                    }
                    else {
                        console.log(`Echoed to ${rinfo.address}:${rinfo.port}: ${reply.toString()}`);
                    }
                });
            }
        });
    }
    // 启动UDP服务
    start() {
        return new Promise((resolve, reject) => {
            if (this.isListening) {
                resolve();
                return;
            }
            this.createServer();
            if (!this.server) {
                reject(new Error('Failed to create server'));
                return;
            }
            this.server.bind(this.port, () => {
                this.isListening = true;
                console.log(`UDP server listening on port ${this.port}`);
                resolve();
            });
            this.server.on('error', (err) => {
                console.error('UDP server error:', err);
                this.isListening = false;
                reject(err);
            });
        });
    }
    // 停止UDP服务
    stop() {
        return new Promise((resolve) => {
            if (!this.isListening || !this.server) {
                resolve();
                return;
            }
            this.server.close(() => {
                this.isListening = false;
                this.server = null;
                console.log('UDP server stopped');
                resolve();
            });
        });
    }
    // 查询是否正在监听
    isSerListening() {
        return this.isListening;
    }
    // 获取回显配置
    getEchoConfig() {
        return {
            enabled: this.echoEnabled,
            content: this.echoContent
        };
    }
    // 设置回显开关
    setEchoEnabled(enabled) {
        this.echoEnabled = enabled;
        console.log(`UDP echo enabled: ${enabled}`);
    }
    // 设置自定义回显内容（null 表示回显原始数据）
    setEchoContent(content) {
        this.echoContent = content;
        if (content === null) {
            console.log('UDP echo content set to: 原始数据');
        }
        else {
            console.log(`UDP echo content set to: ${content}`);
        }
    }
    // 主动发送UDP消息
    send(message, port, host) {
        if (!this.server) {
            console.error('UDP server not initialized');
            return;
        }
        this.server.send(message, port, host, err => {
            if (err) {
                console.error('UDP send error:', err);
            }
            else {
                console.log(`Sent to ${host}:${port}: ${message}`);
            }
        });
    }
}
exports.UdpService = UdpService;
exports.udpService = new UdpService(9000);
// 启动服务
exports.udpService.start().catch(console.error);

/**
 * TCP客户端测试工具 - 用于测试高精度TCP服务器
 * 功能：连接到TCP服务器，接收数据并原样回复
 */

const net = require('net');

class TCPTestClient {
    constructor(port = 8888, host = 'localhost') {
        this.port = port;
        this.host = host;
        this.socket = null;
    }

    /**
     * 连接到TCP服务器
     */
    connect() {
        console.log(`正在连接到TCP服务器 ${this.host}:${this.port}...`);
        
        this.socket = new net.Socket();
        
        // 设置socket选项
        this.socket.setNoDelay(true);
        this.socket.setKeepAlive(true);
        
        // 连接成功
        this.socket.on('connect', () => {
            console.log(`已连接到服务器 ${this.host}:${this.port}`);
            console.log('等待服务器发送数据...');
        });
        
        // 接收数据
        this.socket.on('data', (data) => {
            console.log(`收到服务器数据: ${data.length} 字节`);
            console.log('立即回复相同数据...');
            
            // 立即回复相同的数据
            this.socket.write(data, (err) => {
                if (err) {
                    console.error('回复数据失败:', err.message);
                } else {
                    console.log('数据回复成功');
                }
            });
        });
        
        // 连接关闭
        this.socket.on('close', () => {
            console.log('与服务器的连接已关闭');
        });
        
        // 连接错误
        this.socket.on('error', (err) => {
            console.error('连接错误:', err.message);
        });
        
        // 建立连接
        this.socket.connect(this.port, this.host);
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.socket) {
            this.socket.end();
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const port = parseInt(process.argv[2]) || 8888;
    const host = process.argv[3] || 'localhost';
    
    console.log('=== TCP客户端测试工具 ===');
    console.log(`连接参数: ${host}:${port}`);
    console.log(`使用方法: node ${require('path').basename(__filename)} [端口] [主机地址]`);
    console.log();
    
    const client = new TCPTestClient(port, host);
    
    // 处理进程信号
    process.on('SIGINT', () => {
        console.log('\n正在断开连接...');
        client.disconnect();
        process.exit(0);
    });
    
    client.connect();
}

module.exports = TCPTestClient;

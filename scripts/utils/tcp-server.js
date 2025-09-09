/**
 * 高精度TCP服务器类
 * 功能：
 * 1. 高精度时间戳记录
 * 2. 主动发送100字节数据并等待回复
 * 3. 记录往返时间(RTT)
 * 4. 生成详细日志和汇总报告
 */

const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class HighPrecisionTCPServer {
    constructor(port = 8890, host = '0.0.0.0', options = {}) {
        this.port = port;
        this.host = host;
        this.server = null;
        this.logFile = path.join(__dirname, '../../logs/tcp-server-detail.log');
        this.summaryFile = path.join(__dirname, '../../logs/tcp-server-summary.log');
        this.testData = this.generateRandomTestData(100); // 100字节随机测试数据
        this.sessionCount = 0;
        this.isShuttingDown = false; // 添加关闭标志
        this.activeSockets = new Set(); // 跟踪活跃的socket连接
        
        // 配置选项
        this.continuousTest = options.continuousTest !== false; // 默认启用连续测试
        this.testInterval = options.testInterval || 1000; // 测试间隔，默认1秒
        this.maxRounds = options.maxRounds || 0; // 最大轮次，0表示无限制
        
        // 确保日志目录存在
        this.ensureLogDirectory();
        this.initializeLogFiles();
    }

    /**
     * 生成随机测试数据（数字和字母组合）
     * @param {number} length 数据长度
     * @returns {Buffer} 随机数据Buffer
     */
    generateRandomTestData(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return Buffer.from(result, 'utf8');
    }

    /**
     * 确保日志目录存在
     */
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    /**
     * 初始化日志文件
     */
    initializeLogFiles() {
        const timestamp = this.getHighPrecisionTimestamp();
        const startLog = `[${timestamp}] TCP服务器启动 - 监听 ${this.host}:${this.port}\n`;
        
        fs.writeFileSync(this.logFile, startLog);
        fs.writeFileSync(this.summaryFile, `# TCP服务器时间差汇总报告\n# 启动时间: ${timestamp}\n# 格式: 会话ID, 发送时间戳, 接收时间戳, 往返时间(ms), 状态\n\n`);
    }

    /**
     * 获取高精度时间戳 (纳秒级精度)
     * @returns {string} 高精度时间戳字符串
     */
    getHighPrecisionTimestamp() {
        const hrTime = process.hrtime.bigint();
        const date = new Date();
        const ms = date.getMilliseconds().toString().padStart(3, '0');
        const ns = (hrTime % 1000000n).toString().padStart(6, '0');
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}.${ms}${ns}`;
    }

    /**
     * 获取高精度时间 (用于计算时间差)
     * @returns {bigint} 纳秒时间戳
     */
    getHighPrecisionTime() {
        return process.hrtime.bigint();
    }

    /**
     * 写入详细日志
     * @param {string} message 日志消息
     */
    writeDetailLog(message) {
        const timestamp = this.getHighPrecisionTimestamp();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(this.logFile, logEntry);
        console.log(logEntry.trim());
    }

    /**
     * 写入汇总日志
     * @param {number} sessionId 会话ID
     * @param {string} sendTime 发送时间戳
     * @param {string} receiveTime 接收时间戳
     * @param {number} rttMs 往返时间(毫秒)
     * @param {string} status 状态
     */
    writeSummaryLog(sessionId, sendTime, receiveTime, rttMs, status) {
        const summaryEntry = `${sessionId}, ${sendTime}, ${receiveTime}, ${rttMs}, ${status}\n`;
        fs.appendFileSync(this.summaryFile, summaryEntry);
    }

    /**
     * 处理客户端连接
     * @param {net.Socket} socket 客户端socket连接
     */
    handleClient(socket) {
        this.sessionCount++;
        const sessionId = this.sessionCount;
        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
        
        // 添加到活跃连接集合
        this.activeSockets.add(socket);
        
        this.writeDetailLog(`会话${sessionId}: 客户端连接 - ${clientAddress}`);
        
        let roundCount = 0;
        let sendTime = null;
        let isWaitingForResponse = false;
        let responseTimeout = null;
        let nextTestTimeout = null;

        // 设置socket选项以提高精度
        socket.setNoDelay(true);
        socket.setKeepAlive(true);

        // 发送测试数据的函数
        const sendTestData = () => {
            // 检查服务器是否正在关闭
            if (this.isShuttingDown || socket.destroyed) {
                return;
            }
            
            roundCount++;
            this.writeDetailLog(`会话${sessionId}: 开始第${roundCount}轮测试`);
            
            // 为每轮生成新的随机测试数据
            const testBuffer = this.generateRandomTestData(100);
            // 固定测试数据，便于验证
            // const testBuffer = Buffer.from("uaVz7a8nznd7jCr2vHwsIJzojKaONoCzYjgyjerlEyEHLgHekclBd0Y9QXmaGI2YE1FhSYXTt02DQ7dxE67HfM7ZAIe1vMCU1BPj", 'utf8');
            
            this.writeDetailLog(`会话${sessionId}: 准备发送100字节测试数据`);
            this.writeDetailLog(`会话${sessionId}: 测试数据内容: ${testBuffer.toString('utf8')}`);
            
            sendTime = this.getHighPrecisionTime();
            const sendTimestamp = this.getHighPrecisionTimestamp();
            
            socket.write(testBuffer, (err) => {
                if (err) {
                    this.writeDetailLog(`会话${sessionId}: 发送数据失败 - ${err.message}`);
                    return;
                }
                
                this.writeDetailLog(`会话${sessionId}: 数据发送完成 - ${sendTimestamp}`);
                isWaitingForResponse = true;
                
                // 设置3秒超时
                responseTimeout = setTimeout(() => {
                    if (isWaitingForResponse) {
                        isWaitingForResponse = false;
                        const timeoutTimestamp = this.getHighPrecisionTimestamp();
                        this.writeDetailLog(`会话${sessionId}: 第${roundCount}轮等待响应超时 - ${timeoutTimestamp}`);
                        this.writeSummaryLog(sessionId + '-' + roundCount, sendTimestamp, timeoutTimestamp, Infinity, '超时');
                        
                        // 超时后可以选择继续下一轮测试或关闭连接
                        if (this.continuousTest && !this.isShuttingDown) {
                            this.writeDetailLog(`会话${sessionId}: 超时后继续下一轮测试`);
                            nextTestTimeout = setTimeout(() => {
                                if (!socket.destroyed && !this.isShuttingDown) {
                                    sendTestData();
                                }
                            }, this.testInterval);
                        } else {
                            socket.end();
                        }
                    }
                }, 8000);
            });
            
            // 存储当前轮次的测试数据，供验证使用
            socket.currentTestBuffer = testBuffer;
        };

        // 处理接收到的数据
        socket.on('data', (data) => {
            const receiveTime = this.getHighPrecisionTime();
            const receiveTimestamp = this.getHighPrecisionTimestamp();
            
            this.writeDetailLog(`会话${sessionId}: 收到数据 ${data.length} 字节 - ${receiveTimestamp}`);
            this.writeDetailLog(`会话${sessionId}: 收到数据内容: ${data.toString('utf8')}`);
            
            if (isWaitingForResponse) {
                clearTimeout(responseTimeout);
                isWaitingForResponse = false;
                
                // 验证接收到的数据是否与发送的相同
                if (Buffer.compare(data, socket.currentTestBuffer) === 0) {
                    const rttNs = receiveTime - sendTime;
                    const rttMs = Number(rttNs) / 1000000; // 转换为毫秒
                    
                    const sendTimestamp = this.getHighPrecisionTimestamp();
                    this.writeDetailLog(`会话${sessionId}: 第${roundCount}轮数据验证成功，往返时间: ${rttMs.toFixed(6)}ms`);
                    this.writeSummaryLog(sessionId + '-' + roundCount, sendTimestamp, receiveTimestamp, rttMs.toFixed(6), '成功');
                } else {
                    this.writeDetailLog(`会话${sessionId}: 第${roundCount}轮数据验证失败 - 接收数据与发送数据不匹配`);
                    this.writeSummaryLog(sessionId + '-' + roundCount, 'N/A', receiveTimestamp, 'N/A', '数据不匹配');
                }
                
                // 检查是否继续下一轮测试
                if (this.continuousTest && !this.isShuttingDown) {
                    this.writeDetailLog(`会话${sessionId}: ${this.testInterval}ms后开始下一轮测试`);
                    nextTestTimeout = setTimeout(() => {
                        if (!socket.destroyed && !this.isShuttingDown) {
                            sendTestData();
                        }
                    }, this.testInterval);
                } else {
                    this.writeDetailLog(`会话${sessionId}: 单次测试完成`);
                    setTimeout(() => {
                        socket.end();
                    }, 100);
                }
            }
        });

        // 处理连接错误
        socket.on('error', (err) => {
            this.writeDetailLog(`会话${sessionId}: 连接错误 - ${err.message}`);
            if (responseTimeout) {
                clearTimeout(responseTimeout);
            }
            if (nextTestTimeout) {
                clearTimeout(nextTestTimeout);
            }
        });

        // 处理连接关闭
        socket.on('close', () => {
            this.writeDetailLog(`会话${sessionId}: 客户端连接关闭 - ${clientAddress}, 共完成${roundCount}轮测试`);
            
            // 从活跃连接集合中移除
            this.activeSockets.delete(socket);
            
            // 清理定时器
            if (responseTimeout) {
                clearTimeout(responseTimeout);
            }
            if (nextTestTimeout) {
                clearTimeout(nextTestTimeout);
            }
        });

        // 连接建立后等待1秒再开始测试
        setTimeout(() => {
            if (!this.isShuttingDown && !socket.destroyed) {
                sendTestData();
            }
        }, 1000);
    }

    /**
     * 启动TCP服务器
     */
    start() {
        this.server = net.createServer((socket) => {
            this.handleClient(socket);
        });

        // 设置服务器选项
        this.server.maxConnections = 100;

        // 处理服务器错误
        this.server.on('error', (err) => {
            this.writeDetailLog(`服务器错误: ${err.message}`);
            console.error('服务器错误:', err);
        });

        // 启动监听
        this.server.listen(this.port, this.host, () => {
            const message = `TCP服务器启动成功，监听地址: ${this.host}:${this.port}`;
            this.writeDetailLog(message);
            console.log(`\n=== ${message} ===`);
            console.log(`详细日志文件: ${this.logFile}`);
            console.log(`汇总日志文件: ${this.summaryFile}`);
            console.log('等待客户端连接...\n');
        });

        // 处理进程信号
        process.on('SIGINT', () => {
            this.stop();
        });

        process.on('SIGTERM', () => {
            this.stop();
        });
    }

    /**
     * 停止TCP服务器
     */
    stop() {
        if (this.server) {
            this.isShuttingDown = true; // 设置关闭标志
            this.writeDetailLog('正在关闭TCP服务器...');
            
            // 关闭所有活跃的socket连接
            this.activeSockets.forEach(socket => {
                if (!socket.destroyed) {
                    socket.end();
                }
            });
            
            // 关闭服务器
            this.server.close((err) => {
                if (err) {
                    this.writeDetailLog(`关闭服务器时出错: ${err.message}`);
                } else {
                    this.writeDetailLog('TCP服务器已关闭');
                }
                process.exit(0);
            });
        }
    }

    /**
     * 获取服务器统计信息
     */
    getStats() {
        return {
            sessionCount: this.sessionCount,
            isListening: this.server && this.server.listening,
            address: this.server ? this.server.address() : null
        };
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    // 从命令行参数获取配置
    const port = parseInt(process.argv[2]) || 8888;
    const host = process.argv[3] || '0.0.0.0';
    const testInterval = parseInt(process.argv[4]) || 2000; // 测试间隔，默认2秒
    
    console.log('=== 高精度TCP服务器 ===');
    console.log('功能说明:');
    console.log('- 高精度时间戳记录(纳秒级)');
    console.log('- 主动发送100字节数据测试');
    console.log('- 连续测试模式（持续测试，不关闭连接）');
    console.log('- 3秒响应超时检测');
    console.log('- 详细日志和汇总报告');
    console.log(`- 启动参数: node ${path.basename(__filename)} [端口] [主机地址] [测试间隔ms]`);
    console.log(`- 当前配置: 端口=${port}, 主机=${host}, 测试间隔=${testInterval}ms`);
    console.log();

    const options = {
        continuousTest: true,
        testInterval: testInterval,
        maxRounds: 0 // 无限制
    };
    
    const server = new HighPrecisionTCPServer(port, host, options);
    server.start();
}

module.exports = HighPrecisionTCPServer;

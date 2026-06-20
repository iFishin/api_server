"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('./app');
const dotenv_1 = __importDefault(require("dotenv"));
const postgres_1 = require("./config/postgres");
const postgresService_1 = require("./services/postgresService");
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mqttService_1 = require("./services/mqttService");
// 加载环境变量
dotenv_1.default.config();
// 根据环境确定端口
const isProduction = process.env.NODE_ENV === 'production';
const HTTP_PORT = parseInt(process.env.HTTP_PORT || (isProduction ? '80' : '3000'), 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || (isProduction ? '443' : '3443'), 10);
// 根据环境确定证书路径
const certsDir = isProduction
    ? path_1.default.join(__dirname, 'certs')
    : path_1.default.join(__dirname, 'certs');
const SSL_KEY = path_1.default.join(certsDir, 'server.key');
const SSL_CERT = path_1.default.join(certsDir, 'server.crt');
async function initDb() {
    // 测试 PostgreSQL 连接
    const isConnected = await (0, postgres_1.testConnection)();
    if (isConnected) {
        // 初始化 PostgreSQL 数据库表
        const postgresService = new postgresService_1.PostgresService();
        const result = await postgresService.initDatabase();
        if (result.success) {
            console.log('✅ PostgreSQL database initialized');
        }
        else {
            console.error('❌ PostgreSQL database initialization failed:', result.message);
        }
    }
    else {
        console.warn('⚠️  PostgreSQL connection failed, some features may not work');
    }
}
// 启动服务器
async function startServer() {
    try {
        // 初始化数据库
        await initDb();
        let hasCert = false;
        try {
            fs_1.default.accessSync(SSL_KEY, fs_1.default.constants.R_OK);
            fs_1.default.accessSync(SSL_CERT, fs_1.default.constants.R_OK);
            hasCert = true;
        }
        catch { }
        if (hasCert && isProduction) {
            // 生产环境：HTTPS + HTTP (都提供完整服务)
            const options = {
                key: fs_1.default.readFileSync(SSL_KEY),
                cert: fs_1.default.readFileSync(SSL_CERT)
            };
            // HTTPS 服务器
            https_1.default.createServer(options, app).listen(HTTPS_PORT, '0.0.0.0', () => {
                console.log(`🔒 HTTPS Server is running on https://0.0.0.0:${HTTPS_PORT}`);
            });
            // HTTP 服务器（提供完整服务，便于 Nginx 代理）
            app.listen(HTTP_PORT, '0.0.0.0', async () => {
                console.log(`🌐 HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 Production mode: Both HTTP and HTTPS available`);
                // 启动 MQTT Broker
                try {
                    await mqttService_1.mqttService.start();
                    console.log('✅ MQTT broker started from server startup');
                }
                catch (err) {
                    console.error('❌ Failed to start MQTT broker during server startup:', err);
                }
            });
        }
        else if (hasCert && !isProduction) {
            // 开发环境：同时运行 HTTP 和 HTTPS
            const options = {
                key: fs_1.default.readFileSync(SSL_KEY),
                cert: fs_1.default.readFileSync(SSL_CERT)
            };
            // HTTPS 服务器
            https_1.default.createServer(options, app).listen(HTTPS_PORT, '0.0.0.0', () => {
                console.log(`🔒 HTTPS Server is running on https://0.0.0.0:${HTTPS_PORT}`);
            });
            // HTTP 服务器（直接提供服务，不重定向）
            app.listen(HTTP_PORT, '0.0.0.0', async () => {
                console.log(`🌐 HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 Development mode: Both HTTP and HTTPS available`);
                // 启动 MQTT Broker
                try {
                    await mqttService_1.mqttService.start();
                    console.log('✅ MQTT broker started from server startup');
                }
                catch (err) {
                    console.error('❌ Failed to start MQTT broker during server startup:', err);
                }
            });
        }
        else {
            // 没有证书：仅 HTTP 服务器
            app.listen(HTTP_PORT, '0.0.0.0', async () => {
                console.log(`🌐 HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 Environment: ${isProduction ? 'production' : 'development'}`);
                // 启动 MQTT Broker
                try {
                    await mqttService_1.mqttService.start();
                    console.log('✅ MQTT broker started from server startup');
                }
                catch (err) {
                    console.error('❌ Failed to start MQTT broker during server startup:', err);
                }
            });
        }
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // 如果服务器启动失败，退出进程
    }
}
// 启动应用
startServer();
// Graceful shutdown for MQTT broker on process exit
function handleShutdown(signal) {
    console.log(`Received ${signal}, shutting down...`);
    mqttService_1.mqttService.stop().then(() => {
        console.log('MQTT broker stopped');
        process.exit(0);
    }).catch(err => {
        console.error('Error stopping MQTT broker:', err);
        process.exit(1);
    });
}
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

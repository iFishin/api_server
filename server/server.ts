const app = require('./app');
import dotenv from 'dotenv';
import { testConnection } from './config/postgres';
import { PostgresService } from './services/postgresService';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { mqttService } from './services/mqttService'

// 加载环境变量
dotenv.config();

// 根据环境确定端口
const isProduction = process.env.NODE_ENV === 'production';
const HTTP_PORT = parseInt(process.env.HTTP_PORT || (isProduction ? '80' : '3000'), 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || (isProduction ? '443' : '3443'), 10);

// 根据环境确定证书路径
const certsDir = isProduction 
  ? path.join(__dirname, 'certs')
  : path.join(__dirname, 'certs');

const SSL_KEY = path.join(certsDir, 'server.key');
const SSL_CERT = path.join(certsDir, 'server.crt');

async function initDb() {
    // 测试 PostgreSQL 连接
    const isConnected = await testConnection();
    
    if (isConnected) {
        // 初始化 PostgreSQL 数据库表
        const postgresService = new PostgresService();
        const result = await postgresService.initDatabase();
        
        if (result.success) {
            console.log('✅ PostgreSQL database initialized');
        } else {
            console.error('❌ PostgreSQL database initialization failed:', result.message);
        }
    } else {
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
            fs.accessSync(SSL_KEY, fs.constants.R_OK);
            fs.accessSync(SSL_CERT, fs.constants.R_OK);
            hasCert = true;
        } catch {}

    if (hasCert && isProduction) {
            // 生产环境：HTTPS + HTTP (都提供完整服务)
            const options = {
                key: fs.readFileSync(SSL_KEY),
                cert: fs.readFileSync(SSL_CERT)
            };
            // HTTPS 服务器
            https.createServer(options, app).listen(HTTPS_PORT, '0.0.0.0', () => {
                console.log(`🔒 HTTPS Server is running on https://0.0.0.0:${HTTPS_PORT}`);
            });
            // HTTP 服务器（提供完整服务，便于 Nginx 代理）
            app.listen(HTTP_PORT, '0.0.0.0', async () => {
                console.log(`🌐 HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 Production mode: Both HTTP and HTTPS available`);
                // 启动 MQTT Broker
                try {
                    await mqttService.start()
                    console.log('✅ MQTT broker started from server startup')
                } catch (err) {
                    console.error('❌ Failed to start MQTT broker during server startup:', err)
                }
            });
        } else if (hasCert && !isProduction) {
            // 开发环境：同时运行 HTTP 和 HTTPS
            const options = {
                key: fs.readFileSync(SSL_KEY),
                cert: fs.readFileSync(SSL_CERT)
            };
            // HTTPS 服务器
            https.createServer(options, app).listen(HTTPS_PORT, '0.0.0.0', () => {
                console.log(`🔒 HTTPS Server is running on https://0.0.0.0:${HTTPS_PORT}`);
            });
            // HTTP 服务器（直接提供服务，不重定向）
            app.listen(HTTP_PORT, '0.0.0.0', async () => {
                console.log(`🌐 HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 Development mode: Both HTTP and HTTPS available`);
                // 启动 MQTT Broker
                try {
                    await mqttService.start()
                    console.log('✅ MQTT broker started from server startup')
                } catch (err) {
                    console.error('❌ Failed to start MQTT broker during server startup:', err)
                }
            });
        } else {
            // 没有证书：仅 HTTP 服务器
            app.listen(HTTP_PORT, '0.0.0.0', async () => {
                console.log(`🌐 HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 Environment: ${isProduction ? 'production' : 'development'}`);
                // 启动 MQTT Broker
                try {
                    await mqttService.start()
                    console.log('✅ MQTT broker started from server startup')
                } catch (err) {
                    console.error('❌ Failed to start MQTT broker during server startup:', err)
                }
            });
        }
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // 如果服务器启动失败，退出进程
    }
}

// 启动应用
startServer();

// Graceful shutdown for MQTT broker on process exit
function handleShutdown(signal: string) {
    console.log(`Received ${signal}, shutting down...`)
    mqttService.stop().then(() => {
        console.log('MQTT broker stopped')
        process.exit(0)
    }).catch(err => {
        console.error('Error stopping MQTT broker:', err)
        process.exit(1)
    })
}

process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))
const app = require('./app');
import dotenv from 'dotenv';
import { openDb } from './db';
import https from 'https';
import fs from 'fs';
import path from 'path';

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
    const db = await openDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )
    `);
    console.log('Database initialized');
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

        if (hasCert) {
            const options = {
                key: fs.readFileSync(SSL_KEY),
                cert: fs.readFileSync(SSL_CERT)
            };
            // HTTPS 服务器
            https.createServer(options, app).listen(HTTPS_PORT, '0.0.0.0', () => {
                console.log(`🔒 HTTPS Server is running on https://0.0.0.0:${HTTPS_PORT}`);
            });
            // HTTP 服务器（重定向到 HTTPS）
            const redirectApp = require('express')();
            redirectApp.use((req: any, res: any) => {
                res.redirect(301, `https://${req.header('host').replace(/:\d+/, `:${HTTPS_PORT}`)}${req.url}`);
            });
            redirectApp.listen(HTTP_PORT, '0.0.0.0', () => {
                console.log(`🌐 HTTP Server (redirect) is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 All HTTP traffic will be redirected to HTTPS`);
            });
        } else {
            // 仅 HTTP 服务器
            app.listen(HTTP_PORT, '0.0.0.0', () => {
                console.log(`🌐 HTTP Server is running on http://0.0.0.0:${HTTP_PORT}`);
                console.log(`💡 Environment: ${isProduction ? 'production' : 'development'}`);
            });
        }
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // 如果服务器启动失败，退出进程
    }
}

// 启动应用
startServer();
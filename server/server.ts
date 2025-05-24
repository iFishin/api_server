import app from './app';
import dotenv from 'dotenv';
import { openDb } from './db';
import https from 'https';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const SSL_KEY = path.join(__dirname, '/certs/server.key');
const SSL_CERT = path.join(__dirname, '/certs/server.crt');

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
            https.createServer(options, app).listen(PORT, () => {
                console.log(`HTTPS Server is running on https://0.0.0.0:${PORT}`);
            });
            // 同时开启 HTTP 端口（可选，端口+1）
            app.listen(PORT + 1, '0.0.0.0', () => {
                console.log(`HTTP Server is running on http://0.0.0.0:${PORT + 1}`);
            });
        } else {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`HTTP Server is running on http://0.0.0.0:${PORT}`);
            });
        }
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // 如果服务器启动失败，退出进程
    }
}

// 启动应用
startServer();
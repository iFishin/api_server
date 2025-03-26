import app from './app';
import dotenv from 'dotenv';
import { openDb } from './db';

// 加载环境变量
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

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

        // 启动 Express 服务器，监听 0.0.0.0
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // 如果服务器启动失败，退出进程
    }
}

// 启动应用
startServer();
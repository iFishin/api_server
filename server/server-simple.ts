import app from './app-simple';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

// 启动服务器
async function startServer() {
    try {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 HTTP Server is running on http://0.0.0.0:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

// 启动应用
startServer();

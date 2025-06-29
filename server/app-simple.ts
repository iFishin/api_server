import express from 'express';
import cors from 'cors';
import path from "path";
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// 中间件配置
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // 在开发阶段可能需要禁用CSP
}));
app.use(morgan('dev'));
app.use(express.json());

// 静态文件路径 - 根据环境确定路径
const isProduction = process.env.NODE_ENV === 'production';
const baseDir = isProduction ? __dirname : path.join(__dirname, '..');

console.log("Environment:", isProduction ? 'production' : 'development');
console.log("Base Directory:", baseDir);

// Vue 前端静态文件服务 (生产环境)
if (isProduction) {
  // 在生产环境下，dist 的内容已经在当前目录的父级
  const staticPath = path.join(__dirname, '..');
  console.log("Static Path:", staticPath);
  app.use(express.static(staticPath));
  
  // 处理 SPA 路由 - 所有非 API 路由都返回 index.html
  app.get('*', (req, res, next) => {
    // 如果是 API 路由，跳过
    if (req.path.startsWith('/api/') || req.path.startsWith('/webdav/')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // 开发环境
  app.get('/', (req, res) => {
    res.json({ message: 'API Server is running in development mode' });
  });
}

// 基本的 API 路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;

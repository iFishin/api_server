import express from 'express';
import cors from 'cors';
import path from "path";
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import httpRoutes from './routes/httpRoutes';
import { errorHandler } from './middlewares/errorHandler';
import fileRoutes from './routes/fileRoutes';
import { setupWebDAV } from './services/webdavService';
import { getApiDocs } from './services/docService';
import { mqttService } from './services/mqttService';
import { tcpService } from './services/tcpService';
import { udpService } from './services/udpService';

const app = express();
// 获取项目根目录
const projectRoot = path.resolve();

// 中间件配置
app.use(cors({
  origin: function (origin, callback) {
    // 允许的源列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080'
    ];
    
    // 在开发环境中，也允许任何来自5173和8080端口的请求
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.match(/^http:\/\/[\d.]+:5173$/) ||
        origin.match(/^http:\/\/[\d.]+:8080$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // 如果需要发送cookies的话
}));
app.use(helmet({
  contentSecurityPolicy: false, // 在开发阶段可能需要禁用CSP
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// 调试中间件
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  next();
});

// API 路由 - 移到最前面
app.use('/api/users', userRoutes);
app.use('/api/http', httpRoutes);
app.use('/api/files', fileRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    data: getApiDocs(),
    message: 'API documentation retrieved successfully'
  });
});

// MQTT 服务
mqttService.isSerListening(); // 检查MQTT服务是否在监听

// TCP 服务
tcpService.isSerListening(); // 检查TCP服务是否在监听

// UDP 服务
udpService.isSerListening(); // 检查UDP服务是否在监听

// 静态文件路径 - 根据环境确定路径
const isProduction = process.env.NODE_ENV === 'production';

// 开发环境：server 目录下的 public 和 temps
// 生产环境：dist 目录下的结构
let publicPath: string;
let tempsPath: string;

if (isProduction) {
  // 生产环境：dist/server/server.js，所以 __dirname 是 dist/server
  publicPath = path.join(__dirname, '..', 'public'); // dist/public
  tempsPath = path.join(__dirname, 'temps'); // dist/server/temps
} else {
  // 开发环境：server/server.ts，所以 __dirname 是 server
  publicPath = path.join(__dirname, 'public'); // server/public
  tempsPath = path.join(__dirname, 'temps'); // server/temps
}

// 确保目录存在（可选）
import fs from 'fs';
if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
if (!fs.existsSync(tempsPath)) fs.mkdirSync(tempsPath, { recursive: true });

// 静态文件服务
app.use(express.static(publicPath));
app.use("/temps", express.static(tempsPath));

// Vue 前端静态文件服务 (生产环境)
if (isProduction) {
  // 在生产环境下，静态文件在 dist 目录（上一级目录）
  app.use(express.static(path.join(__dirname, '..')));
  
  // 处理 SPA 路由 - 所有非 API 路由都返回 index.html
  app.get('*', (req, res, next) => {
    // 如果是 API 路由，跳过
    if (req.path.startsWith('/api/') || req.path.startsWith('/webdav/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });
} else {
  // 开发环境下的路由处理
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "server", "public", "index.html"));
  });
}

app.get("/script.js", (req, res) => {
    const scriptPath = isProduction 
      ? path.join(__dirname, "script.js")
      : path.join(__dirname, "server", "public", "script.js");
    res.sendFile(scriptPath, {
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  });

// 调试日志
console.log("Environment:", isProduction ? 'production' : 'development');
console.log("__dirname:", __dirname);
console.log("Public Path:", publicPath);
console.log("Temps Path:", tempsPath);

setupWebDAV(app); // 设置 WebDAV

// 错误处理
app.use(errorHandler);

module.exports = app;
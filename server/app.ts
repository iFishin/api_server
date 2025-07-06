import express from 'express';
import cors from 'cors';
import path from "path";
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import httpRoutes from './routes/httpRoutes';
import tcpRoutes from './routes/tcpRoutes';
import udpRoutes from './routes/udpRoutes';
import mqttRoutes from './routes/mqttRoutes';
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
    // 在生产环境下，如果没有 origin（同源请求），应该允许
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // 允许的源列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost',        // 添加不带端口的localhost
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:80',
      'http://127.0.0.1'         // 添加不带端口的127.0.0.1
    ];
    
    // 检查是否是局域网IP地址
    const isPrivateNetwork = (url: string) => {
      // 提取IP地址部分
      const match = url.match(/^https?:\/\/([\d.]+)(?::\d+)?(?:\/.*)?$/);
      if (!match) return false;
      
      const ip = match[1];
      const parts = ip.split('.').map(Number);
      
      // 检查是否是私有网络IP段
      return (
        // 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
        (parts[0] === 10) ||
        // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        // 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
        (parts[0] === 192 && parts[1] === 168) ||
        // localhost
        (parts[0] === 127 && parts[1] === 0 && parts[2] === 0 && parts[3] === 1)
      );
    };
    
    // 检查是否允许访问
    if (allowedOrigins.includes(origin) || 
        origin.match(/^http:\/\/[\d.]+:5173$/) ||
        origin.match(/^http:\/\/[\d.]+:8080$/) ||
        origin.match(/^http:\/\/[\d.]+:3000$/) ||
        origin.match(/^http:\/\/[\d.]+:80$/) ||
        origin.match(/^http:\/\/[\d.]+$/) ||   // 添加不带端口的IP访问
        isPrivateNetwork(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      // 对于开发和调试，我们可以更宽松一些
      callback(null, true);  // 临时允许所有来源，便于调试
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true // 如果需要发送cookies的话
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost", "http://127.0.0.1", "http://10.55.131.77"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "http://localhost", "http://localhost:80", "http://localhost:3000", "http://127.0.0.1", "http://127.0.0.1:80", "http://127.0.0.1:3000", "http://10.55.131.77", "http://10.55.131.77:80", "http://10.55.131.77:3000"],
      manifestSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      upgradeInsecureRequests: null  // 禁用自动HTTPS升级
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },  // 放宽跨域资源策略
  crossOriginOpenerPolicy: false,  // 禁用 Cross-Origin-Opener-Policy，避免HTTP下的警告
  crossOriginEmbedderPolicy: false,  // 禁用 Cross-Origin-Embedder-Policy
  originAgentCluster: false,  // 禁用 Origin-Agent-Cluster
  hsts: false  // 在开发/测试环境禁用 HSTS
}));
app.use(morgan('dev'));
app.use(express.json());

// 调试中间件
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  next();
});

// 静态资源中间件 - 防止HTTPS重定向
app.use((req, res, next) => {
  // 移除可能导致HTTPS升级的头信息
  res.removeHeader('Strict-Transport-Security');
  res.removeHeader('upgrade-insecure-requests');
  
  // 对于静态资源，确保正确的CORS头
  if (req.url.match(/\.(css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=86400'
    });
  }
  
  next();
});

// API 路由 - 移到最前面
app.use('/api/users', userRoutes);
app.use('/api/http', httpRoutes);
app.use('/api/tcp', tcpRoutes);
app.use('/api/udp', udpRoutes);
app.use('/api/mqtt', mqttRoutes);
app.use('/api/files', fileRoutes);

// 专门处理 favicon.ico 路由
app.get('/favicon.ico', (req, res) => {
  const faviconPath = isProduction 
    ? path.join(__dirname, '..', 'favicon.ico')  // dist/favicon.ico
    : path.join(__dirname, '..', 'public', 'favicon.ico');  // public/favicon.ico
  
  res.set({
    'Content-Type': 'image/x-icon',
    'Cache-Control': 'public, max-age=86400',  // 缓存1天
    'Access-Control-Allow-Origin': '*',  // 允许跨域访问favicon
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Vary': 'Origin'  // 告诉缓存根据Origin头进行变化
  });
  
  res.sendFile(faviconPath, (err) => {
    if (err) {
      console.log('Favicon not found:', faviconPath);
      res.status(404).end();
    }
  });
});

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

// Vue 前端静态文件服务 (生产环境)
if (isProduction) {
  // 在生产环境下，静态文件在 dist 目录（上一级目录）
  app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, path, stat) => {
      // 为所有静态文件设置CORS和缓存头
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': 'public, max-age=86400'
      });
      
      // 特别处理CSS和JS文件
      if (path.match(/\.(css|js)$/)) {
        res.set({
          'Content-Security-Policy': 'default-src \'self\' http: data: blob:',
          'X-Content-Type-Options': 'nosniff'
        });
      }
    }
  }));
  // temps 目录服务
  app.use("/temps", express.static(tempsPath));
  
  // 处理 SPA 路由 - 所有非 API 路由都返回 index.html
  app.get('*', (req, res, next) => {
    // 如果是 API 路由，跳过
    if (req.path.startsWith('/api/') || req.path.startsWith('/webdav/')) {
      return next();
    }
    
    // 为 SPA 路由设置正确的头信息
    res.set({
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });
} else {
  // 开发环境的静态文件服务
  app.use(express.static(publicPath));
  app.use("/temps", express.static(tempsPath));
  
  // 开发环境下的路由处理
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

app.get("/script.js", (req, res) => {
    const scriptPath = isProduction 
      ? path.join(__dirname, "script.js")
      : path.join(__dirname, "public", "script.js");
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
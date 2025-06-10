import express from 'express';
import cors from 'cors';
import path from "path";
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from '@routes/userRoutes';
import httpRoutes from '@routes/httpRoutes';
import { errorHandler } from '@middlewares/errorHandler';
import fileRoutes from '@routes/fileRoutes';
import { setupWebDAV } from '@services/webdavService';
import { getApiDocs } from '@services/docService';
import { mqttService } from '@services/mqttService';
import { tcpService } from '@services/tcpService';
import { udpService } from '@services/udpService';

const app = express();
const __dirname = path.resolve(); // 获取项目根目录

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

// 静态文件路径
const publicPath = path.join(__dirname, "server/public");
const tempsPath = path.join(__dirname, "server/temps");

// 确保目录存在（可选）
import fs from 'fs';
if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
if (!fs.existsSync(tempsPath)) fs.mkdirSync(tempsPath, { recursive: true });

// 静态文件服务
app.use(express.static(publicPath));
app.use("/temps", express.static(tempsPath));

// 显式处理根路径
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "script.js"), {
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  });

// 调试日志
console.log("Public Path:", publicPath);
console.log("Temps Path:", tempsPath);

setupWebDAV(app); // 设置 WebDAV

// 处理Vue前端 - 添加以下内容
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// 错误处理
app.use(errorHandler);

export default app;
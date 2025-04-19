import { HttpStatusCode } from './../node_modules/axios/index.d';
import express from 'express';
import cors from 'cors';
import path from "path";
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import httpRoutes from './routes/httpRoutes';
import { errorHandler } from './middlewares/errorHandler';
import fileRoutes from './routes/fileRoutes';
import { setupWebDAV } from './webdav';

const app = express();
const __dirname = path.resolve(); // 获取项目根目录

// 中间件配置
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
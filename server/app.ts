import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// 中间件配置
app.use(cors()); // 跨域支持
app.use(helmet()); // 安全头设置
app.use(morgan('dev')); // 请求日志
app.use(express.json()); // 解析 JSON 请求体

// 挂载路由
app.use('/api/users', userRoutes);

// 全局错误处理
app.use(errorHandler);

export default app;
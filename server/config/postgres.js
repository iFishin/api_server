"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.closePool = closePool;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// 加载环境变量（确保在读取 process.env 之前执行）
dotenv_1.default.config();
/**
 * PostgreSQL 数据库配置
 * 可以通过环境变量覆盖默认配置
 */
const poolConfig = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'api_server',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    max: 20, // 最大连接数
    idleTimeoutMillis: 30000, // 空闲连接超时时间
    connectionTimeoutMillis: 2000, // 连接超时时间
};
/**
 * PostgreSQL 连接池
 * 使用连接池可以提高性能，避免频繁创建和销毁连接
 */
exports.pool = new pg_1.Pool(poolConfig);
/**
 * 测试数据库连接
 */
async function testConnection() {
    try {
        const client = await exports.pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ PostgreSQL 连接成功:', result.rows[0]);
        return true;
    }
    catch (error) {
        console.error('❌ PostgreSQL 连接失败:', error);
        return false;
    }
}
/**
 * 关闭连接池
 */
async function closePool() {
    await exports.pool.end();
    console.log('PostgreSQL 连接池已关闭');
}
// 优雅退出处理
process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await closePool();
    process.exit(0);
});

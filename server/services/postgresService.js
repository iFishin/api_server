"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgresService = exports.PostgresService = void 0;
const postgres_1 = require("../config/postgres");
/**
 * PostgreSQL 服务类
 * 提供高级 PostgreSQL 功能演示（事务、统计、原始查询等）
 * 基础 CRUD 操作委托给 userService
 */
class PostgresService {
    /**
     * 初始化数据库表
     * 创建示例用户表
     */
    async initDatabase() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                age INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- 创建更新时间触发器函数
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
            
            -- 创建触发器（如果不存在）
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `;
        try {
            await postgres_1.pool.query(createTableQuery);
            return {
                success: true,
                message: '数据库表初始化成功'
            };
        }
        catch (error) {
            return {
                success: false,
                message: `数据库表初始化失败: ${error.message}`
            };
        }
    }
    /**
     * 批量创建用户（事务示例）
     */
    async batchCreateUsers(users) {
        const client = await postgres_1.pool.connect();
        try {
            await client.query('BEGIN');
            const createdUsers = [];
            for (const user of users) {
                const query = `
                    INSERT INTO users (name, email, age)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `;
                const result = await client.query(query, [user.name, user.email, user.age || null]);
                createdUsers.push(result.rows[0]);
            }
            await client.query('COMMIT');
            return {
                success: true,
                data: createdUsers
            };
        }
        catch (error) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: `批量创建用户失败: ${error.message}`
            };
        }
        finally {
            client.release();
        }
    }
    /**
     * 获取数据库统计信息
     */
    async getStatistics() {
        try {
            const stats = await postgres_1.pool.query(`
                SELECT 
                    COUNT(*) as total_users,
                    AVG(age) as average_age,
                    MIN(created_at) as first_user_date,
                    MAX(created_at) as last_user_date
                FROM users
            `);
            return {
                success: true,
                data: stats.rows[0]
            };
        }
        catch (error) {
            return {
                success: false,
                error: `获取统计信息失败: ${error.message}`
            };
        }
    }
    /**
     * 执行原始 SQL 查询（高级用法）
     */
    async executeRawQuery(sql, params = []) {
        try {
            const result = await postgres_1.pool.query(sql, params);
            return {
                success: true,
                data: result.rows
            };
        }
        catch (error) {
            return {
                success: false,
                error: `执行查询失败: ${error.message}`
            };
        }
    }
}
exports.PostgresService = PostgresService;
// 导出服务实例
exports.postgresService = new PostgresService();

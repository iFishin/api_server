import { pool } from '../config/postgres';
import { QueryResult } from 'pg';
import { userService, type User } from './userService';

/**
 * PostgreSQL 服务类
 * 提供高级 PostgreSQL 功能演示（事务、统计、原始查询等）
 * 基础 CRUD 操作委托给 userService
 */
export class PostgresService {
    
    /**
     * 初始化数据库表
     * 创建示例用户表
     */
    async initDatabase(): Promise<{ success: boolean; message: string }> {
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
            await pool.query(createTableQuery);
            return {
                success: true,
                message: '数据库表初始化成功'
            };
        } catch (error) {
            return {
                success: false,
                message: `数据库表初始化失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 批量创建用户（事务示例）
     */
    async batchCreateUsers(users: { name: string; email: string; age?: number }[]): Promise<{ success: boolean; data?: any[]; error?: string }> {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const createdUsers: User[] = [];
            
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
        } catch (error) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: `批量创建用户失败: ${(error as Error).message}`
            };
        } finally {
            client.release();
        }
    }
    
    /**
     * 获取数据库统计信息
     */
    async getStatistics(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const stats = await pool.query(`
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
        } catch (error) {
            return {
                success: false,
                error: `获取统计信息失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 执行原始 SQL 查询（高级用法）
     */
    async executeRawQuery(sql: string, params: any[] = []): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            const result = await pool.query(sql, params);
            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            return {
                success: false,
                error: `执行查询失败: ${(error as Error).message}`
            };
        }
    }
}

// 导出服务实例
export const postgresService = new PostgresService();

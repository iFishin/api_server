import { pool } from '../config/postgres';
import { QueryResult } from 'pg';

/**
 * 用户数据接口
 */
export interface User {
    id?: number;
    name: string;
    email: string;
    age?: number;
    created_at?: Date;
    updated_at?: Date;
}

/**
 * PostgreSQL 服务类
 * 提供完整的 CRUD 操作示例
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
     * 创建用户 (CREATE)
     */
    async createUser(user: User): Promise<{ success: boolean; data?: User; error?: string }> {
        const query = `
            INSERT INTO users (name, email, age)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        
        try {
            const result: QueryResult<User> = await pool.query(query, [
                user.name,
                user.email,
                user.age || null
            ]);
            
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            const err = error as any;
            if (err.code === '23505') { // 唯一约束违反
                return {
                    success: false,
                    error: '该邮箱已被使用'
                };
            }
            return {
                success: false,
                error: `创建用户失败: ${err.message}`
            };
        }
    }
    
    /**
     * 获取所有用户 (READ ALL)
     */
    async getAllUsers(limit: number = 100, offset: number = 0): Promise<{ success: boolean; data?: User[]; total?: number; error?: string }> {
        try {
            // 获取总数
            const countResult = await pool.query('SELECT COUNT(*) FROM users');
            const total = parseInt(countResult.rows[0].count);
            
            // 获取分页数据
            const query = `
                SELECT * FROM users
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            `;
            const result: QueryResult<User> = await pool.query(query, [limit, offset]);
            
            return {
                success: true,
                data: result.rows,
                total
            };
        } catch (error) {
            return {
                success: false,
                error: `获取用户列表失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 根据 ID 获取用户 (READ ONE)
     */
    async getUserById(id: number): Promise<{ success: boolean; data?: User; error?: string }> {
        const query = 'SELECT * FROM users WHERE id = $1';
        
        try {
            const result: QueryResult<User> = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '用户不存在'
                };
            }
            
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            return {
                success: false,
                error: `获取用户失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 根据邮箱搜索用户
     */
    async searchUsersByEmail(email: string): Promise<{ success: boolean; data?: User[]; error?: string }> {
        const query = `
            SELECT * FROM users
            WHERE email ILIKE $1
            ORDER BY created_at DESC
        `;
        
        try {
            const result: QueryResult<User> = await pool.query(query, [`%${email}%`]);
            
            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            return {
                success: false,
                error: `搜索用户失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 更新用户 (UPDATE)
     */
    async updateUser(id: number, updates: Partial<User>): Promise<{ success: boolean; data?: User; error?: string }> {
        // 动态构建更新语句
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        if (updates.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            fields.push(`email = $${paramIndex++}`);
            values.push(updates.email);
        }
        if (updates.age !== undefined) {
            fields.push(`age = $${paramIndex++}`);
            values.push(updates.age);
        }
        
        if (fields.length === 0) {
            return {
                success: false,
                error: '没有需要更新的字段'
            };
        }
        
        values.push(id);
        const query = `
            UPDATE users
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        try {
            const result: QueryResult<User> = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '用户不存在'
                };
            }
            
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            const err = error as any;
            if (err.code === '23505') {
                return {
                    success: false,
                    error: '该邮箱已被使用'
                };
            }
            return {
                success: false,
                error: `更新用户失败: ${err.message}`
            };
        }
    }
    
    /**
     * 删除用户 (DELETE)
     */
    async deleteUser(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        
        try {
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: '用户不存在'
                };
            }
            
            return {
                success: true,
                message: '用户删除成功'
            };
        } catch (error) {
            return {
                success: false,
                error: `删除用户失败: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * 批量创建用户（事务示例）
     */
    async batchCreateUsers(users: User[]): Promise<{ success: boolean; data?: User[]; error?: string }> {
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

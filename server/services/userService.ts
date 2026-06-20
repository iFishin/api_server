import { pool } from '../config/postgres';
import { QueryResult } from 'pg';

export interface User {
    id?: number;
    name: string;
    email: string;
    age?: number;
    created_at?: Date;
    updated_at?: Date;
}

/**
 * 用户服务类
 * 使用 PostgreSQL 进行用户管理
 */
export class UserService {
    
    /**
     * 获取所有用户
     */
    async getAllUsers(): Promise<User[]> {
        const query = 'SELECT * FROM users ORDER BY id DESC';
        
        try {
            const result: QueryResult<User> = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('获取用户列表失败:', error);
            throw new Error(`获取用户列表失败: ${(error as Error).message}`);
        }
    }
    
    /**
     * 根据 ID 获取用户
     */
    async getUserById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        
        try {
            const result: QueryResult<User> = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('获取用户失败:', error);
            throw new Error(`获取用户失败: ${(error as Error).message}`);
        }
    }
    
    /**
     * 创建用户
     */
    async createUser(user: User): Promise<User> {
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
            
            return result.rows[0];
        } catch (error) {
            const err = error as any;
            if (err.code === '23505') { // 唯一约束违反
                throw new Error('该邮箱已被使用');
            }
            throw new Error(`创建用户失败: ${err.message}`);
        }
    }
    
    /**
     * 更新用户
     */
    async updateUser(id: number, user: User): Promise<User | null> {
        const query = `
            UPDATE users 
            SET name = $1, email = $2, age = $3
            WHERE id = $4
            RETURNING *
        `;
        
        try {
            const result: QueryResult<User> = await pool.query(query, [
                user.name,
                user.email,
                user.age || null,
                id
            ]);
            
            return result.rows[0] || null;
        } catch (error) {
            const err = error as any;
            if (err.code === '23505') {
                throw new Error('该邮箱已被使用');
            }
            throw new Error(`更新用户失败: ${err.message}`);
        }
    }
    
    /**
     * 删除用户
     */
    async deleteUser(id: number): Promise<boolean> {
        const query = 'DELETE FROM users WHERE id = $1';
        
        try {
            const result = await pool.query(query, [id]);
            return (result.rowCount || 0) > 0;
        } catch (error) {
            console.error('删除用户失败:', error);
            throw new Error(`删除用户失败: ${(error as Error).message}`);
        }
    }
}

import { Request, Response } from 'express';
import { postgresService } from '../services/postgresService';

/**
 * PostgreSQL 控制器
 * 处理所有与 PostgreSQL 相关的 HTTP 请求
 */
export class PostgresController {
    
    /**
     * 初始化数据库
     * POST /api/postgres/init
     */
    async initDatabase(req: Request, res: Response) {
        try {
            const result = await postgresService.initDatabase();
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 创建用户
     * POST /api/postgres/users
     * Body: { name: string, email: string, age?: number }
     */
    async createUser(req: Request, res: Response) {
        try {
            const { name, email, age } = req.body;
            
            // 验证必填字段
            if (!name || !email) {
                res.status(400).json({
                    success: false,
                    error: 'name 和 email 是必填字段'
                });
                return;
            }
            
            const result = await postgresService.createUser({ name, email, age });
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取所有用户
     * GET /api/postgres/users?limit=100&offset=0
     */
    async getAllUsers(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;
            
            const result = await postgresService.getAllUsers(limit, offset);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 根据 ID 获取用户
     * GET /api/postgres/users/:id
     */
    async getUserById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的用户 ID'
                });
                return;
            }
            
            const result = await postgresService.getUserById(id);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 搜索用户
     * GET /api/postgres/users/search?email=example
     */
    async searchUsers(req: Request, res: Response) {
        try {
            const email = req.query.email as string;
            
            if (!email) {
                res.status(400).json({
                    success: false,
                    error: 'email 参数是必填的'
                });
                return;
            }
            
            const result = await postgresService.searchUsersByEmail(email);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 更新用户
     * PUT /api/postgres/users/:id
     * Body: { name?: string, email?: string, age?: number }
     */
    async updateUser(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的用户 ID'
                });
                return;
            }
            
            const updates = req.body;
            const result = await postgresService.updateUser(id, updates);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 删除用户
     * DELETE /api/postgres/users/:id
     */
    async deleteUser(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的用户 ID'
                });
                return;
            }
            
            const result = await postgresService.deleteUser(id);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 批量创建用户
     * POST /api/postgres/users/batch
     * Body: { users: [{ name: string, email: string, age?: number }] }
     */
    async batchCreateUsers(req: Request, res: Response) {
        try {
            const { users } = req.body;
            
            if (!Array.isArray(users) || users.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'users 必须是非空数组'
                });
                return;
            }
            
            const result = await postgresService.batchCreateUsers(users);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取统计信息
     * GET /api/postgres/statistics
     */
    async getStatistics(req: Request, res: Response) {
        try {
            const result = await postgresService.getStatistics();
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    
    /**
     * 执行原始查询（仅供开发测试）
     * POST /api/postgres/query
     * Body: { sql: string, params?: any[] }
     */
    async executeQuery(req: Request, res: Response) {
        try {
            const { sql, params } = req.body;
            
            if (!sql) {
                res.status(400).json({
                    success: false,
                    error: 'sql 参数是必填的'
                });
                return;
            }
            
            // 生产环境建议禁用此接口或添加权限验证
            if (process.env.NODE_ENV === 'production') {
                res.status(403).json({
                    success: false,
                    error: '生产环境不允许执行原始查询'
                });
                return;
            }
            
            const result = await postgresService.executeRawQuery(sql, params || []);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
}

// 导出控制器实例
export const postgresController = new PostgresController();

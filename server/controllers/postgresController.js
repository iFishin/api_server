"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgresController = exports.PostgresController = void 0;
const postgresService_1 = require("../services/postgresService");
const userService_1 = require("../services/userService");
/**
 * PostgreSQL 控制器
 * 处理所有与 PostgreSQL 相关的 HTTP 请求
 */
class PostgresController {
    /**
     * 初始化数据库
     * POST /api/postgres/init
     */
    async initDatabase(req, res) {
        try {
            const result = await postgresService_1.postgresService.initDatabase();
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(500).json(result);
            }
        }
        catch (error) {
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
    async createUser(req, res) {
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
            const user = await userService_1.userService.createUser({ name, email, age });
            res.status(201).json({ success: true, data: user });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    /**
     * 获取所有用户
     * GET /api/postgres/users?limit=100&offset=0
     */
    async getAllUsers(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const users = await userService_1.userService.getAllUsers();
            // userService 默认按 id DESC 排序，这里做分页
            const paged = users.slice(offset, offset + limit);
            res.status(200).json({ success: true, data: paged, total: users.length });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, error: '无效的用户 ID' });
                return;
            }
            const user = await userService_1.userService.getUserById(id);
            if (user) {
                res.status(200).json({ success: true, data: user });
            }
            else {
                res.status(404).json({ success: false, error: '用户不存在' });
            }
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async searchUsers(req, res) {
        try {
            const email = req.query.email;
            if (!email) {
                res.status(400).json({ success: false, error: 'email 参数是必填的' });
                return;
            }
            const users = await userService_1.userService.getAllUsers();
            const filtered = users.filter(u => u.email?.toLowerCase().includes(email.toLowerCase()));
            res.status(200).json({ success: true, data: filtered });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, error: '无效的用户 ID' });
                return;
            }
            const updatedUser = await userService_1.userService.updateUser(id, req.body);
            if (updatedUser) {
                res.status(200).json({ success: true, data: updatedUser });
            }
            else {
                res.status(404).json({ success: false, error: '用户不存在' });
            }
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, error: '无效的用户 ID' });
                return;
            }
            await userService_1.userService.deleteUser(id);
            res.status(200).json({ success: true, message: '用户删除成功' });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    /**
     * 批量创建用户
     * POST /api/postgres/users/batch
     * Body: { users: [{ name: string, email: string, age?: number }] }
     */
    async batchCreateUsers(req, res) {
        try {
            const { users } = req.body;
            if (!Array.isArray(users) || users.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'users 必须是非空数组'
                });
                return;
            }
            const result = await postgresService_1.postgresService.batchCreateUsers(users);
            if (result.success) {
                res.status(201).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
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
    async getStatistics(req, res) {
        try {
            const result = await postgresService_1.postgresService.getStatistics();
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(500).json(result);
            }
        }
        catch (error) {
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
    async executeQuery(req, res) {
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
            const result = await postgresService_1.postgresService.executeRawQuery(sql, params || []);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
}
exports.PostgresController = PostgresController;
// 导出控制器实例
exports.postgresController = new PostgresController();

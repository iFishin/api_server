"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = exports.MessageController = void 0;
const messageService_1 = require("../services/messageService");
/**
 * 留言板控制器
 */
class MessageController {
    /**
     * 初始化数据库
     * POST /api/messages/init
     */
    async initDatabase(req, res) {
        try {
            const result = await messageService_1.messageService.initDatabase();
            res.status(result.success ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 创建留言
     * POST /api/messages
     */
    async createMessage(req, res) {
        try {
            const { user_name, email, content, parent_id } = req.body;
            if (!user_name || !content) {
                res.status(400).json({
                    success: false,
                    error: 'user_name 和 content 是必填字段'
                });
                return;
            }
            // 获取 IP 和 User-Agent
            const ip_address = req.ip || req.connection.remoteAddress;
            const user_agent = req.get('User-Agent');
            const result = await messageService_1.messageService.createMessage({
                user_name,
                email,
                content,
                parent_id,
                ip_address,
                user_agent
            });
            res.status(result.success ? 201 : 400).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 获取所有留言
     * GET /api/messages?limit=20&offset=0&status=approved&parentId=null&sortBy=created_at&sortOrder=DESC
     */
    async getAllMessages(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;
            const status = req.query.status || 'approved';
            const sortBy = req.query.sortBy || 'created_at';
            const sortOrder = req.query.sortOrder || 'DESC';
            let parentId = undefined;
            if (req.query.parentId !== undefined) {
                parentId = req.query.parentId === 'null' ? null : parseInt(req.query.parentId);
            }
            const result = await messageService_1.messageService.getAllMessages({
                limit,
                offset,
                status,
                parentId,
                sortBy,
                sortOrder
            });
            res.status(result.success ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 获取留言树（包含回复）
     * GET /api/messages/tree?limit=20&offset=0
     */
    async getMessageTree(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;
            const result = await messageService_1.messageService.getMessageTree(limit, offset);
            res.status(result.success ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 根据 ID 获取留言
     * GET /api/messages/:id
     */
    async getMessageById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            const result = await messageService_1.messageService.getMessageById(id);
            res.status(result.success ? 200 : 404).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 获取某条留言的所有回复
     * GET /api/messages/:id/replies
     */
    async getMessageReplies(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            const result = await messageService_1.messageService.getMessageReplies(id);
            res.status(result.success ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 更新留言
     * PUT /api/messages/:id
     */
    async updateMessage(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            const result = await messageService_1.messageService.updateMessage(id, req.body);
            res.status(result.success ? 200 : 400).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 删除留言
     * DELETE /api/messages/:id?hard=false
     */
    async deleteMessage(req, res) {
        try {
            const id = parseInt(req.params.id);
            const hard = req.query.hard === 'true';
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            const result = await messageService_1.messageService.deleteMessage(id, hard);
            res.status(result.success ? 200 : 404).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 点赞留言
     * POST /api/messages/:id/like
     */
    async likeMessage(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            const result = await messageService_1.messageService.likeMessage(id);
            res.status(result.success ? 200 : 404).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 取消点赞
     * POST /api/messages/:id/unlike
     */
    async unlikeMessage(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            const result = await messageService_1.messageService.unlikeMessage(id);
            res.status(result.success ? 200 : 404).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 置顶/取消置顶留言
     * POST /api/messages/:id/pin
     */
    async pinMessage(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { is_pinned } = req.body;
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            if (typeof is_pinned !== 'boolean') {
                res.status(400).json({
                    success: false,
                    error: 'is_pinned 必须是布尔值'
                });
                return;
            }
            const result = await messageService_1.messageService.pinMessage(id, is_pinned);
            res.status(result.success ? 200 : 404).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 审核留言
     * POST /api/messages/:id/review
     */
    async reviewMessage(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: '无效的留言 ID'
                });
                return;
            }
            if (status !== 'approved' && status !== 'rejected') {
                res.status(400).json({
                    success: false,
                    error: 'status 必须是 approved 或 rejected'
                });
                return;
            }
            const result = await messageService_1.messageService.reviewMessage(id, status);
            res.status(result.success ? 200 : 404).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 搜索留言
     * GET /api/messages/search?keyword=xxx&limit=20&offset=0
     */
    async searchMessages(req, res) {
        try {
            const keyword = req.query.keyword;
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;
            if (!keyword) {
                res.status(400).json({
                    success: false,
                    error: 'keyword 参数是必填的'
                });
                return;
            }
            const result = await messageService_1.messageService.searchMessages(keyword, limit, offset);
            res.status(result.success ? 200 : 500).json(result);
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
     * GET /api/messages/statistics
     */
    async getStatistics(req, res) {
        try {
            const result = await messageService_1.messageService.getStatistics();
            res.status(result.success ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 批量删除留言
     * POST /api/messages/batch-delete
     */
    async batchDeleteMessages(req, res) {
        try {
            const { ids, hard } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'ids 必须是非空数组'
                });
                return;
            }
            const result = await messageService_1.messageService.batchDeleteMessages(ids, hard || false);
            res.status(result.success ? 200 : 400).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
    /**
     * 获取热门留言
     * GET /api/messages/hot?limit=10
     */
    async getHotMessages(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const result = await messageService_1.messageService.getHotMessages(limit);
            res.status(result.success ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '服务器内部错误'
            });
        }
    }
}
exports.MessageController = MessageController;
exports.messageController = new MessageController();

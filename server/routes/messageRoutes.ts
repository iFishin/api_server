import express from 'express';
import { messageController } from '../controllers/messageController';

const router = express.Router();

/**
 * 留言板 API 路由
 * 基础路径: /api/messages
 */

// 初始化数据库
router.post('/init', (req, res) => messageController.initDatabase(req, res));

// 留言 CRUD 操作
router.post('/', (req, res) => messageController.createMessage(req, res));
router.get('/', (req, res) => messageController.getAllMessages(req, res));
router.get('/tree', (req, res) => messageController.getMessageTree(req, res));
router.get('/search', (req, res) => messageController.searchMessages(req, res));
router.get('/statistics', (req, res) => messageController.getStatistics(req, res));
router.get('/hot', (req, res) => messageController.getHotMessages(req, res));
router.get('/:id', (req, res) => messageController.getMessageById(req, res));
router.get('/:id/replies', (req, res) => messageController.getMessageReplies(req, res));
router.put('/:id', (req, res) => messageController.updateMessage(req, res));
router.delete('/:id', (req, res) => messageController.deleteMessage(req, res));

// 留言互动操作
router.post('/:id/like', (req, res) => messageController.likeMessage(req, res));
router.post('/:id/unlike', (req, res) => messageController.unlikeMessage(req, res));
router.post('/:id/pin', (req, res) => messageController.pinMessage(req, res));
router.post('/:id/review', (req, res) => messageController.reviewMessage(req, res));

// 批量操作
router.post('/batch-delete', (req, res) => messageController.batchDeleteMessages(req, res));

export default router;

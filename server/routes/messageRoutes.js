"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const router = express_1.default.Router();
/**
 * 留言板 API 路由
 * 基础路径: /api/messages
 */
// 初始化数据库
router.post('/init', (req, res) => messageController_1.messageController.initDatabase(req, res));
// 留言 CRUD 操作
router.post('/', (req, res) => messageController_1.messageController.createMessage(req, res));
router.get('/', (req, res) => messageController_1.messageController.getAllMessages(req, res));
router.get('/tree', (req, res) => messageController_1.messageController.getMessageTree(req, res));
router.get('/search', (req, res) => messageController_1.messageController.searchMessages(req, res));
router.get('/statistics', (req, res) => messageController_1.messageController.getStatistics(req, res));
router.get('/hot', (req, res) => messageController_1.messageController.getHotMessages(req, res));
router.get('/:id', (req, res) => messageController_1.messageController.getMessageById(req, res));
router.get('/:id/replies', (req, res) => messageController_1.messageController.getMessageReplies(req, res));
router.put('/:id', (req, res) => messageController_1.messageController.updateMessage(req, res));
router.delete('/:id', (req, res) => messageController_1.messageController.deleteMessage(req, res));
// 留言互动操作
router.post('/:id/like', (req, res) => messageController_1.messageController.likeMessage(req, res));
router.post('/:id/unlike', (req, res) => messageController_1.messageController.unlikeMessage(req, res));
router.post('/:id/pin', (req, res) => messageController_1.messageController.pinMessage(req, res));
router.post('/:id/review', (req, res) => messageController_1.messageController.reviewMessage(req, res));
// 批量操作
router.post('/batch-delete', (req, res) => messageController_1.messageController.batchDeleteMessages(req, res));
exports.default = router;

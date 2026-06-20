"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postgresController_1 = require("../controllers/postgresController");
const router = express_1.default.Router();
/**
 * PostgreSQL API 路由
 * 基础路径: /api/postgres
 */
// 初始化数据库表
router.post('/init', (req, res) => postgresController_1.postgresController.initDatabase(req, res));
// 用户 CRUD 操作
router.post('/users', (req, res) => postgresController_1.postgresController.createUser(req, res));
router.get('/users', (req, res) => postgresController_1.postgresController.getAllUsers(req, res));
router.get('/users/search', (req, res) => postgresController_1.postgresController.searchUsers(req, res));
router.get('/users/:id', (req, res) => postgresController_1.postgresController.getUserById(req, res));
router.put('/users/:id', (req, res) => postgresController_1.postgresController.updateUser(req, res));
router.delete('/users/:id', (req, res) => postgresController_1.postgresController.deleteUser(req, res));
// 批量操作
router.post('/users/batch', (req, res) => postgresController_1.postgresController.batchCreateUsers(req, res));
// 统计信息
router.get('/statistics', (req, res) => postgresController_1.postgresController.getStatistics(req, res));
// 原始查询（开发环境）
router.post('/query', (req, res) => postgresController_1.postgresController.executeQuery(req, res));
exports.default = router;

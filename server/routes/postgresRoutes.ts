import express from 'express';
import { postgresController } from '../controllers/postgresController';

const router = express.Router();

/**
 * PostgreSQL API 路由
 * 基础路径: /api/postgres
 */

// 初始化数据库表
router.post('/init', (req, res) => postgresController.initDatabase(req, res));

// 用户 CRUD 操作
router.post('/users', (req, res) => postgresController.createUser(req, res));
router.get('/users', (req, res) => postgresController.getAllUsers(req, res));
router.get('/users/search', (req, res) => postgresController.searchUsers(req, res));
router.get('/users/:id', (req, res) => postgresController.getUserById(req, res));
router.put('/users/:id', (req, res) => postgresController.updateUser(req, res));
router.delete('/users/:id', (req, res) => postgresController.deleteUser(req, res));

// 批量操作
router.post('/users/batch', (req, res) => postgresController.batchCreateUsers(req, res));

// 统计信息
router.get('/statistics', (req, res) => postgresController.getStatistics(req, res));

// 原始查询（开发环境）
router.post('/query', (req, res) => postgresController.executeQuery(req, res));

export default router;

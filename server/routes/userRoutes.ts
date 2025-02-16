import express, { Request, Response, NextFunction } from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/userController';

const router = express.Router();

// 获取所有用户
router.get('/', getAllUsers);

// 根据 ID 获取用户
router.get('/:id', getUserById);

// 创建用户
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createUser(req, res);
    } catch (error) {
        next(error);
    }
});

// 更新用户
router.put('/:id', updateUser);

// 删除用户
router.delete('/:id', deleteUser);

export default router;
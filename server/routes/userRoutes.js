"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// 获取所有用户
router.get('/', userController_1.getAllUsers);
// 根据 ID 获取用户
router.get('/:id', userController_1.getUserById);
// 创建用户
router.post('/', async (req, res, next) => {
    try {
        await (0, userController_1.createUser)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// 更新用户
router.put('/:id', userController_1.updateUser);
// 删除用户
router.delete('/:id', userController_1.deleteUser);
exports.default = router;

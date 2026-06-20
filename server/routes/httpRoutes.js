"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const httpController = __importStar(require("@controllers/httpController"));
const overtimeController_1 = require("@controllers/overtimeController");
// 配置文件上传
const upload = (0, multer_1.default)({ dest: 'temps/' });
const router = (0, express_1.Router)();
// 原始数据中间件 - 用于处理 PUT 文件接口
const rawDataMiddleware = (req, res, next) => {
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    });
    req.on('end', () => {
        // 将原始数据存储到 req.rawBody
        req.rawBody = data;
        next();
    });
    req.on('error', (err) => {
        next(err);
    });
};
// API 文档已经移到专门的路由 /api/docs
// 文件操作路由
router.get('/files', httpController.getFiles);
router.delete('/files/:filename', httpController.deleteFile);
router.post('/upload', upload.single('file'), httpController.uploadFile);
router.get('/files/:filename/download', httpController.downloadFile);
router.put('/put_file/:filename', rawDataMiddleware, httpController.put_file);
// 基础 HTTP 路由
router.get('/', httpController.getDefault);
router.get('/query', httpController.getQuery);
router.get('/params/:id', httpController.getParams);
router.get('/status/:code', httpController.getStatusCode);
router.get('/delay/:ms', httpController.getDelay);
router.get('/headers', httpController.getHeaders);
router.get('/echo-headers', httpController.getEchoHeaders);
// 数据负载路由（参数化，替代原先 8 条独立路由）
router.get('/payload/:size', httpController.getPayload);
// HTTP 测试路由
router.get('/test/get', httpController.get_basic);
router.post('/test/post', httpController.post_basic);
router.put('/test/put', httpController.put_basic);
router.delete('/test/delete', httpController.delete_basic);
router.patch('/test/patch', httpController.patch_basic);
router.options('/test/options', httpController.options_basic);
router.head('/test/head', httpController.head_basic);
router.post('/test/json', httpController.postJson);
router.post('/test/form', upload.none(), httpController.postForm);
// 其他 接口
router.post('/overtime/calculate', overtimeController_1.handleCalculateOvertime);
// 支持GET请求的加班计算（通过查询参数）
router.get('/overtime/calculate', overtimeController_1.handleCalculateOvertime);
// TODO: JSON文件管理路由 - 需要修复TypeScript类型问题
// router.get('/files/list', httpController.listJsonFiles);
// router.get('/files/read', httpController.readJsonFile);
// router.post('/files/save', httpController.saveJsonFile);
exports.default = router;

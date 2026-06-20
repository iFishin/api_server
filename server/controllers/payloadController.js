"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get8M = exports.get4M = exports.get2M = exports.get1M = exports.get8K = exports.get4K = exports.get2K = exports.get1K = exports.getPayload = exports.PayloadController = void 0;
const httpServices_1 = require("@services/httpServices");
const apiDocService_1 = require("@services/apiDocService");
/**
 * 数据负载控制器
 * 提供 1KB ~ 8MB 的数据负载用于测试
 */
class PayloadController {
    constructor() {
        this.registerApiDocs();
    }
    registerApiDocs() {
        ['1k', '2k', '4k', '8k', '1m', '2m', '4m', '8m'].forEach(size => {
            (0, apiDocService_1.registerApiDoc)({
                operationId: `get${size.toUpperCase()}`,
                tags: ['数据负载'],
                summary: `获取 ${size.toUpperCase()} 数据`,
                description: `返回 ${size.toUpperCase()} 大小的数据`,
                method: 'GET',
                path: `/api/http/payload/${size}`,
                responses: { '200': { description: '成功响应', content: { 'text/plain': { schema: { type: 'string' } } } } }
            });
        });
    }
    /**
     * 通用 payload 路由（支持 1k/2k/4k/8k/1m/2m/4m/8m）
     */
    getPayload(req, res) {
        const sizeParam = req.params.size.toLowerCase();
        const sizeMap = {
            '1k': 1, '2k': 2, '4k': 4, '8k': 8,
            '1m': 1024, '2m': 2048, '4m': 4096, '8m': 8192,
        };
        const kb = sizeMap[sizeParam];
        if (!kb) {
            res.status(400).json({ error: 'Invalid payload size. Use: 1k, 2k, 4k, 8k, 1m, 2m, 4m, 8m' });
            return;
        }
        res.status(200).send(httpServices_1.payloadService.getData(kb));
    }
}
exports.PayloadController = PayloadController;
const payloadController = new PayloadController();
exports.getPayload = payloadController.getPayload;
// 保留旧接口以兼容路由
const get1K = (req, res) => payloadController.getPayload({ ...req, params: { size: '1k' } }, res);
exports.get1K = get1K;
const get2K = (req, res) => payloadController.getPayload({ ...req, params: { size: '2k' } }, res);
exports.get2K = get2K;
const get4K = (req, res) => payloadController.getPayload({ ...req, params: { size: '4k' } }, res);
exports.get4K = get4K;
const get8K = (req, res) => payloadController.getPayload({ ...req, params: { size: '8k' } }, res);
exports.get8K = get8K;
const get1M = (req, res) => payloadController.getPayload({ ...req, params: { size: '1m' } }, res);
exports.get1M = get1M;
const get2M = (req, res) => payloadController.getPayload({ ...req, params: { size: '2m' } }, res);
exports.get2M = get2M;
const get4M = (req, res) => payloadController.getPayload({ ...req, params: { size: '4m' } }, res);
exports.get4M = get4M;
const get8M = (req, res) => payloadController.getPayload({ ...req, params: { size: '8m' } }, res);
exports.get8M = get8M;

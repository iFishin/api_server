"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTags = exports.getDocsByTag = exports.getAllDocs = exports.ApiDocController = void 0;
const apiDocService_1 = require("@services/apiDocService");
/**
 * API 文档控制器
 */
class ApiDocController {
    /**
     * 获取所有 API 文档
     */
    getAllDocs(req, res) {
        const docs = (0, apiDocService_1.getApiDocs)();
        res.status(200).json(docs);
    }
    /**
     * 根据标签获取 API 文档
     */
    getDocsByTag(req, res) {
        const { tag } = req.params;
        const docs = (0, apiDocService_1.getApiDocsByTag)(tag);
        res.status(200).json(docs);
    }
    /**
     * 获取所有可用的 API 标签
     */
    getAllTags(req, res) {
        const tags = (0, apiDocService_1.getApiTags)();
        res.status(200).json(tags);
    }
}
exports.ApiDocController = ApiDocController;
// 创建控制器实例
const apiDocController = new ApiDocController();
// 导出控制器方法
exports.getAllDocs = apiDocController.getAllDocs, exports.getDocsByTag = apiDocController.getDocsByTag, exports.getAllTags = apiDocController.getAllTags;

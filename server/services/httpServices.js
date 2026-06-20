"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpTestService = exports.payloadService = exports.httpService = exports.fileService = exports.HttpTestService = exports.PayloadService = exports.HttpService = exports.FileService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
// 转换回调函数为 Promise
const readdir = (0, util_1.promisify)(fs_1.default.readdir);
const unlink = (0, util_1.promisify)(fs_1.default.unlink);
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
/**
 * 文件系统服务
 */
class FileService {
    tempDir;
    constructor() {
        this.tempDir = path_1.default.join(__dirname, '../temps');
        // 确保临时目录存在
        if (!fs_1.default.existsSync(this.tempDir)) {
            fs_1.default.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    /**
     * 获取所有文件
     */
    async getFiles() {
        try {
            const files = await readdir(this.tempDir);
            return { success: true, files };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    /**
     * 删除文件
     */
    async deleteFile(filename) {
        const filePath = path_1.default.join(this.tempDir, filename);
        try {
            await unlink(filePath);
            return { success: true, message: 'File deleted successfully' };
        }
        catch (err) {
            const error = err;
            if (error.code === 'ENOENT') {
                return { success: false, error: 'File not found', status: 404 };
            }
            return { success: false, error: error.message };
        }
    }
    /**
     * 上传文件
     */
    async uploadFile(file) {
        if (!file) {
            return { success: false, error: 'No file uploaded', status: 400 };
        }
        const filePath = path_1.default.join(this.tempDir, file.originalname);
        try {
            await writeFile(filePath, file.buffer);
            return {
                success: true,
                message: 'File uploaded successfully',
                filename: file.originalname
            };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    /**
     * PUT 方式创建文件
     */
    async putFile(filename, content) {
        const filePath = path_1.default.join(this.tempDir, filename);
        try {
            await writeFile(filePath, content, 'utf8');
            return {
                success: true,
                message: 'File created successfully',
                filename: filename,
                filePath: filePath
            };
        }
        catch (err) {
            return {
                success: false,
                message: `Failed to create file: ${err.message}`,
                error: err.message
            };
        }
    }
}
exports.FileService = FileService;
/**
 * 基础HTTP服务
 */
class HttpService {
    /**
     * 处理默认请求
     */
    getDefault() {
        return { message: "Basic GET request successful" };
    }
    /**
     * 处理查询参数
     */
    getQuery(name, age) {
        return {
            message: "GET with query params",
            data: { name, age }
        };
    }
    /**
     * 处理路径参数
     */
    getParams(id) {
        return {
            message: "GET with URL params",
            id
        };
    }
}
exports.HttpService = HttpService;
/**
 * 数据负载生成服务
 */
class PayloadService {
    /**
     * 生成重复字符串
     */
    generateRepeatedString(size) {
        const baseString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const repeats = Math.ceil(size / baseString.length);
        return baseString.repeat(repeats).slice(0, size);
    }
    /**
     * 获取指定大小的数据
     */
    getData(sizeInKB) {
        return this.generateRepeatedString(sizeInKB * 1024);
    }
}
exports.PayloadService = PayloadService;
/**
 * HTTP测试服务
 */
class HttpTestService {
    // 基础HTTP方法测试
    testBasicGet(req) {
        return {
            test: "Basic GET request",
            passed: true,
            request_received: {
                method: req.method,
                headers: req.headers,
                query: req.query
            }
        };
    }
    testBasicPost(req) {
        return {
            test: "Basic POST request",
            passed: true,
            request_received: {
                method: req.method,
                headers: req.headers,
                body: req.body
            }
        };
    }
}
exports.HttpTestService = HttpTestService;
// 导出服务实例，方便在控制器中使用
exports.fileService = new FileService();
exports.httpService = new HttpService();
exports.payloadService = new PayloadService();
exports.httpTestService = new HttpTestService();

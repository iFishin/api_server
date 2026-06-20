"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.put_file = exports.downloadFile = exports.uploadFile = exports.deleteFile = exports.getFiles = exports.FileController = exports.saveJsonFile = exports.readJsonFile = exports.listJsonFiles = void 0;
const httpServices_1 = require("@services/httpServices");
const apiDocService_1 = require("@services/apiDocService");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/** JSON 文件管理函数 - 从原 httpController 迁移 */
const listJsonFiles = (req, res) => {
    try {
        const { directory = '', extension = '' } = req.query;
        const targetDir = path_1.default.join(process.cwd(), directory);
        if (!fs_1.default.existsSync(targetDir)) {
            return res.json({ success: false, error: '目录不存在' });
        }
        const files = fs_1.default.readdirSync(targetDir)
            .filter(file => {
            const filePath = path_1.default.join(targetDir, file);
            const isFile = fs_1.default.statSync(filePath).isFile();
            const hasExtension = extension ? file.endsWith(extension) : true;
            return isFile && hasExtension;
        })
            .sort();
        res.json({ success: true, files });
    }
    catch (error) {
        res.json({ success: false, error: error.message });
    }
};
exports.listJsonFiles = listJsonFiles;
const readJsonFile = (req, res) => {
    try {
        const { path: filePath } = req.query;
        if (!filePath)
            return res.json({ success: false, error: '缺少文件路径参数' });
        const fullPath = path_1.default.join(process.cwd(), filePath);
        if (!fs_1.default.existsSync(fullPath))
            return res.json({ success: false, error: '文件不存在' });
        const content = fs_1.default.readFileSync(fullPath, 'utf-8');
        res.json({ success: true, content });
    }
    catch (error) {
        res.json({ success: false, error: error.message });
    }
};
exports.readJsonFile = readJsonFile;
const saveJsonFile = (req, res) => {
    try {
        const { filename, content, directory = '' } = req.body;
        if (!filename || content === undefined)
            return res.json({ success: false, error: '缺少必要参数' });
        const targetDir = path_1.default.join(process.cwd(), directory);
        if (!fs_1.default.existsSync(targetDir))
            fs_1.default.mkdirSync(targetDir, { recursive: true });
        const filePath = path_1.default.join(targetDir, filename);
        fs_1.default.writeFileSync(filePath, content, 'utf-8');
        res.json({ success: true, message: '文件保存成功', path: filePath });
    }
    catch (error) {
        res.json({ success: false, error: error.message });
    }
};
exports.saveJsonFile = saveJsonFile;
/**
 * 文件管理控制器
 */
class FileController {
    constructor() {
        this.registerApiDocs();
    }
    registerApiDocs() {
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'getFiles',
            tags: ['文件管理'],
            summary: '获取文件列表',
            description: '获取服务器上的所有文件',
            method: 'GET',
            path: '/api/http/files',
            responses: {
                '200': { description: '成功获取文件列表', content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } } },
                '500': { description: '服务器错误', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } }
            }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'deleteFile',
            tags: ['文件管理'],
            summary: '删除文件',
            description: '删除服务器上指定的文件',
            method: 'DELETE',
            path: '/api/http/files/{filename}',
            parameters: [{ name: 'filename', in: 'path', required: true, description: '要删除的文件名', schema: { type: 'string' } }],
            responses: {
                '200': { description: '文件删除成功', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
                '404': { description: '文件不存在', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
                '500': { description: '服务器错误', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } }
            }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'uploadFile',
            tags: ['文件管理'],
            summary: '上传文件',
            description: '上传文件到服务器',
            method: 'POST',
            path: '/api/http/upload',
            requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } },
            responses: {
                '200': { description: '文件上传成功', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, filename: { type: 'string' } } } } } },
                '400': { description: '未提供文件', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
                '500': { description: '服务器错误', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } }
            }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'putFile',
            tags: ['文件管理'],
            summary: 'PUT 方式创建文件',
            description: '使用 PUT 请求创建文件，将请求体数据写入到 .txt 文件',
            method: 'PUT',
            path: '/api/http/put_file/{filename}',
            parameters: [{ name: 'filename', in: 'path', required: true, description: '文件名（会自动添加 .txt 扩展名）', schema: { type: 'string' } }],
            requestBody: { required: true, description: '要写入文件的原始文本数据', content: { 'text/plain': { schema: { type: 'string', example: '这是要写入文件的原始文本内容\n可以是多行文本\n支持换行符等特殊字符' } } } },
            responses: {
                '200': { description: '文件创建成功', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, filename: { type: 'string' }, data: { type: 'string', description: '写入文件的实际内容' }, filePath: { type: 'string' }, contentLength: { type: 'integer', description: '内容长度（字符数）' } } } } } },
                '400': { description: '请求体为空或无效', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
                '500': { description: '服务器错误', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, error: { type: 'string' } } } } } }
            }
        });
    }
    async getFiles(req, res) {
        const result = await httpServices_1.fileService.getFiles();
        if (result.success) {
            res.status(200).json(result.files);
        }
        else {
            res.status(500).json({ message: result.error });
        }
    }
    async deleteFile(req, res) {
        const { filename } = req.params;
        const result = await httpServices_1.fileService.deleteFile(filename);
        if (result.success) {
            res.status(200).json({ message: result.message });
        }
        else {
            res.status(result.status || 500).json({ message: result.error });
        }
    }
    async uploadFile(req, res) {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const result = await httpServices_1.fileService.uploadFile(req.file);
        if (result.success) {
            res.status(200).json({ message: result.message, filename: result.filename });
        }
        else {
            res.status(result.status || 500).json({ message: result.error });
        }
    }
    async downloadFile(req, res) {
        const { filename } = req.params;
        const filePath = path_1.default.join(__dirname, '../temps', filename);
        try {
            await fs_1.default.promises.access(filePath, fs_1.default.constants.F_OK);
            res.download(filePath, filename, (err) => {
                if (err)
                    res.status(500).json({ message: 'Error downloading file' });
            });
        }
        catch {
            res.status(404).json({ message: 'File not found' });
        }
    }
    async put_file(req, res) {
        try {
            const { filename } = req.params;
            const rawBody = req.rawBody;
            const body = rawBody || req.body;
            if (body === undefined || body === null || body === '') {
                res.status(400).json({ success: false, message: 'Request body is empty' });
                return;
            }
            let content;
            if (typeof body === 'string') {
                content = body;
            }
            else if (Buffer.isBuffer(body)) {
                content = body.toString('utf8');
            }
            else {
                content = JSON.stringify(body, null, 2);
            }
            const finalFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
            const result = await httpServices_1.fileService.putFile(finalFilename, content);
            if (result.success) {
                res.status(200).json({
                    success: true, message: 'File created successfully', filename: finalFilename,
                    data: content, filePath: result.filePath, contentLength: content.length,
                    dataSource: rawBody ? 'rawBody' : 'parsedBody'
                });
            }
            else {
                res.status(500).json({ success: false, message: result.message || 'Failed to create file' });
            }
        }
        catch (error) {
            console.error('Error in put_file:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
}
exports.FileController = FileController;
// 创建实例
const fileController = new FileController();
// 导出方法
exports.getFiles = fileController.getFiles, exports.deleteFile = fileController.deleteFile, exports.uploadFile = fileController.uploadFile, exports.downloadFile = fileController.downloadFile, exports.put_file = fileController.put_file;

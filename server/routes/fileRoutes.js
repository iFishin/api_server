"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const tempDir = path_1.default.join(process.cwd(), 'server', 'temps');
// 确保temps目录存在
if (!fs_1.default.existsSync(tempDir)) {
    fs_1.default.mkdirSync(tempDir, { recursive: true });
}
// 调试日志
console.log('File routes initialized');
console.log('Temp directory:', tempDir);
// 配置文件上传
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, tempDir);
    },
    filename: function (_req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// 获取文件列表
router.get('/', (_req, res) => {
    try {
        const files = fs_1.default.readdirSync(tempDir).map(filename => {
            const filePath = path_1.default.join(tempDir, filename);
            const stats = fs_1.default.statSync(filePath);
            return {
                name: filename,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime
            };
        });
        console.log('Files found:', files);
        res.json(files);
    }
    catch (err) {
        console.error('Error reading files:', err);
        res.status(500).json({ error: err.message });
    }
});
// 上传文件
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    res.json({
        message: 'File uploaded successfully',
        file: req.file.originalname
    });
});
// 下载文件
router.get('/download/:filename', (req, res) => {
    const filePath = path_1.default.join(tempDir, req.params.filename);
    if (!fs_1.default.existsSync(filePath) || fs_1.default.statSync(filePath).isDirectory()) {
        res.status(404).json({ error: 'File not found' });
    }
    res.download(filePath);
});
// 删除文件
router.delete('/:filename', (req, res) => {
    const filePath = path_1.default.join(tempDir, req.params.filename);
    if (!fs_1.default.existsSync(filePath)) {
        res.status(404).json({ error: 'File not found' });
        return;
    }
    try {
        const stats = fs_1.default.statSync(filePath);
        if (stats.isDirectory()) {
            fs_1.default.rmdirSync(filePath, { recursive: true });
        }
        else {
            fs_1.default.unlinkSync(filePath);
        }
        res.json({ message: `${req.params.filename} deleted successfully` });
    }
    catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ error: err.message, details: err });
    }
});
router.get('/debug', (req, res) => {
    try {
        const files = fs_1.default.readdirSync(tempDir);
        res.json({
            message: "WebDAV debug info",
            directory: tempDir,
            exists: fs_1.default.existsSync(tempDir),
            files: files,
            details: files.map(file => {
                const filePath = path_1.default.join(tempDir, file);
                const stats = fs_1.default.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    isDirectory: stats.isDirectory(),
                    modified: stats.mtime
                };
            })
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;

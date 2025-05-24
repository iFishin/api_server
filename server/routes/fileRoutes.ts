import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const router = express.Router();
const tempDir = path.join(process.cwd(), 'server', 'temps');

// 确保temps目录存在
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 调试日志
console.log('File routes initialized');
console.log('Temp directory:', tempDir);

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, tempDir);
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// 获取文件列表
router.get('/', (_req: express.Request, res: express.Response) => {
  try {
    const files = fs.readdirSync(tempDir).map(filename => {
      const filePath = path.join(tempDir, filename);
      const stats = fs.statSync(filePath);
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
  } catch (err) {
    console.error('Error reading files:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// 上传文件
router.post('/upload', upload.single('file'), (req: express.Request, res: express.Response): void => {
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
router.get('/download/:filename', (req: express.Request, res: express.Response): void => {
  const filePath = path.join(tempDir, req.params.filename);
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.status(404).json({ error: 'File not found' });
  }
  
  res.download(filePath);
});

// 删除文件
router.delete('/:filename', (req: express.Request, res: express.Response): void => {
  const filePath = path.join(tempDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      fs.rmdirSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
    res.json({ message: `${req.params.filename} deleted successfully` });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: (err as Error).message, details: err });
  }
});

router.get('/debug', (req, res) => {
  try {
    const files = fs.readdirSync(tempDir);
    res.json({
      message: "WebDAV debug info",
      directory: tempDir,
      exists: fs.existsSync(tempDir),
      files: files,
      details: files.map(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          modified: stats.mtime
        };
      })
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
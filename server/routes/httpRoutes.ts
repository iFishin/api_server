import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as httpController from '@controllers/httpController';
import { handleCalculateOvertime } from '@controllers/overtimeController';
import { getApiDocs } from '@services/apiDocService';

// 配置文件上传
const upload = multer({ dest: 'temps/' });
const router = Router();

// 原始数据中间件 - 用于处理 PUT 文件接口
const rawDataMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let data = '';
  
  req.on('data', (chunk) => {
    data += chunk;
  });
  
  req.on('end', () => {
    // 将原始数据存储到 req.rawBody
    (req as any).rawBody = data;
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

// 数据负载路由
router.get('/payload/1k', httpController.get1K);
router.get('/payload/2k', httpController.get2K);
router.get('/payload/4k', httpController.get4K);
router.get('/payload/8k', httpController.get8K);
router.get('/payload/1m', httpController.get1M);
router.get('/payload/2m', httpController.get2M);
router.get('/payload/4m', httpController.get4M);
router.get('/payload/8m', httpController.get8M);

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
router.post('/overtime/calculate', handleCalculateOvertime)

export default router;

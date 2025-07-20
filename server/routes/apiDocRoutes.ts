import { Router } from 'express';
import * as apiDocController from '@controllers/apiDocController';

const router = Router();

// API 文档路由
router.get('/', apiDocController.getAllDocs);
router.get('/tags', apiDocController.getAllTags);
router.get('/tags/:tag', apiDocController.getDocsByTag);

export default router;

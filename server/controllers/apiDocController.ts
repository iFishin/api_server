import { Request, Response } from 'express';
import { getApiDocs, getApiDocsByTag, getApiTags } from '@services/apiDocService';

/**
 * API 文档控制器
 */
export class ApiDocController {
  /**
   * 获取所有 API 文档
   */
  getAllDocs(req: Request, res: Response): void {
    const docs = getApiDocs();
    res.status(200).json(docs);
  }

  /**
   * 根据标签获取 API 文档
   */
  getDocsByTag(req: Request, res: Response): void {
    const { tag } = req.params;
    const docs = getApiDocsByTag(tag);
    res.status(200).json(docs);
  }

  /**
   * 获取所有可用的 API 标签
   */
  getAllTags(req: Request, res: Response): void {
    const tags = getApiTags();
    res.status(200).json(tags);
  }
}

// 创建控制器实例
const apiDocController = new ApiDocController();

// 导出控制器方法
export const {
  getAllDocs,
  getDocsByTag,
  getAllTags
} = apiDocController;

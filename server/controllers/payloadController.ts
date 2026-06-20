import { Request, Response } from 'express';
import { payloadService } from '@services/httpServices';
import { registerApiDoc } from '@services/apiDocService';

/**
 * 数据负载控制器
 * 提供 1KB ~ 8MB 的数据负载用于测试
 */
export class PayloadController {
  constructor() {
    this.registerApiDocs();
  }

  private registerApiDocs(): void {
    ['1k', '2k', '4k', '8k', '1m', '2m', '4m', '8m'].forEach(size => {
      registerApiDoc({
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
  getPayload(req: Request, res: Response): void {
    const sizeParam = req.params.size.toLowerCase();
    const sizeMap: Record<string, number> = {
      '1k': 1, '2k': 2, '4k': 4, '8k': 8,
      '1m': 1024, '2m': 2048, '4m': 4096, '8m': 8192,
    };
    const kb = sizeMap[sizeParam];
    if (!kb) {
      res.status(400).json({ error: 'Invalid payload size. Use: 1k, 2k, 4k, 8k, 1m, 2m, 4m, 8m' });
      return;
    }
    res.status(200).send(payloadService.getData(kb));
  }
}

const payloadController = new PayloadController();

export const { getPayload } = payloadController;

// 保留旧接口以兼容路由
export const get1K = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '1k' } } as any, res);
export const get2K = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '2k' } } as any, res);
export const get4K = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '4k' } } as any, res);
export const get8K = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '8k' } } as any, res);
export const get1M = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '1m' } } as any, res);
export const get2M = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '2m' } } as any, res);
export const get4M = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '4m' } } as any, res);
export const get8M = (req: Request, res: Response) => payloadController.getPayload({ ...req, params: { size: '8m' } } as any, res);

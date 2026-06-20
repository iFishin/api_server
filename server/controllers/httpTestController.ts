import { Request, Response } from 'express';
import { httpTestService } from '@services/httpServices';
import { registerApiDoc } from '@services/apiDocService';

/**
 * HTTP 测试控制器
 */
export class HttpTestController {
  constructor() {
    this.registerApiDocs();
  }

  private registerApiDocs(): void {
    registerApiDoc({
      operationId: 'getBasic', tags: ['HTTP测试'], summary: '基础 GET 请求测试',
      description: '测试基础 GET 请求的处理', method: 'GET', path: '/api/http/test/get',
      responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { test: { type: 'string' }, passed: { type: 'boolean' }, request_received: { type: 'object' } } } } } } }
    });
    registerApiDoc({
      operationId: 'postBasic', tags: ['HTTP测试'], summary: '基础 POST 请求测试',
      description: '测试基础 POST 请求的处理', method: 'POST', path: '/api/http/test/post',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object' } } } } } },
      responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { test: { type: 'string' }, passed: { type: 'boolean' }, request_received: { type: 'object' } } } } } } }
    });
  }

  getBasic(req: Request, res: Response): void {
    res.status(200).json(httpTestService.testBasicGet(req));
  }

  postBasic(req: Request, res: Response): void {
    res.status(200).json(httpTestService.testBasicPost(req));
  }

  putBasic(req: Request, res: Response): void {
    res.status(200).json({ test: "Basic PUT request", passed: true, request_received: { method: req.method, headers: req.headers, body: req.body } });
  }

  deleteBasic(req: Request, res: Response): void {
    res.status(200).json({ test: "Basic DELETE request", passed: true, request_received: { method: req.method, headers: req.headers, params: req.params } });
  }

  patchBasic(req: Request, res: Response): void {
    res.status(200).json({ test: "Basic PATCH request", passed: true, request_received: { method: req.method, headers: req.headers, body: req.body } });
  }

  optionsBasic(req: Request, res: Response): void {
    res.status(200).json({ test: "Basic OPTIONS request", passed: true, request_received: { method: req.method, headers: req.headers } });
  }

  headBasic(req: Request, res: Response): void {
    res.status(200).end();
  }

  postJson(req: Request, res: Response): void {
    res.status(200).json({ test: "JSON POST request", passed: true, request_received: { method: req.method, body: req.body } });
  }

  postForm(req: Request, res: Response): void {
    res.status(200).json({ test: "Form POST request", passed: true, request_received: { method: req.method, body: req.body } });
  }
}

const httpTestController = new HttpTestController();

export const {
  getBasic: get_basic, postBasic: post_basic, putBasic: put_basic,
  deleteBasic: delete_basic, patchBasic: patch_basic,
  optionsBasic: options_basic, headBasic: head_basic, postJson, postForm
} = httpTestController;

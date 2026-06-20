"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEchoHeaders = exports.getHeaders = exports.getDelay = exports.getStatusCode = exports.getParams = exports.getQuery = exports.getDefault = exports.HttpController = void 0;
const httpServices_1 = require("@services/httpServices");
const apiDocService_1 = require("@services/apiDocService");
/**
 * HTTP 基础控制器
 */
class HttpController {
    constructor() {
        this.registerApiDocs();
    }
    registerApiDocs() {
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'getDefault', tags: ['基础'], summary: '默认 API',
            description: '默认 API 路径，返回欢迎信息', method: 'GET', path: '/api/http',
            responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Welcome to the API Server' } } } } } } }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'getQuery', tags: ['基础'], summary: '查询参数 API',
            description: '测试查询参数的处理', method: 'GET', path: '/api/http/query',
            parameters: [{ name: 'name', in: 'query', description: '姓名', schema: { type: 'string' } }, { name: 'age', in: 'query', description: '年龄', schema: { type: 'integer' } }],
            responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, data: { type: 'object', properties: { name: { type: 'string' }, age: { type: 'integer' } } } } } } } } }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'getParams', tags: ['基础'], summary: '路径参数 API',
            description: '测试路径参数的处理', method: 'GET', path: '/api/http/params/{id}',
            parameters: [{ name: 'id', in: 'path', required: true, description: '资源ID', schema: { type: 'string' } }],
            responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, id: { type: 'string' } } } } } } }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'getStatusCode', tags: ['基础'], summary: '状态码 API',
            description: '返回指定的 HTTP 状态码', method: 'GET', path: '/api/http/status/{code}',
            parameters: [{ name: 'code', in: 'path', required: true, description: 'HTTP 状态码', schema: { type: 'integer' } }],
            responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'integer' }, message: { type: 'string' } } } } } }, 'default': { description: '请求的状态码响应', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'integer' }, message: { type: 'string' } } } } } } }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'getDelay', tags: ['基础'], summary: '延迟响应 API',
            description: '延迟指定毫秒后响应', method: 'GET', path: '/api/http/delay/{ms}',
            parameters: [{ name: 'ms', in: 'path', required: true, description: '延迟毫秒数', schema: { type: 'integer', minimum: 0, maximum: 10000 } }],
            responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, delay: { type: 'integer' } } } } } } }
        });
    }
    getDefault(req, res) {
        res.status(200).json(httpServices_1.httpService.getDefault());
    }
    getQuery(req, res) {
        const name = req.query.name;
        const age = req.query.age ? parseInt(req.query.age) : undefined;
        res.status(200).json(httpServices_1.httpService.getQuery(name, age));
    }
    getParams(req, res) {
        const { id } = req.params;
        res.status(200).json(httpServices_1.httpService.getParams(id));
    }
    getStatusCode(req, res) {
        const code = parseInt(req.params.code);
        if (isNaN(code) || code < 100 || code > 599) {
            res.status(400).json({ error: 'Invalid status code. Must be between 100-599' });
            return;
        }
        res.status(code).json({ status: code, message: `Responded with status code ${code}` });
    }
    getDelay(req, res) {
        const ms = parseInt(req.params.ms);
        if (isNaN(ms) || ms < 0) {
            res.status(400).json({ error: 'Invalid delay. Must be a positive number' });
            return;
        }
        const maxDelay = 10000;
        const actualDelay = Math.min(ms, maxDelay);
        setTimeout(() => {
            res.status(200).json({ message: `Response delayed by ${actualDelay} ms`, delay: actualDelay });
        }, actualDelay);
    }
    getHeaders(req, res) {
        res.setHeader('X-Custom-Header', 'Custom-Value');
        res.setHeader('X-API-Version', '1.0.0');
        res.status(200).json({ message: "Response with custom headers", headers: { 'X-Custom-Header': 'Custom-Value', 'X-API-Version': '1.0.0' } });
    }
    getEchoHeaders(req, res) {
        res.status(200).json({ message: "Echo headers", headers: req.headers });
    }
}
exports.HttpController = HttpController;
const httpController = new HttpController();
exports.getDefault = httpController.getDefault, exports.getQuery = httpController.getQuery, exports.getParams = httpController.getParams, exports.getStatusCode = httpController.getStatusCode, exports.getDelay = httpController.getDelay, exports.getHeaders = httpController.getHeaders, exports.getEchoHeaders = httpController.getEchoHeaders;

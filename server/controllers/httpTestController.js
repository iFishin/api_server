"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postForm = exports.postJson = exports.head_basic = exports.options_basic = exports.patch_basic = exports.delete_basic = exports.put_basic = exports.post_basic = exports.get_basic = exports.HttpTestController = void 0;
const httpServices_1 = require("@services/httpServices");
const apiDocService_1 = require("@services/apiDocService");
/**
 * HTTP 测试控制器
 */
class HttpTestController {
    constructor() {
        this.registerApiDocs();
    }
    registerApiDocs() {
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'getBasic', tags: ['HTTP测试'], summary: '基础 GET 请求测试',
            description: '测试基础 GET 请求的处理', method: 'GET', path: '/api/http/test/get',
            responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { test: { type: 'string' }, passed: { type: 'boolean' }, request_received: { type: 'object' } } } } } } }
        });
        (0, apiDocService_1.registerApiDoc)({
            operationId: 'postBasic', tags: ['HTTP测试'], summary: '基础 POST 请求测试',
            description: '测试基础 POST 请求的处理', method: 'POST', path: '/api/http/test/post',
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object' } } } } } },
            responses: { '200': { description: '成功响应', content: { 'application/json': { schema: { type: 'object', properties: { test: { type: 'string' }, passed: { type: 'boolean' }, request_received: { type: 'object' } } } } } } }
        });
    }
    getBasic(req, res) {
        res.status(200).json(httpServices_1.httpTestService.testBasicGet(req));
    }
    postBasic(req, res) {
        res.status(200).json(httpServices_1.httpTestService.testBasicPost(req));
    }
    putBasic(req, res) {
        res.status(200).json({ test: "Basic PUT request", passed: true, request_received: { method: req.method, headers: req.headers, body: req.body } });
    }
    deleteBasic(req, res) {
        res.status(200).json({ test: "Basic DELETE request", passed: true, request_received: { method: req.method, headers: req.headers, params: req.params } });
    }
    patchBasic(req, res) {
        res.status(200).json({ test: "Basic PATCH request", passed: true, request_received: { method: req.method, headers: req.headers, body: req.body } });
    }
    optionsBasic(req, res) {
        res.status(200).json({ test: "Basic OPTIONS request", passed: true, request_received: { method: req.method, headers: req.headers } });
    }
    headBasic(req, res) {
        res.status(200).end();
    }
    postJson(req, res) {
        res.status(200).json({ test: "JSON POST request", passed: true, request_received: { method: req.method, body: req.body } });
    }
    postForm(req, res) {
        res.status(200).json({ test: "Form POST request", passed: true, request_received: { method: req.method, body: req.body } });
    }
}
exports.HttpTestController = HttpTestController;
const httpTestController = new HttpTestController();
exports.get_basic = httpTestController.getBasic, exports.post_basic = httpTestController.postBasic, exports.put_basic = httpTestController.putBasic, exports.delete_basic = httpTestController.deleteBasic, exports.patch_basic = httpTestController.patchBasic, exports.options_basic = httpTestController.optionsBasic, exports.head_basic = httpTestController.headBasic, exports.postJson = httpTestController.postJson, exports.postForm = httpTestController.postForm;

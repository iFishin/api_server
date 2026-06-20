"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tcpController = __importStar(require("../controllers/tcpController"));
const router = (0, express_1.Router)();
// TCP 服务控制
router.post('/start', tcpController.start);
router.post('/stop', tcpController.stop);
// TCP 服务状态
router.get('/status', tcpController.getStatus);
// 客户端管理
router.get('/clients', tcpController.getClients);
router.post('/sendToClient', tcpController.sendToClient);
router.post('/disconnectClient', tcpController.disconnectClient);
router.post('/closeAllClients', tcpController.closeAllClients);
// 回显配置
router.get('/echo', tcpController.getEcho);
router.post('/echo/enabled', tcpController.setEchoEnabled);
router.post('/echo/content', tcpController.setEchoContent);
// 客户端发送消息
router.post('/send', tcpController.send);
exports.default = router;

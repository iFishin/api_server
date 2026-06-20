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
const mqttController = __importStar(require("../controllers/mqttController"));
const router = (0, express_1.Router)();
// MQTT 服务控制
router.post('/start', mqttController.start);
router.post('/stop', mqttController.stop);
// MQTT 服务状态和统计
router.get('/status', mqttController.getStatus);
router.get('/stats', mqttController.getStats);
// 客户端管理
router.get('/clients', mqttController.getClients);
router.post('/kick', mqttController.kickClient);
// 订阅管理
router.get('/subscriptions', mqttController.getSubscriptions);
// 消息发布
router.post('/publish', mqttController.publish);
// 回显配置
router.get('/echo', mqttController.getEcho);
router.post('/echo', mqttController.setEcho);
router.post('/echo/enabled', mqttController.setEchoEnabled);
router.post('/echo/content', mqttController.setEchoContent);
exports.default = router;

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
exports.setupWebDAV = setupWebDAV;
const webdav_server_1 = require("webdav-server");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// 确保temps目录存在
const tempDir = path.join(process.cwd(), "server", "temps");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}
function setupWebDAV(app) {
    // 创建WebDAV服务器
    const userManager = new webdav_server_1.v2.SimpleUserManager();
    const privilegeManager = new webdav_server_1.v2.SimplePathPrivilegeManager();
    // 添加一个默认用户（可选）
    // 用户名：admin，密码：admin
    const user = userManager.addUser("admin", "admin", false);
    // 设置权限
    privilegeManager.setRights(user, "/", ["all"]);
    // 文件系统
    const tempFs = new webdav_server_1.v2.PhysicalFileSystem(tempDir);
    // 创建WebDAV服务器
    const server = new webdav_server_1.v2.WebDAVServer({
        privilegeManager,
        port: 0,
        httpAuthentication: new webdav_server_1.v2.HTTPBasicAuthentication(userManager),
    });
    // 挂载文件系统
    server.rootFileSystem().addSubTree(server.createExternalContext(), {
        "/": webdav_server_1.v2.ResourceType.Directory,
    }, (success) => {
        if (success) {
            server.setFileSystem("/", tempFs, (setFileSystemError) => {
                if (setFileSystemError) {
                    console.error("Failed to set the PhysicalFileSystem to the WebDAV server:", setFileSystemError, "tempDir:", tempDir);
                    try {
                        fs.accessSync(tempDir, fs.constants.R_OK | fs.constants.W_OK);
                        console.log("Directory is readable and writable.");
                    }
                    catch (e) {
                        console.error("Directory permission error:", e);
                    }
                }
                else {
                    console.log("WebDAV PhysicalFileSystem mounted successfully.");
                }
            });
        }
        else {
            console.error("Failed to add subtree to the WebDAV server.");
        }
    });
    // 将WebDAV集成到Express中
    app.use(webdav_server_1.v2.extensions.express("/webdav", server));
    console.log(`WebDAV server running at /webdav (pointing to ${tempDir})`);
}

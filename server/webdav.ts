import { v2 as webdav } from "webdav-server";
import * as path from "path";
import * as fs from "fs";
import { Express } from "express";

// 确保temps目录存在
const tempDir = path.join(process.cwd(), "server", "temps");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export function setupWebDAV(app: Express) {
  // 创建WebDAV服务器
  const userManager = new webdav.SimpleUserManager();
  const privilegeManager = new webdav.SimplePathPrivilegeManager();

  // 添加一个默认用户（可选）
  // 用户名：admin，密码：admin
  const user = userManager.addUser("admin", "admin", false);

  // 设置权限
  privilegeManager.setRights(user, "/", ["all"]);

  // 文件系统
  const tempFs = new webdav.PhysicalFileSystem(tempDir);

  // 创建WebDAV服务器
  const server = new webdav.WebDAVServer({
    privilegeManager,
    port: 0,
    httpAuthentication: new webdav.HTTPBasicAuthentication(userManager),
  });

  // 挂载文件系统
  server.rootFileSystem().addSubTree(
    server.createExternalContext(),
    {
      "/": webdav.ResourceType.Directory,
    },
    (success) => {
      if (success) {
        server.setFileSystem("/", tempFs, (setFileSystemError) => {
          if (setFileSystemError) {
            console.error(
              "Failed to set the PhysicalFileSystem to the WebDAV server:",
              setFileSystemError,
              "tempDir:",
              tempDir
            );
            try {
              fs.accessSync(tempDir, fs.constants.R_OK | fs.constants.W_OK);
              console.log("Directory is readable and writable.");
            } catch (e) {
              console.error("Directory permission error:", e);
            }
          } else {
            console.log("WebDAV PhysicalFileSystem mounted successfully.");
          }
        });
      } else {
        console.error("Failed to add subtree to the WebDAV server.");
      }
    }
  );

  // 将WebDAV集成到Express中
  app.use(webdav.extensions.express("/webdav", server));

  console.log(`WebDAV server running at /webdav (pointing to ${tempDir})`);
}

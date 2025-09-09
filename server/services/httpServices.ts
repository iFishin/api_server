import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// 转换回调函数为 Promise
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

/**
 * 文件系统服务
 */
export class FileService {
  private tempDir: string;
  
  constructor() {
    this.tempDir = path.join(__dirname, '../temps');
    // 确保临时目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }
  
  /**
   * 获取所有文件
   */
  async getFiles() {
    try {
      const files = await readdir(this.tempDir);
      return { success: true, files };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
  
  /**
   * 删除文件
   */
  async deleteFile(filename: string) {
    const filePath = path.join(this.tempDir, filename);
    try {
      await unlink(filePath);
      return { success: true, message: 'File deleted successfully' };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        return { success: false, error: 'File not found', status: 404 };
      }
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 上传文件
   */
  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      return { success: false, error: 'No file uploaded', status: 400 };
    }
    
    const filePath = path.join(this.tempDir, file.originalname);
    try {
      await writeFile(filePath, file.buffer);
      return { 
        success: true,
        message: 'File uploaded successfully',
        filename: file.originalname
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * PUT 方式创建文件
   */
  async putFile(filename: string, content: string) {
    const filePath = path.join(this.tempDir, filename);
    try {
      await writeFile(filePath, content, 'utf8');
      return { 
        success: true,
        message: 'File created successfully',
        filename: filename,
        filePath: filePath
      };
    } catch (err) {
      return { 
        success: false, 
        message: `Failed to create file: ${(err as Error).message}`,
        error: (err as Error).message 
      };
    }
  }
}

/**
 * 基础HTTP服务
 */
export class HttpService {
  /**
   * 处理默认请求
   */
  getDefault() {
    return { message: "Basic GET request successful" };
  }
  
  /**
   * 处理查询参数
   */
  getQuery(name?: string, age?: number) {
    return {
      message: "GET with query params",
      data: { name, age }
    };
  }
  
  /**
   * 处理路径参数
   */
  getParams(id: string) {
    return {
      message: "GET with URL params",
      id
    };
  }
}

/**
 * 数据负载生成服务
 */
export class PayloadService {
  /**
   * 生成重复字符串
   */
  private generateRepeatedString(size: number): string {
    const baseString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const repeats = Math.ceil(size / baseString.length);
    return baseString.repeat(repeats).slice(0, size);
  }
  
  /**
   * 获取指定大小的数据
   */
  getData(sizeInKB: number): string {
    return this.generateRepeatedString(sizeInKB * 1024);
  }
}

/**
 * HTTP测试服务
 */
export class HttpTestService {
  // 基础HTTP方法测试
  testBasicGet(req: any) {
    return {
      test: "Basic GET request",
      passed: true,
      request_received: {
        method: req.method,
        headers: req.headers,
        query: req.query
      }
    };
  }
  
  testBasicPost(req: any) {
    return {
      test: "Basic POST request",
      passed: true,
      request_received: {
        method: req.method,
        headers: req.headers,
        body: req.body
      }
    };
  }
  
  // 其他测试方法...
}

// 导出服务实例，方便在控制器中使用
export const fileService = new FileService();
export const httpService = new HttpService();
export const payloadService = new PayloadService();
export const httpTestService = new HttpTestService();
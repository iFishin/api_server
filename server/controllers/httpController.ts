import { Request, Response } from 'express';
import { 
  fileService, 
  httpService, 
  payloadService, 
  httpTestService 
} from '@services/httpServices';
import { registerApiDoc } from '@services/apiDocService';
import path from 'path';
import fs from 'fs';

/**
 * 文件管理控制器
 */
export class FileController {
  constructor() {
    // 注册 API 文档
    this.registerApiDocs();
  }

  /**
   * 注册所有 API 文档
   */
  private registerApiDocs(): void {
    // 获取文件列表 API 文档
    registerApiDoc({
      operationId: 'getFiles',
      tags: ['文件管理'],
      summary: '获取文件列表',
      description: '获取服务器上的所有文件',
      method: 'GET',
      path: '/api/http/files',
      responses: {
        '200': {
          description: '成功获取文件列表',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        },
        '500': {
          description: '服务器错误',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    // 删除文件 API 文档
    registerApiDoc({
      operationId: 'deleteFile',
      tags: ['文件管理'],
      summary: '删除文件',
      description: '删除服务器上指定的文件',
      method: 'DELETE',
      path: '/api/http/files/{filename}',
      parameters: [
        {
          name: 'filename',
          in: 'path',
          required: true,
          description: '要删除的文件名',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: '文件删除成功',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        '404': {
          description: '文件不存在',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        '500': {
          description: '服务器错误',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    // 上传文件 API 文档
    registerApiDoc({
      operationId: 'uploadFile',
      tags: ['文件管理'],
      summary: '上传文件',
      description: '上传文件到服务器',
      method: 'POST',
      path: '/api/http/upload',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: '文件上传成功',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  filename: { type: 'string' }
                }
              }
            }
          }
        },
        '400': {
          description: '未提供文件',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        '500': {
          description: '服务器错误',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    // PUT 创建文件 API 文档
    registerApiDoc({
      operationId: 'putFile',
      tags: ['文件管理'],
      summary: 'PUT 方式创建文件',
      description: '使用 PUT 请求创建文件，将请求体数据写入到 .txt 文件',
      method: 'PUT',
      path: '/api/http/put_file/{filename}',
      parameters: [
        {
          name: 'filename',
          in: 'path',
          required: true,
          description: '文件名（会自动添加 .txt 扩展名）',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        description: '要写入文件的原始文本数据',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
              example: '这是要写入文件的原始文本内容\n可以是多行文本\n支持换行符等特殊字符'
            }
          }
        }
      },
      responses: {
        '200': {
          description: '文件创建成功',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  filename: { type: 'string' },
                  data: { 
                    type: 'string',
                    description: '写入文件的实际内容'
                  },
                  filePath: { type: 'string' },
                  contentLength: { 
                    type: 'integer',
                    description: '内容长度（字符数）'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: '请求体为空或无效',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        '500': {
          description: '服务器错误',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * 获取文件列表
   */
  async getFiles(req: Request, res: Response): Promise<void> {
    const result = await fileService.getFiles();
    if (result.success) {
      res.status(200).json(result.files);
    } else {
      res.status(500).json({ message: result.error });
    }
  }
  
  /**
   * 删除文件
   */
  async deleteFile(req: Request, res: Response): Promise<void> {
    const { filename } = req.params;
    const result = await fileService.deleteFile(filename);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(result.status || 500).json({ message: result.error });
    }
  }
  
  /**
   * 上传文件
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    const result = await fileService.uploadFile(req.file);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        filename: result.filename
      });
    } else {
      res.status(result.status || 500).json({ message: result.error });
    }
  }
  
  /**
   * 下载文件
   */
  async downloadFile(req: Request, res: Response): Promise<void> {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../temps', filename);
    
    // 检查文件是否存在
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      res.download(filePath, filename, (err) => {
        if (err) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      });
    } catch (err) {
      res.status(404).json({ message: 'File not found' });
    }
  }

  /**
   * PUT 方式创建文件
   */
  async put_file(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      
      // 优先使用原始数据，如果没有则使用解析后的 body
      const rawBody = (req as any).rawBody;
      const body = rawBody || req.body;
      
      // 检查是否有数据
      if (body === undefined || body === null || body === '') {
        res.status(400).json({ 
          success: false,
          message: 'Request body is empty' 
        });
        return;
      }

      // 处理不同类型的数据
      let content: string;
      
      if (typeof body === 'string') {
        content = body;
      } else if (Buffer.isBuffer(body)) {
        content = body.toString('utf8');
      } else {
        // 如果是对象，转换为 JSON 字符串
        content = JSON.stringify(body, null, 2);
      }

      // 确保文件扩展名
      const finalFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
      
      // 写入文件到 temps 目录
      const result = await fileService.putFile(finalFilename, content);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'File created successfully',
          filename: finalFilename,
          data: content,
          filePath: result.filePath,
          contentLength: content.length,
          dataSource: rawBody ? 'rawBody' : 'parsedBody'
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Failed to create file'
        });
      }
    } catch (error) {
      console.error('Error in put_file:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

/**
 * HTTP 基础控制器
 */
export class HttpController {
  constructor() {
    // 注册 API 文档
    this.registerApiDocs();
  }

  /**
   * 注册所有 API 文档
   */
  private registerApiDocs(): void {
    // 注册默认 API 文档
    registerApiDoc({
      operationId: 'getDefault',
      tags: ['基础'],
      summary: '默认 API',
      description: '默认 API 路径，返回欢迎信息',
      method: 'GET',
      path: '/api/http',
      parameters: [],
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Welcome to the API Server'
                  }
                }
              }
            }
          }
        }
      }
    });

    // 查询参数 API 文档
    registerApiDoc({
      operationId: 'getQuery',
      tags: ['基础'],
      summary: '查询参数 API',
      description: '测试查询参数的处理',
      method: 'GET',
      path: '/api/http/query',
      parameters: [
        {
          name: 'name',
          in: 'query',
          description: '姓名',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'age',
          in: 'query',
          description: '年龄',
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      age: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // 路径参数 API 文档
    registerApiDoc({
      operationId: 'getParams',
      tags: ['基础'],
      summary: '路径参数 API',
      description: '测试路径参数的处理',
      method: 'GET',
      path: '/api/http/params/{id}',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: '资源ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  id: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    // 状态码 API 文档
    registerApiDoc({
      operationId: 'getStatusCode',
      tags: ['基础'],
      summary: '状态码 API',
      description: '返回指定的 HTTP 状态码',
      method: 'GET',
      path: '/api/http/status/{code}',
      parameters: [
        {
          name: 'code',
          in: 'path',
          required: true,
          description: 'HTTP 状态码',
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'integer' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        'default': {
          description: '请求的状态码响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'integer' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    // 延迟响应 API 文档
    registerApiDoc({
      operationId: 'getDelay',
      tags: ['基础'],
      summary: '延迟响应 API',
      description: '延迟指定毫秒后响应',
      method: 'GET',
      path: '/api/http/delay/{ms}',
      parameters: [
        {
          name: 'ms',
          in: 'path',
          required: true,
          description: '延迟毫秒数',
          schema: {
            type: 'integer',
            minimum: 0,
            maximum: 10000
          }
        }
      ],
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  delay: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * 获取默认响应
   */
  getDefault(req: Request, res: Response): void {
    const result = httpService.getDefault();
    res.status(200).json(result);
  }
  
  /**
   * 获取查询参数
   */
  getQuery(req: Request, res: Response): void {
    const name = req.query.name as string;
    const age = req.query.age ? parseInt(req.query.age as string) : undefined;
    
    const result = httpService.getQuery(name, age);
    res.status(200).json(result);
  }
  
  /**
   * 获取路径参数
   */
  getParams(req: Request, res: Response): void {
    const { id } = req.params;
    const result = httpService.getParams(id);
    res.status(200).json(result);
  }

  /**
   * 返回指定状态码
   */
  getStatusCode(req: Request, res: Response): void {
    const code = parseInt(req.params.code);
    
    // 状态码范围检查
    if (isNaN(code) || code < 100 || code > 599) {
      res.status(400).json({ 
        error: 'Invalid status code. Must be between 100-599'
      });
      return;
    }
    
    res.status(code).json({
      status: code,
      message: `Responded with status code ${code}`
    });
  }

  /**
   * 延迟响应
   */
  getDelay(req: Request, res: Response): void {
    const ms = parseInt(req.params.ms);
    
    // 延迟范围检查
    if (isNaN(ms) || ms < 0) {
      res.status(400).json({ 
        error: 'Invalid delay. Must be a positive number'
      });
      return;
    }
    
    // 为了服务器安全，设置最大延迟
    const maxDelay = 10000; // 10秒
    const actualDelay = Math.min(ms, maxDelay);
    
    setTimeout(() => {
      res.status(200).json({
        message: `Response delayed by ${actualDelay} ms`,
        delay: actualDelay
      });
    }, actualDelay);
  }

  /**
   * 响应带自定义头的请求
   */
  getHeaders(req: Request, res: Response): void {
    res.setHeader('X-Custom-Header', 'Custom-Value');
    res.setHeader('X-API-Version', '1.0.0');
    
    res.status(200).json({
      message: "Response with custom headers",
      headers: {
        'X-Custom-Header': 'Custom-Value',
        'X-API-Version': '1.0.0'
      }
    });
  }

  /**
   * 返回发送的请求头
   */
  getEchoHeaders(req: Request, res: Response): void {
    res.status(200).json({
      message: "Echo headers",
      headers: req.headers
    });
  }
}

/**
 * 数据负载控制器
 */
export class PayloadController {
  constructor() {
    // 注册 API 文档
    this.registerApiDocs();
  }

  /**
   * 注册所有 API 文档
   */
  private registerApiDocs(): void {
    // 注册 1KB 数据 API 文档
    registerApiDoc({
      operationId: 'get1K',
      tags: ['数据负载'],
      summary: '获取 1KB 数据',
      description: '返回 1KB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/1k',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });

    // 注册 2KB 数据 API 文档
    registerApiDoc({
      operationId: 'get2K',
      tags: ['数据负载'],
      summary: '获取 2KB 数据',
      description: '返回 2KB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/2k',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });

    // 注册 4KB 数据 API 文档
    registerApiDoc({
      operationId: 'get4K',
      tags: ['数据负载'],
      summary: '获取 4KB 数据',
      description: '返回 4KB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/4k',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });

    // 注册 8KB 数据 API 文档
    registerApiDoc({
      operationId: 'get8K',
      tags: ['数据负载'],
      summary: '获取 8KB 数据',
      description: '返回 8KB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/8k',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });

    // 注册 1MB 数据 API 文档
    registerApiDoc({
      operationId: 'get1M',
      tags: ['数据负载'],
      summary: '获取 1MB 数据',
      description: '返回 1MB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/1m',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });

    // 注册 2MB 数据 API 文档
    registerApiDoc({
      operationId: 'get2M',
      tags: ['数据负载'],
      summary: '获取 2MB 数据',
      description: '返回 2MB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/2m',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });

    // 注册 4MB 数据 API 文档
    registerApiDoc({
      operationId: 'get4M',
      tags: ['数据负载'],
      summary: '获取 4MB 数据',
      description: '返回 4MB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/4m',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });

    // 注册 8MB 数据 API 文档
    registerApiDoc({
      operationId: 'get8M',
      tags: ['数据负载'],
      summary: '获取 8MB 数据',
      description: '返回 8MB 大小的数据',
      method: 'GET',
      path: '/api/http/payload/8m',
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        }
      }
    });
  }

  /**
   * 获取 1KB 数据
   */
  get1K(req: Request, res: Response): void {
    const data = payloadService.getData(1);
    res.status(200).send(data);
  }
  
  /**
   * 获取 2KB 数据
   */
  get2K(req: Request, res: Response): void {
    const data = payloadService.getData(2);
    res.status(200).send(data);
  }
  
  /**
   * 获取 4KB 数据
   */
  get4K(req: Request, res: Response): void {
    const data = payloadService.getData(4);
    res.status(200).send(data);
  }
  
  /**
   * 获取 8KB 数据
   */
  get8K(req: Request, res: Response): void {
    const data = payloadService.getData(8);
    res.status(200).send(data);
  }
  
  /**
   * 获取 1MB 数据
   */
  get1M(req: Request, res: Response): void {
    const data = payloadService.getData(1024);
    res.status(200).send(data);
  }
  
  /**
   * 获取 2MB 数据
   */
  get2M(req: Request, res: Response): void {
    const data = payloadService.getData(2048);
    res.status(200).send(data);
  }
  
  /**
   * 获取 4MB 数据
   */
  get4M(req: Request, res: Response): void {
    const data = payloadService.getData(4096);
    res.status(200).send(data);
  }
  
  /**
   * 获取 8MB 数据
   */
  get8M(req: Request, res: Response): void {
    const data = payloadService.getData(8192);
    res.status(200).send(data);
  }
}

/**
 * HTTP 测试控制器
 */
export class HttpTestController {
  constructor() {
    // 注册 API 文档
    this.registerApiDocs();
  }

  /**
   * 注册所有 API 文档
   */
  private registerApiDocs(): void {
    // GET 测试 API 文档
    registerApiDoc({
      operationId: 'getBasic',
      tags: ['HTTP测试'],
      summary: '基础 GET 请求测试',
      description: '测试基础 GET 请求的处理',
      method: 'GET',
      path: '/api/http/test/get',
      parameters: [],
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  test: { type: 'string' },
                  passed: { type: 'boolean' },
                  request_received: { type: 'object' }
                }
              }
            }
          }
        }
      }
    });

    // POST 测试 API 文档
    registerApiDoc({
      operationId: 'postBasic',
      tags: ['HTTP测试'],
      summary: '基础 POST 请求测试',
      description: '测试基础 POST 请求的处理',
      method: 'POST',
      path: '/api/http/test/post',
      parameters: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: { type: 'object' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: '成功响应',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  test: { type: 'string' },
                  passed: { type: 'boolean' },
                  request_received: { type: 'object' }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * 基础 GET 测试
   */
  getBasic(req: Request, res: Response): void {
    const result = httpTestService.testBasicGet(req);
    res.status(200).json(result);
  }
  
  /**
   * 基础 POST 测试
   */
  postBasic(req: Request, res: Response): void {
    const result = httpTestService.testBasicPost(req);
    res.status(200).json(result);
  }

  /**
   * PUT 请求测试
   */
  putBasic(req: Request, res: Response): void {
    res.status(200).json({
      test: "Basic PUT request",
      passed: true,
      request_received: {
        method: req.method,
        headers: req.headers,
        body: req.body
      }
    });
  }

  /**
   * DELETE 请求测试
   */
  deleteBasic(req: Request, res: Response): void {
    res.status(200).json({
      test: "Basic DELETE request",
      passed: true,
      request_received: {
        method: req.method,
        headers: req.headers,
        params: req.params
      }
    });
  }

  /**
   * PATCH 请求测试
   */
  patchBasic(req: Request, res: Response): void {
    res.status(200).json({
      test: "Basic PATCH request",
      passed: true,
      request_received: {
        method: req.method,
        headers: req.headers,
        body: req.body
      }
    });
  }

  /**
   * OPTIONS 请求测试
   */
  optionsBasic(req: Request, res: Response): void {
    res.status(200).json({
      test: "Basic OPTIONS request",
      passed: true,
      request_received: {
        method: req.method,
        headers: req.headers
      }
    });
  }

  /**
   * HEAD 请求测试
   */
  headBasic(req: Request, res: Response): void {
    res.status(200).end();
  }

  /**
   * 测试带 JSON 请求体的 POST
   */
  postJson(req: Request, res: Response): void {
    res.status(200).json({
      test: "JSON POST request",
      passed: true,
      request_received: {
        method: req.method,
        body: req.body
      }
    });
  }
  
  /**
   * 测试表单数据的 POST
   */
  postForm(req: Request, res: Response): void {
    res.status(200).json({
      test: "Form POST request",
      passed: true,
      request_received: {
        method: req.method,
        body: req.body
      }
    });
  }
}

// 创建控制器实例
const fileController = new FileController();
const httpController = new HttpController();
const payloadController = new PayloadController();
const httpTestController = new HttpTestController();

// 导出控制器方法
export const {
  getFiles,
  deleteFile,
  uploadFile,
  downloadFile,
  put_file
} = fileController;

export const {
  getDefault,
  getQuery,
  getParams,
  getStatusCode,
  getDelay,
  getHeaders,
  getEchoHeaders
} = httpController;

export const {
  get1K,
  get2K,
  get4K,
  get8K,
  get1M,
  get2M,
  get4M,
  get8M
} = payloadController;

export const {
  getBasic: get_basic,
  postBasic: post_basic,
  putBasic: put_basic,
  deleteBasic: delete_basic,
  patchBasic: patch_basic,
  optionsBasic: options_basic,
  headBasic: head_basic,
  postJson,
  postForm
} = httpTestController;

// JSON文件管理控制器函数
export const listJsonFiles = (req: Request, res: Response) => {
  try {
    const { directory = '', extension = '' } = req.query;
    const targetDir = path.join(process.cwd(), directory as string);
    
    if (!fs.existsSync(targetDir)) {
      return res.json({ success: false, error: '目录不存在' });
    }
    
    const files = fs.readdirSync(targetDir)
      .filter(file => {
        const filePath = path.join(targetDir, file);
        const isFile = fs.statSync(filePath).isFile();
        const hasExtension = extension ? file.endsWith(extension as string) : true;
        return isFile && hasExtension;
      })
      .sort();
    
    res.json({ success: true, files });
  } catch (error) {
    res.json({ success: false, error: (error as Error).message });
  }
};

export const readJsonFile = (req: Request, res: Response) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.json({ success: false, error: '缺少文件路径参数' });
    }
    
    const fullPath = path.join(process.cwd(), filePath as string);
    
    if (!fs.existsSync(fullPath)) {
      return res.json({ success: false, error: '文件不存在' });
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ success: true, content });
  } catch (error) {
    res.json({ success: false, error: (error as Error).message });
  }
};

export const saveJsonFile = (req: Request, res: Response) => {
  try {
    const { filename, content, directory = '' } = req.body;
    
    if (!filename || content === undefined) {
      return res.json({ success: false, error: '缺少必要参数' });
    }
    
    const targetDir = path.join(process.cwd(), directory);
    
    // 确保目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    
    res.json({ success: true, message: '文件保存成功', path: filePath });
  } catch (error) {
    res.json({ success: false, error: (error as Error).message });
  }
};

// 导出所有控制器，以便在单元测试中使用
export const controllers = {
  fileController,
  httpController,
  payloadController,
  httpTestController
};

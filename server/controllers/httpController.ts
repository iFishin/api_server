import { Request, Response } from "express";
const fs = require("fs");
const path = require("path");
import { generateRepeatedString } from "../utils/stringUtils";
import upload from "../middlewares/multer";

const get_files = async (req: Request, res: Response) => {
  const dirPath = path.join(__dirname, "../temps");
  fs.readdir(dirPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read directory" });
    }
    res.json({ files });
  });
};

const delete_file = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = `./temps/${filename}`;
  fs.unlink(filePath, (err: Error) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete file" });
    }
    res.json({ message: "File deleted successfully" });
  });
};

const upload_file = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const filePath = `./temps/${req.file.filename}`;

  fs.writeFile(filePath, req.file.buffer, (err: Error) => {
    if (err) {
      res.status(500).json({ error: "Failed to save file" });
      return;
    }
    res.json({ message: "File uploaded successfully", filePath });
  });
}

const get_default = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Basic GET request successful" });
};

const get_query = async (req: Request, res: Response) => {
  const { name, age } = req.query;
  res.status(200).json({
    message: "GET with query params",
    data: { name, age },
  });
};

const get_params = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({
    message: "GET with URL params",
    id,
  });
};

const get_1k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024);
  res.status(200).send(data);
};

const get_2k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024 * 2);
  res.status(200).send(data);
};

const get_4k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024 * 4);
  res.status(200).send(data);
};

const get_8k = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024 * 8);
  res.status(200).send(data);
};

const get_1m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024 * 1024);
  res.status(200).send(data);
};

const get_2m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024 * 1024 * 2);
  res.status(200).send(data);
};

const get_4m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024 * 1024 * 4);
  res.status(200).send(data);
};

const get_8m = async (req: Request, res: Response) => {
  const data = generateRepeatedString(1024 * 1024 * 8);
  res.status(200).send(data);
};

const post_create = async (req: Request, res: Response) => {
  const body = req.body;
  res.status(201).json({
    message: "POST request successful",
    data: body,
  });
};

const post_file = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  res.json({
    success: true,
    file: {
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
    },
  });
};

const post_dict = async (req: Request, res: Response) => {
  const body = req.body;

  // Define the directory and ensure it exists
  const dirPath = "./server/temps";
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  // Generate a unique ID for the file
  const id = Date.now();
  const filePath = `${dirPath}/${id}.json`;

  // Write the data to a new file named with the ID
  fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

  // Respond with the stored data
  res.status(200).json({
    message: "POST request with dictionary - data stored successfully",
    data: { ...body, id },
  });
};

const put_update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  res.status(200).json({
    message: "PUT request successful",
    id,
    updates: body,
  });
};

const patch_partial_update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  res.status(200).json({
    message: "PATCH request successful",
    id,
    updates: body,
  });
};

const delete_remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({
    message: "DELETE request successful",
    id,
  });
};

const head_request = async (req: Request, res: Response) => {
  res.status(200).json({ message: "HEAD request successful" });
};

const options_request = async (req: Request, res: Response) => {
  res.status(200).json({ message: "OPTIONS request successful" });
};


// 辅助类型定义
type HttpTestResponse = {
  test: string;
  passed: boolean;
  request_received: {
    method: string;
    headers: Record<string, string>;
    query?: Record<string, string>;
    params?: Record<string, string>;
    body?: any;
  };
  details?: any;
};

// 1. 基础HTTP方法测试 ========================================

const testBasicGet = async (req: Request, res: Response<HttpTestResponse>) => {
  const response: HttpTestResponse = {
    test: "basic_get",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>,
    }
  };
  res.status(200).json(response);
};

const testBasicPost = async (req: Request, res: Response<HttpTestResponse>) => {
  const response: HttpTestResponse = {
    test: "basic_post",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: req.body
    }
  };
  res.status(201).json(response);
};

const testBasicPut = async (req: Request, res: Response<HttpTestResponse>) => {
  const response: HttpTestResponse = {
    test: "basic_put",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>,
      params: req.params,
      body: req.body
    }
  };
  res.status(200).json(response);
};

const testBasicDelete = async (req: Request, res: Response<HttpTestResponse>) => {
  const response: HttpTestResponse = {
    test: "basic_delete",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>,
      params: req.params
    }
  };
  res.status(200).json(response);
};

const testBasicPatch = async (req: Request, res: Response<HttpTestResponse>) => {
  const response: HttpTestResponse = {
    test: "basic_patch",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>,
      params: req.params,
      body: req.body
    }
  };
  res.status(200).json(response);
};

// 2. 头部处理测试 ========================================

const testHeaders = async (req: Request, res: Response<HttpTestResponse>) => {
  const response: HttpTestResponse = {
    test: "headers",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>
    }
  };
  res.status(200).json(response);
};

// 3. 状态码测试 ========================================

const testStatusCode = async (req: Request, res: Response<HttpTestResponse>) => {
  const { code } = req.params;
  const validCodes = ["200", "201", "204", "400", "401", "403", "404", "500"];
  
  if (!validCodes.includes(code)) {
    return res.status(400).json({
      test: "status_code",
      passed: false,
      request_received: {
        method: req.method,
        headers: req.headers as Record<string, string>
      },
      details: `Invalid status code requested. Valid codes are: ${validCodes.join(", ")}`
    });
  }

  const response: HttpTestResponse = {
    test: "status_code",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>
    },
    details: {
      expected_status: parseInt(code, 10)
    }
  };

  res.status(parseInt(code, 10)).json(response);
};

// 4. 超时测试 ========================================

const testTimeout = async (req: Request, res: Response<HttpTestResponse>) => {
  const delay = parseInt(req.query.delay as string) || 1000;
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const response: HttpTestResponse = {
    test: "timeout",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>
    },
    details: {
      delay_ms: delay
    }
  };
  
  res.status(200).json(response);
};

// 5. 重定向测试 ========================================

const testRedirect = async (req: Request, res: Response) => {
  const { count } = req.params;
  const redirectCount = parseInt(count) || 1;
  const maxRedirects = 5; // 安全限制
  
  if (redirectCount > maxRedirects) {
    return res.status(400).json({
      test: "redirect",
      passed: false,
      details: `Maximum redirect count is ${maxRedirects}`
    });
  }
  
  if (redirectCount <= 1) {
    return res.redirect(302, '/http-test/redirect/final');
  }
  
  res.redirect(302, `/http-test/redirect/${redirectCount - 1}`);
};

const testRedirectFinal = async (req: Request, res: Response<HttpTestResponse>) => {
  const response: HttpTestResponse = {
    test: "redirect_final",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>
    }
  };
  res.status(200).json(response);
};

// 6. 分块传输测试 ========================================

const testChunked = async (req: Request, res: Response) => {
  res.setHeader('Transfer-Encoding', 'chunked');
  
  const chunks = [
    "This is ",
    "a chunked ",
    "response ",
    "from the server."
  ];
  
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  
  for (const chunk of chunks) {
    res.write(chunk);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  res.end();
};

// 7. 认证测试 ========================================

const testAuthBasic = async (req: Request, res: Response<HttpTestResponse>) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Test Area"');
    return res.status(401).json({
      test: "auth_basic",
      passed: false,
      request_received: {
        method: req.method,
        headers: req.headers as Record<string, string>
      },
      details: "Missing or invalid Basic Auth header"
    });
  }
  
  const response: HttpTestResponse = {
    test: "auth_basic",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>
    },
    details: {
      auth_type: "Basic",
      auth_header: authHeader
    }
  };
  
  res.status(200).json(response);
};

const testAuthBearer = async (req: Request, res: Response<HttpTestResponse>) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      test: "auth_bearer",
      passed: false,
      request_received: {
        method: req.method,
        headers: req.headers as Record<string, string>
      },
      details: "Missing or invalid Bearer token"
    });
  }
  
  const response: HttpTestResponse = {
    test: "auth_bearer",
    passed: true,
    request_received: {
      method: req.method,
      headers: req.headers as Record<string, string>
    },
    details: {
      auth_type: "Bearer",
      token: authHeader.split(' ')[1]
    }
  };
  
  res.status(200).json(response);
};

// 8. 合规性验证套件 ========================================

const runValidationSuite = async (req: Request, res: Response) => {
  // 这里可以集成多个测试用例
  const testCases = [
    { name: "basic_get", endpoint: "/http-test/basic/get" },
    { name: "headers", endpoint: "/http-test/headers" },
    { name: "status_200", endpoint: "/http-test/status/200" }
    // 添加更多测试用例...
  ];
  
  const results = [];
  
  // 在实际实现中，这里应该实际调用这些端点并收集结果
  // 简化示例：
  for (const testCase of testCases) {
    results.push({
      test: testCase.name,
      passed: true, // 实际实现中需要真实测试
      endpoint: testCase.endpoint
    });
  }
  
  res.status(200).json({
    test: "validation_suite",
    passed: results.every(r => r.passed),
    details: {
      total_tests: testCases.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results
    }
  });
};

// 9. 压力测试 ========================================

const runStressTest = async (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string) || 10;
  
  // 在实际实现中，这里应该实际执行多次请求并统计结果
  // 简化示例：
  res.status(200).json({
    test: "stress_test",
    details: {
      requested_count: count,
      simulated_results: {
        success_rate: 1.0,
        average_response_time_ms: 50,
        min_response_time_ms: 30,
        max_response_time_ms: 120
      }
    }
  });
};

// 10. 协议回显服务 ========================================

const echoRequest = async (req: Request, res: Response) => {
  const response = {
    test: "echo",
    request_received: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body
    }
  };
  
  res.status(200).json(response);
};

// 导出所有控制器函数 ========================================

export {
  // 基础HTTP方法
  testBasicGet as get_basic,
  testBasicPost as post_basic,
  testBasicPut as put_basic,
  testBasicDelete as delete_basic,
  testBasicPatch as patch_basic,
  
  // 特殊功能测试
  testHeaders as get_headers,
  testStatusCode as get_status_code,
  testTimeout as get_timeout,
  testRedirect as get_redirect,
  testRedirectFinal as get_redirect_final,
  testChunked as get_chunked,
  testAuthBasic as get_auth_basic,
  testAuthBearer as get_auth_bearer,
  
  // 高级测试
  runValidationSuite as post_validate,
  runStressTest as get_stress,
  echoRequest as any_echo,
  
  // 基础函数
  get_files,
  delete_file,
  upload_file,
  get_default,
  get_query,
  get_params,
  get_1k,
  get_2k,
  get_4k,
  get_8k,
  get_1m,
  get_2m,
  get_4m,
  get_8m,
  post_create,
  post_file,
  post_dict,
  put_update,
  patch_partial_update,
  delete_remove,
  head_request,
  options_request
};
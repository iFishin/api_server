import axios from 'axios'

// 动态获取API基础URL
const getApiBaseUrl = (): string => {
  const { protocol, hostname, port } = window.location;
  
  console.log('Current location:', { protocol, hostname, port });
  
  // 开发环境端口映射
  let backendPort = '3000'; // 默认后端端口
  
  // 根据前端端口确定后端端口
  if (port === '5173') {
    // Vite 开发服务器
    backendPort = '3000'; // 对应您的后端HTTP端口
  } else if (port === '8080') {
    // Vue CLI 开发服务器
    backendPort = '3000';
  }
  
  // 强制使用 HTTP 协议连接后端（因为后端运行在HTTP上）
  const apiUrl = `http://${hostname}:${backendPort}`;
  
  console.log('API Base URL:', apiUrl);
  return apiUrl;
};

// 创建 axios 实例
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config: any) => {
    // 可以在这里添加认证token等
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('📤 Request Config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error: any) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: any) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  (error: any) => {
    console.error('❌ API Error:', error);
    console.log('🔍 Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    if (error.response) {
      // 服务器响应了错误状态码
      const message = error.response.data?.message || error.message;
      error.message = `HTTP ${error.response.status}: ${message}`;
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('📡 No response received:', error.request);
      error.message = 'No response from server - Check CORS or network connectivity';
    } else {
      // 其他错误
      error.message = `Request setup error: ${error.message}`;
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { getApiBaseUrl };

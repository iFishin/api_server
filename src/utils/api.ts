import axios from 'axios'

// 动态获取API基础URL
const getApiBaseUrl = (): string => {
  const { protocol, hostname, port } = window.location;
  
  console.log('Current location:', { protocol, hostname, port });
  
  // 根据当前环境动态确定API地址
  if (port === '5173') {
    // Vite 开发服务器 - 使用代理或直接连接后端
    return 'http://localhost:3000';
  } else if (port === '8080') {
    // Vue CLI 开发服务器
    return 'http://localhost:3000';
  } else if (port === '3000') {
    // 直接访问3000端口 - API和前端在同一服务器同一端口
    return `${protocol}//${hostname}:3000`;
  } else if (port === '80' || port === '' || !port) {
    // 通过nginx代理访问80端口 - API和前端都通过nginx代理
    return `${protocol}//${hostname}`;
  } else if (port === '443') {
    // 通过nginx代理访问443端口 (HTTPS)
    return `${protocol}//${hostname}`;
  } else {
    // 其他情况，优先尝试无端口(nginx代理)，备选3000端口
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}`;
    }
    return `http://${hostname}:3000`;
  }
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

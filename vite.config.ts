import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      // 启用代码分割和优化
      rollupOptions: {
        output: {
          manualChunks: {
            // 将Vue相关库分离到单独的chunk
            'vue-vendor': ['vue', 'vue-router', 'vuex'],
            // 将大型编辑器库分离
            'monaco-editor': ['monaco-editor-vue3'],
            // 将工具库分离
            'utils': ['axios']
          }
        }
      },
      // 提高chunk大小警告阈值
      chunkSizeWarningLimit: 1000
    },
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:3000'),
      'process.env.VITE_WEBDAV_BASE_URL': JSON.stringify(env.VITE_WEBDAV_BASE_URL || 'http://localhost:3000/webdav')
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '^/api/.*': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy: any, _options: any) => {
            proxy.on('error', (err: any, _req: any, _res: any) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    }
  }
})

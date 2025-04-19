import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
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
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:3000'),
      'process.env.VITE_WEBDAV_BASE_URL': JSON.stringify(env.VITE_WEBDAV_BASE_URL || 'http://localhost:3000/webdav')
    },
    server: {
      port: 5173,
      proxy: {
        '^/api/.*': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    }
  }
})

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_vue_1 = __importDefault(require("@vitejs/plugin-vue"));
const vite_plugin_vue_devtools_1 = __importDefault(require("vite-plugin-vue-devtools"));
const path_1 = __importDefault(require("path"));
// https://vite.dev/config/
exports.default = (0, vite_1.defineConfig)(({ mode }) => {
    const env = (0, vite_1.loadEnv)(mode, process.cwd(), '');
    return {
        plugins: [
            (0, plugin_vue_1.default)(),
            (0, vite_plugin_vue_devtools_1.default)(),
        ],
        resolve: {
            alias: {
                '@': path_1.default.resolve(__dirname, './src')
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
    };
});

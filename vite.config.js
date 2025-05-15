"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_vue_1 = __importDefault(require("@vitejs/plugin-vue"));
var vite_plugin_vue_devtools_1 = __importDefault(require("vite-plugin-vue-devtools"));
var path_1 = __importDefault(require("path"));
// https://vite.dev/config/
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, plugin_vue_1.default)(),
        (0, vite_plugin_vue_devtools_1.default)(),
    ],
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src')
        }
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
});

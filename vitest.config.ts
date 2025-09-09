/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, './server'),
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/**/*.ts'],
      exclude: [
        'tests/**/*.ts',
        'server/**/*.test.ts',
        'server/**/*.spec.ts',
        'server/**/types.ts',
        'server/**/interfaces.ts'
      ]
    },
    // 设置测试超时时间
    testTimeout: 10000,
    hookTimeout: 10000,
    // 并发运行测试以提高速度
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  }
})

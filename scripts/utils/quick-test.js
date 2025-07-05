#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 快速部署测试\n');

// 检查构建是否完成
if (!fs.existsSync('dist')) {
  console.log('❌ dist 目录不存在，请先运行构建');
  console.log('💡 运行: npm run build');
  process.exit(1);
}

console.log('✅ 找到 dist 目录');

// 检查关键文件
const requiredFiles = [
  'dist/index.html',
  'dist/package.json',
  'dist/server/server.js'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.log('❌ 缺少关键文件:');
  missingFiles.forEach(file => console.log(`   ${file}`));
  console.log('💡 请重新运行: npm run build');
  process.exit(1);
}

console.log('✅ 关键文件检查通过');

// 进入 dist 目录并安装依赖
console.log('📦 安装生产依赖...');
process.chdir('dist');

const installProcess = spawn('npm', ['install', '--production', '--silent'], {
  stdio: 'inherit'
});

installProcess.on('close', (code) => {
  if (code !== 0) {
    console.log('❌ 依赖安装失败');
    process.exit(1);
  }
  
  console.log('✅ 依赖安装完成');
  console.log('🚀 启动服务器...\n');
  
  // 启动服务器
  const serverProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // 处理中断信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止服务器...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
  
  serverProcess.on('close', (code) => {
    console.log(`服务器已停止 (退出码: ${code})`);
  });
});

installProcess.on('error', (error) => {
  console.error('❌ 启动失败:', error.message);
});

#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

console.log('🔍 API Server 运行检查工具\n');

const args = process.argv.slice(2);
const command = args[0] || 'help';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printUsage() {
  log('用法:', 'bold');
  log('  node quick-test.js check        # 检查所有运行方式');
  log('  node quick-test.js dev          # 检查开发环境');
  log('  node quick-test.js prod         # 检查生产环境');
  log('  node quick-test.js docker       # 检查 Docker 环境');
  log('  node quick-test.js ports        # 检查端口占用');
  log('  node quick-test.js build        # 快速构建测试');
  log('  node quick-test.js help         # 显示帮助信息');
}

// 检查端口是否被占用
function checkPort(port, protocol = 'http') {
  return new Promise((resolve) => {
    const client = protocol === 'https' ? https : http;
    const req = client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// 检查文件是否存在
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// 执行命令并捕获输出
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

// 检查依赖
function checkDependencies() {
  log('\n📦 检查依赖...', 'blue');
  
  const nodeResult = runCommand('node --version');
  if (nodeResult.success) {
    log(`✅ Node.js: ${nodeResult.output}`, 'green');
  } else {
    log('❌ Node.js 未安装', 'red');
    return false;
  }

  const npmResult = runCommand('npm --version');
  if (npmResult.success) {
    log(`✅ npm: ${npmResult.output}`, 'green');
  } else {
    log('❌ npm 未安装', 'red');
    return false;
  }

  // 检查 package.json
  if (fileExists('package.json')) {
    log('✅ package.json 存在', 'green');
  } else {
    log('❌ package.json 不存在', 'red');
    return false;
  }

  // 检查 node_modules
  if (fileExists('node_modules')) {
    log('✅ node_modules 存在', 'green');
  } else {
    log('⚠️  node_modules 不存在，请运行 npm install', 'yellow');
  }

  return true;
}

// 检查端口占用
async function checkPorts() {
  log('\n🔌 检查端口占用...', 'blue');
  
  const ports = [
    { port: 3000, name: 'API Server (开发)', protocol: 'http' },
    { port: 3443, name: 'API Server HTTPS (开发)', protocol: 'https' },
    { port: 5173, name: 'Vite Dev Server', protocol: 'http' },
    { port: 80, name: 'HTTP (生产)', protocol: 'http' },
    { port: 443, name: 'HTTPS (生产)', protocol: 'https' }
  ];

  for (const { port, name, protocol } of ports) {
    const isUsed = await checkPort(port, protocol);
    if (isUsed) {
      log(`🟢 ${name} (${port}) - 服务运行中`, 'green');
    } else {
      log(`⚪ ${name} (${port}) - 端口空闲`, 'reset');
    }
  }
}

// 检查构建文件
function checkBuildFiles() {
  log('\n🏗️  检查构建文件...', 'blue');
  
  const buildFiles = [
    'dist/index.html',
    'dist/package.json',
    'dist/server/server.js',
    'dist/server/app.js'
  ];

  let allExist = true;
  for (const file of buildFiles) {
    if (fileExists(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} 不存在`, 'red');
      allExist = false;
    }
  }

  if (!allExist) {
    log('\n💡 提示：运行 npm run build 来构建项目', 'yellow');
  }

  return allExist;
}

// 检查 Docker
function checkDocker() {
  log('\n🐳 检查 Docker 环境...', 'blue');
  
  const dockerResult = runCommand('docker --version');
  if (dockerResult.success) {
    log(`✅ Docker: ${dockerResult.output}`, 'green');
  } else {
    log('❌ Docker 未安装', 'red');
    return false;
  }

  const composeResult = runCommand('docker compose version');
  if (composeResult.success) {
    log(`✅ Docker Compose: ${composeResult.output}`, 'green');
  } else {
    const legacyComposeResult = runCommand('docker-compose --version');
    if (legacyComposeResult.success) {
      log(`✅ Docker Compose: ${legacyComposeResult.output}`, 'green');
    } else {
      log('⚠️  Docker Compose 未安装', 'yellow');
    }
  }

  // 检查 Dockerfile
  if (fileExists('Dockerfile')) {
    log('✅ Dockerfile 存在', 'green');
  } else {
    log('❌ Dockerfile 不存在', 'red');
    return false;
  }

  // 检查 Docker Compose 和 Nginx 配置
  if (fileExists('config/docker-compose.yml')) {
    log('✅ config/docker-compose.yml 存在', 'green');
  } else {
    log('❌ config/docker-compose.yml 不存在', 'red');
  }

  if (fileExists('config/nginx-docker.conf')) {
    log('✅ config/nginx-docker.conf 存在', 'green');
  } else {
    log('❌ config/nginx-docker.conf 不存在', 'red');
  }

  return true;
}

// 快速构建测试
function quickBuild() {
  log('\n🔨 执行快速构建...', 'blue');
  
  const buildResult = runCommand('npm run build');
  if (buildResult.success) {
    log('✅ 构建成功', 'green');
    
    // 检查构建产物
    if (checkBuildFiles()) {
      log('✅ 构建文件完整', 'green');
      
      // 尝试启动预览
      log('\n🚀 尝试启动预览服务器...', 'blue');
      log('💡 运行以下命令来测试：', 'yellow');
      log('   npm run preview', 'yellow');
      log('   或者：cd dist && npm install && npm start', 'yellow');
    }
  } else {
    log('❌ 构建失败', 'red');
    log(buildResult.error || buildResult.output, 'red');
  }
}

// 检查开发环境
async function checkDev() {
  log('\n🛠️  检查开发环境...', 'blue');
  
  // 检查开发端口
  const devPorts = [
    { port: 5173, name: 'Vite Dev Server' },
    { port: 3000, name: 'API Server' }
  ];

  let devRunning = false;
  for (const { port, name } of devPorts) {
    const isUsed = await checkPort(port);
    if (isUsed) {
      log(`🟢 ${name} (${port}) - 正在运行`, 'green');
      devRunning = true;
    } else {
      log(`⚪ ${name} (${port}) - 未运行`, 'reset');
    }
  }

  if (!devRunning) {
    log('\n💡 启动开发环境：', 'yellow');
    log('   npm run dev', 'yellow');
  } else {
    log('\n🎉 开发环境运行中！', 'green');
    log('   前端：http://localhost:5173', 'green');
    log('   后端：http://localhost:3000', 'green');
  }
}

// 检查生产环境
async function checkProd() {
  log('\n🌐 检查生产环境...', 'blue');
  
  // 检查构建文件
  const buildExists = checkBuildFiles();
  
  // 检查生产端口
  const prodPorts = [
    { port: 3000, name: '生产服务器 (默认)' },
    { port: 80, name: '生产服务器 (标准 HTTP)' },
    { port: 443, name: '生产服务器 (标准 HTTPS)' }
  ];

  let prodRunning = false;
  for (const { port, name } of prodPorts) {
    const isUsed = await checkPort(port);
    if (isUsed) {
      log(`🟢 ${name} (${port}) - 正在运行`, 'green');
      prodRunning = true;
    } else {
      log(`⚪ ${name} (${port}) - 未运行`, 'reset');
    }
  }

  if (!prodRunning) {
    if (buildExists) {
      log('\n💡 启动生产环境：', 'yellow');
      log('   npm run start:prod    # 默认端口 3000', 'yellow');
      log('   npm run start:80      # 标准端口 80/443', 'yellow');
      log('   npm run preview       # 构建并预览', 'yellow');
    } else {
      log('\n💡 构建并启动生产环境：', 'yellow');
      log('   npm run build && npm run start:prod', 'yellow');
    }
  } else {
    log('\n🎉 生产环境运行中！', 'green');
  }
}

// 完整检查
async function fullCheck() {
  log('🔍 开始完整环境检查...\n', 'bold');
  
  // 基础检查
  const depsOk = checkDependencies();
  if (!depsOk) {
    log('\n❌ 基础环境检查失败，请先解决依赖问题', 'red');
    return;
  }

  // 端口检查
  await checkPorts();

  // 构建文件检查
  checkBuildFiles();

  // Docker 检查
  checkDocker();

  // 开发环境检查
  await checkDev();

  // 生产环境检查
  await checkProd();

  log('\n📋 运行方式总结:', 'bold');
  log('', 'reset');
  log('开发环境:', 'blue');
  log('  npm run dev           # 前后端同时启动', 'reset');
  log('  npm run frontend      # 只启动前端', 'reset');
  log('  npm run backend       # 只启动后端', 'reset');
  log('', 'reset');
  log('生产环境:', 'blue');
  log('  npm run build         # 构建项目', 'reset');
  log('  npm run start:prod    # 启动生产服务器', 'reset');
  log('  npm run start:80      # 启动标准端口', 'reset');
  log('  npm run preview       # 构建并预览', 'reset');
  log('', 'reset');
  log('Docker 部署:', 'blue');
  log('  npm run docker:build  # 构建镜像', 'reset');
  log('  npm run docker:run    # 运行容器', 'reset');
  log('  npm run docker:compose # Docker Compose', 'reset');
  log('', 'reset');
  log('一键部署:', 'blue');
  log('  ./deploy.sh           # 交互式部署', 'reset');
  log('  node test-build.js    # 构建测试', 'reset');
  log('  node diagnose.js      # 环境诊断', 'reset');
  
  log('\n✅ 检查完成！', 'green');
}

// 主函数
async function main() {
  switch (command) {
    case 'check':
      await fullCheck();
      break;
    case 'dev':
      await checkDev();
      break;
    case 'prod':
      await checkProd();
      break;
    case 'docker':
      checkDocker();
      break;
    case 'ports':
      await checkPorts();
      break;
    case 'build':
      quickBuild();
      break;
    case 'help':
    default:
      printUsage();
      break;
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  log(`\n❌ 发生错误: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`\n❌ Promise 拒绝: ${reason}`, 'red');
  process.exit(1);
});

// 运行主函数
main().catch(error => {
  log(`\n❌ 运行错误: ${error.message}`, 'red');
  process.exit(1);
});

#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 本地打包测试工具\n');

const args = process.argv.slice(2);
const command = args[0] || 'help';

function printUsage() {
  console.log('用法:');
  console.log('  node test-build.js build    # 执行完整构建');
  console.log('  node test-build.js preview  # 构建并启动预览服务器');
  console.log('  node test-build.js clean    # 清理构建文件');
  console.log('  node test-build.js check    # 检查构建结果');
  console.log('  node test-build.js help     # 显示帮助信息');
}

function buildProject() {
  console.log('🔨 开始构建项目...');
  try {
    execSync('node build.js', { stdio: 'inherit' });
    console.log('\n✅ 构建完成！');
    return true;
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    return false;
  }
}

function cleanProject() {
  console.log('🧹 清理构建文件...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ 清理完成！');
  } else {
    console.log('📁 没有找到 dist 目录');
  }
}

function checkBuild() {
  console.log('🔍 检查构建结果...');
  
  if (!fs.existsSync('dist')) {
    console.log('❌ dist 目录不存在，请先运行构建');
    return false;
  }
  
  const requiredFiles = [
    'dist/package.json',
    'dist/index.html',
    'dist/server/server.js'
  ];
  
  let allOk = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} (缺失)`);
      allOk = false;
    }
  });
  
  // 检查文件大小
  if (fs.existsSync('dist')) {
    const stats = fs.statSync('dist');
    console.log(`\n📂 dist 目录信息:`);
    console.log(`   创建时间: ${stats.birthtime.toLocaleString()}`);
    
    // 列出主要文件
    console.log(`\n📋 主要文件列表:`);
    if (fs.existsSync('dist/assets')) {
      const assets = fs.readdirSync('dist/assets');
      assets.forEach(asset => {
        const size = fs.statSync(`dist/assets/${asset}`).size;
        console.log(`   assets/${asset} (${(size/1024).toFixed(1)}KB)`);
      });
    }
    
    if (fs.existsSync('dist/server')) {
      const serverFiles = fs.readdirSync('dist/server');
      serverFiles.forEach(file => {
        if (file.endsWith('.js')) {
          const size = fs.statSync(`dist/server/${file}`).size;
          console.log(`   server/${file} (${(size/1024).toFixed(1)}KB)`);
        }
      });
    }
  }
  
  console.log(allOk ? '\n✅ 构建检查通过！' : '\n❌ 构建检查发现问题');
  return allOk;
}

function previewProject() {
  console.log('👀 启动预览服务器...');
  
  if (!fs.existsSync('dist')) {
    console.log('📦 dist 目录不存在，开始构建...');
    if (!buildProject()) {
      return;
    }
  }
  
  console.log('📦 安装生产依赖...');
  try {
    execSync('cd dist && npm install --production --silent', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    return;
  }
  
  console.log('\n🚀 启动服务器...');
  console.log('📍 服务器将在 http://localhost:3000 启动');
  console.log('💡 按 Ctrl+C 停止服务器\n');
  
  // 启动服务器
  const server = spawn('npm', ['start'], {
    cwd: 'dist',
    stdio: 'inherit'
  });
  
  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止服务器...');
    server.kill('SIGINT');
    process.exit(0);
  });
}

// 执行命令
switch (command) {
  case 'build':
    buildProject();
    break;
  case 'preview':
    previewProject();
    break;
  case 'clean':
    cleanProject();
    break;
  case 'check':
    checkBuild();
    break;
  case 'help':
  default:
    printUsage();
    break;
}

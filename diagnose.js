#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 API_Server 部署诊断工具\n');

// 检查 Node.js 和 npm 版本
function checkEnvironment() {
  console.log('📋 环境检查:');
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
    console.log(`✅ npm: ${npmVersion}`);
  } catch (error) {
    console.log('❌ Node.js 或 npm 未安装');
    return false;
  }
  return true;
}

// 检查依赖安装
function checkDependencies() {
  console.log('\n📦 依赖检查:');
  
  if (!fs.existsSync('node_modules')) {
    console.log('❌ node_modules 目录不存在');
    console.log('💡 请运行: npm install');
    return false;
  }
  
  const criticalPackages = ['vite', 'express', 'vue', 'typescript'];
  let allGood = true;
  
  criticalPackages.forEach(pkg => {
    if (fs.existsSync(`node_modules/${pkg}`)) {
      console.log(`✅ ${pkg}`);
    } else {
      console.log(`❌ ${pkg} (缺失)`);
      allGood = false;
    }
  });
  
  return allGood;
}

// 检查配置文件
function checkConfig() {
  console.log('\n⚙️ 配置文件检查:');
  
  const configFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'server/tsconfig.json'
  ];
  
  let allGood = true;
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} (缺失)`);
      allGood = false;
    }
  });
  
  return allGood;
}

// 尝试构建前端
function testFrontendBuild() {
  console.log('\n🎨 前端构建测试:');
  try {
    console.log('正在构建前端...');
    execSync('npm run build-only', { stdio: 'pipe' });
    console.log('✅ 前端构建成功');
    return true;
  } catch (error) {
    console.log('❌ 前端构建失败:');
    console.log(error.stdout?.toString() || '');
    console.log(error.stderr?.toString() || '');
    return false;
  }
}

// 尝试编译后端
function testBackendBuild() {
  console.log('\n⚙️ 后端编译测试:');
  try {
    console.log('正在编译后端...');
    execSync('npx tsc -p server/tsconfig.json', { stdio: 'pipe' });
    console.log('✅ 后端编译成功');
    return true;
  } catch (error) {
    console.log('❌ 后端编译失败:');
    console.log(error.stdout?.toString() || '');
    console.log(error.stderr?.toString() || '');
    return false;
  }
}

// 测试后端启动
function testBackendStart() {
  console.log('\n🚀 后端启动测试:');
  
  return new Promise((resolve) => {
    const server = spawn('npm', ['run', 'backend'], {
      stdio: 'pipe'
    });
    
    let output = '';
    let hasStarted = false;
    
    server.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Server is running') || output.includes('HTTP Server is running')) {
        console.log('✅ 后端启动成功');
        hasStarted = true;
        server.kill();
        resolve(true);
      }
    });
    
    server.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    server.on('close', (code) => {
      if (!hasStarted) {
        console.log('❌ 后端启动失败:');
        console.log(output);
        resolve(false);
      }
    });
    
    // 10秒超时
    setTimeout(() => {
      if (!hasStarted) {
        console.log('⏰ 后端启动超时');
        server.kill();
        resolve(false);
      }
    }, 10000);
  });
}

// 生成诊断报告
function generateReport(results) {
  console.log('\n📊 诊断报告:');
  console.log('====================');
  
  const issues = [];
  const solutions = [];
  
  if (!results.environment) {
    issues.push('Node.js 或 npm 环境问题');
    solutions.push('请安装 Node.js 18+ 和 npm 8+');
  }
  
  if (!results.dependencies) {
    issues.push('依赖包缺失或损坏');
    solutions.push('运行: rm -rf node_modules package-lock.json && npm install');
  }
  
  if (!results.config) {
    issues.push('配置文件缺失');
    solutions.push('检查项目完整性，重新下载源码');
  }
  
  if (!results.frontendBuild) {
    issues.push('前端构建失败');
    solutions.push('检查 Vue3/Vite 配置和依赖');
  }
  
  if (!results.backendBuild) {
    issues.push('后端编译失败');
    solutions.push('检查 TypeScript 配置和类型定义');
  }
  
  if (!results.backendStart) {
    issues.push('后端启动失败');
    solutions.push('检查端口占用、数据库连接、环境变量');
  }
  
  if (issues.length === 0) {
    console.log('🎉 所有检查都通过！您可以尝试完整部署了。');
    console.log('\n下一步操作:');
    console.log('1. npm run build    # 完整构建');
    console.log('2. npm run preview  # 本地预览');
    console.log('3. 访问 http://localhost:3000');
  } else {
    console.log(`发现 ${issues.length} 个问题:`);
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    console.log('\n建议解决方案:');
    solutions.forEach((solution, i) => {
      console.log(`${i + 1}. ${solution}`);
    });
  }
  
  console.log('\n🔧 常用修复命令:');
  console.log('npm install                    # 重新安装依赖');
  console.log('npm run build                  # 完整构建');
  console.log('npm run dev                    # 开发模式');
  console.log('node diagnose.js               # 重新诊断');
}

// 主函数
async function main() {
  const results = {
    environment: checkEnvironment(),
    dependencies: checkDependencies(),
    config: checkConfig(),
    frontendBuild: false,
    backendBuild: false,
    backendStart: false
  };
  
  if (results.environment && results.dependencies && results.config) {
    results.frontendBuild = testFrontendBuild();
    results.backendBuild = testBackendBuild();
    
    if (results.backendBuild) {
      results.backendStart = await testBackendStart();
    }
  }
  
  generateReport(results);
}

main().catch(console.error);

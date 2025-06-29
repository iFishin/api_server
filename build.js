#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 API_Server 全栈项目...\n');

// 清理之前的构建
console.log('📦 清理构建目录...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

try {
  // 1. 构建前端
  console.log('🎨 构建 Vue3 前端...');
  execSync('npm run build-only', { stdio: 'inherit' });
  
  // 2. 构建后端
  console.log('⚙️  构建 Node.js 后端...');
  execSync('npx tsc -p server/tsconfig.json', { stdio: 'inherit' });
  
  // 3. 复制必要文件
  console.log('📁 复制必要文件...');
  
  // 复制 package.json 并修改
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description || 'API_Server - All-in-One Development Platform',
    main: 'server/server.js',
    type: 'commonjs',
    scripts: {
      start: 'node server/server.js',
      'start:prod': 'NODE_ENV=production node server/server.js',
      'start:80': 'NODE_ENV=production HTTP_PORT=80 HTTPS_PORT=443 node server/server.js',
      'start:dev': 'NODE_ENV=development HTTP_PORT=3000 HTTPS_PORT=3443 node server/server.js'
    },
    dependencies: packageJson.dependencies
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
  
  // 复制其他必要文件
  const filesToCopy = [
    'README.md',
    '.env.example'
  ];
  
  // 复制数据库文件（如果存在）
  if (fs.existsSync('database.db')) {
    filesToCopy.push('database.db');
  }
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, `dist/${file}`);
      console.log(`  ✓ 复制 ${file}`);
    }
  });
  
  // 复制 server 目录中的非 ts 文件
  const copyServerAssets = (srcDir, destDir) => {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const items = fs.readdirSync(srcDir);
    items.forEach(item => {
      const srcPath = path.join(srcDir, item);
      const destPath = path.join(destDir, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        copyServerAssets(srcPath, destPath);
      } else if (!item.endsWith('.ts') && !item.endsWith('.js.map')) {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };
  
  // 复制 server 静态资源
  ['certs', 'public', 'temps'].forEach(dir => {
    const srcPath = `server/${dir}`;
    if (fs.existsSync(srcPath)) {
      copyServerAssets(srcPath, `dist/server/${dir}`);
    }
  });
  
  console.log('✅ 构建完成！');
  console.log('\n📂 构建结果：');
  console.log('  dist/');
  console.log('  ├── 前端文件 (HTML, CSS, JS)');
  console.log('  ├── server/ (后端编译文件)');
  console.log('  ├── package.json (生产环境配置)');
  console.log('  └── 其他必要文件');
  
  // 显示文件大小信息
  if (fs.existsSync('dist/index.html')) {
    const indexSize = fs.statSync('dist/index.html').size;
    console.log(`\n📊 构建统计:`);
    console.log(`  index.html: ${(indexSize/1024).toFixed(1)}KB`);
  }
  
  if (fs.existsSync('dist/assets')) {
    const assets = fs.readdirSync('dist/assets');
    assets.forEach(asset => {
      const size = fs.statSync(`dist/assets/${asset}`).size;
      const sizeKB = (size/1024).toFixed(1);
      console.log(`  assets/${asset}: ${sizeKB}KB`);
    });
  }
  
  console.log('\n🚀 部署说明：');
  console.log('1. 将 dist 目录上传到服务器');
  console.log('2. 在 dist 目录运行: npm install --production');
  console.log('3. 启动服务: npm start');
  console.log('4. 访问: http://服务器IP:3000');
  
  console.log('\n🧪 本地测试方法：');
  console.log('1. 快速预览: npm run preview');
  console.log('2. 详细测试: node test-build.js preview');
  console.log('3. 检查构建: node test-build.js check');
  console.log('4. 清理文件: node test-build.js clean\n');

} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}

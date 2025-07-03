#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🪟 开始构建 Windows 版本...');

// 清理之前的构建
console.log('🧹 清理之前的构建文件...');
if (fs.existsSync('release')) {
  execSync('rm -rf release', { stdio: 'inherit' });
}
if (fs.existsSync('dist')) {
  execSync('rm -rf dist', { stdio: 'inherit' });
}

try {
  // 构建应用
  console.log('🔨 开始构建应用...');
  execSync('npm run build', { stdio: 'inherit' });

  // 只为 Windows 打包
  console.log('📦 开始打包 Windows 版本...');
  execSync('npx electron-builder --win --x64 --arm64', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production'
    }
  });

  console.log('✅ Windows 构建完成！');
  console.log('📁 输出目录: release/');
  
  // 显示生成的文件大小
  const releaseDir = path.join(__dirname, '../release');
  if (fs.existsSync(releaseDir)) {
    const files = fs.readdirSync(releaseDir);
    console.log('\n📊 生成的安装包:');
    files.forEach(file => {
      if (file.endsWith('.exe') || file.endsWith('.zip')) {
        const filePath = path.join(releaseDir, file);
        const stats = fs.statSync(filePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  - ${file}: ${sizeInMB} MB`);
      }
    });
  }

} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
} 
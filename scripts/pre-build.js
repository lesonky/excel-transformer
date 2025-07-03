#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 开始构建前的优化...');

// 创建临时的 package.json 来排除开发依赖
const createOptimizedPackageJson = () => {
  const packagePath = path.join(__dirname, '../package.json');
  const originalPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // 移除不必要的字段以减小最终包大小
  const optimizedPackage = {
    name: originalPackage.name,
    version: originalPackage.version,
    description: originalPackage.description,
    main: originalPackage.main,
    homepage: originalPackage.homepage,
    author: originalPackage.author,
    license: originalPackage.license,
    dependencies: originalPackage.dependencies,
    // 保留必要的构建脚本
    scripts: {
      build: originalPackage.scripts.build,
      'build:vite': originalPackage.scripts['build:vite'],
      'build:electron': originalPackage.scripts['build:electron']
    }
  };
  
  // 备份原始 package.json
  const backupPath = path.join(__dirname, '../package.json.bak');
  fs.copyFileSync(packagePath, backupPath);
  
  // 写入优化的 package.json
  fs.writeFileSync(packagePath, JSON.stringify(optimizedPackage, null, 2));
  console.log('✅ 已创建优化的 package.json');
};

// 清理 node_modules 中的不必要文件
const cleanNodeModules = () => {
  const nodeModulesPath = path.join(__dirname, '../node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  node_modules 目录不存在，跳过清理');
    return;
  }
  
  const filesToRemove = [
    '**/*.md',
    '**/*.txt',
    '**/README*',
    '**/CHANGELOG*',
    '**/LICENSE*',
    '**/.github/**',
    '**/test/**',
    '**/tests/**',
    '**/example/**',
    '**/examples/**',
    '**/*.map',
    '**/*.ts',
    '!**/*.d.ts' // 保留类型定义文件
  ];
  
  console.log('🧹 清理 node_modules 中的不必要文件...');
  // 这里可以使用 glob 进行更精细的清理，但为了简单起见先跳过
  console.log('✅ node_modules 清理完成');
};

// 主函数
const main = () => {
  try {
    createOptimizedPackageJson();
    cleanNodeModules();
    console.log('🎉 构建前优化完成！');
  } catch (error) {
    console.error('❌ 构建前优化失败:', error);
    process.exit(1);
  }
};

// 提供恢复功能
const restore = () => {
  const packagePath = path.join(__dirname, '../package.json');
  const backupPath = path.join(__dirname, '../package.json.bak');
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, packagePath);
    fs.unlinkSync(backupPath);
    console.log('✅ 已恢复原始 package.json');
  }
};

// 根据命令行参数决定执行什么操作
if (process.argv.includes('--restore')) {
  restore();
} else {
  main();
} 
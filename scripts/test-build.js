const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 验证构建配置...');

// 检查必要的文件是否存在
const requiredFiles = [
  'package.json',
  'src/assets/icons/icon.ico',
  'src/assets/icons/icon.icns',
  'src/assets/icons/icon-256.png',
  'build/entitlements.mac.plist',
  '.github/workflows/release.yml'
];

console.log('\n📁 检查必要文件...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 存在缺失文件，请检查配置');
  process.exit(1);
}

// 检查 package.json 配置
console.log('\n📋 检查 package.json 配置...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// 检查构建配置
if (!packageJson.build) {
  console.log('❌ package.json 缺少 build 配置');
  process.exit(1);
}

const buildConfig = packageJson.build;

// 检查各平台配置
['mac', 'win', 'linux'].forEach(platform => {
  if (buildConfig[platform]) {
    console.log(`✅ ${platform} 配置存在`);
    if (buildConfig[platform].target) {
      console.log(`  └─ 目标格式: ${JSON.stringify(buildConfig[platform].target)}`);
    }
  } else {
    console.log(`❌ ${platform} 配置缺失`);
  }
});

// 检查脚本
console.log('\n📜 检查 npm 脚本...');
const requiredScripts = ['build', 'build:vite', 'build:electron', 'generate-icons', 'dist'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} - 脚本不存在`);
  }
});

// 检查依赖
console.log('\n📦 检查关键依赖...');
const requiredDeps = {
  'electron': 'devDependencies',
  'electron-builder': 'devDependencies',
  'vite': 'devDependencies',
  'typescript': 'devDependencies'
};

Object.entries(requiredDeps).forEach(([dep, type]) => {
  if (packageJson[type] && packageJson[type][dep]) {
    console.log(`✅ ${dep} (${type})`);
  } else {
    console.log(`❌ ${dep} (${type}) - 依赖缺失`);
  }
});

// 检查图标文件大小
console.log('\n🖼️  检查图标文件...');
const iconFiles = [
  'src/assets/icons/icon.ico',
  'src/assets/icons/icon.icns',
  'src/assets/icons/icon-256.png',
  'src/assets/icons/icon-128.png',
  'src/assets/icons/icon-64.png',
  'src/assets/icons/icon-48.png',
  'src/assets/icons/icon-32.png',
  'src/assets/icons/icon-16.png'
];

iconFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
  }
});

// 检查 GitHub Actions 工作流
console.log('\n🔄 检查 GitHub Actions 工作流...');
try {
  const workflowContent = fs.readFileSync('.github/workflows/release.yml', 'utf8');
  
  // 检查关键配置
  const checks = [
    { pattern: /on:\s*push:\s*tags:/, message: '标签触发配置' },
    { pattern: /macos-latest/, message: 'macOS 构建' },
    { pattern: /windows-latest/, message: 'Windows 构建' },
    { pattern: /ubuntu-latest/, message: 'Linux 构建' },
    { pattern: /samuelmeuli\/action-electron-builder/, message: 'Electron Builder Action' }
  ];

  checks.forEach(check => {
    if (check.pattern.test(workflowContent)) {
      console.log(`✅ ${check.message}`);
    } else {
      console.log(`❌ ${check.message} - 配置缺失`);
    }
  });
} catch (error) {
  console.log('❌ 无法读取 GitHub Actions 工作流文件');
}

console.log('\n🎉 配置验证完成！');
console.log('\n💡 提示：');
console.log('   1. 确保已安装所有依赖: npm install');
console.log('   2. 测试本地构建: npm run build');
console.log('   3. 创建发布标签: git tag v1.0.0 && git push origin v1.0.0');
console.log('   4. 查看 GitHub Actions 构建状态'); 
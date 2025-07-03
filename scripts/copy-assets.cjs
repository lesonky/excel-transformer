const fs = require('fs');
const path = require('path');

// 确保目标目录存在
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 复制文件
const copyFile = (src, dest) => {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`复制: ${src} -> ${dest}`);
  } else {
    console.warn(`警告: 源文件不存在 ${src}`);
  }
};

// 复制整个目录
const copyDir = (src, dest) => {
  ensureDir(dest);
  
  if (!fs.existsSync(src)) {
    console.warn(`警告: 源目录不存在 ${src}`);
    return;
  }
  
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      copyFile(srcFile, destFile);
    }
  });
};

// 主函数
const main = () => {
  console.log('开始复制图标资源文件...');
  
  // 复制图标文件到dist目录
  const srcAssetsDir = path.join(__dirname, '../src/assets');
  const destAssetsDir = path.join(__dirname, '../dist/assets');
  
  copyDir(srcAssetsDir, destAssetsDir);
  
  console.log('图标资源文件复制完成！');
};

main(); 
const png2icons = require('png2icons');
const fs = require('fs');
const path = require('path');

console.log('🖼️  开始生成平台特定图标格式...');

const iconsDir = path.join(__dirname, '../src/assets/icons');
const inputPng = path.join(iconsDir, 'icon-512.png');

async function generatePlatformIcons() {
  try {
    // 读取512x512的PNG图标
    const input = fs.readFileSync(inputPng);
    
    // 生成macOS .icns文件
    console.log('生成 macOS .icns 图标...');
    const icnsOutput = png2icons.createICNS(input, png2icons.BILINEAR, 0);
    fs.writeFileSync(path.join(iconsDir, 'icon.icns'), icnsOutput);
    console.log('✅ icon.icns 生成完成');
    
    // 生成Windows .ico文件
    console.log('生成 Windows .ico 图标...');
    const icoOutput = png2icons.createICO(input, png2icons.BILINEAR, 0, false);
    fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoOutput);
    console.log('✅ icon.ico 生成完成');
    
    console.log('🎉 所有平台图标生成完成！');
    
    // 显示生成的文件信息
    const files = fs.readdirSync(iconsDir);
    console.log('\n📁 图标文件列表:');
    files.forEach(file => {
      const filePath = path.join(iconsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  ${file} (${sizeKB}KB)`);
    });
    
  } catch (error) {
    console.error('❌ 生成平台图标失败:', error.message);
    console.log('请确保已安装必要的依赖: npm install png2icons --save-dev');
  }
}

generatePlatformIcons(); 
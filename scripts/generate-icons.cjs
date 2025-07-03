const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 开始生成高质量图标...');

const iconSizes = [
  { size: 16, file: 'icon-16.png' },
  { size: 32, file: 'icon-32.png' },
  { size: 48, file: 'icon-48.png' },
  { size: 64, file: 'icon-64.png' },
  { size: 128, file: 'icon-128.png' },
  { size: 256, file: 'icon-256.png' },
  { size: 512, file: 'icon-512.png' }
];

const srcSvg = path.join(__dirname, '../src/assets/icon.svg');
const iconsDir = path.join(__dirname, '../src/assets/icons');

// 确保icons目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 检查是否安装了 sharp (Node.js图像处理库)
let useSharp = false;
try {
  require('sharp');
  useSharp = true;
  console.log('✅ 使用Sharp进行高质量图标转换');
} catch (e) {
  console.log('⚠️  Sharp未安装，尝试使用系统工具...');
}

if (useSharp) {
  // 使用Sharp进行高质量转换
  const sharp = require('sharp');
  
  async function generateIcons() {
    const svgBuffer = fs.readFileSync(srcSvg);
    
    for (const { size, file } of iconSizes) {
      try {
        console.log(`生成 ${file} (${size}x${size})`);
        await sharp(svgBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png({
            quality: 100,
            compressionLevel: 0, // 最小压缩以保持质量
            adaptiveFiltering: false
          })
          .toFile(path.join(iconsDir, file));
      } catch (error) {
        console.error(`❌ 生成 ${file} 失败:`, error.message);
      }
    }
    
    // 生成主图标文件
    console.log('生成主图标文件 icon.png');
    await sharp(svgBuffer)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 100 })
      .toFile(path.join(__dirname, '../src/assets/icon.png'));
      
    console.log('✅ 所有PNG图标生成完成！');
  }
  
  generateIcons().catch(console.error);
} else {
  // 备用方案：尝试使用系统的convert命令（ImageMagick）
  try {
    execSync('convert -version', { stdio: 'ignore' });
    console.log('✅ 使用ImageMagick进行图标转换');
    
    for (const { size, file } of iconSizes) {
      try {
        console.log(`生成 ${file} (${size}x${size})`);
        const outputPath = path.join(iconsDir, file);
        execSync(`convert -background transparent "${srcSvg}" -resize ${size}x${size} "${outputPath}"`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`❌ 生成 ${file} 失败:`, error.message);
      }
    }
    
    // 生成主图标文件
    console.log('生成主图标文件 icon.png');
    const mainIconPath = path.join(__dirname, '../src/assets/icon.png');
    execSync(`convert -background transparent "${srcSvg}" -resize 256x256 "${mainIconPath}"`, { stdio: 'inherit' });
    
    console.log('✅ 所有PNG图标生成完成！');
  } catch (error) {
    console.log('❌ ImageMagick未找到，请安装sharp或ImageMagick来生成PNG图标');
    console.log('安装命令：');
    console.log('  npm install sharp  # 或');
    console.log('  brew install imagemagick  # macOS');
    console.log('');
    console.log('当前只能使用现有的SVG图标，可能在某些尺寸下显示不够清晰。');
  }
} 
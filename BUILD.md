# Excel字段转换工具 - 构建指南

## 快速开始

### 构建 macOS 版本（DMG）
```bash
npm run build:mac
```

### 构建 Windows 版本（安装包）
```bash
npm run build:win
```

### 构建所有平台
```bash
npm run build:all
```

## 输出文件

构建完成后，安装包将在 `release/` 目录中：

### macOS
- `Excel字段转换工具-1.0.0-arm64.dmg` - Apple Silicon 版本
- `Excel字段转换工具-1.0.0-x64.dmg` - Intel 版本

### Windows
- `Excel字段转换工具-Setup-1.0.0-x64.exe` - 64位安装包（仅在 Windows 或配置了 wine 的环境中生成）
- `Excel字段转换工具-Setup-1.0.0-arm64.exe` - ARM64 安装包（仅在 Windows 或配置了 wine 的环境中生成）
- `Excel字段转换工具-1.0.0-x64.zip` - 64位便携版本
- `Excel字段转换工具-1.0.0-arm64.zip` - ARM64 便携版本

## 构建优化

本项目包含以下优化措施来减小安装包大小：

### 1. 文件排除
- 排除开发相关文件（测试、文档、源码映射等）
- 排除 node_modules 中的不必要文件
- 最大压缩级别

### 2. 平台特定优化
- **macOS**: 使用 ULFO 格式的 DMG，优化图标布局
- **Windows**: 使用 NSIS 安装程序，LZMA 压缩

### 3. 构建前预处理
- 临时移除开发依赖
- 清理不必要的包文件
- 自动恢复原始配置

## 系统要求

### 开发环境
- Node.js 18+
- npm 或 yarn

### 构建环境
- **macOS 构建**: 需要在 macOS 上进行
- **Windows 构建**: 
  - 推荐在 Windows 上进行（可生成完整的 NSIS 安装包）
  - 在 macOS 上可生成 zip 格式的便携版本
  - 在 Linux 上需要安装 wine 来生成 NSIS 安装包

## 构建流程详解

1. **清理**: 删除之前的构建文件
2. **优化**: 临时优化 package.json，排除开发依赖
3. **编译**: TypeScript 编译 + Vite 构建
4. **打包**: electron-builder 创建安装包
5. **恢复**: 恢复原始项目配置
6. **报告**: 显示生成的文件大小

## 注意事项

### macOS 签名
当前配置跳过了代码签名（`CSC_IDENTITY_AUTO_DISCOVERY: false`）。
如需发布到 App Store 或启用 Gatekeeper，需要：
1. 获得 Apple 开发者证书
2. 移除 `CSC_IDENTITY_AUTO_DISCOVERY: false`
3. 配置正确的签名身份

### Windows 签名
当前配置未启用代码签名。如需签名：
1. 获得代码签名证书
2. 移除 `signtool: "none"`
3. 配置证书信息

### 预期文件大小
- macOS DMG: ~150-200MB
- Windows 安装包: ~120-180MB

实际大小取决于依赖项和资源文件。

## 故障排除

### 构建失败
1. 确认 Node.js 版本 >= 18
2. 删除 `node_modules` 重新安装
3. 检查磁盘空间是否充足

### 包大小过大
1. 检查是否有大型依赖未被排除
2. 验证图标文件大小
3. 考虑使用 webpack-bundle-analyzer 分析

### 权限问题
```bash
chmod +x scripts/*.js
```

## 自定义构建

可以修改 `package.json` 中的 `build` 配置来自定义：
- 应用图标
- 安装程序外观
- 文件关联
- 系统要求

更多配置选项请参考 [electron-builder 文档](https://www.electron.build/)。 
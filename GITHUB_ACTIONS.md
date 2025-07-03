# GitHub Actions 自动化发布

本项目配置了 GitHub Actions 自动化工作流，可以在推送 release tag 时自动构建和发布 macOS 和 Windows 客户端。

## 🚀 发布流程

### 方式一：推送 Release Tag（推荐）

1. **确保代码已提交并推送到主分支**
   ```bash
   git add .
   git commit -m "准备发布 v1.0.0"
   git push origin main
   ```

2. **创建并推送 release tag**
   ```bash
   # 创建带注释的 tag
   git tag -a v1.0.0 -m "Release v1.0.0: 添加新功能"
   
   # 推送 tag 触发自动构建
   git push origin v1.0.0
   ```

3. **等待自动构建完成**
   - 访问 GitHub 仓库的 Actions 页面查看构建进度
   - 构建完成后会自动创建 GitHub Release

### 方式二：手动触发

1. **访问 GitHub Actions 页面**
   - 进入仓库 → Actions → Release Build

2. **点击 "Run workflow"**
   - 选择分支（通常是 main）
   - 输入版本号（如 v1.0.0）
   - 点击 "Run workflow"

## 📦 构建产物

自动构建会生成以下文件：

### macOS
- `Excel字段转换工具-{version}-x64.dmg` - Intel 芯片版本
- `Excel字段转换工具-{version}-arm64.dmg` - Apple Silicon 版本

### Windows
- `Excel字段转换工具-Setup-{version}-x64.exe` - 64位安装包
- `Excel字段转换工具-Setup-{version}-arm64.exe` - ARM64 安装包
- `Excel字段转换工具-{version}-x64.zip` - 64位便携版
- `Excel字段转换工具-{version}-arm64.zip` - ARM64 便携版

## 🔧 工作流配置

### 触发条件
- **Tag 推送**: 匹配模式 `v*.*.*` 的 tag（如 v1.0.0, v2.1.3）
- **手动触发**: 在 GitHub Actions 页面手动运行

### 构建矩阵
- **macOS**: 在 `macos-latest` 上构建 DMG 文件
- **Windows**: 在 `windows-latest` 上构建 NSIS 安装包和 ZIP 便携版

### 构建步骤
1. 检出代码
2. 设置 Node.js 18 环境
3. 安装依赖（使用 npm ci）
4. 构建应用（调用对应的构建脚本）
5. 上传构建产物
6. 创建 GitHub Release

## 📋 版本命名规范

推荐使用语义化版本号：
- `v1.0.0` - 主版本（重大更新）
- `v1.1.0` - 次版本（新功能）
- `v1.1.1` - 修订版本（bug 修复）

## ⚠️ 注意事项

### 代码签名
当前配置跳过了代码签名，适用于开发和测试。生产环境建议：
- **macOS**: 配置 Apple 开发者证书
- **Windows**: 配置代码签名证书

### 权限要求
工作流需要以下权限：
- `contents: write` - 用于创建 Release 和上传文件

### 依赖要求
- Node.js 18+
- npm（使用 package-lock.json）

## 🐛 故障排除

### 构建失败
1. **检查 package.json 语法**
   ```bash
   npm run build  # 本地测试构建
   ```

2. **检查依赖版本兼容性**
   ```bash
   npm audit  # 检查依赖问题
   ```

3. **查看 Actions 日志**
   - 在 GitHub Actions 页面查看详细错误信息

### Release 创建失败
1. **检查 tag 格式**
   - 确保 tag 匹配 `v*.*.*` 模式
   
2. **检查权限**
   - 确保仓库有足够的权限创建 Release

### 文件上传失败
1. **检查文件路径**
   - 确认构建产物在 `release/` 目录中

2. **检查文件大小**
   - GitHub Release 单个文件最大 2GB

## 🔄 工作流更新

如需修改工作流：
1. 编辑 `.github/workflows/release.yml`
2. 提交并推送更改
3. 下次 tag 推送时使用新配置

## 📝 示例发布流程

```bash
# 1. 完成开发并测试
npm run dev
npm run build:mac  # 本地测试构建

# 2. 更新版本号（可选）
# 编辑 package.json 中的 version 字段

# 3. 提交代码
git add .
git commit -m "feat: 添加新功能，准备发布 v1.1.0"
git push origin main

# 4. 创建并推送 tag
git tag -a v1.1.0 -m "Release v1.1.0: 添加Excel导入优化功能"
git push origin v1.1.0

# 5. 等待自动构建和发布
# 访问 https://github.com/用户名/仓库名/actions 查看进度
# 完成后访问 https://github.com/用户名/仓库名/releases 下载
```

---

通过这个自动化工作流，您可以轻松地发布跨平台的客户端应用，为用户提供便捷的下载体验。 
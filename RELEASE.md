# 发布说明

## 自动化构建和发布

本项目使用 GitHub Actions 进行自动化构建和发布。当推送以 `v` 开头的标签时，会自动触发构建流程。

## 发布流程

### 1. 创建发布标签

```bash
# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

### 2. 自动构建

GitHub Actions 会自动构建以下平台的应用程序：

- **macOS**: 
  - DMG 安装包 (arm64 + x64)
  - ZIP 压缩包 (arm64 + x64)
- **Windows**: 
  - NSIS 安装程序 (x64 + arm64)
  - ZIP 压缩包 (x64 + arm64)
- **Linux**: 
  - AppImage (x64)
  - DEB 包 (x64)
  - RPM 包 (x64)

### 3. 代码签名配置（可选）

如果需要对应用程序进行代码签名，请在 GitHub 仓库的 Settings > Secrets 中添加以下环境变量：

#### macOS 代码签名
- `CSC_LINK`: 开发者证书的 Base64 编码
- `CSC_KEY_PASSWORD`: 证书密码
- `APPLE_ID`: Apple ID
- `APPLE_APP_SPECIFIC_PASSWORD`: 应用专用密码
- `APPLE_TEAM_ID`: 开发者团队 ID

#### Windows 代码签名
- `WIN_CSC_LINK`: Windows 代码签名证书的 Base64 编码
- `WIN_CSC_KEY_PASSWORD`: 证书密码

## 本地构建

### 构建所有平台（需要相应的操作系统）

```bash
# 构建 macOS
npm run dist

# 构建 Windows
npm run dist -- --win

# 构建 Linux
npm run dist -- --linux
```

### 构建特定架构

```bash
# 构建 Windows x64
npm run dist -- --win --x64

# 构建 Windows ARM64
npm run dist -- --win --arm64

# 构建 macOS Intel
npm run dist -- --mac --x64

# 构建 macOS Apple Silicon
npm run dist -- --mac --arm64
```

## 发布检查清单

在创建新版本之前，请确保：

- [ ] 更新 `package.json` 中的版本号
- [ ] 更新 `CHANGELOG.md`（如果有）
- [ ] 所有测试通过
- [ ] 代码已经合并到主分支
- [ ] 创建并推送标签

## 故障排除

### 构建失败

1. 检查 Node.js 版本是否正确
2. 确保所有依赖项都已安装
3. 检查图标文件是否存在
4. 查看 GitHub Actions 日志了解详细错误信息

### 代码签名失败

1. 确保证书有效且未过期
2. 检查环境变量是否正确设置
3. 对于 macOS，确保已启用双重认证
4. 检查权限文件配置

## 输出文件

构建完成后，以下文件会被上传到 GitHub Release：

- `Excel字段转换工具-{version}-arm64.dmg` (macOS ARM64)
- `Excel字段转换工具-{version}.dmg` (macOS x64)
- `Excel字段转换工具 Setup {version}.exe` (Windows)
- `Excel字段转换工具-{version}.AppImage` (Linux)
- `excel-transformer_{version}_amd64.deb` (Linux DEB)
- `excel-transformer-{version}.x86_64.rpm` (Linux RPM)
- 各平台的 ZIP 压缩包 
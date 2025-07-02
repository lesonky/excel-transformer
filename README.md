# Excel字段转换工具

> 🤖 **Vibe Coding Project** | 本项目属于 vibe coding 实验项目，所有代码工作均由 AI (Claude-4-Sonnet) 完成，展示了 AI 在软件开发中的能力。

一款跨平台（Mac/Windows）的桌面应用程序，专门用于智能转换Excel文件中的字段值。通过集成Gemini大模型能力，为用户提供智能化的字段值映射和转换服务。

## ✨ 项目特色

这是一个完全由AI开发的桌面应用程序，从项目架构设计、代码实现、到UI界面设计，全程展示了AI在现代软件开发中的强大能力。

## 功能特点

- 🤖 **AI智能映射**: 基于Gemini大模型自动生成字段值对应关系
- 🎯 **简化操作**: 直观的GUI界面，降低用户操作门槛  
- ⚡ **高效转换**: 批量处理Excel文件中的字段值转换
- 🖥️ **跨平台**: 支持Mac和Windows操作系统
- 🔒 **安全私密**: 本地处理数据，API KEY加密存储
- 🎨 **高质量图标**: AI生成的现代化应用图标系统

## 技术栈

- **应用框架**: Electron + React
- **开发语言**: TypeScript + Node.js
- **Excel处理**: exceljs
- **AI集成**: Google Gemini API
- **UI组件库**: Ant Design
- **状态管理**: Zustand
- **本地存储**: SQLite + better-sqlite3
- **构建工具**: Vite + Electron Builder
- **图标生成**: Sharp + png2icons

## 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置API KEY

首次运行需要配置Google Gemini API KEY：

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录Google账户并创建API KEY
3. 在应用设置中配置API KEY

### 开发模式

```bash
# 启动开发模式
npm run dev

# 仅启动渲染进程开发服务器
npm run dev:vite

# 仅启动Electron主进程
npm run dev:electron
```

### 构建应用

```bash
# 构建所有代码
npm run build

# 仅构建渲染进程
npm run build:vite  

# 仅构建主进程
npm run build:electron

# 生成高质量图标
npm run generate-icons

# 打包应用程序
npm run pack

# 生成分发包
npm run dist
```

## 项目结构

```
excel-transformer/
├── src/
│   ├── main/                 # 主进程代码
│   │   ├── services/         # 服务层
│   │   │   ├── ConfigService.ts    # 配置管理
│   │   │   ├── AIService.ts        # AI调用服务
│   │   │   └── ExcelService.ts     # Excel处理服务
│   │   ├── main.ts          # 主进程入口
│   │   └── preload.ts       # 预加载脚本
│   ├── renderer/            # 渲染进程代码
│   │   ├── components/      # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── stores/         # 状态管理
│   │   ├── services/       # 服务层
│   │   ├── types/          # 类型定义
│   │   ├── App.tsx         # 主应用组件
│   │   ├── main.tsx        # 入口文件
│   │   └── index.html      # HTML模板
│   └── assets/             # 资源文件
│       ├── icons/          # 应用图标
│       ├── icon.svg        # 高质量SVG图标
│       └── icon.png        # 主图标文件
├── scripts/                # 构建脚本
│   ├── copy-assets.js      # 资源复制脚本
│   ├── generate-icons.js   # 图标生成脚本
│   └── generate-platform-icons.js # 平台图标生成
├── dist/                   # 构建输出
├── release/               # 打包输出
├── package.json
├── tsconfig.json          # 渲染进程TS配置
├── tsconfig.main.json     # 主进程TS配置
├── tsconfig.preload.json  # 预加载脚本TS配置
└── vite.config.ts         # Vite配置
```

## 🤖 AI开发说明

本项目是 **vibe coding** 实验的成果，完全由AI完成：

### AI完成的工作
- 📋 **项目架构设计** - 从零开始设计整体架构
- 💻 **代码实现** - 100% AI编写的TypeScript/React代码
- 🎨 **UI/UX设计** - 界面布局和用户体验设计
- 🖼️ **图标设计** - 高质量SVG图标和多尺寸PNG生成
- 🔧 **构建配置** - Electron打包配置和构建脚本
- 📚 **文档编写** - 完整的技术文档和用户文档

### 技术亮点
- 现代化的Electron + React技术栈
- 完整的TypeScript类型定义
- 响应式UI设计
- 跨平台兼容性
- 高质量的应用图标系统

## 开发进度

- [x] 项目初始化和依赖安装
- [x] 基础架构搭建
- [x] API KEY配置管理系统
- [x] 高质量图标系统
- [x] 应用打包和分发
- [x] Excel文件处理功能
- [x] GUI界面开发
- [x] AI映射生成功能
- [x] 数据转换引擎

## 贡献

这是一个AI开发的实验性项目，欢迎：
- 🐛 报告bug和问题
- 💡 提供功能建议
- 🔍 代码审查和优化建议
- 📖 文档改进

请在GitHub Issues中提出您的想法。

## 许可证

MIT License

## 支持

如果遇到问题，请在GitHub Issues中提出。

---

*本项目展示了AI在软件开发中的潜力，所有代码均由Claude-4-Sonnet生成。* 
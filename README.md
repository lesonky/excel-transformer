# Excel字段转换工具

一款跨平台（Mac/Windows）的桌面应用程序，专门用于智能转换Excel文件中的字段值。通过集成Gemini大模型能力，为用户提供智能化的字段值映射和转换服务。

## 功能特点

- 🤖 **AI智能映射**: 基于Gemini大模型自动生成字段值对应关系
- 🎯 **简化操作**: 直观的GUI界面，降低用户操作门槛  
- ⚡ **高效转换**: 批量处理Excel文件中的字段值转换
- 🖥️ **跨平台**: 支持Mac和Windows操作系统
- 🔒 **安全私密**: 本地处理数据，API KEY加密存储

## 技术栈

- **应用框架**: Electron + React
- **开发语言**: TypeScript + Node.js
- **Excel处理**: exceljs
- **AI集成**: Google Gemini API
- **UI组件库**: Ant Design
- **状态管理**: Zustand
- **本地存储**: SQLite + better-sqlite3
- **构建工具**: Vite + Electron Builder

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
│   │   │   └── AIService.ts        # AI调用服务
│   │   ├── main.ts          # 主进程入口
│   │   └── preload.ts       # 预加载脚本
│   └── renderer/            # 渲染进程代码
│       ├── components/      # React组件
│       ├── pages/          # 页面组件
│       ├── stores/         # 状态管理
│       ├── services/       # 服务层
│       ├── types/          # 类型定义
│       ├── App.tsx         # 主应用组件
│       ├── main.tsx        # 入口文件
│       └── index.html      # HTML模板
├── dist/                   # 构建输出
├── release/               # 打包输出
├── package.json
├── tsconfig.json          # 渲染进程TS配置
├── tsconfig.main.json     # 主进程TS配置
├── tsconfig.preload.json  # 预加载脚本TS配置
└── vite.config.ts         # Vite配置
```

## 开发进度

- [x] 项目初始化和依赖安装
- [x] 基础架构搭建
- [x] API KEY配置管理系统
- [ ] Excel文件处理功能
- [ ] GUI界面开发
- [ ] AI映射生成功能
- [ ] 数据转换引擎
- [ ] 应用打包和分发

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License

## 支持

如果遇到问题，请在GitHub Issues中提出。 
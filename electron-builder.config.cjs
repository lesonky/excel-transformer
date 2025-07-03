/**
 * Electron Builder Configuration
 * @type {import('electron-builder').Configuration}
 */
const config = {
  appId: "com.excel-transformer.app",
  productName: "Excel字段转换工具",
  directories: {
    buildResources: "src/assets",
    output: "release"
  },
  files: [
    "dist/**/*",
    "src/assets/icons/**/*",
    "node_modules/**/*",
    "!node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
    "!node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
    "!node_modules/*.d.ts",
    "!node_modules/.bin",
    "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
    "!.editorconfig",
    "!**/._*",
    "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
    "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
    "!**/{appveyor.yml,.travis.yml,circle.yml}",
    "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
  ],
  compression: "maximum",
  mac: {
    category: "public.app-category.productivity",
    target: [
      {
        target: "dmg",
        arch: ["arm64", "x64"]
      },
      {
        target: "zip", 
        arch: ["arm64", "x64"]
      }
    ],
    icon: "src/assets/icons/icon.icns",
    hardenedRuntime: false,
    gatekeeperAssess: false,
    // 不使用代码签名
    identity: null
  },
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64", "arm64"]
      },
      {
        target: "zip",
        arch: ["x64", "arm64"]
      }
    ],
    icon: "src/assets/icons/icon.ico",
    verifyUpdateCodeSignature: false,
    requestedExecutionLevel: "asInvoker",
    artifactName: "Excel字段转换工具-${version}-${arch}.${ext}"
  },
  linux: {
    target: [
      {
        target: "AppImage",
        arch: "x64"
      },
      {
        target: "deb",
        arch: "x64"
      },
      {
        target: "rpm",
        arch: "x64"
      }
    ],
    icon: "src/assets/icons/icon-256.png",
    category: "Office",
    maintainer: "Excel Transformer Team"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    installerIcon: "src/assets/icons/icon.ico",
    uninstallerIcon: "src/assets/icons/icon.ico",
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Excel字段转换工具",
    menuCategory: "Office",
    runAfterFinish: true,
    deleteAppDataOnUninstall: true,
    artifactName: "Excel字段转换工具-Setup-${version}.${ext}"
  },
  dmg: {
    title: "Excel字段转换工具",
    icon: "src/assets/icons/icon.icns"
  }
};

module.exports = config; 
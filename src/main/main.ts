import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ConfigService } from './services/ConfigService';
import { AIService } from './services/AIService';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private configService: ConfigService;
  private aiService: AIService;

  constructor() {
    this.configService = new ConfigService();
    this.aiService = new AIService(this.configService);
    this.setupIpcHandlers();
  }

  async initialize() {
    await app.whenReady();
    await this.createWindow();
    await this.checkInitialSetup();
  }

  private async createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'default',
      show: false
    });

    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private async checkInitialSetup() {
    const isConfigured = await this.configService.isApiKeyConfigured();
    if (isConfigured) {
      await this.aiService.initialize();
    }
    
    // 通知渲染进程API KEY配置状态
    this.mainWindow?.webContents.send('api-key-status', isConfigured);
  }

  private setupIpcHandlers() {
    // API KEY相关处理器
    ipcMain.handle('check-api-key-configured', async () => {
      return await this.configService.isApiKeyConfigured();
    });

    ipcMain.handle('test-api-key', async (_, apiKey: string) => {
      return await this.aiService.testApiKey(apiKey);
    });

    ipcMain.handle('save-api-key', async (_, apiKey: string) => {
      await this.configService.setApiKey(apiKey);
      const initialized = await this.aiService.initialize();
      return initialized;
    });

    // 应用相关事件
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createWindow();
      }
    });
  }
}

const application = new Application();
application.initialize().catch(console.error); 
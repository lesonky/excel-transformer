import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { ConfigService } from './services/ConfigService';
import { AIService } from './services/AIService';
import ExcelService from './services/ExcelService';

let mainWindow: BrowserWindow;

// 获取图标路径的辅助函数
const getIconPath = (): string => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // 开发模式：从源文件夹读取
    const devIconPath = path.join(__dirname, '../../src/assets/icons/icon-256.png');
    if (fs.existsSync(devIconPath)) {
      return devIconPath;
    }
  }
  
  // 生产模式：从dist文件夹读取  
  const prodIconPath = path.join(__dirname, '../assets/icons/icon-256.png');
  if (fs.existsSync(prodIconPath)) {
    return prodIconPath;
  }
  
  // 备用路径
  const fallbackPath = path.join(__dirname, '../../src/assets/icons/icon-256.png');
  return fallbackPath;
};

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'Excel字段转换工具',
    icon: getIconPath(),
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 初始化服务实例
const configService = new ConfigService();
const aiService = new AIService(configService);

// IPC处理器 - API KEY相关
ipcMain.handle('check-api-key-configured', async (): Promise<boolean> => {
  try {
    return await configService.isApiKeyConfigured();
  } catch (error) {
    console.error('检查API KEY配置失败:', error);
    return false;
  }
});

ipcMain.handle('test-api-key', async (_, apiKey: string): Promise<boolean> => {
  try {
    return await aiService.testApiKey(apiKey);
  } catch (error) {
    console.error('测试API KEY失败:', error);
    return false;
  }
});

ipcMain.handle('save-api-key', async (_, apiKey: string): Promise<void> => {
  try {
    await configService.setApiKey(apiKey);
    await aiService.initialize();
    
    // 通知前端API KEY状态变化
    if (mainWindow) {
      mainWindow.webContents.send('api-key-status-changed', true);
    }
  } catch (error) {
    console.error('保存API KEY失败:', error);
    throw error;
  }
});

ipcMain.handle('get-api-key', async (): Promise<string | null> => {
  try {
    return await configService.getApiKey();
  } catch (error) {
    console.error('获取API KEY失败:', error);
    return null;
  }
});

// IPC处理器 - 文件相关
ipcMain.handle('select-excel-file', async (): Promise<string | null> => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '选择Excel文件',
      filters: [
        { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    console.error('选择文件失败:', error);
    throw error;
  }
});

ipcMain.handle('read-excel-file', async (_, filePath: string) => {
  try {
    return await ExcelService.readExcelFile(filePath);
  } catch (error) {
    console.error('读取Excel文件失败:', error);
    throw error;
  }
});

ipcMain.handle('validate-excel-file', async (_, filePath: string): Promise<boolean> => {
  try {
    return await ExcelService.validateExcelFile(filePath);
  } catch (error) {
    console.error('验证Excel文件失败:', error);
    return false;
  }
});

// IPC处理器 - AI映射相关
ipcMain.handle('generate-ai-mapping', async (_, params: {
  uniqueValues: string[];
  description: string;
  sampleData?: any[];
}) => {
  try {
    const { uniqueValues, description } = params;
    const mappingRequest = {
      originalValues: uniqueValues,
      targetDescription: description
    };
    return await aiService.generateMapping(mappingRequest);
  } catch (error) {
    console.error('生成AI映射失败:', error);
    throw error;
  }
});

// IPC处理器 - 转换相关
ipcMain.handle('transform-excel-file', async (_, params: {
  inputPath: string;
  outputPath: string;
  columnName: string;
  mappingRules: any[];
}) => {
  try {
    const { inputPath, outputPath, columnName, mappingRules } = params;
    return await ExcelService.transformExcelFile(inputPath, outputPath, columnName, mappingRules);
  } catch (error) {
    console.error('转换Excel文件失败:', error);
    throw error;
  }
});

ipcMain.handle('save-excel-file', async (): Promise<string | null> => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '保存转换后的文件',
      defaultPath: '转换后的文件.xlsx',
      filters: [
        { name: 'Excel文件', extensions: ['xlsx'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  } catch (error) {
    console.error('保存文件失败:', error);
    throw error;
  }
});

// IPC处理器 - 通用工具
ipcMain.handle('show-item-in-folder', async (_, filePath: string): Promise<void> => {
  try {
    const { shell } = require('electron');
    await shell.showItemInFolder(filePath);
  } catch (error) {
    console.error('显示文件位置失败:', error);
    throw error;
  }
});

// 应用启动时初始化服务
app.whenReady().then(async () => {
  try {
    console.log('正在初始化服务...');
    
    // 检查是否有API KEY，如果有则初始化AI服务
    if (await configService.isApiKeyConfigured()) {
      await aiService.initialize();
      console.log('AI服务初始化完成');
    } else {
      console.log('未配置API KEY，跳过AI服务初始化');
    }
    
    console.log('服务初始化完成');
  } catch (error) {
    console.error('服务初始化失败:', error);
  }
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason, 'at:', promise);
});

// Excel文件解析处理器
ipcMain.handle('parse-excel', async (event, filePath: string, worksheetName?: string) => {
  try {
    console.log('解析Excel文件:', filePath, worksheetName ? `工作表: ${worksheetName}` : '');
    return await ExcelService.readExcelFile(filePath, worksheetName);
  } catch (error: any) {
    console.error('解析Excel文件失败:', error);
    throw new Error(`解析Excel文件失败: ${error.message}`);
  }
});

// Excel文件转换处理器
ipcMain.handle('transform-excel', async (event, params: {
  filePath: string;
  columnName: string;
  mappingRules: { [key: string]: string };
  worksheetName?: string;
}) => {
  try {
    console.log('开始转换Excel文件');
    const { filePath, columnName, mappingRules, worksheetName } = params;
    
    // 检查文件路径
    if (!filePath) {
      throw new Error('未提供文件路径');
    }
    
    if (worksheetName) {
      console.log(`转换工作表: ${worksheetName}`);
    }
    
    // 生成输出文件路径
    const path = require('path');
    const outputPath = path.join(
      path.dirname(filePath),
      `${path.basename(filePath, path.extname(filePath))}_converted${path.extname(filePath)}`
    );
    
    // 将映射规则转换为数组格式
    const mappings = Object.entries(mappingRules).map(([source, target], index) => ({
      id: `mapping_${index}`,
      sourceValue: source,
      targetValue: target,
      confidence: 1.0,
      isManual: true
    }));
    
    const result = await ExcelService.transformExcelFile(filePath, outputPath, columnName, mappings, worksheetName);
    
    if (!result.success) {
      throw new Error('转换失败');
    }
    
    console.log(`转换完成: ${result.transformedRows}行已转换，${result.skippedRows}行跳过`);
    return result;
    
  } catch (error: any) {
    console.error('转换Excel文件失败:', error.message);
    return {
      success: false,
      totalRows: 0,
      transformedRows: 0,
      skippedRows: 0,
      error: error.message
    };
  }
});

// AI映射生成处理器
ipcMain.handle('generate-mappings', async (event, sourceValues: string[], description: string) => {
  try {
    console.log('生成AI映射:', { sourceValues: sourceValues.length, description });
    const mappingRequest = {
      originalValues: sourceValues,
      targetDescription: description
    };
    return await aiService.generateMapping(mappingRequest);
  } catch (error: any) {
    console.error('生成AI映射失败:', error);
    throw new Error(`生成AI映射失败: ${error.message}`);
  }
});

// 文件操作处理器
ipcMain.handle('select-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Excel files', extensions: ['xlsx', 'xls'] },
        { name: 'All files', extensions: ['*'] }
      ]
    });
    
    return result.canceled ? null : result.filePaths[0];
  } catch (error: any) {
    console.error('选择文件失败:', error);
    return null;
  }
});

ipcMain.handle('save-file-dialog', async (event, defaultPath?: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: [
        { name: 'Excel files', extensions: ['xlsx'] },
        { name: 'All files', extensions: ['*'] }
      ]
    });
    
    return result.canceled ? null : result.filePath;
  } catch (error: any) {
    console.error('保存文件对话框失败:', error);
    return null;
  }
});

// 打开文件位置处理器
ipcMain.handle('open-file-location', async (event, filePath: string) => {
  try {
    const { shell } = require('electron');
    shell.showItemInFolder(filePath);
  } catch (error: any) {
    console.error('打开文件位置失败:', error);
    throw new Error(`打开文件位置失败: ${error.message}`);
  }
});

// 系统信息处理器
ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

ipcMain.handle('open-external', async (event, url: string) => {
  try {
    await shell.openExternal(url);
  } catch (error: any) {
    console.error('打开外部链接失败:', error);
    throw new Error(`打开外部链接失败: ${error.message}`);
  }
}); 
import { contextBridge, ipcRenderer } from 'electron';

// 定义类型接口
export interface ExcelData {
  worksheets: string[];
  headers: string[];
  data: any[][];
  uniqueValues: { [column: string]: string[] };
}

export interface MappingResponse {
  mappings: { original: string; target: string; confidence: number }[];
  explanation: string;
}

export interface TransformResult {
  success: boolean;
  totalRows: number;
  transformedRows: number;
  skippedRows: number;
  filePath?: string;
}

// 暴露给渲染进程的API
const electronAPI = {
  // API KEY相关
  checkApiKeyConfigured: (): Promise<boolean> => 
    ipcRenderer.invoke('check-api-key-configured'),
  
  testApiKey: (apiKey: string): Promise<boolean> => 
    ipcRenderer.invoke('test-api-key', apiKey),
  
  saveApiKey: (apiKey: string): Promise<void> => 
    ipcRenderer.invoke('save-api-key', apiKey),
  
  getApiKey: (): Promise<string | null> => 
    ipcRenderer.invoke('get-api-key'),
  
  // API KEY状态变化监听
  onApiKeyStatusChange: (callback: (isConfigured: boolean) => void) => {
    ipcRenderer.on('api-key-status-changed', (_, isConfigured) => callback(isConfigured));
  },
  
  removeApiKeyStatusListener: () => {
    ipcRenderer.removeAllListeners('api-key-status-changed');
  },
  
  // 文件操作相关
  selectExcelFile: (): Promise<string | null> => 
    ipcRenderer.invoke('select-excel-file'),
  
  readExcelFile: (filePath: string): Promise<ExcelData> => 
    ipcRenderer.invoke('read-excel-file', filePath),
  
  validateExcelFile: (filePath: string): Promise<boolean> => 
    ipcRenderer.invoke('validate-excel-file', filePath),
  
  saveExcelFile: (): Promise<string | null> => 
    ipcRenderer.invoke('save-excel-file'),
  
  showItemInFolder: (filePath: string): Promise<void> => 
    ipcRenderer.invoke('show-item-in-folder', filePath),
  
  // AI映射相关
  generateAiMapping: (params: {
    uniqueValues: string[];
    description: string;
    sampleData?: any[];
  }): Promise<MappingResponse> => 
    ipcRenderer.invoke('generate-ai-mapping', params),
  
  // Excel转换相关
  transformExcelFile: (params: {
    inputPath: string;
    outputPath: string;
    columnName: string;
    mappingRules: any[];
  }): Promise<TransformResult> => 
    ipcRenderer.invoke('transform-excel-file', params),
  
  // 进度监听（可用于转换进度）
  onProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('transform-progress', (_, progress) => callback(progress));
  },
  
  removeProgressListener: () => {
    ipcRenderer.removeAllListeners('transform-progress');
  },
  
  // 日志和调试
  log: (...args: any[]) => {
    console.log('[Renderer]', ...args);
  },
  
  // 应用信息
  getAppVersion: (): Promise<string> => 
    ipcRenderer.invoke('get-app-version'),
    
  // 获取平台信息
  getPlatform: (): string => process.platform,
  
  // 检查网络连接
  checkNetworkConnection: (): Promise<boolean> => 
    ipcRenderer.invoke('check-network-connection')
};

// 将API暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
} 
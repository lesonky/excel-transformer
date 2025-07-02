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

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // API KEY相关
  checkApiKeyConfigured: () => ipcRenderer.invoke('check-api-key-configured'),
  testApiKey: (apiKey: string) => ipcRenderer.invoke('test-api-key', apiKey),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke('save-api-key', apiKey),
  
  // Excel处理相关
  parseExcel: (filePath: string, worksheetName?: string) => ipcRenderer.invoke('parse-excel', filePath, worksheetName),
  transformExcel: (filePath: string, mappings: any[], targetColumn: string) => 
    ipcRenderer.invoke('transform-excel', filePath, mappings, targetColumn),
  
  // AI服务相关
  generateMappings: (sourceValues: string[], description: string) => 
    ipcRenderer.invoke('generate-mappings', sourceValues, description),
  
  // 文件操作相关
  selectFile: () => ipcRenderer.invoke('select-file'),
  openFileDialog: (filters?: any[]) => ipcRenderer.invoke('open-file-dialog', filters),
  saveFileDialog: (defaultPath?: string) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  
  // 系统相关
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  // 监听器
  onApiKeyStatusChange: (callback: (isConfigured: boolean) => void) => {
    ipcRenderer.on('api-key-status-changed', (_, isConfigured) => callback(isConfigured));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
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
  
  // 获取平台信息
  getPlatform: (): string => process.platform,
  
  // 检查网络连接
  checkNetworkConnection: (): Promise<boolean> => 
    ipcRenderer.invoke('check-network-connection')
});

// 类型声明已在 global.d.ts 中定义 
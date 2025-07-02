export interface ExcelData {
  worksheets: string[];
  headers: string[];
  data: any[][];
  uniqueValues: { [column: string]: string[] };
}

export interface ElectronAPI {
  // API KEY相关
  checkApiKeyConfigured: () => Promise<boolean>;
  testApiKey: (apiKey: string) => Promise<boolean>;
  saveApiKey: (apiKey: string) => Promise<boolean>;
  
  // 监听器
  onApiKeyStatusChange: (callback: (isConfigured: boolean) => void) => void;
  removeAllListeners: (channel: string) => void;
  
  // 配置相关
  saveConfig: (config: any) => Promise<void>;
  loadConfig: () => Promise<any>;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  
  // AI服务相关
  generateMappings: (sourceValues: string[], description: string) => Promise<any>;
  
  // Excel处理相关
  parseExcel: (filePath: string, worksheetName?: string) => Promise<ExcelData>;
  transformExcel: (filePath: string, mappings: any[], targetColumn: string) => Promise<string>;
  
  // 文件操作相关
  selectFile: () => Promise<string | null>;
  openFileDialog: (filters?: any[]) => Promise<string | null>;
  saveFileDialog: (defaultPath?: string) => Promise<string | null>;
  
  // 系统相关
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 
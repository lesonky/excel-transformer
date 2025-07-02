export interface ElectronAPI {
  // API KEY相关
  checkApiKeyConfigured: () => Promise<boolean>;
  testApiKey: (apiKey: string) => Promise<boolean>;
  saveApiKey: (apiKey: string) => Promise<boolean>;
  
  // 监听器
  onApiKeyStatusChange: (callback: (isConfigured: boolean) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 
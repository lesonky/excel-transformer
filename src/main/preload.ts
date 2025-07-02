import { contextBridge, ipcRenderer } from 'electron';

// 定义暴露给渲染进程的API
const electronAPI = {
  // API KEY相关
  checkApiKeyConfigured: () => ipcRenderer.invoke('check-api-key-configured'),
  testApiKey: (apiKey: string) => ipcRenderer.invoke('test-api-key', apiKey),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke('save-api-key', apiKey),
  
  // 监听器
  onApiKeyStatusChange: (callback: (isConfigured: boolean) => void) => {
    ipcRenderer.on('api-key-status', (_, isConfigured) => callback(isConfigured));
  },
  
  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

// 安全地暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
} 
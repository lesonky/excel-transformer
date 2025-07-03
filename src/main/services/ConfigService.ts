import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

interface AppConfig {
  geminiApiKey?: string;
  geminiModel?: string;
  lastUsedPath?: string;
  theme?: 'light' | 'dark';
}

export class ConfigService {
  private configPath: string;
  private encryptionKey: Buffer;
  
  constructor() {
    this.configPath = path.join(os.homedir(), '.excel-transformer', 'config.json');
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.ensureConfigDirectory();
  }
  
  async setApiKey(apiKey: string): Promise<void> {
    const config = await this.loadConfig();
    config.geminiApiKey = this.encrypt(apiKey);
    await this.saveConfig(config);
  }
  
  async getApiKey(): Promise<string | null> {
    const config = await this.loadConfig();
    if (!config.geminiApiKey) return null;
    
    try {
      return this.decrypt(config.geminiApiKey);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return null;
    }
  }
  
  async isApiKeyConfigured(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return apiKey !== null && apiKey.length > 0;
  }

  async setGeminiModel(model: string): Promise<void> {
    const config = await this.loadConfig();
    config.geminiModel = model;
    await this.saveConfig(config);
  }

  async getGeminiModel(): Promise<string> {
    const config = await this.loadConfig();
    return config.geminiModel || 'gemini-2.5-flash'; // 默认值
  }
  
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
  
  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  private getOrCreateEncryptionKey(): Buffer {
    const keyPath = path.join(os.homedir(), '.excel-transformer', 'app.key');
    
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath);
    }
    
    const key = crypto.randomBytes(32);
    this.ensureConfigDirectory();
    fs.writeFileSync(keyPath, key, { mode: 0o600 }); // 只有用户可读写
    return key;
  }
  
  private ensureConfigDirectory(): void {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }
  
  private async loadConfig(): Promise<AppConfig> {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    return {};
  }
  
  private async saveConfig(config: AppConfig): Promise<void> {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error('配置保存失败');
    }
  }
} 
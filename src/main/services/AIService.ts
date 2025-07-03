import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from './ConfigService.js';

export interface MappingRequest {
  originalValues: string[];
  targetDescription: string;
}

export interface MappingResponse {
  mappings: { original: string; target: string; confidence: number }[];
  explanation: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private configService: ConfigService;
  
  constructor(configService: ConfigService) {
    this.configService = configService;
  }
  
  async initialize(): Promise<boolean> {
    const apiKey = await this.configService.getApiKey();
    if (!apiKey) {
      return false;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return false;
    }
  }
  
  async generateMapping(request: MappingRequest): Promise<MappingResponse> {
    if (!this.genAI) {
      throw new Error('AI服务未初始化，请先配置API KEY');
    }
    
    const modelName = await this.configService.getGeminiModel();
    const model = this.genAI.getGenerativeModel({ model: modelName });
    
    const prompt = this.buildPrompt(request);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return this.parseResponse(response.text());
  }
  
  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const testAI = new GoogleGenerativeAI(apiKey);
      const modelName = await this.configService.getGeminiModel();
      const model = testAI.getGenerativeModel({ model: modelName });
      
      // 发送一个简单的测试请求
      const result = await model.generateContent('Hello, please respond with "API key is valid"');
      const response = await result.response;
      
      return response.text().includes('API key is valid') || response.text().length > 0;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }
  
  private buildPrompt(request: MappingRequest): string {
    return `
请为以下字段值生成转换映射关系：

原始值列表：
${request.originalValues.map((value, index) => `${index + 1}. ${value}`).join('\n')}

转换目标描述：${request.targetDescription}

请按照以下JSON格式返回映射关系：
{
  "mappings": [
    {
      "original": "原始值",
      "target": "转换后的值",
      "confidence": 0.95
    }
  ],
  "explanation": "转换逻辑说明"
}

要求：
1. 为每个原始值提供最合适的转换目标
2. confidence表示转换的置信度(0-1)
3. 考虑语义相似性和上下文关系
4. 提供简洁的转换逻辑说明
`;
  }
  
  private parseResponse(responseText: string): MappingResponse {
    try {
      // 尝试提取JSON部分
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        return {
          mappings: parsed.mappings || [],
          explanation: parsed.explanation || '无说明'
        };
      }
      
      // 如果无法解析JSON，返回默认响应
      return {
        mappings: [],
        explanation: '无法解析AI响应'
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        mappings: [],
        explanation: 'AI响应解析失败'
      };
    }
  }
} 
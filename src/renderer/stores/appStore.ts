import { create } from 'zustand';

export interface ExcelData {
  worksheets: string[];
  headers: string[];
  data: any[][];
  uniqueValues: { [column: string]: string[] };
}

export interface MappingRule {
  id: string;
  sourceValue: string;
  targetValue: string;
  confidence: number;
  isManual?: boolean;
}

export interface TransformResult {
  success: boolean;
  totalRows: number;
  transformedRows: number;
  skippedRows: number;
  filePath?: string;
}

interface AppState {
  // 应用基础状态
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  
  // API KEY配置状态
  isApiKeyConfigured: boolean;
  showApiKeySettings: boolean;
  
  // 文件相关状态
  selectedFile: File | null;
  selectedFilePath: string | null;
  excelData: ExcelData | null;
  selectedWorksheet: string;
  selectedColumn: string;
  
  // 映射相关状态
  transformDescription: string;
  aiGeneratedMappings: MappingRule[];
  userEditedMappings: MappingRule[];
  
  // 转换相关状态
  transformProgress: number;
  transformResult: TransformResult | null;
  
  // 操作方法
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setApiKeyConfigured: (configured: boolean) => void;
  setShowApiKeySettings: (show: boolean) => void;
  setSelectedFile: (file: File | null) => void;
  setSelectedFilePath: (path: string | null) => void;
  setExcelData: (data: ExcelData | null) => void;
  setSelectedWorksheet: (worksheet: string) => void;
  setSelectedColumn: (column: string) => void;
  setTransformDescription: (description: string) => void;
  setAiGeneratedMappings: (mappings: MappingRule[]) => void;
  setUserEditedMappings: (mappings: MappingRule[]) => void;
  setTransformProgress: (progress: number) => void;
  setTransformResult: (result: TransformResult | null) => void;
  
  // 复合操作
  nextStep: () => void;
  prevStep: () => void;
  resetApp: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  currentStep: 1,
  isLoading: false,
  error: null,
  isApiKeyConfigured: false,
  showApiKeySettings: false,
  selectedFile: null,
  selectedFilePath: null,
  excelData: null,
  selectedWorksheet: '',
  selectedColumn: '',
  transformDescription: '',
  aiGeneratedMappings: [],
  userEditedMappings: [],
  transformProgress: 0,
  transformResult: null,
  
  // 基础操作方法
  setCurrentStep: (step) => set({ currentStep: step }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setApiKeyConfigured: (configured) => set({ isApiKeyConfigured: configured }),
  setShowApiKeySettings: (show) => set({ showApiKeySettings: show }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  setSelectedFilePath: (path) => set({ selectedFilePath: path }),
  setExcelData: (data) => set({ excelData: data }),
  setSelectedWorksheet: (worksheet) => set({ selectedWorksheet: worksheet }),
  setSelectedColumn: (column) => set({ selectedColumn: column }),
  setTransformDescription: (description) => set({ transformDescription: description }),
  setAiGeneratedMappings: (mappings) => set({ aiGeneratedMappings: mappings }),
  setUserEditedMappings: (mappings) => set({ userEditedMappings: mappings }),
  setTransformProgress: (progress) => set({ transformProgress: progress }),
  setTransformResult: (result) => set({ transformResult: result }),
  
  // 复合操作
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 4) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  resetApp: () => set({
    currentStep: 1,
    isLoading: false,
    error: null,
    selectedFile: null,
    selectedFilePath: null,
    excelData: null,
    selectedWorksheet: '',
    selectedColumn: '',
    transformDescription: '',
    aiGeneratedMappings: [],
    userEditedMappings: [],
    transformProgress: 0,
    transformResult: null
  })
})); 
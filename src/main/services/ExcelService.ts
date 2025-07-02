import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

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

class ExcelService {
  /**
   * 读取Excel文件并解析数据
   */
  async readExcelFile(filePath: string, worksheetName?: string): Promise<ExcelData> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const worksheets = workbook.worksheets.map(sheet => sheet.name);
      
      // 选择要读取的工作表
      let worksheet;
      if (worksheetName) {
        worksheet = workbook.worksheets.find(sheet => sheet.name === worksheetName);
        if (!worksheet) {
          throw new Error(`找不到工作表: ${worksheetName}`);
        }
      } else {
        // 默认读取第一个工作表
        worksheet = workbook.worksheets[0];
      }
      
      if (!worksheet) {
        throw new Error('Excel文件中没有有效的工作表');
      }
      
      // 获取表头
      const headerRow = worksheet.getRow(1);
      const headers = headerRow.values as string[];
      const validHeaders = headers.slice(1).filter(header => header !== undefined && header !== null);
      
      // 获取数据
      const data: any[][] = [];
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData = row.values as any[];
        if (rowData && rowData.length > 1) {
          data.push(rowData.slice(1));
        }
      }
      
      // 计算每列的唯一值
      const uniqueValues: { [column: string]: string[] } = {};
      validHeaders.forEach((header, index) => {
        const columnValues = data
          .map(row => row[index])
          .filter(value => value !== undefined && value !== null && value !== '')
          .map(value => String(value));
        
        uniqueValues[header] = [...new Set(columnValues)];
      });
      
      return {
        worksheets,
        headers: validHeaders,
        data,
        uniqueValues
      };
    } catch (error) {
      console.error('读取Excel文件失败:', error);
      throw new Error(`读取Excel文件失败: ${(error as Error).message}`);
    }
  }
  
  /**
   * 应用映射规则转换Excel文件
   */
  async transformExcelFile(
    inputPath: string,
    outputPath: string,
    columnName: string,
    mappingRules: MappingRule[],
    worksheetName?: string
  ): Promise<TransformResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(inputPath);
      
      // 选择要转换的工作表
      let worksheet;
      if (worksheetName) {
        worksheet = workbook.worksheets.find(sheet => sheet.name === worksheetName);
        if (!worksheet) {
          throw new Error(`找不到工作表: ${worksheetName}`);
        }
      } else {
        // 默认使用第一个工作表
        worksheet = workbook.worksheets[0];
      }
      
      if (!worksheet) {
        throw new Error('Excel文件中没有有效的工作表');
      }
      
      // 创建映射表
      const mappingMap = new Map<string, string>();
      mappingRules.forEach(rule => {
        mappingMap.set(rule.sourceValue, rule.targetValue);
      });
      
      // 找到目标列的索引
      const headerRow = worksheet.getRow(1);
      const headers = headerRow.values as string[];
      const columnIndex = headers.findIndex(header => header === columnName);
      
      if (columnIndex === -1) {
        throw new Error(`找不到列 "${columnName}"`);
      }
      
      let totalRows = 0;
      let transformedRows = 0;
      let skippedRows = 0;
      
      // 转换数据
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const cellValue = row.getCell(columnIndex).value;
        
        if (cellValue !== null && cellValue !== undefined) {
          totalRows++;
          const stringValue = String(cellValue);
          
          if (mappingMap.has(stringValue)) {
            row.getCell(columnIndex).value = mappingMap.get(stringValue);
            transformedRows++;
          } else {
            skippedRows++;
          }
        }
      }
      
      // 保存转换后的文件
      await workbook.xlsx.writeFile(outputPath);
      
      return {
        success: true,
        totalRows,
        transformedRows,
        skippedRows,
        filePath: outputPath
      };
    } catch (error) {
      console.error('转换Excel文件失败:', error);
      return {
        success: false,
        totalRows: 0,
        transformedRows: 0,
        skippedRows: 0
      };
    }
  }
  
  /**
   * 验证Excel文件
   */
  async validateExcelFile(filePath: string): Promise<boolean> {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      return workbook.worksheets.length > 0;
    } catch (error) {
      console.error('验证Excel文件失败:', error);
      return false;
    }
  }
}

export default new ExcelService(); 
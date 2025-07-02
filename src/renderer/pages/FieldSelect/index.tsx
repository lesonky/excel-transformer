import React, { useEffect, useState } from 'react';
import { Card, Select, Table, Typography, Button, Space, Spin, Alert, Tag } from 'antd';
import { useAppStore } from '../../stores/appStore';

const { Title, Text } = Typography;
const { Option } = Select;

export const FieldSelectPage: React.FC = () => {
  const {
    selectedFile,
    selectedFilePath,
    excelData,
    selectedWorksheet,
    selectedColumn,
    isLoading,
    error,
    setExcelData,
    setSelectedWorksheet,
    setSelectedColumn,
    setLoading,
    setError,
    nextStep
  } = useAppStore();

  const [previewData, setPreviewData] = useState<any[]>([]);

  // 解析Excel文件
  useEffect(() => {
    if (selectedFilePath && !excelData) {
      parseExcelFile();
    }
  }, [selectedFilePath, excelData]);

  // 工作表变化时更新预览数据
  useEffect(() => {
    if (excelData && selectedWorksheet) {
      updatePreviewData();
    }
  }, [excelData, selectedWorksheet]);

  const parseExcelFile = async () => {
    if (!selectedFilePath) return;

    setLoading(true);
    setError(null);

    try {
      const data = await window.electronAPI.parseExcel(selectedFilePath);
      setExcelData(data);
      
      // 默认选择第一个工作表
      if (data.worksheets.length > 0) {
        setSelectedWorksheet(data.worksheets[0]);
      }
    } catch (err: any) {
      setError(err.message || '解析Excel文件失败');
    } finally {
      setLoading(false);
    }
  };

  const updatePreviewData = () => {
    if (!excelData || !selectedWorksheet) return;

    // 获取前10行数据用于预览
    const worksheetData = excelData.data || [];
    const preview = worksheetData.slice(0, 10).map((row, index) => ({
      key: index,
      rowNumber: index + 1,
      ...row.reduce((acc, cell, cellIndex) => {
        const header = excelData.headers[cellIndex] || `列${cellIndex + 1}`;
        acc[header] = cell;
        return acc;
      }, {})
    }));
    setPreviewData(preview);
  };

  const handleWorksheetChange = async (worksheet: string) => {
    if (!selectedFilePath) return;
    
    setSelectedWorksheet(worksheet);
    setSelectedColumn(''); // 重置字段选择
    setLoading(true);
    setError(null);

    try {
      // 重新解析Excel文件，指定工作表
      const data = await window.electronAPI.parseExcel(selectedFilePath, worksheet);
      setExcelData(data);
    } catch (err: any) {
      setError(err.message || '切换工作表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
  };

  const handleNextStep = () => {
    if (!selectedColumn) {
      setError('请选择要转换的字段');
      return;
    }
    nextStep();
  };

  // 生成表格列配置
  const tableColumns = excelData?.headers.map(header => ({
    title: (
      <Space>
        <Text strong>{header}</Text>
        {selectedColumn === header && <Tag color="blue">已选择</Tag>}
      </Space>
    ),
    dataIndex: header,
    key: header,
    width: 150,
    ellipsis: true,
    render: (text: any) => (
      <Text style={{ fontSize: '12px' }}>
        {text?.toString() || '-'}
      </Text>
    )
  })) || [];

  // 添加行号列
  const allColumns = [
    {
      title: '行号',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 60,
      fixed: 'left' as const,
    },
    ...tableColumns
  ];

  // 获取选中字段的统计信息
  const getColumnStats = () => {
    if (!selectedColumn || !excelData) return null;

    const columnIndex = excelData.headers.indexOf(selectedColumn);
    if (columnIndex === -1) return null;

    const columnData = excelData.data.map(row => row[columnIndex]).filter(val => val != null && val !== '');
    const uniqueValues = [...new Set(columnData)];
    
    return {
      totalValues: columnData.length,
      uniqueValues: uniqueValues.length,
      uniqueValuesList: uniqueValues.slice(0, 10) // 显示前10个唯一值
    };
  };

  const columnStats = getColumnStats();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>正在解析Excel文件...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="解析错误"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (!excelData) {
    return (
      <Alert
        message="没有数据"
        description="请先上传Excel文件"
        type="warning"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>选择转换字段</Title>
      
      {/* 工作表选择 */}
      <Card title="选择工作表" style={{ marginBottom: '20px' }}>
        <Space>
          <Text>工作表：</Text>
          <Select
            value={selectedWorksheet}
            onChange={handleWorksheetChange}
            style={{ minWidth: '200px' }}
          >
            {excelData.worksheets.map(sheet => (
              <Option key={sheet} value={sheet}>{sheet}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* 字段选择 */}
      <Card title="选择转换字段" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Text>目标字段：</Text>
            <Select
              value={selectedColumn}
              onChange={handleColumnSelect}
              placeholder="请选择要转换的字段"
              style={{ minWidth: '200px' }}
            >
              {excelData.headers.map(header => (
                <Option key={header} value={header}>{header}</Option>
              ))}
            </Select>
          </Space>

          {/* 字段统计信息 */}
          {columnStats && (
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">
                总数据量：{columnStats.totalValues} | 
                唯一值：{columnStats.uniqueValues} | 
                示例值：{columnStats.uniqueValuesList.join(', ')}
                {columnStats.uniqueValuesList.length < columnStats.uniqueValues && '...'}
              </Text>
            </div>
          )}
        </Space>
      </Card>

      {/* 数据预览 */}
      <Card title={`数据预览 (前10行)`} style={{ marginBottom: '20px' }}>
        <Table
          columns={allColumns}
          dataSource={previewData}
          pagination={false}
          scroll={{ x: 800, y: 300 }}
          size="small"
          bordered
        />
      </Card>

      {/* 操作按钮 */}
      <div style={{ textAlign: 'right' }}>
        <Button 
          type="primary" 
          onClick={handleNextStep}
          disabled={!selectedColumn}
          size="large"
        >
          下一步：AI智能映射
        </Button>
      </div>
    </div>
  );
}; 
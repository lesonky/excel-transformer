import React from 'react';
import { Table, Typography, Card, Space, Tag } from 'antd';

const { Text } = Typography;

interface DataPreviewProps {
  headers: string[];
  data: any[][];
  selectedColumn?: string;
  maxRows?: number;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  headers,
  data,
  selectedColumn,
  maxRows = 10
}) => {
  // 生成表格列配置
  const columns = headers.map((header, index) => ({
    title: (
      <Space>
        <Text strong>{header}</Text>
        {selectedColumn === header && <Tag color="blue">已选择</Tag>}
      </Space>
    ),
    dataIndex: `col_${index}`,
    key: header,
    width: 150,
    ellipsis: true,
    render: (text: any) => (
      <Text style={{ fontSize: '12px' }}>
        {text?.toString() || '-'}
      </Text>
    )
  }));

  // 添加行号列
  const allColumns = [
    {
      title: '行号',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 60,
      fixed: 'left' as const,
    },
    ...columns
  ];

  // 处理数据，限制行数并添加行号
  const processedData = data.slice(0, maxRows).map((row, index) => {
    const rowData: any = {
      key: index,
      rowNumber: index + 1,
    };
    
    // 将每行数据映射到对应的列
    row.forEach((cell, cellIndex) => {
      rowData[`col_${cellIndex}`] = cell;
    });
    
    return rowData;
  });

  return (
    <Card 
      title={`数据预览 (前${Math.min(maxRows, data.length)}行)`}
      size="small"
    >
      <Table
        columns={allColumns}
        dataSource={processedData}
        pagination={false}
        scroll={{ x: 800, y: 300 }}
        size="small"
        bordered
      />
      
      {data.length > maxRows && (
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <Text type="secondary">
            共 {data.length} 行数据，仅显示前 {maxRows} 行
          </Text>
        </div>
      )}
    </Card>
  );
}; 
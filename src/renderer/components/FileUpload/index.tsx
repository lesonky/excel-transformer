import React, { useCallback } from 'react';
import { Card, Button, Typography, Space, Alert, Tag } from 'antd';
import { InboxOutlined, FileExcelOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface FileUploadProps {
  onFileSelected?: (file: File, path: string) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  selectedFile,
  onRemoveFile
}) => {
  const handleSelectFile = useCallback(async () => {
    try {
      const filePath = await window.electronAPI.selectFile();
      if (filePath) {
        // 从文件路径创建一个模拟的File对象用于显示
        const fileName = filePath.split('/').pop() || 'unknown.xlsx';
        const mockFile = new File([], fileName, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        // 添加文件大小信息（可以通过fs获取，这里先模拟）
        Object.defineProperty(mockFile, 'size', {
          value: 0, // 实际大小需要从主进程获取
          writable: false
        });
        
        if (onFileSelected) {
          onFileSelected(mockFile, filePath);
        }
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      alert('选择文件失败，请重试');
    }
  }, [onFileSelected]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '未知大小';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <Card title="已选择的文件" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <FileExcelOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <div>
              <Text strong>{selectedFile.name}</Text>
              <br />
              <Text type="secondary">
                大小: {formatFileSize(selectedFile.size)}
                {selectedFile.lastModified > 0 && (
                  <> | 修改时间: {new Date(selectedFile.lastModified).toLocaleString()}</>
                )}
              </Text>
            </div>
          </Space>
          
          <div style={{ marginTop: '16px' }}>
            <Space>
              <Button 
                icon={<FolderOpenOutlined />}
                onClick={handleSelectFile}
              >
                重新选择
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={onRemoveFile}
              >
                移除文件
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    );
  }

  return (
    <Card title="选择Excel文件">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <InboxOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={4} style={{ marginBottom: '8px' }}>选择Excel文件</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          支持 .xlsx 和 .xls 格式文件
        </Text>
        
        <Button 
          type="primary" 
          size="large"
          icon={<FolderOpenOutlined />}
          onClick={handleSelectFile}
        >
          浏览文件
        </Button>
        
        <div style={{ marginTop: '16px' }}>
          <Space wrap>
            <Tag color="blue">.xlsx</Tag>
            <Tag color="blue">.xls</Tag>
            <Tag color="green">本地处理</Tag>
          </Space>
        </div>
      </div>

      <Alert
        message="使用提示"
        description={
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>请确保Excel文件第一行为表头</li>
            <li>支持多个工作表，默认处理第一个工作表</li>
            <li>文件将在本地处理，不会上传到服务器</li>
            <li>建议文件大小不超过100MB以获得最佳性能</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginTop: '16px' }}
      />
    </Card>
  );
};

export default FileUpload; 
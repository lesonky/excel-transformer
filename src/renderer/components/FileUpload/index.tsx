import React, { useState } from 'react';
import { Upload, message, Card, Typography, Space, Button } from 'antd';
import { InboxOutlined, FileExcelOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;
const { Title, Text } = Typography;

interface FileUploadProps {
  onFileSelected: (file: File, path: string) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelected, 
  selectedFile, 
  onRemoveFile 
}) => {
  const [uploading, setUploading] = useState(false);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    showUploadList: false,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel' ||
                     file.name.toLowerCase().endsWith('.xlsx') ||
                     file.name.toLowerCase().endsWith('.xls');
      
      if (!isExcel) {
        message.error('只能上传Excel文件 (.xlsx, .xls)');
        return false;
      }

      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        message.error('文件大小不能超过100MB');
        return false;
      }

      setUploading(true);
      
      // 创建文件路径（在实际应用中，这里可能需要通过Electron API获取真实路径）
      const filePath = file.name;
      
      // 模拟上传过程
      setTimeout(() => {
        onFileSelected(file, filePath);
        setUploading(false);
        message.success(`${file.name} 文件上传成功`);
      }, 1000);

      return false; // 阻止自动上传
    },
    onDrop(e) {
      console.log('拖拽文件:', e.dataTransfer.files);
    },
  };

  const handleRemoveFile = () => {
    if (onRemoveFile) {
      onRemoveFile();
      message.info('文件已移除');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={4}>已选择文件</Title>
          <Space direction="vertical" size="small">
            <Text strong>{selectedFile.name}</Text>
            <Text type="secondary">大小: {formatFileSize(selectedFile.size)}</Text>
            <Text type="secondary">类型: {selectedFile.type || '未知'}</Text>
          </Space>
          <div style={{ marginTop: '24px' }}>
            <Button 
              icon={<DeleteOutlined />} 
              onClick={handleRemoveFile}
              danger
            >
              移除文件
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Title level={4}>选择Excel文件</Title>
        <Text type="secondary">
          支持 .xlsx 和 .xls 格式文件，最大100MB
        </Text>
      </div>
      
      <Dragger {...uploadProps} style={{ padding: '40px' }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text" style={{ fontSize: '16px' }}>
          点击或拖拽文件到此区域上传
        </p>
        <p className="ant-upload-hint" style={{ color: '#999' }}>
          支持单个文件上传，严格禁止上传公司敏感数据
        </p>
      </Dragger>

      {uploading && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text type="secondary">正在处理文件...</Text>
        </div>
      )}
    </Card>
  );
};

export default FileUpload; 
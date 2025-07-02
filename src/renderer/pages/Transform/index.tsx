import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Space,
  Alert,
  Progress,
  message,
  Row,
  Col,
  Statistic,
  Divider,
  Modal,
  notification,
  Result
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';

const { Title, Text } = Typography;

export const TransformPage: React.FC = () => {
  const {
    excelData,
    selectedColumn,
    selectedFilePath,
    selectedWorksheet,
    userEditedMappings,
    transformProgress,
    transformResult,
    isLoading,
    error,
    setLoading,
    setError,
    setTransformProgress,
    setTransformResult,
    prevStep,
    resetApp
  } = useAppStore();

  const [isTransforming, setIsTransforming] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [transformComplete, setTransformComplete] = useState(false);

  // 获取转换预览数据
  const getTransformPreview = () => {
    if (!excelData || !selectedColumn || userEditedMappings.length === 0) {
      return [];
    }

    const columnIndex = excelData.headers.indexOf(selectedColumn);
    if (columnIndex === -1) return [];

    // 创建映射字典
    const mappingDict = userEditedMappings.reduce((dict, rule) => {
      dict[rule.sourceValue] = rule.targetValue;
      return dict;
    }, {} as { [key: string]: string });

    // 生成预览数据（前10行）
    return excelData.data.slice(0, 10).map((row, index) => {
      const originalValue = row[columnIndex];
      const transformedValue = mappingDict[originalValue] || originalValue;
      
      return {
        key: index,
        rowNumber: index + 1,
        originalValue,
        transformedValue,
        hasMapping: originalValue in mappingDict
      };
    });
  };

  // 获取转换统计
  const getTransformStats = () => {
    if (!excelData || !selectedColumn) return null;

    const columnIndex = excelData.headers.indexOf(selectedColumn);
    if (columnIndex === -1) return null;

    const mappingDict = userEditedMappings.reduce((dict, rule) => {
      dict[rule.sourceValue] = rule.targetValue;
      return dict;
    }, {} as { [key: string]: string });

    let totalRows = excelData.data.length;
    let mappedRows = 0;
    let unmappedRows = 0;

    excelData.data.forEach(row => {
      const value = row[columnIndex];
      if (value in mappingDict) {
        mappedRows++;
      } else {
        unmappedRows++;
      }
    });

    return {
      totalRows,
      mappedRows,
      unmappedRows,
      mappingCoverage: (mappedRows / totalRows * 100).toFixed(1)
    };
  };

  const transformStats = getTransformStats();

  // 执行转换
  const handleStartTransform = async () => {
    if (!excelData || !selectedColumn || userEditedMappings.length === 0) {
      message.warning('转换条件不足，请检查数据和映射规则');
      return;
    }

    if (!selectedFilePath) {
      message.error('文件路径缺失，请重新选择文件');
      return;
    }

    const confirmMessage = `即将转换文件中的"${selectedColumn}"字段，共${transformStats?.totalRows}行数据，其中${transformStats?.mappedRows}行将被转换。\n\n此操作不可撤销，是否继续？`;
    
    if (window.confirm(confirmMessage)) {
      executeTransform();
    }
  };

  const executeTransform = async () => {
    setIsTransforming(true);
    setTransformProgress(0);
    setError(null);

    try {
      // 创建映射对象
      const mappingObject = userEditedMappings.reduce((obj, rule) => {
        obj[rule.sourceValue] = rule.targetValue;
        return obj;
      }, {} as { [key: string]: string });

      // 调用主进程执行转换
      const result = await window.electronAPI.transformExcel({
        filePath: selectedFilePath!,
        columnName: selectedColumn,
        mappingRules: mappingObject,
        worksheetName: selectedWorksheet || undefined
      });

      if (result.success) {
        setTransformResult(result);
        setTransformComplete(true);
        notification.success({
          message: '转换完成',
          description: `成功转换 ${result.transformedRows} 行数据`,
          duration: 4.5,
        });
      } else {
        throw new Error(result.error || '转换失败');
      }

    } catch (err: any) {
      setError(err.message || '转换过程中发生错误');
      message.error('转换失败，请重试');
    } finally {
      setIsTransforming(false);
    }
  };

  // 打开预览
  const handleShowPreview = () => {
    const data = getTransformPreview();
    setPreviewData(data);
    setShowPreview(true);
  };

  // 下载文件
  const handleDownloadFile = async () => {
    if (!transformResult?.filePath) {
      message.error('文件路径不存在');
      return;
    }

    try {
      await window.electronAPI.openFileLocation(transformResult.filePath);
      message.success('文件位置已打开');
    } catch (error) {
      message.error('无法打开文件位置');
    }
  };

  // 开始新的转换
  const handleStartNew = () => {
    if (window.confirm('开始新的转换\n\n这将清除当前所有数据，是否继续？')) {
      resetApp();
      message.success('已重置应用状态');
    }
  };

  // 预览表格列定义
  const previewColumns = [
    {
      title: '行号',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 80,
    },
    {
      title: '原始值',
      dataIndex: 'originalValue',
      key: 'originalValue',
      width: 200,
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: '转换后值',
      dataIndex: 'transformedValue',
      key: 'transformedValue',
      width: 200,
      render: (text: string, record: any) => (
        <Text strong style={{ color: record.hasMapping ? '#52c41a' : '#d9d9d9' }}>
          {text}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'hasMapping',
      key: 'hasMapping',
      width: 100,
      render: (hasMapping: boolean) => (
        <Text type={hasMapping ? 'success' : 'secondary'}>
          {hasMapping ? '已映射' : '无变化'}
        </Text>
      )
    }
  ];

  if (!excelData || !selectedColumn || userEditedMappings.length === 0) {
    return (
      <Alert
        message="数据缺失"
        description={`请先完成前面的步骤：上传文件、选择字段并设置映射规则
        状态: Excel数据=${!!excelData}, 选中列=${selectedColumn}, 映射规则=${userEditedMappings.length}条`}
        type="warning"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  // 转换完成页面
  if (transformComplete && transformResult) {
    return (
      <div style={{ padding: '20px' }}>
        <Result
          status="success"
          title="转换完成！"
          subTitle={`成功转换 ${transformResult.transformedRows} 行数据，跳过 ${transformResult.skippedRows} 行`}
          extra={[
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadFile} key="download">
              打开文件位置
            </Button>,
            <Button onClick={handleStartNew} key="new">
              开始新的转换
            </Button>,
          ]}
        >
          <div style={{ marginTop: '20px' }}>
            <Card>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="总行数" value={transformResult.totalRows} />
                </Col>
                <Col span={6}>
                  <Statistic title="转换行数" value={transformResult.transformedRows} />
                </Col>
                <Col span={6}>
                  <Statistic title="跳过行数" value={transformResult.skippedRows} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="成功率"
                    value={(transformResult.transformedRows / transformResult.totalRows * 100).toFixed(1)}
                    suffix="%"
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </Result>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>执行转换</Title>

      {/* 转换统计 */}
      <Card title="转换统计" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总数据量"
              value={transformStats?.totalRows || 0}
              suffix="行"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="将被转换"
              value={transformStats?.mappedRows || 0}
              suffix="行"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="保持不变"
              value={transformStats?.unmappedRows || 0}
              suffix="行"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="映射覆盖率"
              value={transformStats?.mappingCoverage || 0}
              suffix="%"
            />
          </Col>
        </Row>
      </Card>

      {/* 转换信息 */}
      <Card title="转换信息" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>目标字段：</Text>
            <Text code style={{ marginLeft: '8px' }}>{selectedColumn}</Text>
          </div>
          <div>
            <Text strong>映射规则数量：</Text>
            <Text style={{ marginLeft: '8px' }}>{userEditedMappings.length} 条</Text>
          </div>
          <div>
            <Button
              icon={<EyeOutlined />}
              onClick={handleShowPreview}
              style={{ marginTop: '8px' }}
            >
              预览转换效果
            </Button>
          </div>
        </Space>
      </Card>

      {/* 进度显示 */}
      {isTransforming && (
        <Card title="转换进度" style={{ marginBottom: '20px' }}>
          <Progress
            percent={transformProgress}
            status={transformProgress === 100 ? 'success' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Text type="secondary">正在处理数据，请稍候...</Text>
          </div>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert
          message="转换错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* 注意事项 */}
      <Card style={{ marginBottom: '20px' }}>
        <Alert
          message="注意事项"
          description={
            <div>
              <p>• 转换将创建新的Excel文件，原文件不会被修改</p>
              <p>• 没有映射规则的数据将保持原值不变</p>
              <p>• 转换过程中请不要关闭应用程序</p>
              <p>• 转换完成后，文件将保存在原文件目录中</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>

      {/* 操作按钮 */}
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={prevStep} size="large">
            上一步
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            loading={isTransforming}
            onClick={handleStartTransform}
            disabled={isTransforming}
          >
            {isTransforming ? '转换中...' : '开始转换'}
          </Button>
        </Space>
      </div>

      {/* 预览弹窗 */}
      <Modal
        title="转换效果预览"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="close" onClick={() => setShowPreview(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div style={{ marginBottom: '16px' }}>
          <Alert
            message="预览说明"
            description="仅显示前10行数据的转换效果，实际转换将处理所有数据"
            type="info"
            showIcon
          />
        </div>
        <Table
          columns={previewColumns}
          dataSource={previewData}
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
}; 
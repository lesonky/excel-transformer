import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Table, 
  Space, 
  Alert, 
  Spin, 
  message, 
  Tag, 
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider,
  Modal
} from 'antd';
import { 
  RobotOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';
import type { MappingRule } from '../../stores/appStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const MappingPage: React.FC = () => {
  const {
    excelData,
    selectedColumn,
    transformDescription,
    aiGeneratedMappings,
    userEditedMappings,
    isLoading,
    error,
    setTransformDescription,
    setAiGeneratedMappings,
    setUserEditedMappings,
    setLoading,
    setError,
    nextStep,
    prevStep
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [editingMapping, setEditingMapping] = useState<MappingRule | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMapping, setNewMapping] = useState({ sourceValue: '', targetValue: '' });
  
  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 当映射数据变化时重置分页
  useEffect(() => {
    setCurrentPage(1);
  }, [userEditedMappings.length]);

  // 获取选中列的唯一值
  const getUniqueValues = () => {
    if (!excelData || !selectedColumn) return [];
    return excelData.uniqueValues[selectedColumn] || [];
  };

  const uniqueValues = getUniqueValues();

  // 获取统计信息
  const getColumnStats = () => {
    if (!excelData || !selectedColumn) return null;

    const columnIndex = excelData.headers.indexOf(selectedColumn);
    if (columnIndex === -1) return null;

    const columnData = excelData.data.map(row => row[columnIndex]).filter(val => val != null && val !== '');
    
    return {
      totalValues: columnData.length,
      uniqueValues: uniqueValues.length,
      emptyValues: excelData.data.length - columnData.length
    };
  };

  const columnStats = getColumnStats();

  // 生成AI映射
  const handleGenerateMapping = async () => {
    if (!transformDescription.trim()) {
      message.warning('请先输入转换目标描述');
      return;
    }

    if (uniqueValues.length === 0) {
      message.warning('没有找到唯一值进行映射');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await window.electronAPI.generateMappings(
        uniqueValues,
        transformDescription
      );

      if (result && result.mappings) {
        const mappings: MappingRule[] = result.mappings.map((mapping: any, index: number) => ({
          id: `ai_${index}`,
          sourceValue: mapping.original,
          targetValue: mapping.target,
          confidence: mapping.confidence || 0.5,
          isManual: false
        }));

        setAiGeneratedMappings(mappings);
        setUserEditedMappings([...mappings]); // 复制一份供用户编辑
        message.success('AI映射生成成功！');
      } else {
        throw new Error('AI响应格式错误');
      }
    } catch (err: any) {
      setError(err.message || 'AI映射生成失败');
      message.error('AI映射生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 编辑映射规则
  const handleEditMapping = (mapping: MappingRule) => {
    setEditingMapping({ ...mapping });
  };

  // 保存编辑的映射规则
  const handleSaveMapping = () => {
    if (!editingMapping) return;

    const updatedMappings = userEditedMappings.map(mapping => 
      mapping.id === editingMapping.id ? { 
        ...editingMapping, 
        isManual: true,
        confidence: 1.0 // 手动编辑的置信度设为最高
      } : mapping
    );

    setUserEditedMappings(updatedMappings);
    setEditingMapping(null);
    message.success('映射规则已更新');
  };

  // 删除映射规则
  const handleDeleteMapping = (id: string) => {
    const updatedMappings = userEditedMappings.filter(mapping => mapping.id !== id);
    setUserEditedMappings(updatedMappings);
    message.success('映射规则已删除');
  };

  // 添加新的映射规则
  const handleAddMapping = () => {
    if (!newMapping.sourceValue.trim() || !newMapping.targetValue.trim()) {
      message.warning('请填写完整的源值和目标值');
      return;
    }

    const newRule: MappingRule = {
      id: `manual_${Date.now()}`,
      sourceValue: newMapping.sourceValue,
      targetValue: newMapping.targetValue,
      confidence: 1.0,
      isManual: true
    };

    setUserEditedMappings([...userEditedMappings, newRule]);
    setNewMapping({ sourceValue: '', targetValue: '' });
    setShowAddModal(false);
    message.success('映射规则已添加');
  };

  // 分页处理函数
  const handlePageChange = (page: number, size: number) => {
    console.log('分页变化:', { page, size });
    setCurrentPage(page);
    setPageSize(size);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    console.log('页面大小变化:', { current, size });
    setCurrentPage(1); // 重置到第一页
    setPageSize(size);
  };

  // 处理下一步
  const handleNextStep = () => {
    console.log('Mapping页面 - handleNextStep被调用');
    console.log('当前映射状态:', {
      userEditedMappings: userEditedMappings.length,
      uniqueValues: uniqueValues.length,
      selectedColumn,
      selectedFilePath: useAppStore.getState().selectedFilePath
    });

    if (userEditedMappings.length === 0) {
      console.log('映射规则为空，显示警告');
      message.warning('请先生成或添加映射规则');
      return;
    }

    const mappedCount = userEditedMappings.length;
    const totalCount = uniqueValues.length;
    
    console.log('准备进入下一步，映射统计:', { mappedCount, totalCount });
    
    if (mappedCount < totalCount) {
      Modal.confirm({
        title: '映射不完整',
        content: `还有 ${totalCount - mappedCount} 个唯一值未设置映射规则，是否继续？`,
        onOk: () => {
          console.log('用户确认继续，调用nextStep');
          nextStep();
        },
      });
    } else {
      console.log('映射完整，直接调用nextStep');
      nextStep();
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '原始值',
      dataIndex: 'sourceValue',
      key: 'sourceValue',
      width: 200,
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: '目标值',
      dataIndex: 'targetValue',
      key: 'targetValue',
      width: 200,
      render: (text: string, record: MappingRule) => {
        if (editingMapping?.id === record.id) {
          return (
            <Input
              value={editingMapping.targetValue}
              onChange={(e) => setEditingMapping({
                ...editingMapping,
                targetValue: e.target.value
              })}
              onPressEnter={handleSaveMapping}
              onBlur={handleSaveMapping}
              autoFocus
            />
          );
        }
        return <Text strong>{text}</Text>;
      }
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 100,
      render: (confidence: number, record: MappingRule) => {
        const color = confidence >= 0.8 ? 'green' : confidence >= 0.5 ? 'orange' : 'red';
        return (
          <Tag color={color}>
            {(confidence * 100).toFixed(0)}%
          </Tag>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'isManual',
      key: 'isManual',
      width: 80,
      render: (isManual: boolean) => (
        <Tag color={isManual ? 'blue' : 'purple'}>
          {isManual ? '手动' : 'AI'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: MappingRule) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditMapping(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteMapping(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  if (!excelData || !selectedColumn) {
    return (
      <Alert
        message="数据缺失"
        description="请先完成前面的步骤：上传文件并选择字段"
        type="warning"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>AI智能映射</Title>
      
      {/* 数据统计信息 */}
      <Card title="数据统计" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="总数据量"
              value={columnStats?.totalValues || 0}
              suffix="条"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="唯一值数量"
              value={columnStats?.uniqueValues || 0}
              suffix="个"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="空值数量"
              value={columnStats?.emptyValues || 0}
              suffix="个"
            />
          </Col>
        </Row>
      </Card>

      {/* 唯一值预览 */}
      <Card 
        title={`字段 "${selectedColumn}" 的唯一值`}
        style={{ marginBottom: '20px' }}
        extra={
          <Text type="secondary">
            显示前20个值，共{uniqueValues.length}个唯一值
          </Text>
        }
      >
        <Space wrap>
          {uniqueValues.slice(0, 20).map((value, index) => (
            <Tag key={index} color="blue">
              {value}
            </Tag>
          ))}
          {uniqueValues.length > 20 && (
            <Tag>... 还有{uniqueValues.length - 20}个</Tag>
          )}
        </Space>
      </Card>

      {/* 转换目标设定 */}
      <Card title="转换目标设定" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>请描述您希望如何转换这些字段值：</Text>
            <Tooltip title="例如：将中文城市名转换为英文，将产品代码转换为产品名称">
              <InfoCircleOutlined style={{ marginLeft: '8px', color: '#1890ff' }} />
            </Tooltip>
          </div>
          <TextArea
            rows={4}
            value={transformDescription}
            onChange={(e) => setTransformDescription(e.target.value)}
            placeholder="例如：将中文部门名称转换为对应的英文缩写..."
            maxLength={500}
            showCount
          />
          <div style={{ marginTop: '16px' }}>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              loading={isGenerating}
              onClick={handleGenerateMapping}
              size="large"
            >
              生成AI映射
            </Button>
            {aiGeneratedMappings.length > 0 && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleGenerateMapping}
                style={{ marginLeft: '8px' }}
                loading={isGenerating}
              >
                重新生成
              </Button>
            )}
          </div>
        </Space>
      </Card>

      {/* 映射规则编辑 */}
      {userEditedMappings.length > 0 && (
        <Card 
          title="映射规则"
          style={{ marginBottom: '20px' }}
          extra={
            <Button
              icon={<PlusOutlined />}
              onClick={() => setShowAddModal(true)}
            >
              添加规则
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={userEditedMappings}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: userEditedMappings.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              size: 'default'
            }}
            size="small"
          />
          
          <Divider />
          
          <Alert
            message="提示"
            description={
              <div>
                <p>• AI生成的映射规则仅供参考，请仔细检查和编辑</p>
                <p>• 双击目标值可以直接编辑</p>
                <p>• 手动编辑的规则置信度会自动设为100%</p>
              </div>
            }
            type="info"
            showIcon
          />
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* 操作按钮 */}
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={prevStep} size="large">
            上一步
          </Button>
          <Button
            type="primary"
            onClick={handleNextStep}
            size="large"
            disabled={userEditedMappings.length === 0}
          >
            下一步：执行转换
          </Button>
        </Space>
      </div>

      {/* 添加映射规则弹窗 */}
      <Modal
        title="添加映射规则"
        open={showAddModal}
        onOk={handleAddMapping}
        onCancel={() => {
          setShowAddModal(false);
          setNewMapping({ sourceValue: '', targetValue: '' });
        }}
        okText="添加"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>源值：</Text>
            <Input
              value={newMapping.sourceValue}
              onChange={(e) => setNewMapping({
                ...newMapping,
                sourceValue: e.target.value
              })}
              placeholder="输入原始值"
            />
          </div>
          <div>
            <Text strong>目标值：</Text>
            <Input
              value={newMapping.targetValue}
              onChange={(e) => setNewMapping({
                ...newMapping,
                targetValue: e.target.value
              })}
              placeholder="输入目标值"
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}; 
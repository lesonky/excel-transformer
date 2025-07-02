import React, { useEffect, useState } from 'react';
import { ConfigProvider, Layout, Button, Space, Typography, Alert, message, Card } from 'antd';
import { SettingOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import { useAppStore } from './stores/appStore';
import ApiKeySettings from './components/ApiKeySettings/index';
import StepNavigation from './components/StepNavigation/index';
import FileUpload from './components/FileUpload/index';
import { FieldSelectPage } from './pages/FieldSelect';
import { MappingPage } from './pages/Mapping';
import { TransformPage } from './pages/Transform';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const {
    isApiKeyConfigured,
    showApiKeySettings,
    currentStep,
    error,
    selectedFile,
    selectedFilePath,
    excelData,
    setApiKeyConfigured,
    setShowApiKeySettings,
    setError,
    setSelectedFile,
    setSelectedFilePath,
    setExcelData,
    nextStep,
    prevStep
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Excel字段转换工具启动');
      
      // 检查Electron API是否可用
      if (!window.electronAPI) {
        throw new Error('Electron API 不可用');
      }
      
      console.log('Electron API 已就绪');
      
      // 检查API KEY配置状态
      const configured = await window.electronAPI.checkApiKeyConfigured();
      setApiKeyConfigured(configured);
      
      // 监听API KEY状态变化
      window.electronAPI.onApiKeyStatusChange((isConfigured: boolean) => {
        setApiKeyConfigured(isConfigured);
      });
      
      if (!configured) {
        message.warning('请先配置Gemini API KEY以启用AI功能');
      }
      
    } catch (error) {
      console.error('应用初始化失败:', error);
      setError('应用程序初始化失败: ' + (error as Error).message);
      message.error('应用程序初始化失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = () => {
    setShowApiKeySettings(true);
  };

  const handleCloseSettings = () => {
    setShowApiKeySettings(false);
  };

  const handleApiKeyConfigured = (configured: boolean) => {
    setApiKeyConfigured(configured);
    if (configured) {
      message.success('API KEY配置成功！');
    }
  };

  const handleFileSelected = async (file: File, path: string) => {
    try {
      setSelectedFile(file);
      setSelectedFilePath(path);
      message.success('文件选择成功！');
    } catch (error) {
      console.error('文件处理失败:', error);
      message.error('文件处理失败');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSelectedFilePath(null);
    setExcelData(null);
  };

  const handleStartUse = () => {
    if (!isApiKeyConfigured) {
      message.warning('请先配置API KEY');
      setShowApiKeySettings(true);
      return;
    }
    
    if (selectedFile) {
      nextStep();
    } else {
      message.info('请先选择Excel文件');
    }
  };

  const renderMainContent = () => {
    console.log('App.tsx - 渲染主内容，当前步骤:', currentStep);
    switch (currentStep) {
      case 1:
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2}>欢迎使用Excel字段转换工具</Title>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                通过AI智能映射，快速转换Excel文件中的字段值
              </p>
            </div>
            
            {!isApiKeyConfigured && (
              <Alert
                message="需要配置API KEY"
                description="请先配置Gemini API KEY以启用AI智能映射功能"
                type="warning"
                action={
                  <Button type="primary" onClick={handleOpenSettings}>
                    立即配置
                  </Button>
                }
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}
            
            {isApiKeyConfigured && (
              <Alert
                message="系统已就绪"
                description="API KEY已配置，可以开始使用所有功能"
                type="success"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}
            
            {/* 文件上传区域 */}
            <FileUpload
              onFileSelected={handleFileSelected}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
            />
            
            {/* 操作按钮 */}
            <Card style={{ marginTop: '24px', textAlign: 'center' }}>
              <Space size="large">
                <Button size="large" onClick={handleOpenSettings}>
                  配置设置
                </Button>
                
                <Button 
                  type="primary" 
                  size="large"
                  disabled={!isApiKeyConfigured || !selectedFile}
                  onClick={handleStartUse}
                  icon={<ArrowRightOutlined />}
                >
                  开始处理
                </Button>
              </Space>
            </Card>
          </div>
        );
      
      case 2:
        return <FieldSelectPage />;
      
      case 3:
        return <MappingPage />;
      
      case 4:
        return <TransformPage />;
      
      default:
        return (
          <div className="flex-center full-height">
            <Title level={3}>未知步骤</Title>
          </div>
        );
    }
  };

  if (error) {
    return (
      <ConfigProvider locale={zhCN}>
        <Layout style={{ height: '100vh' }}>
          <Content className="flex-center">
            <div className="error-container">
              <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
              <Title level={4} type="danger">应用启动失败</Title>
              <p>{error}</p>
              <Button type="primary" onClick={() => window.location.reload()}>
                重新启动
              </Button>
            </div>
          </Content>
        </Layout>
      </ConfigProvider>
    );
  }

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="app-container">
        {/* 应用头部 */}
        <Header className="app-header">
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            Excel字段转换工具
          </Title>
          
          <Space>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isApiKeyConfigured ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              )}
              <span style={{ fontSize: '12px', color: '#666' }}>
                {isApiKeyConfigured ? 'API KEY已配置' : '未配置API KEY'}
              </span>
            </div>
            
            <Button
              icon={<SettingOutlined />}
              onClick={handleOpenSettings}
              type={isApiKeyConfigured ? 'default' : 'primary'}
            >
              设置
            </Button>
          </Space>
        </Header>

        {/* 步骤导航 */}
        <StepNavigation />
        
        {/* 主内容区域 */}
        <Content className="app-content">
          {renderMainContent()}
        </Content>

        {/* API KEY设置弹窗 */}
        <ApiKeySettings
          visible={showApiKeySettings}
          onClose={handleCloseSettings}
          onApiKeyConfigured={handleApiKeyConfigured}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default App; 
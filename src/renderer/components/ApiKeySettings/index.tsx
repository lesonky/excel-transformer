import React, { useState, useEffect } from 'react';
import { Input, Button, Alert, Space, Card, Typography, Modal, Select } from 'antd';
import { KeyOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, RobotOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Password } = Input;

interface ApiKeySettingsProps {
  visible: boolean;
  onClose: () => void;
  onApiKeyConfigured: (configured: boolean) => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ 
  visible, 
  onClose, 
  onApiKeyConfigured 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (visible) {
      checkApiKeyStatus();
    }
  }, [visible]);

  const checkApiKeyStatus = async () => {
    try {
      if (window.electronAPI) {
        const configured = await window.electronAPI.checkApiKeyConfigured();
        setIsConfigured(configured);
        onApiKeyConfigured(configured);
        
        // 获取当前配置的模型
        const currentModel = await window.electronAPI.getGeminiModel();
        setSelectedModel(currentModel);
      }
    } catch (error) {
      console.error('检查API KEY状态失败:', error);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: '请输入API KEY' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      if (window.electronAPI) {
        const isValid = await window.electronAPI.testApiKey(apiKey);
        setTestResult({
          success: isValid,
          message: isValid ? 'API KEY验证成功！' : 'API KEY无效，请检查并重新输入'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '验证失败：' + (error as Error).message
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    // 如果有输入新的API KEY，需要先验证
    if (apiKey.trim() && !testResult?.success) {
      setTestResult({ success: false, message: '请先验证API KEY' });
      return;
    }

    setIsSaving(true);
    try {
      if (window.electronAPI) {
        // 如果有新的API KEY，则保存
        if (apiKey.trim()) {
          await window.electronAPI.saveApiKey(apiKey);
          setIsConfigured(true);
          onApiKeyConfigured(true);
          setApiKey('');
        }
        
        // 总是保存模型配置
        await window.electronAPI.setGeminiModel(selectedModel);
        
        setTestResult({ 
          success: true, 
          message: apiKey.trim() ? 'API KEY和模型配置保存成功！' : '模型配置保存成功！' 
        });
        
        // 2秒后关闭弹窗
        setTimeout(() => {
          onClose();
          setTestResult(null);
        }, 2000);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '保存失败：' + (error as Error).message
      });
    } finally {
      setIsSaving(false);
    }
  };





  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyOutlined />
          <span>Gemini API KEY 配置</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Paragraph type="secondary">
          配置您的Google Gemini API KEY以启用AI智能映射功能。API KEY将在本地加密存储。
        </Paragraph>

        {isConfigured && (
          <Alert
            message="API KEY已配置"
            description="您的API KEY已配置并可以正常使用。如需更换，请在下方输入新的API KEY。"
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
          />
        )}

        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>API KEY：</Text>
            <Password
              placeholder="请输入您的Gemini API KEY"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onPressEnter={handleTestApiKey}
              style={{ width: '100%' }}
              size="large"
            />
            
            <Text strong>Gemini模型：</Text>
            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              style={{ width: '100%' }}
              size="large"
              options={[
                { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (推荐)', icon: <RobotOutlined /> },
                { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', icon: <RobotOutlined /> }
              ]}
            />
            
            <Space wrap>
              {apiKey.trim() && (
                <Button 
                  onClick={handleTestApiKey}
                  loading={isTestingKey}
                  disabled={!apiKey.trim()}
                  icon={<ExclamationCircleOutlined />}
                >
                  验证API KEY
                </Button>
              )}
              
              <Button 
                type="primary"
                onClick={handleSaveApiKey}
                disabled={!!apiKey.trim() && !testResult?.success}
                loading={isSaving}
                icon={<CheckCircleOutlined />}
              >
                {apiKey.trim() ? '保存配置' : '保存模型配置'}
              </Button>
            </Space>
          </Space>
        </div>

        {testResult && (
          <Alert
            message={testResult.message}
            type={testResult.success ? 'success' : 'error'}
            icon={testResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            showIcon
            closable
            onClose={() => setTestResult(null)}
          />
        )}

        <Card size="small" title="如何获取API KEY：">
          <Paragraph>
            <ol>
              <li>访问 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
              <li>登录您的Google账户</li>
              <li>点击"Create API Key"创建新的API KEY</li>
              <li>复制生成的API KEY并粘贴到上方输入框中</li>
            </ol>
          </Paragraph>
        </Card>
      </Space>
    </Modal>
  );
};

export default ApiKeySettings; 
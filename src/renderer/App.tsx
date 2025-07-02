import React, { useEffect } from 'react';
import { ConfigProvider, Layout, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  useEffect(() => {
    // 初始化应用
    console.log('Excel字段转换工具启动');
    
    // 检查Electron API是否可用
    if (window.electronAPI) {
      console.log('Electron API 已就绪');
    } else {
      console.error('Electron API 不可用');
      message.error('应用程序初始化失败');
    }
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ height: '100vh' }}>
        <Content style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}>
            <h1>Excel字段转换工具</h1>
            <p>项目初始化完成！</p>
            <p>接下来将继续开发核心功能。</p>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App; 
import React from 'react';
import { Steps } from 'antd';
import { FileOutlined, TableOutlined, BulbOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';

const StepNavigation: React.FC = () => {
  const currentStep = useAppStore(state => state.currentStep);
  
  const steps = [
    { 
      title: '上传文件', 
      description: '选择Excel文件',
      icon: <FileOutlined />
    },
    { 
      title: '选择字段', 
      description: '选择需要转换的字段',
      icon: <TableOutlined />
    },
    { 
      title: '设置转换', 
      description: '配置AI映射规则',
      icon: <BulbOutlined />
    },
    { 
      title: '执行转换', 
      description: '完成字段转换',
      icon: <ThunderboltOutlined />
    }
  ];
  
  return (
    <div style={{ padding: '24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
      <Steps 
        current={currentStep - 1} 
        items={steps}
        type="navigation"
        size="small"
        className="step-navigation"
      />
    </div>
  );
};

export default StepNavigation; 
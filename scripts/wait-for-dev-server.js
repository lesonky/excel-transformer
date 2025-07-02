const http = require('http');

// 检测端口的函数
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 等待开发服务器启动
async function waitForDevServer() {
  const portsToCheck = [3000, 3001, 3002, 3003, 5173, 5174];
  const maxAttempts = 60; // 最多等待60秒
  let attempts = 0;

  console.log('🔍 等待开发服务器启动...');

  while (attempts < maxAttempts) {
    for (const port of portsToCheck) {
      const isReady = await checkPort(port);
      if (isReady) {
        console.log(`✅ 发现开发服务器在端口 ${port}`);
        
        // 设置环境变量告诉Electron使用这个端口
        process.env.VITE_DEV_SERVER_PORT = port.toString();
        
        return port;
      }
    }
    
    attempts++;
    if (attempts % 5 === 0) {
      console.log(`⏳ 继续等待... (${attempts}/${maxAttempts})`);
    }
    
    // 等待1秒后重试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('❌ 超时：未能检测到开发服务器');
}

// 运行脚本
waitForDevServer()
  .then((port) => {
    console.log(`🚀 准备启动Electron，连接到端口 ${port}`);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  }); 
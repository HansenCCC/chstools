import net from 'net';
import { logNormal, logSuccess, logError, logWarning } from './logUtils.js';

export function scanPorts(argv) {
  // 提取端口范围
  const [startPort, endPort] = argv.ports.split('-').map(Number);
  // 如果端口范围格式错误（没有 - 或者端口值无效）
  if (argv.ports.includes('-') && (isNaN(startPort) || isNaN(endPort))) {
    logWarning('端口范围无效，请使用正确的格式，如 1-65535');
    return;
  }
  if (!argv.ports.includes('-') && !isNaN(startPort)) {
    startScanPorts(argv.host, startPort, startPort);
  } else if (argv.ports.includes('-')) {
    startScanPorts(argv.host, startPort, endPort);
  } else {
    logWarning('无效的端口范围，正确格式为 1-65535 或单个端口');
  }
}

function startScanPorts(host, startPort = 1, endPort = 65535) {
  logNormal(`开始扫描 ${host} 的端口，范围是${startPort}～${endPort}`);
  
  // 每批扫描的端口数
  const batchSize = 100; // 可以根据需要调整为更合适的数值
  
  // 初始化计数器
  let totalPorts = 0;
  let openPorts = 0;
  let successPorts = 0;
  let failedPorts = 0;
  
  // 存储开放的端口
  const openPortsList = [];

  // 开始时间
  const startTime = Date.now();

  // 计算总的批次数量
  const totalBatches = Math.ceil((endPort - startPort + 1) / batchSize);
  
  const scanBatch = (batchStartPort, batchEndPort) => {
    return new Promise((resolve) => {
      const promises = [];
      for (let port = batchStartPort; port <= batchEndPort; port++) {
        totalPorts++;
        const socketPromise = new Promise((resolve, reject) => {
          const socket = new net.Socket();
          socket.setTimeout(3000);
          socket.on('connect', () => {
            successPorts++;
            logSuccess(`${port} 开放`);
            openPorts++;
            openPortsList.push(port); // 将开放的端口添加到数组中
            socket.destroy();
            resolve();
          });
          socket.on('timeout', () => {
            socket.destroy();
            successPorts++;
            failedPorts++;
            resolve();
          });
          socket.on('error', (err) => {
            socket.destroy();
            successPorts++;
            failedPorts++;
            resolve();
          });
          socket.connect(port, host);
        });
        promises.push(socketPromise);
      }

      // 等待当前批次的扫描完成
      Promise.all(promises)
        .then(() => resolve());
    });
  };

  // 扫描每个批次
  (async function scanInBatches() {
    for (let i = 0; i < totalBatches; i++) {
      const batchStartPort = startPort + i * batchSize;
      const batchEndPort = Math.min(startPort + (i + 1) * batchSize - 1, endPort);

      await scanBatch(batchStartPort, batchEndPort); // 等待每一批次完成
      logWarning(`${i + 1} > 扫描端口范围: ${batchStartPort}～${batchEndPort}`);
    }

    // 计算总耗时
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // 转换为秒

    logNormal('===============================================');
    logNormal(`IP：${host}`);
    logNormal(`端口范围：${startPort}～${endPort}`);
    logNormal(`总共扫描： ${totalPorts} 个端口`);
    logNormal(`开放的端口：${openPorts}`);
    logNormal(`总耗时：${duration} 秒`);
    // 打印所有开放的端口
    if (openPortsList.length > 0) {
      logSuccess(`开放的端口：${openPortsList.join(', ')}`);
    } else {
      logNormal('没有开放的端口');
    }
    logNormal('===============================================');
  })();
}

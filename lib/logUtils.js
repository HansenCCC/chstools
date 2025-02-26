import chalk from 'chalk';

// 定义颜色
const colors = {
  normal: chalk.white,          // 正常颜色（默认）
  warning: chalk.yellow,        // 警告颜色（黄色）
  success: chalk.green,         // 成功颜色（绿色）
  error: chalk.red,             // 失败颜色（红色）
};

// 封装打印函数
const logNormal = (message) => {
  console.log(colors.normal(message));
};

const logWarning = (message) => {
  console.log(colors.warning(message));
};

const logSuccess = (message) => {
  console.log(colors.success(message));
};

const logError = (message) => {
  console.log(colors.error(message));
};

// 导出模块
export {
  logNormal,
  logWarning,
  logSuccess,
  logError,
};

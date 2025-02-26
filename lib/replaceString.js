import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { logNormal, logSuccess, logError, logWarning } from './logUtils.js';

// 替换目录下所有文件中的字符串
export function replaceStringInFiles(argv) {
  const { dir, oldStr, newStr } = argv;

  logNormal(`开始扫描${dir}目录下，查找包含字符串 "${oldStr}" 的文件`);
  const filesToModify = [];

  fs.readdir(dir, (err, files) => {
    if (err) {
      logError(`读取目录失败: ${err}`);
      return;
    }

    let fileCount = files.length;
    if (fileCount === 0) {
      logNormal('目录为空');
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          logError(`检查文件状态失败: ${err}`);
          return;
        }

        if (stats.isFile()) {
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              logError(`读取文件失败: ${err}`);
              return;
            }

            const updatedData = data.replace(new RegExp(oldStr, 'g'), newStr);

            if (updatedData !== data) {
              filesToModify.push(filePath);
            }

            fileCount--;
            if (fileCount === 0) {
              handleUserConfirmation(filesToModify, oldStr, newStr);
            }
          });
        } else {
          fileCount--;
          if (fileCount === 0) {
            handleUserConfirmation(filesToModify, oldStr, newStr);
          }
        }
      });
    });
  });
}

// 用户确认修改操作
function handleUserConfirmation(filesToModify, oldStr, newStr) {
  if (filesToModify.length === 0) {
    logNormal('没有找到需要修改的文件');
    return;
  }

  logNormal('即将修改的文件:');
  filesToModify.forEach((file, index) => {
    logWarning(`${index + 1}. ${file}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`是否将 "${oldStr}" 全部修改为 "${newStr}" ？y/n：`, (answer) => {
    if (answer.toLowerCase() === 'y') {
      filesToModify.forEach((filePath) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            logError(`读取文件失败: ${err}`);
            return;
          }

          const updatedData = data.replace(new RegExp(oldStr, 'g'), newStr);

          fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
              logError(`写入文件失败: ${err}`);
              return;
            }
            logSuccess(`成功替换文件: ${filePath}`);
          });
        });
      });
    } else {
      logNormal('操作已取消');
    }
    rl.close();
  });
}

#!/usr/bin/env node
import { scanPorts } from './lib/scanPorts.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'; // 需要从 helpers 导入 hideBin
import { replaceStringInFiles } from './lib/replaceString.js';

const commandYargs = yargs(hideBin(process.argv))
    .command('scanport <host> <ports>', '扫描 IP 地址的指定端口范围', (yargs) => {
        yargs.positional('host', {
            description: '目标主机地址',
            type: 'string',
        })
            .positional('ports', {
                description: '端口范围，格式如 1-65535 或单个端口如 8080',
                type: 'string',
            });
    }, (argv) => {
        scanPorts(argv);
    })
    .command('replace <dir> <oldStr> <newStr>', '替换指定目录下所有文件中的字符串', (yargs) => {
        yargs.positional('dir', {
            description: '目标目录',
            type: 'string',
        })
            .positional('oldStr', {
                description: '需要替换的旧字符串',
                type: 'string',
            })
            .positional('newStr', {
                description: '新的字符串',
                type: 'string',
            });
    }, (argv) => {
        replaceStringInFiles(argv);
    })
    .help()
    .alias('help', 'h')
    .argv;
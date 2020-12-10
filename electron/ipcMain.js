const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const walkdir = require('walkdir');

/**
 * 使用reply方法进行消息处理
 * @param {object} event
 * @param {object} args method is need
 */
module.exports = async () => {

  ipcMain.handle('validatePath', async (event, path) => {
    if (!fs.existsSync(path)) {
      return {
        err: '找不到目录',
        data: path
      }
    } else {
      return {
        err: null,
        data: path
      }
    }
  })

  ipcMain.handle('listRole', async (event, path) => {
    // 获取所有d2s存档文件
    const files = walkdir
      .sync(path)
      .filter(file => path.extname(file).toLowerCase() === '.d2s');

    const choices = [
      ...files.map(file => ({
        name: path.basename(item).slice(0, path.basename(item).length - 4),
        value: file
      }))
    ]

    return {
      err: null,
      data: choices
    }

  })

}

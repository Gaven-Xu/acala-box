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

  ipcMain.handle('validatePath', async (event, save_dir) => {
    if (!fs.existsSync(save_dir)) {
      return {
        err: '找不到目录',
        data: save_dir
      }
    } else {
      return {
        err: null,
        data: save_dir
      }
    }
  })

  ipcMain.handle('listRole', async (event, save_dir) => {
    // 获取所有d2s存档文件
    const files = walkdir
      .sync(save_dir)
      .filter(file => path.extname(file).toLowerCase() === '.d2s');

    const choices = [
      ...files.map(file => ({
        name: path.basename(file).slice(0, path.basename(file).length - 4),
        path: file
      }))
    ]

    return {
      err: null,
      data: choices
    }

  })

}

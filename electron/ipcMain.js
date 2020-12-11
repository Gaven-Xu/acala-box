const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const walkdir = require('walkdir');

const CHECKSUM_POS = 12;
const RESET_STATS_POS = 427;

function setChecksome(buffer) {
  buffer.writeUInt32BE(0, CHECKSUM_POS);
  let checksum = 0;
  for (let i = 0; i < buffer.length; i++) {
    checksum = (checksum << 1) + buffer.readUInt8(i) + Number(checksum < 0);
  }
  buffer.writeInt32LE(checksum, CHECKSUM_POS);
}

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

  ipcMain.handle('resetPoints', async (event, hero) => {

    let filePath = hero.path;

    const buffer = fs.readFileSync(filePath);
    const isReset = buffer.readUInt8(RESET_STATS_POS) === 0x2;

    if (isReset) {
      return {
        err: '你的勇士不需要重新规划道路',
        data: hero
      }
    } else {
      buffer.writeUInt8(0x2, RESET_STATS_POS);
      setChecksome(buffer);
      fs.writeFileSync(filePath, buffer);
      return {
        err: null,
        data: hero
      }
    }

  })

}


// ref: https://umijs.org/config/
export default {
  title: '阿卡拉的祝福',
  history: {
    type: 'hash'
  },
  hash: true,
  publicPath: './',
  outputPath: './render',
  dynamicImport: {},
  // plugins
  antd: {
    compact: true
  },
  dva: {
    immer: true,
    hmr: true
  },
  locale: {
    baseNavigator: true,
    default: 'en-US',
  },
  devServer: {
    port: 8787
  }
}

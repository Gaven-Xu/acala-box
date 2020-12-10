import { PureComponent } from 'react';
import { Button, Input } from 'antd';
import { formatMessage, setLocale, getLocale } from 'umi';
import styles from './index.css';

const { ipcRenderer } = window.require('electron');

const CHECKSUM_POS = 12;
const RESET_STATS_POS = 427;
const DEFAULT_SAVE_DIR = '/Applications/Diablo II/Save';

export default class Acala extends PureComponent {

  state = {
    path: '/Applications/Diablo II/Save',
    err: '',
    choices: []
  }

  /**
   * 防抖
   * @param {function} fn
   * @param {number} wait
   */
  _debounce = (fn, wait) => {
    let timeout;
    return function () {
      let context = this;
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        fn.apply(context, arguments)
      }, wait)
    }
  }

  /**
   * 展示错误消息，1.8s后退出
   * @param {string} err
   */
  _error(err) {
    this.setState({
      err
    }, () => {
      setTimeout(() => {
        this.setState({ err: '' })
      }, 1800)
    })
  }

  /**
   * 匹配是否存在存档目录，如果没有，则返回其它存档目录
   * @param {string} path
   * @return path
   */
  validatePath = (path = this.state.path) => {
    console.log(path)
    ipcRenderer.invoke('validatePath', path).then(({ err, path }) => {
      if (err) {
        this._error(err)
      } else {
        this.listRole(path)
      }
    })
  }

  listRole = path => {

  }



  componentDidMount() {
    // this.matchPath()
  }

  render() {

    // 防抖
    let handle = this._debounce(this.validatePath, 1000);

    function Space(props) {
      return <div style={{ height: 6 }}></div>
    }

    function Err(props) {
      if (props.value) {
        return <div style={{ textAlign: 'center', color: 'red' }}>
          {props.value}
        </div>
      } else {
        return null
      }
    }

    return (
      <div>
        <Input defaultValue={DEFAULT_SAVE_DIR} size="small" onChange={e => handle(e.target.value)} />
        <Space />
        <Button size="small" type="primary" onClick={() => handle(this.state.path)}>检测存档目录</Button>
        <Space />
        <Err value={this.state.err} />
      </div>
    );

  }
}


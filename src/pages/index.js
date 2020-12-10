import { PureComponent } from 'react';
import { Button, Input, Radio } from 'antd';
import { formatMessage, setLocale, getLocale } from 'umi';
import styles from './index.css';

const { ipcRenderer } = window.require('electron');

const CHECKSUM_POS = 12;
const RESET_STATS_POS = 427;

export default class Acala extends PureComponent {

  state = {
    save_dir: '/Applications/Diablo II/Save',
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
   * @param {string} save_dir
   */
  validatePath = (save_dir = this.state.save_dir) => {
    ipcRenderer.invoke('validatePath', save_dir).then(({ err, data: save_dir }) => {
      if (err) {
        this._error(err)
      } else {
        this.listRole(save_dir)
      }
    })
  }

  listRole = save_dir => {
    ipcRenderer.invoke('listRole', save_dir).then(({ err, data }) => {
      if (err) {
        this._error(err)
      } else {
        this.setState({
          choices: [...data]
        })
      }
    })
  }

  componentDidMount() {
    this.validatePath()
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

    function Heros(props) {
      return props.value && (
        <Radio.Group>
          {props.value.map(item => <Radio value={item.name} key={item.name}>{item.name}</Radio>)}
        </Radio.Group>
      )
    }

    return (
      <div>
        <Input defaultValue={this.state.save_dir} size="small" onChange={e => handle(e.target.value)} />
        <Space />
        <div style={{ textAlign: 'right' }}>
          <Button size="small" type="primary" onClick={() => handle(this.state.save_dir)}>检测存档目录</Button>
        </div>
        <Space />
        <Err value={this.state.err} />
        <Heros value={this.state.choices} />
        <Space />
        <div style={{ textAlign: 'right' }}>
          <Button size="small" type="primary" onClick={() => console.log('test')}>重置</Button>
        </div>
      </div>
    );

  }
}


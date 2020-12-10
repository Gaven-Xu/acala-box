import { PureComponent } from 'react';
import { Form, Button, Input, Radio, message } from 'antd';
import { formatMessage, setLocale, getLocale } from 'umi';
import styles from './index.css';

// 设置默认语言
setLocale('en-US', false)

const { ipcRenderer } = window.require('electron');

const CHECKSUM_POS = 12;
const RESET_STATS_POS = 427;
const DEFAULT_SAVE_PATH = '/Applications/Diablo II/Save'
export default class Acala extends PureComponent {

  state = {
    err: '',
    choices: [],
    handleHero: null
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
   * 匹配是否存在存档目录，如果没有，则返回其它存档目录
   * @param {string} save_dir
   */
  validatePath = () => {
    this.formRef.validateFields(['save_dir']).then(values => {
      let { save_dir } = values;
      ipcRenderer.invoke('validatePath', save_dir).then(({ err, data: save_dir }) => {
        if (err) {
          message.error(err)
          this.setState({
            choices: []
          })
        } else {
          this.listRole(save_dir)
        }
      })
    })
  }

  listRole = save_dir => {
    ipcRenderer.invoke('listRole', save_dir).then(({ err, data }) => {
      if (err) {
        message.error(err)
      } else {
        this.setState({
          choices: [...data]
        })
      }
    })
  }

  resetPoints = () => {
    this.formRef.validateFields(['hero_name']).then(values => {
      let { hero_name } = values;
      let hero = this.state.choices.filter(item => item.name === hero_name)[0]
      ipcRenderer.invoke('resetPoints', hero).then(({ err, data }) => {
        if (err) {
          message.error(err)
        } else {
          message.success('技能点重置成功')
        }
      })
    })
  }

  componentDidMount() {
    this.validatePath()
  }

  // TODO: 选择英雄
  // TODO: 重置操作

  render() {

    // 防抖
    let validatePath = this._debounce(this.validatePath, 1000);

    return (
      <div>
        <Form
          size="small"
          ref={c => this.formRef = c}
          initialValues={{
            save_dir: DEFAULT_SAVE_PATH
          }}
        >
          <Form.Item name="save_dir">
            <Input defaultValue={this.state.save_dir} onChange={validatePath} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={validatePath}>检测存档目录</Button>
          </Form.Item>
          <Form.Item name="hero_name" rules={[
            { required: true, message: '选择你的英雄' }
          ]}>
            <Radio.Group>
              {this.state.choices.map(item => <Radio value={item.name} key={item.name}>{item.name}</Radio>)}
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={this.resetPoints}>重置</Button>
          </Form.Item>
        </Form>
      </div>
    );

  }
}


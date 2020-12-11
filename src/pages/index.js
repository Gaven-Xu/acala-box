import { PureComponent } from 'react';
import { Spin, Form, Button, Input, Radio, notification } from 'antd';
import { formatMessage, setLocale, getLocale } from 'umi';
import acala from '@/assets/avatar.png';
// 设置默认语言
setLocale('en-US', false)

const { ipcRenderer } = window.require('electron');

const CHECKSUM_POS = 12;
const RESET_STATS_POS = 427;
const DEFAULT_SAVE_PATH = '/Applications/Diablo II/Save'
export default class Acala extends PureComponent {

  state = {
    loading: false,
    choices: []
  }

  /**
   * normal say
   * @param {string} msg
   * @param {string} color hex rgb rgba hsl
   */
  _say(msg, color = "#333") {
    notification.info({
      icon: <img src={acala} style={{ width: 48, height: 48, position: 'relative', left: -16, top: -4 }} />,
      message: '阿卡拉 : ',
      description: <div style={{ fontSize: 12, color }}>
        {msg}
      </div>,
      placement: 'bottomRight',
    })
  }

  /**
   * with red color
   * @param {string} msg
   */
  _err(msg) {
    this._say(msg, 'red')
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
  getSaves = () => {
    this.formRef.validateFields(['save_dir'])
      .then(values => {
        this.setState({
          loading: true
        })
        // 发起目录校验ipc
        let { save_dir } = values;
        return ipcRenderer.invoke('validatePath', save_dir)
      })
      .then(reply => {
        // 处理目录 ipc reply，如果存在目录，则往下传递目录
        let { err, data: save_dir } = reply;
        if (err) {
          this.setState({
            choices: []
          })
          throw err;
        } else {
          return save_dir
        }
      })
      .then(save_dir => {
        // 发起获取英雄ipc
        return ipcRenderer.invoke('listRole', save_dir)
      })
      .then(reply => {
        // 处理获取英雄 ipc reply
        let { err, data } = reply;
        if (err) throw err;
        this._say('为你找到了这些英雄，选择你的英雄为他重新规划前进的道路吧')
        this.setState({
          choices: [...data]
        })
      })
      .catch(err => {
        this._err('选择，选择你的英雄');
      })
      .finally(() => {
        this.setState({
          loading: false
        })
      })
  }

  /**
   * 重置点数
   */
  resetPoints = () => {
    this.formRef.validateFields(['hero_name'])
      .then(values => {
        let { hero_name } = values;
        let hero = this.state.choices.filter(item => item.name === hero_name)[0]
        return ipcRenderer.invoke('resetPoints', hero)
      })
      .then(reply => {

        let { err, data: hero } = reply;
        if (err) throw err;
        this._say(`请让你的勇士${hero.name}来罗格营地找我，我给他重新选择道路的机会`)
      })
      .catch(err => {
        if (err.errorFields) {
          err = err.errorFields[0].errors[0]
        }
        this._err(err)
      })
  }

  componentDidMount() {
    this.getSaves()
  }

  // TODO: 重置操作

  render() {

    // 防抖
    let getSaves = this._debounce(this.getSaves, 1000);

    return (
      <Spin spinning={this.state.loading}>
        <Form
          ref={c => this.formRef = c}
          initialValues={{
            save_dir: DEFAULT_SAVE_PATH
          }}
        >
          <Form.Item name="save_dir">
            <Input defaultValue={this.state.save_dir} onChange={getSaves} />
          </Form.Item>
          <Form.Item name="hero_name" style={{ padding: 10 }} rules={[
            { required: true, message: '选择你的英雄' }
          ]}>
            <Radio.Group buttonStyle="solid">
              {this.state.choices.map(item => <Radio.Button value={item.name} key={item.name}>{item.name}</Radio.Button>)}
            </Radio.Group>
          </Form.Item>
          <Form.Item style={{ textAlign: 'center', width: "100%" }}>
            <Button type="primary" style={{ borderRadius: 80, marginRight: 5 }} onClick={getSaves} >刷新英雄</Button>
            <Button type="primary" style={{ borderRadius: 80, marginLeft: 5 }} onClick={this.resetPoints}>重置技能</Button>
          </Form.Item>
        </Form>
      </Spin>
    );

  }
}


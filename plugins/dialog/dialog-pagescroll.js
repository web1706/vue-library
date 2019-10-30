/**
 * 打开弹窗时调用`lock`锁定页面滚动条
 * 关闭弹窗时调用`unlock`解锁页面滚动条
 * 只有调用`unlock`的次数等于调用`lock`的次数时，
 * `lockCount`等于0，才真正解锁滚动条，
 * 因为此时才将所有弹窗关闭
 * 
 * @example
 * 
 * //main.js
 * import pageScroll from 'dialog-pagescroll.js'
 * Vue.use(Dialog, {
 *   plugins: [
 *     pageScroll({
 *       // 设置默认值，不设置则为`true`
 *       // disableScroll: true
 *     })
 *   ]
 * })
 * 
 * // App.vue
 * this.$dialog(<Component/>, {
 *   // 打开弹窗时是否禁用滚动，不传则使用默认值
 *   // disableScroll: false
 * })
 */

// 当前锁数量，大于0时禁止页面滚动
let lockCount = 0;

// 页面滚动条位置
let offsetY = 0;

// 加锁
const lock = () => {
  if (lockCount++ === 0) {
    offsetY = window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = -offsetY + 'px';
    document.body.style.width = '100%';
  }
}

// 解锁
const unlock = () => {
  if (--lockCount === 0) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, offsetY);
  }
}

/**
 * 生成插件
 * @param {object} [options] 选项
 * @param {boolean} [options.disableScroll=true] 打开弹窗时是否默认禁用滚动
 */
export default function (options = {}) {
  const isUndef = (o) => typeof o === 'undefined'

  function shouldDisableScroll(dialogOptions) {
    const defaultValue = true
    let disableScroll = dialogOptions.disableScroll
    if (isUndef(disableScroll)) {
      disableScroll = options ? options.disableScroll : defaultValue
    }
    if (isUndef(disableScroll)) {
      disableScroll = defaultValue
    }
    return !!disableScroll
  }

  return {
    beforeOpen(vm, dialogOptions) {
      if (shouldDisableScroll(dialogOptions)) {
        lock()
      }
    },

    closed(vm, dialogOptions) {
      if (shouldDisableScroll(dialogOptions)) {
        unlock()
      }
    }
  }
}
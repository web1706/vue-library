/**
 * 打开弹窗时调用`lock`锁定页面滚动条
 * 关闭弹窗时调用`unlock`解锁页面滚动条
 * 只有调用`unlock`的次数等于调用`lock`的次数时，
 * 才真正解锁滚动条，因为此时才将所有弹窗关闭
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

// <body>原本的`overflow`和`paddingRight`属性
let overflow = '';
let paddingRight = '';

// 加锁
const lock = () => {
  if (lockCount++ === 0) {
    const body = document.body
    overflow = body.style.overflow
    body.style.overflow = 'hidden'
    // 将滚动条宽度加在`padding`上
    const bodyStyle = getComputedStyle(body)
    const bodyIsOverflow = document.documentElement.clientHeight < document.body.scrollHeight
    const bodyOverflowY = bodyStyle.overflowY
    const bodyHasScrollBar = bodyIsOverflow || bodyOverflowY === 'scroll'
    if (bodyHasScrollBar) {
      paddingRight = document.body.style.paddingRight
      document.body.style.paddingRight = parseInt(bodyStyle.paddingRight) + getScrollBarWidth() + 'px'
    }
  }
}

// 解锁
const unlock = () => {
  if (--lockCount === 0) {
    document.body.style.overflow = overflow
    document.body.style.paddingRight = paddingRight
  }
}

// 获取滚动条宽度
const getScrollBarWidth = () => {
  const outer = document.createElement('div')
  const outerStyle = {
    position: 'absolute',
    top: '-9999px',
    visibility: 'hidden',
    width: '100px',
    overflow: 'scroll'
  }
  Object.assign(outer.style, outerStyle)

  const inner = document.createElement('div')
  const innerStyle = {
    width: '100%'
  }
  Object.assign(inner.style, innerStyle)

  outer.append(inner)
  document.body.append(outer)
  setTimeout(() => outer.remove())
  return outer.offsetWidth - inner.offsetWidth
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

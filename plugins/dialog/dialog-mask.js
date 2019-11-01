/**
 * 为弹窗添加遮罩层
 * 
 * @example
 * 
 * // main.js
 * import mask from 'dialog-mask.js'
 * Vue.use(Dialog, {
 *   plugins: [
 *     mask({
 *       // 默认遮罩类型（none-无遮罩层|transparent-透明遮罩层|normal-普通遮罩层）
 *       default: 'normal',
 *       // 默认遮罩层颜色（任意css color属性）
 *       color: 'rgba(0, 0, 0, 0.5)',
 *       // 自定义遮罩层样式
 *       style: {},
 *       // 点击遮罩层时是否关闭弹窗
 *       closeOnClick: true
 *     })
 *   ]
 * })
 * 
 * // App.vue
 * const { close } = this.$dialog(<Component />, {
 *   // 遮罩类型
 *   mask: 'none',
 *   // 遮罩层颜色
 *   maskColor: 'rgba(0, 0, 0, 0.5)',
 *   // 自定义遮罩层样式
 *   maskStyle: {
 *     left: '10%',
 *     right: '10%'
 *   },
 *   // 点击遮罩层时是否关闭弹窗
 *   closeOnClickMask: false,
 *   // 点击遮罩层关闭弹窗时的回调
 *   onClose: () => console.log('点击遮罩层导致弹窗关闭')
 * })
 */

export default function (options = {}) {
  const isDef = (o) => typeof o !== 'undefined'

  function hasMask(opts) {
    if (isDef(opts.mask)) {
      return opts.mask !== 'none'
    }
    if (isDef(options.default)) {
      return options.default !== 'none'
    }
    return true
  }

  function isTransparent(opts) {
    if (isDef(opts.mask)) {
      return opts.mask === 'transparent'
    }
    if (isDef(options.default)) {
      return options.default === 'transparent'
    }
    return false
  }

  function getBackgroundColor(opts) {
    if (isTransparent(opts)) {
      return 'transparent'
    }
    if (isDef(opts.maskColor)) {
      return opts.maskColor
    }
    if (isDef(options.color)) {
      return options.color
    }
    return 'rgba(0, 0, 0, 0.5)'
  }

  function shouldCloseOnClick(opts) {
    if (isDef(opts.closeOnClickMask)) {
      return opts.closeOnClickMask
    }
    if (isDef(options.closeOnClick)) {
      return options.closeOnClick
    }
    return true
  }

  return {
    opened(vm, opts, { close }) {
      if (!hasMask(opts)) return
      const wrapper = document.createElement('div')
      const wrapperStyle = {
        position: 'fixed',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: getBackgroundColor(opts)
      }
      Object.assign(
        wrapper.style,
        wrapperStyle,
        options.style,
        opts.maskStyle
      )

      vm.$el.replaceWith(wrapper)
      wrapper.append(vm.$el)
      vm.$el._mask = wrapper

      if (shouldCloseOnClick(opts)) {
        wrapper.addEventListener('click', (e) => {
          if (e.target === e.currentTarget) {
            close()
            opts.onClose && opts.onClose()
          }
        }, false)
      }
    },

    closed(vm) {
      if (vm.$el._mask) {
        vm.$el._mask.remove()
        delete vm.$el._mask
      }
    }
  }
}

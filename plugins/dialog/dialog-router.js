/**
 * 设置路由变化时的策略，如可在路由变化时关闭弹窗
 * **需要引入VueRouter才能使用**
 *
 * 可在弹窗选项中传入以下两个参数：
 * @param {boolean} [preventLeave=true] 是否阻止路由跳转
 * @param {boolean} [closeOnLeave=true] 是否在路由变化时关闭弹窗
 *
 * |`preventLeave`|`closeOnLeave`|     按下返回键时     |
 * |--------------|--------------|--------------------|
 * |    `true`    |    `true`    |阻止路由跳转，只关闭弹窗|
 * |    `true`    |    `false`   |阻止路由跳转，不关闭弹窗|
 * |    `false`   |    `true`    |路由跳转成功时，关闭弹窗|
 * |    `false`   |    `false`   |正常跳转页面，不关闭弹窗|
 * 
 * @example
 * 
 * // main.js
 * import dialogRouter from 'dialog-router.js'
 * Vue.use(Dialog, {
 *   plugins: [
 *     dialogRouter({
 *       // 默认情况下，弹窗是否会阻止路由跳转，不传则为`true`
 *       preventLeave: true,
 *       // 默认情况下，是否在路由变化时关闭弹窗，不传则为`true`
 *       closeOnLeave: true
 *     })
 *   ]
 * })
 * 
 * // App.vue
 * this.$dialog(<Component />, {
 *   // 以下所有参数可选
 *   preventLeave: true,
 *   closeOnLeave: true,
 *   onClose: () => console.log('路由跳转导致弹窗关闭')
 * })
 */

/**
 * 路由变化时的策略
 * @param {object} [options] 插件选项
 * @param {boolean} [options.preventLeave=true] 是否阻止路由跳转
 * @param {boolean} [options.closeOnLeave=true] 是否在路由变化时关闭弹窗
 */
export default function (options = {}) {
  const {
    preventLeave = true,
    closeOnLeave = true
  } = options || {}

  const dialogList = []

  return {
    init(Vue) {
      // 路由变化时关闭弹窗的函数
      // 将弹窗关闭，并调用弹窗选项中的`onClose`回调
      function closeDialog(dialog) {
        dialog.close()
        if (dialog.onClose) {
          dialog.onClose()
        }
      }

      let router = null
      Vue.mixin({
        // 路由成功跳转时关闭相应的弹窗
        beforeCreate() {
          if (!router && this.$router) {
            router = this.$router
            router.afterEach((to, from) => {
              dialogList
                .filter(dialog => dialog.closeOnLeave)
                .forEach(dialog => closeDialog(dialog))
            })
          }
        },

        // 弹窗阻止路由跳转
        // 之所以用这个路由守卫而不用全局路由守卫，
        // 是因为这个路由守卫是最先触发的，
        // 这样，若设置离开某页面时弹出弹窗，
        // 再次按返回键时，可以把弹窗关闭，
        // 如果用全局守卫则可能多次弹出弹窗
        beforeRouteLeave(to, from, next) {
          for (const dialog of dialogList) {
            if (dialog.preventLeave) {
              next(false)
              if (dialog.closeOnLeave) {
                closeDialog(dialog)
              }
              return
            }
          }
          next()
        }
      })
    },

    // 打开弹窗时，把该弹窗相关信息存入`dialogList`数组中
    // 之所以存入数组开头，是为了遍历时可以优先关闭最后打开的弹窗
    opened(vm, opt, { close }) {
      dialogList.unshift({
        close,
        onClose: opt.onClose,
        preventLeave: typeof opt.preventLeave === 'undefined'
          ? preventLeave
          : opt.preventLeave,
        closeOnLeave: typeof opt.closeOnLeave === 'undefined'
          ? closeOnLeave
          : opt.closeOnLeave
      })
    },

    // 弹窗关闭后从`dialogList`中删除
    closed(vm, opt, { close }) {
      const index = dialogList.findIndex(item => item.close === close)
      if (index !== -1) {
        dialogList.splice(index, 1)
      }
    }
  }
}
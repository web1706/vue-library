/**
 * @example
 * 
 * // main.js
 * import Vue from 'vue'
 * import DialogPlugin from 'dialog.js'
 * import router from './router'
 * import store from './store'
 * Vue.use(DialogPlugin, {
 *   // 在将弹窗VNode变成Vue实例时传入的选项参数
 *   vueOptions: {
 *     // 传入`router`可以在弹窗组件中使用`this.$router`
 *     router,
 *     // 传入`store`可以在弹窗组件中使用vuex
 *     store
 *   },
 *   // 插件列表
 *   plugins: []
 * })
 * 
 * // App.vue
 * import Alert from '@/components/Alert.vue';
 * const { close } = this.$dialog(<Alert
 *   message="Success"
 *   onConfirm={() => close()}
 * />)
 * 
 * // 插件定义
 * export default {
 *   // 初始化函数，在安装插件时调用
 *   init(Vue) {},
 * 
 *   // 生命周期函数
 *   // `vm`参数为弹窗组件实例
 *   // `options`参数为调用`this.$dialog`时传入的第二个参数
 *   // `returnValue`参数为调用`this.$dialog`的返回值
 *   beforeOpen(vm, options, returnValue) {},
 *   opened(vm, options, returnValue) {},
 *   beforeClose(vm, options, returnValue) {},
 *   closed(vm, options, returnValue) {}
 * }
 */

export default {
  install(Vue, options = {}) {
    const {
      vueOptions = {},
      plugins = []
    } = options || {}

    for (const plugin of plugins) {
      if (plugin['init']) {
        plugin['init'](Vue)
      }
    }

    const lifecycle = ['beforeOpen', 'opened', 'beforeClose', 'closed']
    const hooks = {}
    for (const i of lifecycle) {
      hooks[i] = []
      for (const plugin of plugins) {
        if (plugin[i]) {
          hooks[i].push(plugin[i])
        }
      }
    }
    function callHook(hook, ...params) {
      for (const cb of hooks[hook]) {
        cb(...params)
      }
    }

    /**
     * 打开弹窗
     * @param {VNode} dialog 弹窗VNode，可用`this.$createElement`或JSX生成
     * @param {object} [options] 弹窗选项
     * @return {DialogHandler}
     * @typedef DialogHandler
     * @type {object}
     * @property {() => void} close 关闭弹窗
     */
    Vue.prototype.$dialog = function (dialog, options = {}) {
      const vm = new Vue({
        ...vueOptions,
        render: () => dialog
      })
      const close = function close() {
        callHook('beforeClose', vm, options, returnValue)
        vm.$el.remove()
        vm.$destroy()
        callHook('closed', vm, options, returnValue)
      }
      const returnValue = { close }
      callHook('beforeOpen', vm, options, returnValue)
      document.body.append(vm.$mount().$el)
      callHook('opened', vm, options, returnValue)
      return returnValue
    }
  }
}

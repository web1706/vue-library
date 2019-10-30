/**
 * 使弹窗不可交互，适用于toast类型的弹窗
 * 
 * @example
 * 
 * // main.js
 * import transparent from 'dialog-transparent.js'
 * Vue.use(Dialog, {
 *   plugins: [
 *     transparent()
 *   ]
 * })
 * 
 * // App.vue
 * import Toast from '@/components/Toast.vue'
 * const { close } = this.$dialog(<Toast text="Success" />, {
 *   transparent: true
 * })
 * setTimeout(close, 1500)
 */

export default () => ({
  opened(vm, options) {
    if (options.transparent) {
      vm.$el.style.pointerEvents = 'none'
    }
  }
})
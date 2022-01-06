/**
 * 异步计算属性，用法同依赖 vue-async-computed，但支持取消
 * @param {AsyncComputedObject} asyncComputed 异步计算属性
 *
 * @example 快捷取消 axios 请求（需要引入 AxiosCancelTokenPlugin）
 * asyncComputedMixin({
 *   async someProp({ cancelToken }) {
 *     return this.$ajax({
 *       url: '...',
 *       cancelToken
 *     })
 *   }
 * })
 *
 * @example 手动取消回调
 * asyncComputedMixin({
 *   async someProp(onCancel) {
 *     const CancelToken = axios.CancelToken;
 *     const source = CancelToken.source();
 *     onCancel(() => source.cancel())
 *     // 或
 *     // onCancel().then(() => source.cancel())
 *     return this.$ajax({
 *       url: '...',
 *       cancelToken: source.token
 *     })
 *   }
 * })
 *
 * @typedef AsyncComputedObject
 * @type {{ [K: string]: AsyncComputedGetter | IAsyncComputedValue }}
 *
 * @typedef AsyncComputedGetter
 * @type {(this: import('vue').default, onCancel: CancelCallback & CancelModules) => Promise<T>}
 *
 * @typedef CancelCallback
 * @type {(cb: () => U) => Promise<U>}
 *
 * @typedef CancelModules
 * @type {object}
 * @prop {import('axios').CancelToken} cancelToken 用于取消axios请求的token
 *
 * @typedef IAsyncComputedValue
 * @type {{
 *   get: AsyncComputedGetter;
 *   default?: T | (() => T);
 *   watch?: string[] | (() => void);
 *   shouldUpdate?: () => boolean;
 *   lazy?: boolean;
 * }}
 */
export default function asyncComputedMixin(asyncComputed) {
  asyncComputed = { ...asyncComputed }
  // 保存所有的 vm2fns 实例，供组件销毁时使用
  const mapList = []
  for (const prop of Object.keys(asyncComputed)) {
    // 为每个异步计算属性创建一份状态数据
    const vm2fns = new WeakMap()
    mapList.push(vm2fns)
    const computed = asyncComputed[prop]
    if (typeof computed === 'function') {
      asyncComputed[prop] = autoCancel(computed, vm2fns)
    } else if (typeof computed.get === 'function') {
      asyncComputed[prop] = {
        ...computed,
        get: autoCancel(computed.get, vm2fns)
      }
    }
  }
  return {
    asyncComputed,
    destroyed() {
      // 这里的 this 也指向组件实例，所以也能获取到异步计算属性的取消回调
      for (const vm2fns of mapList) {
        if (vm2fns.has(this)) {
          const cancelFns = vm2fns.get(this)
          for (const cb of cancelFns.values()) {
            cb()
          }
        }
      }
    }
  }
}
// 保存引入的插件
const props = {}

/**
 * 添加快捷属性
 * @param {() => any} propPlugin 插件函数，一个返回属性值的函数
 * @param {string} [propName] 要添加的属性名
 */
asyncComputedMixin.useProp = function(propPlugin, propName = propPlugin.propName) {
  // 把插件保存起来
  props[propName] = propPlugin
  return asyncComputedMixin
}

/**
 * 给函数增加取消的方法，在多次执行时取消前面的函数
 * @param {() => Promise<T>} fn 任意函数
 * @param {WeakMap} vm2fns 保存组件实例到取消回调的映射
 * @returns {(onCancel: CancelCallback & CancelModules) => Promise<T>}
 */
function autoCancel(fn, vm2fns) {
  return async function() {
    if (!vm2fns.has(this)) {
      vm2fns.set(this, new Set())
    }
    const cancelFns = vm2fns.get(this)
    for (const cb of cancelFns.values()) {
      cb()
    }
    let cancelFn = null
    const cancelPromise = new Promise((resolve) => {
      cancelFns.add(resolve)
      cancelFn = resolve
    })
    const onCancel = (cb) => cancelPromise.then(cb)
    // 定义已经引入的插件属性
    for (const propName of Object.keys(props)) {
      Object.defineProperty(onCancel, propName, {
        get: props[propName].bind(null, onCancel)
      })
    }
    try {
      return await fn.call(this, onCancel, ...arguments)
    } finally {
      cancelFns.delete(cancelFn)
    }
  }
}

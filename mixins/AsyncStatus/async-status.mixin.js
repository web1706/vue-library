import Vue from 'vue'

/**
 * 维护异步方法的执行状态，为组件实例的方法添加如下属性：
 * - loading {boolean} 是否正在执行
 * - success {boolean} 是否执行成功
 * - error {boolean} 是否执行失败
 * - exception 方法执行失败时抛出的异常
 * @param {string|string[]|Alias} [methods] 方法名，可指定多个
 * @param {Alias} [alias] 为注入的属性指定属性名，或将某个属性设置成false跳过注入
 *
 * @typedef Alias
 * @type {object}
 * @prop {boolean|string} [loading=true] 加载状态的属性名
 * @prop {boolean|string} [success=true] 加载成功状态的属性名
 * @prop {boolean|string} [error=true] 加载失败状态的属性名
 * @prop {boolean|string} [exception=true] 加载失败时存储错误对象的属性名
 *
 * @example
 * <template>
 *  <el-table v-loading="getTableData.loading" />
 * </template>
 * <script>
 *  export default {
 *    mixins: [
 *      asyncStatus('goFetchData')
 *    ],
 *    methods: {
 *      async getTableData() {
 *        this.tableData = await this.$http.get('/user/list');
 *      }
 *    }
 *  }
 * </script>
 */
export default function asyncStatus(methods, alias = {}) {
  // 规范化参数
  if (typeof methods === 'object' && !Array.isArray(methods)) {
    alias = methods
  }
  if (typeof methods === 'string') {
    methods = [methods]
  }
  const getKey = (name) =>
    typeof alias[name] === 'string' || alias[name] === false ? alias[name] : name
  const loadingKey = getKey('loading')
  const successKey = getKey('success')
  const errorKey = getKey('error')
  const exceptionKey = getKey('exception')
  return {
    data() {
      const fns = Array.isArray(methods) ? methods : Object.keys(this.$options.methods || {})
      for (const method of fns) {
        if (typeof this[method] === 'function') {
          const fn = this[method]
          let loadId = 0
          const status = Vue.observable({})
          if (loadingKey) Vue.set(status, loadingKey, false)
          if (successKey) Vue.set(status, successKey, false)
          if (errorKey) Vue.set(status, errorKey, false)
          if (exceptionKey) Vue.set(status, exceptionKey, false)
          const setStatus = (key, value) => key && (status[key] = value)
          this[method] = (...args) => {
            const currentId = ++loadId
            setStatus(loadingKey, true)
            setStatus(successKey, false)
            setStatus(errorKey, false)
            setStatus(exceptionKey, null)
            try {
              const result = fn.call(this, ...args)
              if (result instanceof Promise) {
                return result
                  .then((res) => {
                    if (loadId === currentId) {
                      setStatus(loadingKey, false)
                      setStatus(successKey, true)
                    }
                    return res
                  })
                  .catch((err) => {
                    if (loadId === currentId) {
                      setStatus(loadingKey, false)
                      setStatus(errorKey, true)
                      setStatus(exceptionKey, err)
                    }
                    throw err
                  })
              }
              setStatus(loadingKey, false)
              setStatus(successKey, true)
              return result
            } catch (err) {
              setStatus(loadingKey, false)
              setStatus(errorKey, true)
              setStatus(exceptionKey, err)
              throw err
            }
          }
          Object.keys(status).forEach((key) => {
            Object.defineProperty(this[method], key, {
              get() {
                return status[key]
              },
            })
          })
          Object.setPrototypeOf(this[method], fn)
        }
      }
      return {}
    },
  }
}

import axios from 'axios'

/**
 * 给 async-computed 添加快捷取消 axios 的属性
 * @example
 * // main.js
 * asyncComputedMixin.useProp(CancelTokenPlugin);
 * // *.vue
 * export default {
 *   mixins: [
 *     asyncComputed({
 *       async userList({ cancelToken }) {
 *         return this.$ajax({
 *           url: '/user/list',
 *           cancelToken
 *         })
 *       }
 *     })
 *   ]
 * }
 */
export default function AxiosCancelTokenPlugin(onCancel) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  onCancel(() => source.cancel())
  return source.token
}

AxiosCancelTokenPlugin.propName = 'cancelToken'

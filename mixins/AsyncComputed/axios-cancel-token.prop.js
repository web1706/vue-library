import axios from 'axios'

/**
 * 给 async-computed 添加快捷取消 axios 的属性
 * @returns {import('axios').CancelToken}
 */
export default function AxiosCancelTokenProp(onCancel) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  onCancel(() => source.cancel())
  return source.token
}

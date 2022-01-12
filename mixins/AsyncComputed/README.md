# 带取消功能的异步计算属性

为工具 [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed) 添加取消功能。

## 基本使用

首先，正常安装并引入 [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed)。

```bash
npm i vue-async-computed
```

```js
// main.js
import Vue from 'vue';
import AsyncComputed from 'vue-async-computed';

Vue.use(AsyncComputed);
```

接着就能使用这个 mixin 了。

```js
import AsyncComputed from '@/mixins/AsyncComputed/async-computed.mixin';
export default {
  mixins: [
    asyncComputed({
      async username(onCancel) {
        // 可以使用回调方式
        onCancel(() => {
          /** 取消加载 */
        });
        // 也可以使用 Promise 方式
        onCancel().then(() => {
          /** 取消加载 */
        });
      },
    }),
  ],
};
```

当重新执行异步计算属性，或者组件销毁时，会自动调用传给 `onCancel` 的回调。

## 快捷取消 axios 请求

从 `onCancel` 上取得快捷属性 `cancelToken`，用于自动取消过时的 axios 请求。

```js
export default {
  mixins: [
    asyncComputedMixin({
      async username({ cancelToken }) {
        return this.$axios.get('/user/name', {
          params: {
            keyword: this.keyword,
          },
          cancelToken,
        });
      },
    }),
  ],
};
```

## 自定义快捷属性

如果你不使用 axios，或者想提供其他的快捷属性以便自动取消加载，可以自己编写快捷属性。

快捷属性是一个函数，传入 `onCancel` 作为参数，返回快捷属性的值。具体写法可以参考预置的快捷属性 [axios-cancel-token.prop.js](https://github.com/web1706/vue-library/blob/master/mixins/AsyncComputed/axios-cancel-token.prop.js)。

```js
// axios-cancel-token.prop.js
export default function AxiosCancelTokenPlugin(onCancel) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  onCancel(() => source.cancel());
  return source.token;
}
```

然后在 [async-computed.mixin.js](https://github.com/web1706/vue-library/blob/master/mixins/AsyncComputed/async-computed.mixin.js)中的 `fastProps` 中引入。

```js
// async-computed.mixin.js
import AxiosCancelTokenProp from './axios-cancel-token.prop'
const fastProps = {
  cancelToken: AxiosCancelTokenProp
}
```

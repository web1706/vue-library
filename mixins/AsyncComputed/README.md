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

使用 `axios-cancel-token` 插件，可以提供快捷取消 axios 请求的方法。

```js
// main.js
import AsyncComputedMixin from '@/mixins/AsyncComputed/async-computed.mixin';
import AxiosCancelTokenProp from '@/mixins/AsyncComputed/axios-cancel-token.prop';

AsyncComputedMixin.useProp(AxiosCancelTokenProp);
```

接着可以从 `onCancel` 上取得快捷属性 `cancelToken`。

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

你也可以通过第二个参数指定快捷属性的名字。

```js
AsyncComputedMixin.useProp(AxiosCancelTokenProp, 'axiosCancelToken');
```

## 自定义快捷属性

如果你不使用 axios，或者想提供其他的快捷属性以便自动取消加载，可以自己编写快捷属性插件。

快捷属性插件是一个函数，传入 `onCancel` 作为参数，返回快捷属性的值。

```js
export default function AxiosCancelTokenPlugin(onCancel) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  onCancel(() => source.cancel());
  return source.token;
}
```

通过 `propName` 指定推荐的快捷属性名，当引入快捷属性插件时，如果没有指定属性名，则使用推荐的属性名。

```js
AxiosCancelTokenPlugin.propName = 'cancelToken';
```

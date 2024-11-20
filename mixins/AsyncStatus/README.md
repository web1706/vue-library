# AsyncStatusMixin

维护异步方法的执行状态，为组件实例的方法添加如下属性：

- `loading` {boolean} 是否正在执行
- `success` {boolean} 是否执行成功
- `error` {boolean} 是否执行失败
- `exception` 方法执行失败时抛出的异常

## 基本用法

```js
// main.js
import Vue from 'vue';
// 全局引入
Vue.mixin(asyncStatus());
```

```vue
<template>
  <el-table v-loading="getTableData.loading" />
</template>
<script>
export default {
  methods: {
    async getTableData() {
      this.tableData = await this.$http.get('/user/list');
    },
  },
};
</script>
```

## 局部引入

可以只在组件内局部引入。

```vue
<template>
  <el-table v-loading="getTableData.loading" />
</template>
<script>
export default {
  mixins: [asyncStatus()],
  methods: {
    async getTableData() {
      this.tableData = await this.$http.get('/user/list');
    },
  },
};
</script>
```

## 指定方法

可以只为部分方法添加属性。

```js
// 单个方法
asyncStatus('getTableData');
// 多个方法
asyncStatus(['getTableData']);
```

# 异步加载组件

加载异步数据时，根据不同的加载状态显示不同的内容，需要配合 [vue-async-computed](https://github.com/foxbenjaminfox/vue-async-computed) 使用。

## 示例

简单的使用方式：

```vue
<template>
  <async-status>
    <template #default>
      <!-- 加载完成后显示的内容 -->
    </template>
    <template #updating>
      <!-- 加载过程中显示的内容 -->
    </template>
    <template #error>
      <!-- 加载失败时显示的内容 -->
    </template>
  </async-status>
</template>
```

一个复杂一些的例子：

```vue
<template>
  <async-status :async-computed="$asyncComputed" :async-props="['group']">
    <template #default>
      <div class="page__container">
        <div class="page__header">{{ group.name }}</div>
        <async-status
          :async-computed="$asyncComputed"
          :async-props="['tableData']"
        >
          <table class="page__body">
            <!-- 显示 tableData 的内容 -->
          </table>
        </async-status>
      </div>
    </template>
    <template #updating>
      <!-- 加载过程中显示的内容，比如骨架屏 -->
    </template>
    <template #error="{ exception, retry }">
      <!-- 加载失败时显示的内容 -->
      <div class="error__container">
        <div class="error__header">加载失败</div>
        <div class="error__msg">{{ exception.message }}</div>
        <button class="error__btn" @click="retry">重试</button>
      </div>
    </template>
  </async-status>
</template>
<script>
export default {
  asyncComputed: {
    async group() {
      return this.$http.get('/group/info');
    },
    async tableData() {
      if (!this.groupInfo.success) return;
      return this.$http.get('/user/list', {
        groupId: this.group.id,
      });
    },
  },
};
</script>
```

## API

### props

| 属性            | 类型       | 说明                                                                                           |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `asyncComputed` | `object`   | 传入要监听的 `$asyncComputed`，默认为父组件的 `$asyncComputed`，所以外层没有其他组件时可以不传 |
| `asyncProps`    | `string[]` | 要监听的异步计算属性名列表，默认监听所有异步计算属性                                           |

### slots

| 插槽       | 说明                 | 插槽属性                                              |
| ---------- | -------------------- | ----------------------------------------------------- |
| `default`  | 加载完成后显示的内容 | 无                                                    |
| `updating` | 加载过程中显示的内容 | 无                                                    |
| `error`    | 加载失败时显示的内容 | `exception`-捕获到的错误，`update`-重新获取数据的函数 |

请注意，插槽内容只能有单个根节点，组件根据不同状态渲染不同的插槽内容。

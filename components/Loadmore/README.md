# 下拉刷新和触底加载更多

该组件支持两个功能：

1. 下拉刷新
2. 滚动到底部加载更多

## 特性

- 下拉刷新完成后自定义本次刷新结果的提示文字
- 下拉刷新和触底加载失败时自定义错误提示文字
- 防止同时触发下拉刷新和触底加载
- 支持首次挂载后自动触发一次触底加载

## 示例

以下是一个简化版的使用示例：

```html
<template>
  <load-more
    class="loadmore"
    :refresh-method="onRefresh"
    :loadmore-method="onLoadmore"
    :is-empty="!list.length"
    :reach-end="reachEnd"
    initial-load
  >
    <list-item v-for="item in list" :key="item.id" :data="item" />
  </load-more>
</template>

<script>
import LoadMore from 'path/to/Loadmore.vue'
import ListItem from 'path/to/ListItem.vue'
export default {
  components: {
    LoadMore,
    ListItem
  },

  data() {
    return {
      list: [],
      reachEnd: false,
      pageSize: 10
    }
  },

  methods: {
    /**
     * 获取数据并渲染
     * @param {number} offset 从第几项开始获取数据
     * @param {number} length 获取多少条记录
     * @returns {Promise<any[]>} 获取到的列表数据
     */
    async fetch(
      offset = this.list.length,
      length = this.pageSize
    ) {
      try {
        // 获取列表数据
        const data = await this.$http.post('...', {
          offset,
          length
        })
        // 填充数据
        this.list.splice(
          offset,
          this.list.length - offset,
          ...data.list
        )
        this.reachEnd = data.isLastPage
        return data.list
      } catch (err) {
        // TODO: 处理请求错误
      }
    },

    /**
     * 下拉刷新时的回调
     */
    async onRefresh() {
      this.reachEnd = false
      const list = await this.fetch(0);
      return `为您获取到${list.length}条数据`
    },

    /**
     * 触底加载更多的回调
     */
    async onLoadmore() {
      await this.fetch();
    }
  }
}
</script>

<style scoped>
.loadmore {
  min-height: 100vh;
}
</style>
```

## API

### props

| 属性 | 类型 | 说明 |
|------|-----|------|
|`refreshMethod`|`function`|触发刷新时调用的函数，函数返回表示刷新完成，可返回`Promise`。函数如果返回一个字符串，则将其作为成功的提示信息。如果抛出一个异常，则表示刷新失败。可以抛出一个`Error`对象或者一个字符串，以自定义错误提示信息。如果不传，则禁用下拉刷新功能。|
|`refreshDistance`|`number`|下拉多少像素时可触发下拉刷新|
|`refreshPullText`|`string`|下拉刷新时的提示文字|
|`refreshDropText`|`string`|释放可刷新时的提示文字|
|`refreshLoadingText`|`string`|正在刷新时的提示文字|
|`refreshSuccessText`|`string`|刷新成功时的默认提示信息|
|`refreshErrorText`|`string`|刷新失败时的默认提示信息|
|`loadmoreMethod`|`function`|触发加载时调用的函数，函数返回表示加载完成，可返回`Promise`。函数如果抛出一个异常，则代表加载失败。可以抛出一个`Error`对象或者一个字符串，以自定义错误提示信息。如果不传，则禁用触底加载功能。|
|`loadmoreDistance`|`number`|距离底部多少像素时触发加载|
|`isEmpty`|`boolean`|当前是否没有数据|
|`reachEnd`|`boolean`|是否加载完所有数据|
|`loadmoreReadyText`|`string`|正常情况下的提示文字|
|`loadmoreLoadingText`|`string`|加载过程中的提示文字|
|`loadmoreEmptyText`|`string`|无数据可加载时的提示文字|
|`loadmoreEndText`|`string`|加载完所有数据时的提示文字|
|`loadmoreErrorText`|`string`|加载失败时的默认提示信息|
|`initialLoad`|`boolean`|初始时是否调用一次加载更多函数|

### methods

| 函数 | 说明 |
|------|------|
|`refresh`|手动触发下拉刷新|
|`loadmore`|手动触发加载更多|
|`findScrollElement`|重新查找滚动元素（默认情况下只在初始时查找一次，后续如果滚动元素发生变化，则需要手动调用此函数）|

### slots

| 插槽 | 说明 | 插槽属性 |
|------|-----|-----------|
|`refresh`|下拉刷新|`status` & `text`|
|`refresh-pull`|下拉刷新状态|`text`|
|`refresh-drop`|释放可刷新状态|`text`|
|`refresh-loading`|正在刷新状态|`text`|
|`refresh-success`|刷新成功状态|`text`|
|`refresh-error`|刷新失败状态|`text`|
|`loadmore`|加载更多|`status` & `text`|
|`loadmore-loading`|正在加载状态|`text`|
|`loadmore-empty`|没有数据可以加载状态|`text`|
|`loadmore-end`|加载完全部数据状态|`text`|
|`loadmore-error`|加载失败状态|`text`|
|`loadmore-ready`|等待下一次加载状态|`text`|

以上`status`属性代表下拉刷新或触底加载的状态，`text`属性代表提示文字。

### events

| 事件 | 说明 | 参数 |
|------|-----|------|
|`refresh-status-change`|下拉刷新状态改变|`from` & `to` & `text`|
|`loadmore-status-change`|触底加载状态改变|`from` & `to` & `text`|

参数为一个对象，包含以下属性：

- `from` 改变前的状态
- `to` 改变之后的状态
- `text` 改变后的提示文字

## 了解更多

### 下拉刷新

下拉刷新的原理是监听组件根元素的触摸事件。因此，要使用下拉刷新功能，最好把列表放入组件的`slot`中，并设置组件的最小高度占满一页。

需要注意的是，由于监听的是组件根元素的触摸事件，因此，在组件之外的区域进行滚动是不会触发下拉刷新的。

### 触底加载更多

触底加载更多的原理是监听滚动元素的滚动条位置，滚动到底部时触发加载。

由于初始时数据可能不足一页，导致无法向下滚动，因此，也可以通过点击提示信息来触发加载。

如果某次加载失败，会显示错误提示，下次滚动时将不会触发加载更多，但仍然可以通过点击错误信息触发加载。

滚动元素是从组件根元素向上查找，直到找到`overflow`属性值为`auto`或者`scroll`的元素。如果没有找到，则滚动元素为`window`。因此，即使列表不在组件的`slot`中，也可以使用触底加载的功能。但不能把滚动元素放置在组件的`slot`中，因为组件并不会向内部查找滚动元素。

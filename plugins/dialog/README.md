# 弹窗插件

弹窗插件可以让你将VNode作为弹窗打开，支持使用插件来扩展本插件的功能，使其适用于更多的场景。

## 子插件特性

通过子插件可以实现以下功能：

- 弹窗打开时禁止页面滚动
- 路由跳转成功时自动关闭弹窗
- 按返回键时阻止页面跳转并打开弹窗
- 禁止与弹窗组件交互（可用于`toast`类型的弹窗）

## 基本使用

```js
// 在 main.js 中注册插件
import Vue from 'vue'
import Dialog from 'dialog'
Vue.use(Dialog, {
  vueOptions: {
    // 将VNode转化为Vue实例时传入的选项参数
  },
  plugins: [
    // 子插件列表
  ]
})

// 在vue组件方法中使用`this.$createElement`
// 或JSX生成VNode，并调用`this.$dialog`打开弹窗
// 返回的对象中包含一个`close`方法，调用则会关闭弹窗
const { close } = this.$dialog(<Toast />, {
  // 可选参数，主要传给子插件使用
})
setTimeout(close, 1500)
```

## 示例

```js
// main.js
import Vue from 'vue'
import router from './router'
import store from './store'
import DialogPlugin from 'dialog'
import pageScroll from 'dialog-pagescroll'
import dialogRouter from 'dialog-router'
import transparent from 'dialog-transparent'

Vue.use(DialogPlugin, {
  // 在将弹窗VNode变成Vue实例时传入的选项参数
  vueOptions: {
    // 为了在弹窗组件中使用`this.$router`
    router,
    // 为了在弹窗组件中使用 vuex
    store
  },
  // 插件列表
  plugins: [
    pageScroll(),
    dialogRouter(),
    transparent()
  ]
})
```

```html
<script>
// App.vue
import Alert from '@/components/Alert.vue'
import Toast from '@/components/Toast.vue'
export default {
  methods: {
    alertMsg(msg) {
      const { close } = this.$dialog(
        <Alert message={msg} onConfirm={() => close} />
      )
    },

    toastMsg(msg) {
      const { close } = this.$dialog(
        <Toast text={msg} />,
        {
          // 来自`dialog-tranparent`插件
          transparent: true,
          // 以下两个参数来自`dialog-router`插件
          preventLeave: false,
          closeOnLeave: false
        }
      )
      setTimeout(close, 1500)
    }
  }
}
</script>
```

## 原理

1. 创建`Vue`实例，并在`render`方法中返回VNode。
2. 从`Vue`实例中通过`$el`属性取出真实的DOM节点，放到`body`的末尾。
3. 关闭弹窗时调用`vm.$destroy`销毁弹窗组件实例，并从DOM中移除节点。

## 子插件列表

以下介绍当前目录下的子插件的作用，具体使用请看文件内部的注释。

- `dialog-pagescroll`：弹窗打开时禁止页面滚动
- `dialog-router`：控制路由跳转时弹窗的行为，或阻止本次路由跳转
- `dialog-transparent`：阻止用户与弹窗组件进行交互

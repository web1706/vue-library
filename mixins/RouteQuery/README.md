# RouteQueryMixin

将路由 `query` 参数映射为组件中可读写的属性，对该属性写入时会使用 `this.$router.replace` 改变路由。

## 用法示例

### 基本用法

```js
import routeQuery from 'route-query.mixin';
export default {
  mixins: [
    // 引入一个参数
    routeQuery('deptId'),
    // 引入多个参数
    routeQuery(['deptId', 'year']),
  ],
};
```

### 类型转换

```js
export default {
  mixins: [
    routeQuery({
      // 对引入的属性值进行转换
      companyId: {
        type: Number,
      },
      // 简写形式
      deptId: Number,
    }),
  ],
};
```

类型转换函数接收路由中的参数值作为参数，返回转换后的属性值。

### 指定参数名

注入的属性可以和路由中的参数名不一致。

```js
export default {
  mixins: [
    routeQuery({
      // 引入的属性名是 `deptId`，但 query 中对应的参数名是 `dept-id`
      deptId: {
        from: 'dept-id',
      },
      // 简写形式
      companyId: 'company-id',
    }),
  ],
};
```

### 默认值

当路由中没有对应的参数时，可以指定一个默认值。

```js
export default {
  mixins: [
    routeQuery({
      // 指定默认值
      year: {
        default: '2022',
      },
      // 对象或数组的默认值必须从一个工厂函数返回
      empList: {
        default: () => [],
      },
      // 可以通过 this 获取组件实例，类似计算属性
      yearLabel: {
        default() {
          return `${this.year}年`;
        },
      },
      // 也可以通过函数参数获取组件实例
      empCode: {
        default: (vm) => vm.empList?.[0]?.empCode,
      },
    }),
  ],
};
```

只有当参数没有在路由中出现时，才会使用默认值，且函数形式的默认值具有响应式，类似计算属性。以下情况不会使用默认值：

| 示例       | 参数值 |
| ---------- | ------ |
| `?deptId=` | `''`   |
| `?deptId`  | `null` |

### 同步设置

默认情况下，属性值和路由保持双向同步，可以设置是否需要与路由保持同步。

```js
export default {
  mixins: [
    routeQuery({
      deptId: {
        // query变化时，是否同步更新prop的值
        query2prop: true,
        // prop变化时，是否同步更新query
        prop2query: true,
      },
      userInfo: {
        type: JSON.parse,
        // 传入一个转换函数，将prop的值转换成query中的值
        prop2query: JSON.stringify,
      },
    }),
  ],
};
```

// 比较两个 query 对象是否相同，从 vue-router 的源码中拷贝
function isObjectEqual(a, b) {
  if (a === void 0) a = {};
  if (b === void 0) b = {};

  if (!a || !b) {
    return a === b;
  }
  var aKeys = Object.keys(a).sort();
  var bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every(function (key, i) {
    var aVal = a[key];
    var bKey = bKeys[i];
    if (bKey !== key) {
      return false;
    }
    var bVal = b[key];
    if (aVal == null || bVal == null) {
      return aVal === bVal;
    }
    if (typeof aVal === "object" && typeof bVal === "object") {
      return isObjectEqual(aVal, bVal);
    }
    return String(aVal) === String(bVal);
  });
}

// 用于操作路由 query 参数的适配器
const query = {
  get(vm, name) {
    return vm.$route.query[name];
  },
  set(vm, name, value) {
    const query = {
      ...vm.$route.query,
      [name]: value,
    };
    if (!isObjectEqual(query, vm.$route.query)) {
      vm.$router.replace({ query });
    }
  },
  has(vm, name) {
    // 如果没有兼容性问题，可以使用`Object.hasOwn`
    return Object.prototype.hasOwnProperty.call(vm.$route.query, name);
  },
  active(vm) {
    return vm.$route.matched.some((record) => Object.values(record.instances).includes(vm));
  },
};

// 为单个属性生成 mixin
function generatePropMixin(propName, propConf) {
  const {
    from = propName,
    type,
    default: defaultValue,
    query2prop = true,
    prop2query = true,
  } = propConf;
  // 将路由参数转换成属性值
  const getPropValue = (vm) =>
    query.has(vm, from)
      ? typeof type === "function"
        ? type(query.get(vm, from))
        : query.get(vm, from)
      : typeof defaultValue === "function"
      ? defaultValue.call(vm, vm)
      : defaultValue;
  // 将属性值转换成路由query的值
  const getQueryValue = (propValue) =>
    typeof prop2query === "function" ? prop2query(propValue) : propValue;
  return {
    data() {
      return {
        [propName]: getPropValue(this),
      };
    },
    created() {
      // 如果双向不同步，则没有必要处理属性
      if (!query2prop && !prop2query) return;
      // 如果路由单向同步到属性值，使用 `watch` 即可
      if (query2prop && !prop2query) {
        this.$watch(
          "$route",
          () => {
            if (query.active(this)) {
              this[propName] = getPropValue(this);
            }
          },
          {
            immediate: true,
          }
        );
        return;
      }
      // 剩余的情况下，对属性赋值时需要同步给路由
      const attributes = Object.getOwnPropertyDescriptor(this.$data, propName);
      const { get, set } = attributes;
      const cache = Object.defineProperty({}, "value", { get, set });
      attributes.get = () => {
        // 双向绑定时直接从路由读取属性值
        if (query2prop && query.active(this)) {
          const value = getPropValue(this);
          // 实时同步到缓存中
          cache.value = value
          return value
        }
        return cache.value;
      };
      attributes.set = (value) => {
        cache.value = value;
        if (query.active(this)) {
          const queryValue = getQueryValue(value);
          query.set(this, from, queryValue);
        }
      };
      Object.defineProperty(this.$data, propName, attributes);
    },
  };
}

/**
 * 将路由中的 query 参数映射为组件中的属性
 * @see {@link https://github.com/web1706/vue-library/tree/master/mixins/RouteQuery}
 * @param {string|string[]|{ [prop: string]: string|function|PropConfig }} config 属性配置
 * @returns 生成的 mixin 对象
 *
 * @typedef PropConfig
 * @type {object}
 * @prop {string} [from] 该属性在 query 中对应的参数名
 * @prop {function} [type] 类型转换函数，将参数值转换成属性值
 * @prop {any} [default] 当参数不存在时属性的默认值，或返回默认值的函数
 * @prop {boolean} [query2prop=true] 参数变化时，是否同步更新属性值
 * @prop {boolean|function} [prop2query=true] 给属性赋值时，是否同步更新路由，也可以传属性到参数的转换函数
 *
 * @example 简单用法
 * export default {
 *   mixins: [
 *     // 引入一个参数
 *     routeQuery("deptId"),
 *     // 引入多个参数
 *     routeQuery(["deptId", "year"]),
 *   ],
 * };
 *
 * @example 指定参数名
 * export default {
 *   mixins: [
 *     routeQuery({
 *       // 引入的属性名是 `deptId`，但 query 中对应的参数名是 `dept-id`
 *       deptId: {
 *         from: "dept-id",
 *       },
 *       // 简写形式
 *       companyId: "company-id",
 *     }),
 *   ],
 * };
 *
 * @example 类型转换
 * export default {
 *   mixins: [
 *     routeQuery({
 *       // 对引入的属性值进行转换
 *       companyId: {
 *         type: Number,
 *       },
 *       // 简写形式
 *       deptId: Number,
 *     }),
 *   ],
 * };
 *
 * @example 默认值
 * export default {
 *   mixins: [
 *     routeQuery({
 *       // 指定默认值
 *       year: {
 *         default: "2022",
 *       },
 *       // 对象或数组的默认值必须从一个工厂函数返回
 *       empList: {
 *         default: () => [],
 *       },
 *       // 可以通过 this 获取组件实例，类似计算属性
 *       yearLabel: {
 *         default() {
 *           return `${this.year}年`
 *         },
 *       },
 *       // 也可以通过函数参数获取组件实例
 *       empCode: {
 *         default: (vm) => vm.empList?.[0]?.empCode,
 *       },
 *     }),
 *   ],
 * };
 */
export default function routeQuery(config) {
  // 字符串形式转换成数组形式
  if (typeof config === "string") {
    config = [config];
  }
  // 数组形式转换成对象形式
  if (Array.isArray(config)) {
    config = config.reduce(
      (propsConfig, propName) =>
        Object.assign(propsConfig, {
          [propName]: {},
        }),
      {}
    );
  }
  const mixins = [];
  for (const propName of Object.keys(config)) {
    let propConf = config[propName];
    // 简写形式转换成完整形式
    if (typeof propConf === "string") {
      propConf = { from: propConf };
    } else if (typeof propConf === "function") {
      propConf = { type: propConf };
    }
    mixins.push(generatePropMixin(propName, propConf));
  }
  return {
    mixins,
  };
}

<script lang="jsx">
/**
 * 异步加载组件，根据父组件状态加载不同插槽中的内容。
 * 根据父组件实例的 $asyncComputed 自动判断加载状态。
 * 可用的插槽有：
 *
 * - `default` 加载成功时显示
 * - `updating` 加载时显示
 * - `error` 加载失败时显示，提供以下插槽参数：
 *   - `exception` {any} 抛出的错误对象
 *   - `update` {() => void} 重试的方法
 *
 * 需要注意所有插槽都只能有一个根节点。
 */
export default {
  props: {
    /**
     * 用于获取状态的 $asyncComputed，默认取父组件中的 $asyncComputed。
     * 如果外层没有包裹其他组件，可以不传。
     */
    asyncComputed: {
      type: Object,
      default() {
        return this.$parent.$asyncComputed;
      },
    },
    /**
     * 要监听的异步计算属性列表
     * @type {string[]}
     */
    asyncProps: Array,
  },
  computed: {
    status() {
      const $ac = this.asyncComputed;
      const props = this.asyncProps || Object.keys($ac);
      return props.map((prop) => $ac[prop]);
    },
    success() {
      return this.status.every((state) => state.success);
    },
    updating() {
      return this.status.some((state) => state.updating);
    },
    error() {
      return this.status.some((state) => state.error);
    },
    exception() {
      return this.status.find((state) => state.error)?.exception;
    },
  },
  methods: {
    update() {
      if (this.error) {
        this.status
          .filter((state) => state.error)
          .forEach((state) => state.update());
      } else {
        this.status.forEach((state) => state.update());
      }
    },
  },
  render() {
    if (this.success) {
      return this.$scopedSlots.default?.();
    }
    if (this.updating) {
      if (this.$scopedSlots.updating) {
        return this.$scopedSlots.updating();
      }
      // 此处可以返回默认的加载组件
    }
    if (this.error) {
      if (this.$scopedSlots.error) {
        return this.$scopedSlots.error({
          exception: this.exception,
          update: this.update,
        });
      }
      // 此处可以返回默认的失败组件
    }
    return null;
  },
};
</script>

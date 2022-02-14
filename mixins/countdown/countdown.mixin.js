/**
 * 生成倒计时 mixin，按秒进行倒计时
 * @param {string} getterKey 要注入的属性名，改属性可读写，用于获取或设置剩余秒数
 * @param {string} [setterKey] 要注入的方法名，可选，改方法用于重置剩余秒数
 * @see {@link https://github.com/web1706/vue-library/tree/master/mixins/countdown}
 *
 * @example 传入一个字符串参数，注入一个可读写的属性用于取值和重置
 * <template>
 *   <button :disabled="!!seconds" @click="seconds = 60">
 *     {{ seconds || '发送验证码' }}
 *   </button>
 * </template>
 * <script>
 * import countdown from '@/mixins/countdown'
 * export default {
 *   mixins: [
 *     countdown('seconds')
 *   ]
 * }
 * </script>
 *
 * @example 传入第二个字符串参数，再注入一个重置的方法
 * <template>
 *   <button :disabled="!!seconds" @click="setCountdown(60)">
 *     {{ seconds || '发送验证码' }}
 *   </button>
 * </template>
 * <script>
 * import countdown from '@/mixins/countdown'
 * export default {
 *   mixins: [
 *     countdown('seconds', 'setCountdown')
 *   ]
 * }
 * </script>
 */
 export default function countdown(getterKey, setterKey) {
  if (typeof getterKey === "string") {
    const mixin = {
      data() {
        return {
          // 属性注入到 data 中
          [getterKey]: 0,
        };
      },
      created() {
        let timer = null;
        this.$watch(
          getterKey,
          (val, oldVal) => {
            if (timer !== null) {
              clearTimeout(timer);
              timer = null;
            }
            // 非数字类型转成数字类型
            if (typeof val !== "number") {
              this[getterKey] = Number(val);
              return;
            }
            // 非法值，转成 0
            if (!isFinite(val)) {
              this[getterKey] = 0;
              return;
            }
            // 负数，转成 0
            if (val < 0) {
              this[getterKey] = 0;
              return;
            }
            // 小数，向上取整
            if (val % 1 !== 0) {
              this[getterKey] = Math.ceil(val);
              return;
            }
            if (val > 0) {
              timer = setTimeout(
                () => {
                  this[getterKey] = val - 1;
                },
                // 整数时倒计时 1s，小数时倒计时超出整数秒的时间
                oldVal % 1 > 0 ? (oldVal * 1000) % 1000 : 1000
              );
            }
          },
          {
            immediate: true,
          }
        );
      },
      destroyed() {
        // 组件销毁时清除定时器
        this[getterKey] = 0;
      },
    };
    if (typeof setterKey === "string") {
      // 再注入一个方法
      mixin.methods = {
        [setterKey](val) {
          this[getterKey] = val;
        },
      };
    }
    return mixin;
  }
  // 参数不规范时抛出错误
  throw new Error("Invalid arguments");
}

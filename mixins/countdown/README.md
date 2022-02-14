# 倒计时 mixin

注入一个可读写的属性，用于获取和设置倒计时的剩余秒数。

_注意：这个 mixin 基于 `setTimeout` 实现，可能会存在误差，适用于无需精确控制毫秒数的场景。_

## 基本使用

传入一个字符串参数，指定要注入的属性名。

```vue
<template>
  <button :disabled="!!seconds" @click="seconds = 60">
    {{ seconds || '发送验证码' }}
  </button>
</template>
<script>
import countdown from '@/mixins/countdown';
export default {
  mixins: [countdown('seconds')],
};
</script>
```

## 重置倒计时

除了通过给属性赋值来重新进行倒计时，还可以通过传入第二个可选的参数，再注入一个重置倒计时的方法。

```vue
<template>
  <button :disabled="!!seconds" @click="setCountdown(60)">
    {{ seconds || '发送验证码' }}
  </button>
</template>
<script>
import countdown from '@/mixins/countdown';
export default {
  mixins: [countdown('seconds', 'setCountdown')],
};
</script>
```

## 支持小数

如果将剩余时间设置成小数，也能被正确处理。

```vue
<template>
  <!-- 会显示成 4，但是 0.2s 后变成 3 -->
  <button :disabled="!!seconds" @click="seconds = 3.2">
    {{ seconds || '开始计时' }}
  </button>
</template>
<script>
import countdown from '@/mixins/countdown';
export default {
  mixins: [countdown('seconds')],
};
</script>
```

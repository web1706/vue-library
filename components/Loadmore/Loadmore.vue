<template>
  <div class="refresh-loadmore">
    <div
      class="refresh"
      v-if="refreshMethod"
      :class="{ transition: !hasTouch }"
      :style="{ height: touchmoveDistance + 'px' }"
    >
      <div class="refresh-wrapper" ref="refresh">
        <slot name="refresh" :status="refreshStatus" :text="refreshText">
          <slot name="refresh-pull" v-if="refreshStatus === 'pull'" :text="refreshPullText">
            <div class="refresh-area">
              <i class="icon icon-pull"></i>
              <div class="refresh-text">{{refreshPullText}}</div>
            </div>
          </slot>
          <slot name="refresh-drop" v-else-if="refreshStatus === 'drop'" :text="refreshDropText">
            <div class="refresh-area">
              <i class="icon icon-drop"></i>
              <div class="refresh-text">{{refreshDropText}}</div>
            </div>
          </slot>
          <slot
            name="refresh-loading"
            v-else-if="refreshStatus === 'loading'"
            :text="refreshLoadingText"
          >
            <div class="refresh-area">
              <i class="icon icon-loading"></i>
              <div class="refresh-text">{{refreshLoadingText}}</div>
            </div>
          </slot>
          <slot
            name="refresh-success"
            v-else-if="refreshStatus === 'success'"
            :text="refreshMessage"
          >
            <div class="refresh-area">
              <i class="icon icon-success"></i>
              <div class="refresh-text">{{refreshMessage}}</div>
            </div>
          </slot>
          <slot name="refresh-error" v-else-if="refreshStatus === 'error'" :text="refreshError">
            <div class="refresh-area">
              <div class="refresh-text">{{refreshError}}</div>
            </div>
          </slot>
        </slot>
      </div>
    </div>
    <div ref="list">
      <slot/>
    </div>
    <div
      class="loadmore"
      ref="loadmore"
      v-if="loadmoreMethod && !touchmoveDistance"
      @click="loadmore"
    >
      <slot name="loadmore" :status="loadmoreStatus" :text="loadmoreText">
        <slot name="loadmore-loading" v-if="isLoading" :text="loadmoreLoadingText">
          <div class="loadmore-area">
            <i class="icon icon-loading"></i>
            <div class="loadmore-text">{{loadmoreLoadingText}}</div>
          </div>
        </slot>
        <slot name="loadmore-empty" v-else-if="isEmpty && reachEnd" :text="loadmoreEmptyText">
          <div class="loadmore-area">
            <div class="loadmore-text">{{loadmoreEmptyText}}</div>
          </div>
        </slot>
        <slot name="loadmore-end" v-else-if="reachEnd" :text="loadmoreEndText">
          <div class="loadmore-area">
            <div class="loadmore-text">{{loadmoreEndText}}</div>
          </div>
        </slot>
        <slot name="loadmore-error" v-else-if="loadmoreError" :text="loadmoreError">
          <div class="loadmore-area">
            <div class="loadmore-text">{{loadmoreError}}</div>
          </div>
        </slot>
        <slot name="loadmore-ready" v-else :text="loadmoreReadyText">
          <div class="loadmore-area">
            <div class="loadmore-text">{{loadmoreReadyText}}</div>
          </div>
        </slot>
      </slot>
    </div>
  </div>
</template>

<script>
/**
 * @file 数据刷新和加载，包含两个功能：
 * 1. 下拉刷新（refresh）
 * 2. 滚动到底部时加载更多（loadmore）
 *
 * @copyright web1706 2019
 * @author cxy930123 <chen@xingyu1993.cn>
 * @license MIT
 * @see {@link https://github.com/web1706/vue-library/tree/master/components/Loadmore}
 */
export default {
  props: {
    /**
     * 触发下拉刷新时调用的函数。
     * 如果不传，则禁用下拉刷新。
     * 函数可以异步返回，返回时表示刷新成功。
     * 函数执行过程中抛出异常，代表刷新失败。
     * - 如果函数抛出的异常是字符串，则将该字符串作用错误提示文字
     * - 如果函数抛出`Error`对象，则将其`message`属性作用错误提示文字
     */
    refreshMethod: Function,
    /**
     * 下拉多少像素时释放可触发刷新，默认为提示信息的元素高度
     */
    refreshDistance: Number,
    /**
     * 下拉刷新时的文字
     */
    refreshPullText: {
      type: String,
      default: '下拉刷新'
    },
    /**
     * 释放可刷新时的文字
     */
    refreshDropText: {
      type: String,
      default: '释放立即刷新'
    },
    /**
     * 正在刷新时的文字
     */
    refreshLoadingText: {
      type: String,
      default: '正在刷新...'
    },
    /**
     * 刷新成功时的默认提示信息
     */
    refreshSuccessText: {
      type: String,
      default: '刷新成功'
    },
    /**
     * 刷新失败时的默认提示信息
     */
    refreshErrorText: {
      type: String,
      default: '刷新失败'
    },
    /**
     * 触发触底加载更多时调用的函数。
     * 如果不传，则禁用触底加载更多。
     * 函数可以异步返回，返回时表示刷新成功。
     * 函数执行过程中抛出异常，代表刷新失败。
     * - 如果函数抛出的异常是字符串，则将该字符串作用错误提示文字
     * - 如果函数抛出`Error`对象，则将其`message`属性作用错误提示文字
     */
    loadmoreMethod: Function,
    /**
     * 距离底部多少像素时触发加载更多，默认为提示元素的高度
     */
    loadmoreDistance: Number,
    /**
     * 正常情况下显示的文字
     */
    loadmoreReadyText: {
      type: String,
      default: '点击加载更多'
    },
    /**
     * 加载过程中的文字
     */
    loadmoreLoadingText: {
      type: String,
      default: '正在加载...'
    },
    /**
     * 无数据可加载时的文字
     */
    loadmoreEmptyText: {
      type: String,
      default: '没有数据，空空如也'
    },
    /**
     * 加载完所有数据时的文字
     */
    loadmoreEndText: {
      type: String,
      default: '- 再怎么翻都没有了 -'
    },
    /**
     * 加载失败时的默认提示信息
     */
    loadmoreErrorText: {
      type: String,
      default: '加载失败，点击可重试'
    },
    /**
     * 当前是否没有数据
     */
    isEmpty: Boolean,
    /**
     * 是否加载完所有数据
     */
    reachEnd: Boolean,
    /**
     * 初始时是否调用一次加载更多函数
     */
    initialLoad: Boolean
  },

  data() {
    return {
      /**
       * 下拉刷新区域状态
       * - pull
       * - drop
       * - loading
       * - success
       * - error
       */
      refreshStatus: 'pull',
      /**
       * 刷新成功时的提示信息
       */
      refreshMessage: '',
      /**
       * 刷新失败时的错误信息
       */
      refreshError: '',
      /**
       * 刷新成功或失败，用定时器去除提示信息
       */
      refreshTimer: null,
      /**
       * 是否正在加载
       */
      isLoading: false,
      /**
       * 加载失败时的错误信息
       */
      loadmoreError: '',
      /**
       * 滚动元素，组件挂载后查找一次，之后如果发生变化，可以调用`findScrollElement`方法手动更新
       */
      scrollElement: null,
      /**
       * 当前触摸点的Y坐标
       */
      touchsClientY: {},
      /**
       * 当前下拉距离
       */
      touchmoveDistance: 0,
      /**
       * 滚动之前的`scrollTop`
       */
      lastScrollTop: 0,
      /**
       * 是否在`<keep-alive>`组件中处于非激活状态（非激活状态下不处理相关事件）
       */
      inactive: false
    };
  },

  computed: {
    /**
     * 是否有触摸点
     */
    hasTouch() {
      return !!Object.keys(this.touchsClientY).length;
    },

    /**
     * 下拉刷新区域的当前提示信息
     */
    refreshText() {
      switch (this.refreshStatus) {
        case 'pull':
          return this.refreshPullText;
        case 'drop':
          return this.refreshDropText;
        case 'loading':
          return this.refreshLoadingText;
        case 'success':
          return this.refreshMessage;
        case 'error':
          return this.refreshError;
      }
    },

    /**
     * 触底加载区域状态
     * - ready
     * - loading
     * - error
     * - empty
     * - end
     */
    loadmoreStatus() {
      if (this.isLoading) return 'loading';
      if (this.isEmpty && this.reachEnd) return 'empty';
      if (this.reachEnd) return 'end';
      if (this.loadmoreError) return 'error';
      return 'ready';
    },

    /**
     * 触底加载区域的当前提示信息
     */
    loadmoreText() {
      switch (this.loadmoreStatus) {
        case 'loading':
          return this.loadmoreLoadingText;
        case 'empty':
          return this.loadmoreEmptyText;
        case 'end':
          return this.loadmoreEndText;
        case 'error':
          return this.loadmoreError;
        case 'ready':
          return this.loadmoreReadyText;
      }
    }
  },

  watch: {
    /**
     * 滚动元素变动时重新绑定滚动事件
     */
    scrollElement(element, oldElement) {
      if (oldElement) {
        oldElement.removeEventListener('scroll', this.onScroll, false);
      }
      element.addEventListener('scroll', this.onScroll, false);
    },

    /**
     * 下拉：'pull'|'success'|'error'->'drop'
     * 上滑：'drop'|'success'|'error'->'pull'
     * 松开：'drop'->'loading'
     * 加载完成：'loading' -> 'success'|'error'
     * 定时器超时：'success'|'error'->'pull'
     */
    refreshStatus(to, from) {
      if (to === 'success' || to === 'error') {
        // 新增定时器
        this.refreshTimer = setTimeout(() => {
          if (!this.hasTouch && !this.getScrollTop()) {
            this.touchmoveDistance = 0;
          }
          this.refreshTimer = setTimeout(() => {
            this.refreshStatus = 'pull';
          }, 300);
        }, 1000);
      } else if (from === 'success' || from === 'error') {
        // 移除定时器
        clearTimeout(this.refreshTimer);
      }
      if (!this.hasTouch && !this.getScrollTop()) {
        // 调整高度
        if (to === 'pull') {
          this.touchmoveDistance = 0;
        } else {
          this.$nextTick(() => {
            this.touchmoveDistance = this.$refs.refresh.clientHeight;
          });
        }
      }
      this.$emit('refresh-status-change', {
        to,
        from,
        text: this.refreshText
      });
    },

    loadmoreStatus(to, from) {
      this.$emit('loadmore-status-change', {
        to,
        from,
        text: this.loadmoreText
      });
    }
  },

  methods: {
    /**
     * 查找滚动元素，并赋值给`this.scrollElement`。
     * 从当前组件元素一直往上寻找，直到找到`overflow`为`auto`或`scroll`的元素。
     * 如果没找到，则将`this.scrollElement`设置为`window`。
     * @returns 找到的滚动元素
     */
    findScrollElement() {
      for (
        let currentElement = this.$el;
        currentElement;
        currentElement = currentElement.parentElement
      ) {
        const overflowY = getComputedStyle(currentElement).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return (this.scrollElement = currentElement);
        }
      }
      return (this.scrollElement = window);
    },

    getClientHeight() {
      return this.scrollElement === window
        ? window.innerHeight
        : this.scrollElement.clientHeight;
    },

    getScrollHeight() {
      return this.scrollElement === window
        ? document.documentElement.scrollHeight
        : this.scrollElement.scrollHeight;
    },

    getScrollTop() {
      return this.scrollElement === window
        ? window.pageYOffset
        : this.scrollElement.scrollTop;
    },

    /**
     * 尝试触发刷新
     */
    async refresh() {
      if (typeof this.refreshMethod !== 'function') return;
      if (this.refreshStatus === 'loading') return;
      try {
        this.refreshError = '';
        this.loadmoreError = '';
        this.refreshStatus = 'loading';
        const message = await this.refreshMethod();
        if (typeof message === 'string') {
          this.refreshMessage = message;
        } else {
          this.refreshMessage = this.refreshSuccessText;
        }
        this.refreshStatus = 'success';
      } catch (err) {
        if (err instanceof Error) {
          err = err.message;
        }
        if (!err || typeof err !== 'string') {
          err = this.refreshErrorText;
        }
        this.refreshError = err;
        this.refreshStatus = 'error';
      }
    },

    /**
     * 尝试触发加载更多
     */
    async loadmore() {
      if (typeof this.loadmoreMethod !== 'function') return;
      if (this.isLoading || this.reachEnd) return;
      try {
        this.refreshError = '';
        this.loadmoreError = '';
        this.isLoading = true;
        await this.loadmoreMethod();
      } catch (err) {
        if (err instanceof Error) {
          err = err.message;
        }
        if (!err || typeof err !== 'string') {
          err = this.loadmoreErrorText;
        }
        this.loadmoreError = err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 滚动时的回调，滚动到底部时将调用`loadmore`加载更多数据
     */
    onScroll() {
      if (this.inactive) return;
      if (typeof this.loadmoreMethod !== 'function') return;
      if (this.isLoading || this.reachEnd || this.loadmoreError) return;
      const clientHeight = this.getClientHeight();
      const scrollTop = this.getScrollTop();
      const scrollHeight = this.getScrollHeight();
      const loadmoreDistance =
        typeof this.loadmoreDistance === 'number'
          ? this.loadmoreDistance
          : this.$refs.loadmore.clientHeight;
      if (scrollTop + clientHeight + loadmoreDistance >= scrollHeight) {
        this.loadmore();
      }
    },

    onTouchStart(event) {
      if (this.inactive) return;
      if (typeof this.refreshMethod !== 'function') return;
      // 添加触摸点坐标
      for (const touch of event.changedTouches) {
        this.$set(this.touchsClientY, touch.identifier, touch.clientY);
      }
      // 更新滚动位置
      this.lastScrollTop = this.getScrollTop();
    },

    onTouchMove(event) {
      if (this.inactive) return;
      if (typeof this.refreshMethod !== 'function') return;
      if (this.getScrollTop() > 0) return;
      if (this.isLoading) return;
      // 计算本次触点移动的距离
      let distance = 0;
      for (const touch of event.changedTouches) {
        distance += touch.clientY - this.touchsClientY[touch.identifier];
        this.$set(this.touchsClientY, touch.identifier, touch.clientY);
      }
      distance /= event.changedTouches.length;
      // 计算下拉距离
      if (this.lastScrollTop < distance) {
        // 向下滑动到滚动临界点
        distance -= this.lastScrollTop;
      } else if (this.touchmoveDistance < -distance) {
        // 向上滑动到滚动临界点
        distance = -this.touchmoveDistance;
      }
      // 下拉时滑动减速
      if (distance > 0) {
        // (1 - 当前下拉距离 / 最大可下拉距离) ^ 阻力
        distance *= (1 - this.touchmoveDistance / innerHeight) ** 2;
      }
      this.touchmoveDistance += distance;
      // 向上滑动且没有到临界点
      if (distance < 0 && this.touchmoveDistance > 0) {
        event.preventDefault();
      }
      // 更新当前滚动位置
      this.lastScrollTop = this.getScrollTop();
      // 计算下拉状态
      if (this.refreshStatus !== 'loading') {
        // 下拉刷新和释放刷新状态的临界距离
        const refreshDistance =
          typeof this.refreshDistance === 'number'
            ? this.loadmoreDistance
            : this.$refs.refresh.clientHeight;
        if (distance > 0 && this.touchmoveDistance >= refreshDistance) {
          // 向下滑动到临界距离
          this.refreshStatus = 'drop';
        } else if (distance < 0 && this.touchmoveDistance <= refreshDistance) {
          // 向上滑动到临界距离
          this.refreshStatus = 'pull';
        }
      }
    },

    onTouchEnd(event) {
      if (this.inactive) return;
      if (typeof this.refreshMethod !== 'function') return;
      // 移除触摸点坐标
      for (const touch of event.changedTouches) {
        this.$delete(this.touchsClientY, touch.identifier);
      }
      // 无触摸点时开始刷新
      if (Object.keys(this.touchsClientY).length === 0) {
        switch (this.refreshStatus) {
          case 'pull':
            this.touchmoveDistance = 0;
            break;
          case 'drop':
            this.refresh();
            break;
          case 'loading':
          case 'success':
          case 'error':
            if (!this.getScrollTop()) {
              this.touchmoveDistance = this.$refs.refresh.clientHeight;
            }
            break;
        }
      }
    }
  },

  mounted() {
    // 查找滚动元素
    this.findScrollElement();
    // 绑定下拉相关事件
    this.$refs.list.addEventListener('touchstart', this.onTouchStart, false);
    this.$refs.list.addEventListener('touchmove', this.onTouchMove, false);
    this.$refs.list.addEventListener('touchend', this.onTouchEnd, false);
    // 初始加载
    if (this.initialLoad) {
      this.loadmore();
    }
  },

  destroyed() {
    // 释放内存
    this.scrollElement.removeEventListener('scroll', this.onScroll, false);
    this.$refs.list.removeEventListener('touchstart', this.onTouchStart, false);
    this.$refs.list.removeEventListener('touchmove', this.onTouchMove, false);
    this.$refs.list.removeEventListener('touchend', this.onTouchEnd, false);
  },

  activated() {
    this.inactive = false;
  },

  deactivated() {
    this.inactive = true;
  }
};
</script>

<style lang="postcss" scoped>
.refresh {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.refresh.transition {
  transition: height 0.3s ease-out;
}

.refresh-area,
.loadmore-area {
  min-height: 3em;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  display: block;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin-right: 5px;
}

.icon-pull,
.icon-drop {
  width: 1em;
  height: 1em;
  background-image: url("data:image/svg+xml,<svg viewBox='0 0 1024 1024' fill='%23666' xmlns='http://www.w3.org/2000/svg' width='48' height='48'><path d='M845.631078 611.970876l-12.565177-12.68388c-2.532683-2.558265-5.987365-3.994987-9.586332-3.994987s-7.054673 1.436722-9.585309 3.994987L533.597389 881.823883l0-805.853631c0-7.593955-6.118348-13.580297-13.660114-13.580297l-15.875572 0c-7.661494 0-13.661138 6.065136-13.661138 13.580297l0 805.851585-280.295847-282.534841c-5.062296-5.116531-14.108323-5.116531-19.170618 0l-12.5662 12.68388c-5.221932 5.27412-5.221932 13.752212 0 19.015076l324.046281 326.628082c2.532683 2.558265 5.987365 3.994987 9.586332 3.994987s7.054673-1.436722 9.585309-3.994987l324.045257-326.628082C850.85301 625.724111 850.85301 617.246019 845.631078 611.970876z'></path></svg>");
}

.icon-drop {
  transform: rotate(180deg);
}

.icon-loading {
  width: 1.5em;
  height: 1.5em;
  animation: loading 1s steps(12, end) infinite;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 100 100'><rect width='7' height='20' x='46.5' y='40' fill='%23E9E9E9' rx='5' ry='5' transform='translate(0 -30)'/><rect width='7' height='20' x='46.5' y='40' fill='%23989697' rx='5' ry='5' transform='rotate(30 105.98 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%239B999A' rx='5' ry='5' transform='rotate(60 75.98 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23A3A1A2' rx='5' ry='5' transform='rotate(90 65 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23ABA9AA' rx='5' ry='5' transform='rotate(120 58.66 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23B2B2B2' rx='5' ry='5' transform='rotate(150 54.02 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23BAB8B9' rx='5' ry='5' transform='rotate(180 50 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23C2C0C1' rx='5' ry='5' transform='rotate(-150 45.98 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23CBCBCB' rx='5' ry='5' transform='rotate(-120 41.34 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23D2D2D2' rx='5' ry='5' transform='rotate(-90 35 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23DADADA' rx='5' ry='5' transform='rotate(-60 24.02 65)'/><rect width='7' height='20' x='46.5' y='40' fill='%23E2E2E2' rx='5' ry='5' transform='rotate(-30 -5.98 65)'/></svg>");
}

.icon-success {
  width: 1.2em;
  height: 1.2em;
  background-image: url("data:image/svg+xml,<svg viewBox='0 0 1024 1024' fill='%23666' xmlns='http://www.w3.org/2000/svg' width='48' height='48'><path d='M508.248559 953.897386c-60.0824 0-118.381178-11.772115-173.275415-34.991956-53.009308-22.420639-100.612489-54.513568-141.484361-95.385441-40.872896-40.872896-72.964802-88.475054-95.386464-141.485384-23.218818-54.894238-34.990932-113.193015-34.990933-173.275416s11.773138-118.381178 34.990933-173.275415c22.421662-53.009308 54.513568-100.612489 95.386464-141.484362 40.871873-40.872896 88.475054-72.964802 141.484361-95.386464 54.895261-23.218818 113.194038-34.990932 173.275415-34.990932 60.0824 0 118.380154 11.773138 173.275416 34.990932 53.009308 22.421662 100.611465 54.513568 141.484361 95.386464 40.871873 40.871873 72.964802 88.475054 95.385441 141.484362 23.218818 54.895261 34.991955 113.194038 34.991955 173.275415s-11.773138 118.381178-34.991955 173.275416c-22.420639 53.010331-54.513568 100.612489-95.385441 141.485384-40.872896 40.871873-88.475054 72.964802-141.484361 95.385441-54.895261 23.218818-113.193015 34.991955-173.275416 34.991956z m0-839.844794c-217.641879 0-394.706597 177.064718-394.706596 394.706597 0 217.642902 177.064718 394.706597 394.706596 394.706597s394.705574-177.063695 394.705574-394.706597c0.001023-217.641879-177.063695-394.706597-394.705574-394.706597z'></path><path d='M448.493617 738.906893a25.485441 25.485441 0 0 1-16.624632-6.148024L250.937193 577.889663c-10.733459-9.188266-11.987009-25.337061-2.799766-36.07052 9.188266-10.732435 25.337061-11.988032 36.071543-2.798743l161.571863 138.297786L718.296483 361.414353c9.228175-10.69969 25.384134-11.890818 36.081777-2.660596 10.697643 9.229199 11.888771 25.38311 2.660596 36.081777L467.87606 730.034828c-5.058203 5.863545-12.199856 8.872065-19.382443 8.872065z'></path></svg>");
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

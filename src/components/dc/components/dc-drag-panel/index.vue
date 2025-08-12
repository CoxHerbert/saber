<template>
  <!-- 水平左右拖拽-->
  <div
    class="comp-drag-panel"
    :style="{
      height: boxHeight,
    }"
  >
    <div
      ref="left"
      class="left-panel"
      :style="{
        width: leftWidth + 'px',
      }"
    >
      <slot name="left"></slot>
    </div>
    <div
      ref="right"
      class="right-panel"
      :style="{
        width: `calc(100% - ${leftWidth}px)`,
      }"
    >
      <span @mousedown="handleMouseDown" class="split"></span>
      <slot name="right"></slot>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue';

const props = defineProps({
  /** 盒子高度 */
  height: {
    type: [String, Number],
    default() {
      return 0;
    },
  },
  /**
   * 左侧初始高度
   */
  leftInitWidth: {
    type: [String, Number],
    default() {
      return 180;
    },
  },
});

// left dom元素
const left = ref(null);
// right dom元素
const right = ref(null);
// 左侧宽度
const leftWidth = ref('auto');
// 鼠标按下左键标记x位置
const initClientX = ref(0);
// 拖拽偏移量
const offsetX = ref(0);
// 鼠标按下时记录当时左侧宽度
const initWidth = ref(0);

// 盒子高度
const boxHeight = computed(() => {
  return props.height === 'auto' ? props.height : `${props.height}px`;
});

onMounted(() => {
  leftWidth.value = props.leftInitWidth;
});

const moveCallback = event => {
  offsetX.value = event.clientX - initClientX.value;
  leftWidth.value = initWidth.value + parseInt(offsetX.value, 10);
};
// 添加事件
const addWindowEvent = () => {
  document.body.classList.add('no-select');
  window.addEventListener('mousemove', moveCallback);
  window.addEventListener('mouseup', removeWindowEvent);
};
// 销毁事件绑定
const removeWindowEvent = () => {
  window.removeEventListener('mousemove', moveCallback);
  window.removeEventListener('mouseup', removeWindowEvent);
  document.body.classList.remove('no-select');
};
// 鼠标按下
const handleMouseDown = event => {
  initClientX.value = event.clientX;
  initWidth.value = left.value.offsetWidth;
  addWindowEvent();
};
</script>

<style lang="scss" scoped>
.comp-drag-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  .split {
    position: absolute;
    width: 8px;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 10;
    border-left: 1px solid #dadbe0;
  }

  .left-panel {
    height: 100%;
    box-sizing: border-box;
    padding-right: 10px;
  }

  .right-panel {
    position: relative;
    height: 100%;
    flex: 1;
  }

  .split {
    cursor: ew-resize;
  }
}
</style>

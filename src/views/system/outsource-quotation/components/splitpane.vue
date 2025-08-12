<template>
  <div class="split-pane-container" ref="container">
    <div class="split-pane" :class="{ vertical: direction === 'vertical' }">
      <!-- 左侧面板 -->
      <div class="pane left" :style="leftStyle">
        <slot name="left"></slot>
      </div>

      <!-- 分隔线 -->
      <div
        class="divider"
        ref="divider"
        @mousedown="startResize"
        @touchstart="startResize"
        :style="{
          cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
          width: direction === 'horizontal' ? `${dividerSize}px` : '100%',
          height: direction === 'vertical' ? `${dividerSize}px` : '100%',
        }"
      ></div>

      <!-- 右侧面板 -->
      <div class="pane right" :style="rightStyle">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';

const props = defineProps({
  // 初始分割比例 (0-1)
  initialRatio: {
    type: Number,
    default: 0.5,
  },
  // 最小左侧宽度/高度比例
  minLeftRatio: {
    type: Number,
    default: 0.2,
  },
  // 最大左侧宽度/高度比例
  maxLeftRatio: {
    type: Number,
    default: 0.7,
  },
  // 分隔线方向: horizontal(左右) 或 vertical(上下)
  direction: {
    type: String,
    default: 'horizontal',
    validator: value => ['horizontal', 'vertical'].includes(value),
  },
  // 分隔线宽度
  dividerSize: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(['resize']);

const container = ref(null);
const divider = ref(null);
const isResizing = ref(false);
let animationFrameId = null;

// 响应式状态
const state = reactive({
  leftRatio: props.initialRatio,
  containerWidth: 0,
  containerHeight: 0,
  dragStartPosition: 0,
  dragStartRatio: 0,
});

// 计算样式 - 使用transform提高性能
const leftStyle = computed(() => {
  if (props.direction === 'horizontal') {
    return {
      width: `calc(${state.leftRatio * 100}% - ${props.dividerSize / 2}px)`,
      height: '100%',
      // 使用will-change提示浏览器优化
      willChange: 'width',
    };
  } else {
    return {
      height: `calc(${state.leftRatio * 100}% - ${props.dividerSize / 2}px)`,
      width: '100%',
      willChange: 'height',
    };
  }
});

const rightStyle = computed(() => {
  if (props.direction === 'horizontal') {
    return {
      width: `calc(${(1 - state.leftRatio) * 100}% - ${props.dividerSize / 2}px)`,
      height: '100%',
      willChange: 'width',
    };
  } else {
    return {
      height: `calc(${(1 - state.leftRatio) * 100}% - ${props.dividerSize / 2}px)`,
      width: '100%',
      willChange: 'height',
    };
  }
});

// 开始拖动
const startResize = e => {
  e.preventDefault();
  isResizing.value = true;

  const containerRect = container.value.getBoundingClientRect();

  // 存储拖动开始位置和比例
  if (props.direction === 'horizontal') {
    state.dragStartPosition = e.clientX || e.touches[0].clientX;
  } else {
    state.dragStartPosition = e.clientY || e.touches[0].clientY;
  }

  state.dragStartRatio = state.leftRatio;

  // 添加全局事件监听器
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('touchmove', handleMouseMove);
  window.addEventListener('touchend', handleMouseUp);

  // 优化页面滚动行为
  document.body.style.overflow = 'hidden';
};

// 拖动处理 - 使用requestAnimationFrame提高性能
const handleMouseMove = e => {
  if (!isResizing.value) return;

  // 取消之前的动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // 使用requestAnimationFrame优化性能
  animationFrameId = requestAnimationFrame(() => {
    const containerRect = container.value.getBoundingClientRect();
    let currentPosition, delta, newRatio;

    if (props.direction === 'horizontal') {
      currentPosition = e.clientX || e.touches[0].clientX;
      delta = currentPosition - state.dragStartPosition;
      newRatio = state.dragStartRatio + delta / containerRect.width;
    } else {
      currentPosition = e.clientY || e.touches[0].clientY;
      delta = currentPosition - state.dragStartPosition;
      newRatio = state.dragStartRatio + delta / containerRect.height;
    }

    // 限制在最小和最大比例之间
    state.leftRatio = Math.max(props.minLeftRatio, Math.min(props.maxLeftRatio, newRatio));

    emit('resize', state.leftRatio);
  });
};

// 结束拖动
const handleMouseUp = () => {
  if (!isResizing.value) return;

  isResizing.value = false;

  // 清理事件监听器
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('touchmove', handleMouseMove);
  window.removeEventListener('touchend', handleMouseUp);

  // 重置页面滚动
  document.body.style.overflow = '';

  // 取消未执行的动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

onMounted(() => {
  // 初始化容器尺寸
  nextTick(() => {
    updateContainerSize();

    // 监听窗口大小变化
    window.addEventListener('resize', updateContainerSize);
  });
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', updateContainerSize);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('touchmove', handleMouseMove);
  window.removeEventListener('touchend', handleMouseUp);

  // 取消未执行的动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// 更新容器尺寸
const updateContainerSize = () => {
  if (!container.value) return;

  const rect = container.value.getBoundingClientRect();
  state.containerWidth = rect.width;
  state.containerHeight = rect.height;
};

// 监听props变化
watch(
  () => props.initialRatio,
  newRatio => {
    state.leftRatio = Math.max(props.minLeftRatio, Math.min(props.maxLeftRatio, newRatio));
  }
);
</script>

<style scoped>
.split-pane-container {
  width: 100%;
  height: calc(100vh - 100px);
  min-width: 0; /* 允许容器收缩 */
  min-height: 0; /* 允许容器收缩 */
}

.split-pane {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.split-pane.vertical {
  flex-direction: column;
}

.pane {
  overflow: auto; /* 内容超出时显示滚动条 */
  min-width: 0; /* 允许面板收缩 */
  min-height: 0; /* 允许面板收缩 */
  transition: none; /* 移除过渡动画，使用即时更新 */
}

.divider {
  background-color: #e4e7ed;
  z-index: 10;
  transition: background-color 0.2s;
  user-select: none;
  /* 添加transform优化 */
  will-change: transform;
}

.divider:hover {
  background-color: #dcdfe6;
}

.divider:active {
  background-color: #c0c4cc;
}

/* 为Element UI组件添加样式调整 */
.pane .el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  box-shadow: none;
}

.pane .el-card__body {
  flex: 1;
  overflow: auto; /* 确保卡片内容超出时显示滚动条 */
}
</style>

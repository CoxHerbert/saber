<template>
  <div class="table">
    <!-- 表头保持不动 -->
    <div class="table-header">
      <div
        class="table-column"
        v-for="(column, i) in columns"
        :key="i"
        :class="column.align"
        :style="column.width ? { width: column.width } : { flex: 1 }"
      >
        <span class="cell">{{ column.label }}</span>
      </div>
    </div>

    <!-- 滚动容器 -->
    <div
      class="scroll-wrap"
      ref="scrollContainer"
      @mouseenter="stopScroll"
      @mouseleave="startScroll"
    >
      <!-- 第一份列表 -->
      <div class="scroll-content" ref="scrollContent">
        <div class="table__row" v-for="(item, idx) in tableData" :key="'a-' + idx">
          <div
            class="table-column"
            v-for="(column, j) in columns"
            :key="j"
            :class="column.align"
            :style="column.width ? { width: column.width } : { flex: 1 }"
          >
            <span class="cell">{{ item[column.prop] }}</span>
          </div>
        </div>
      </div>
      <!-- 第二份列表，和第一份一模一样 -->
      <div class="scroll-content">
        <div class="table__row" v-for="(item, idx) in tableData" :key="'b-' + idx">
          <div
            class="table-column"
            v-for="(column, j) in columns"
            :key="j"
            :class="column.align"
            :style="column.width ? { width: column.width } : { flex: 1 }"
          >
            <span class="cell">{{ item[column.prop] }}</span>
          </div>
        </div>
      </div>
      <!-- 如果没有数据，显示提示 -->
      <div v-if="tableData.length === 0" class="empty-tip">暂无数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  tableData: {
    type: Array,
    default: () => [],
  },
});

const scrollContainer = ref(null);
const scrollContent = ref(null);
let timer = null;

// 每次滚动的像素步长
const STEP = 1; // 可调：步长越大滚越快
// 定时器间隔(ms)
const INTERVAL = 80; // 可调：间隔越小滚越平滑

function startScroll() {
  if (timer || !scrollContainer.value || !scrollContent.value) return;
  timer = setInterval(() => {
    const cont = scrollContainer.value;
    const singleHeight = scrollContent.value.offsetHeight;
    // 如果已经滚过了第一份列表的高度，就回到起点
    if (cont.scrollTop >= singleHeight) {
      cont.scrollTop -= singleHeight;
    } else {
      cont.scrollTop += STEP;
    }
  }, INTERVAL);
}

function stopScroll() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(() => {
  // 等 DOM 完全渲染后再启动滚动
  nextTick(() => {
    startScroll();
  });
});

onBeforeUnmount(() => {
  stopScroll();
});
</script>

<style scoped lang="scss">
.table {
  width: 100%;
  height: 100%;
  color: #000;

  .table-header {
    display: flex;
    width: 100%;
    height: 36px;
    background: #f7f6f5;
    font-size: 12px;
    font-weight: 600;
  }

  .scroll-wrap {
    position: relative;
    width: 100%;
    height: 300px; /* 根据需要调节 */
    overflow: hidden;
    font-size: 12px;
    background: #fff;

    .scroll-content {
      /* 两份内容自然排列 */
    }

    .table__row {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 36px;
      border-bottom: 1px solid #ebeef5;
    }

    .empty-tip {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #999;
      font-size: 14px;
    }
  }

  .table-column {
    display: flex;
    align-items: center;
    height: 100%;
    overflow: hidden;
    word-break: break-all;

    &.left {
      justify-content: flex-start;
    }
    &.center {
      justify-content: center;
    }
    &.right {
      justify-content: flex-end;
    }

    .cell {
    }
  }
}
</style>

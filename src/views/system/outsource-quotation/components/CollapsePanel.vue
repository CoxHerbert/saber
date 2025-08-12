<template>
  <div class="collapse-panel">
    <!-- 标题区域，点击触发折叠 -->
    <div class="panel-header" @click="toggleCollapse">
      <!-- 标题内容 -->
      <div class="panel-title-wrapper">
        <slot name="title">默认标题</slot>
        <!-- 箭头图标，根据折叠状态旋转 -->
        <el-icon
          class="arrow"
          :style="{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }"
        >
          <CaretTop />
        </el-icon>
      </div>
    </div>
    <!-- 内容区域，使用过渡动画 -->
    <transition name="collapse-fade">
      <div class="panel-content" v-show="!isCollapsed">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';

// 是否折叠（默认收起）
const isCollapsed = ref(false);

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 暴露状态，允许父组件控制
defineExpose({
  isCollapsed,
  toggleCollapse,
});
</script>

<style scoped>
.collapse-panel {
  /* border: 1px solid #ebeef5; */
  border-radius: 4px;
  /* margin: 10px 0; */
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  /* padding: 12px 16px; */
  cursor: pointer;
  /* border-bottom: 1px solid #ebeef5; */
}

.panel-title-wrapper {
  display: flex;
  align-items: center;
  font-weight: bold;
  box-sizing: border-box;
  padding-left: 4px;
  border-left: 3px solid #f78431;
  line-height: 16px;
  font-size: 16px;
  margin: 10px 0;
  gap: 8px; /* 标题与箭头间距 */
}

.arrow {
  font-size: 16px;
  transition: transform 0.2s;
  color: #0f0f0f; /* 箭头颜色 */
}

.panel-content {
  padding: 0 10px;
  background-color: #fff;
}

/* 折叠动画 */
.collapse-fade-enter-active,
.collapse-fade-leave-active {
  /* transition: height 0.2s, opacity 0.3s; */
  overflow: hidden;
}

.collapse-fade-enter-from,
.collapse-fade-leave-to {
  height: 0;
  opacity: 0;
}

.collapse-fade-enter-to,
.collapse-fade-leave-from {
  height: auto;
  opacity: 1;
}
</style>

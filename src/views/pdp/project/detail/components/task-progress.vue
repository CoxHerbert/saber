<template>
  <div class="circular-progress-container">
    <div class="chart-box">
      <svg class="svg-task-progress" :width="size" :height="size" viewBox="0 0 100 100">
        <!-- 背景圆环（270°范围） -->
        <path
          v-for="(item, index) in items"
          :key="index"
          :d="getArcPath(index, 100)"
          fill="none"
          stroke="#EFF1F7"
          :stroke-width="strokeWidth / 2"
          stroke-linecap="round"
        />

        <!-- 进度圆环（动态270°范围） -->
        <path
          v-for="(item, index) in items"
          :key="'progress-' + index"
          :d="getArcPath(index, item.progress)"
          fill="none"
          :stroke="item.color || defaultColors[index % 5]"
          :stroke-width="strokeWidth / 2"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="legend">
      <div v-for="(item, index) in items" :key="index" class="legend-item">
        <span
          class="icon"
          :style="{
            backgroundColor: item.color,
          }"
        ></span>
        <span v-if="item.name" class="label">{{ item.name }}</span>
        <span class="value">{{ item.progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: value =>
      value.every(
        item => typeof item.progress === 'number' && item.progress >= 0 && item.progress <= 100
      ),
  },
  size: {
    type: Number,
    default: 200,
  },
  strokeWidth: {
    type: Number,
    default: 8,
  },
  spacing: {
    type: Number,
    default: 6, // 基准间距单位
  },
});

const defaultColors = ['#4CAF50', '#2196F3', '#FFC107', '#FF5252', '#9C27B0'];

// 均匀间距半径计算（核心算法）
const getRadius = index => {
  const totalLayers = props.items.length;
  const maxRadius = 45;
  const minRadius = 15;

  // 计算可用空间（扣除所有间距和线条宽度）
  const totalSpace = maxRadius - minRadius;
  const totalGaps = (totalLayers - 1) * props.spacing;
  const totalStrokeWidth = totalLayers * (props.strokeWidth / 2);
  const availableSpace = totalSpace - totalGaps - totalStrokeWidth;

  // 每层基础半径增量
  const layerIncrement = availableSpace / totalLayers;

  // 从外向内计算半径
  return maxRadius - index * (layerIncrement + props.spacing + props.strokeWidth / 2);
};

// 弧形路径生成（保持270°范围）
const getArcPath = (index, progress) => {
  const radius = getRadius(index);
  const startAngle = 90;
  const endAngle = startAngle - (270 * Math.min(100, Math.max(0, progress))) / 100;

  const toCartesian = angle => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  };

  const start = toCartesian(startAngle);
  const end = toCartesian(endAngle);
  const largeArcFlag = progress > 50 ? 1 : 0;

  return `M ${start.x} ${start.y}
          A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};
</script>

<style lang="scss">
.circular-progress-container {
  display: inline-block;
  line-height: 0;
  padding-top: 28px;
  padding-left: 20px;
  min-width: 450px;

  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  .legend {
    flex: 1;
    display: inline-flex;
    flex-flow: column nowrap;
    margin-left: 60px;
  }
  .legend-item {
    width: 100%;
    display: block;
    height: 20px;
    line-height: 20px;
    margin-bottom: 6px;
    .icon {
      display: inline-block;
      width: 24px;
      height: 12px;
      border-radius: 12px;
      margin-right: 8px;
    }
    .label {
      display: inline-block;
      text-align: left;
      min-width: 80px;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
      line-height: 14px;
      text-align: center;
      font-style: normal;
      text-transform: none;
    }
    .value {
      margin-left: 8px;
      font-weight: 500;
      font-size: 14px;
      color: #333333;
      line-height: 14px;
      text-align: center;
      font-style: normal;
      text-transform: none;
    }
  }

  .svg-task-progress {
    width: 164px;
    height: 164px;
    transform: rotate(-90deg);
    transform-origin: center;
  }
}
</style>

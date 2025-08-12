<template>
  <div :style="{ width: size + 'px', height: size + 'px' }" class="progress-circle">
    <svg :width="size" :height="size" viewBox="0 0 100 100">
      <circle class="background" cx="50" cy="50" r="45" stroke-width="8" fill="none" />
      <circle
        class="progress"
        cx="50"
        cy="50"
        r="45"
        stroke-width="8"
        :stroke="color"
        fill="none"
        stroke-dasharray="282"
        :stroke-dashoffset="282 - (computedProgress / 100) * 282"
        style="transition: stroke-dashoffset 0.6s"
      />
    </svg>
    <div class="text" :style="{ fontSize: size / 5 + 'px' }">{{ text }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  progress: Number,
  color: String,
  size: Number,
  text: String,
  duration: Number,
});

// ✅ 设置默认值
const defaultProgress = 50;
const defaultColor = 'red';
const defaultSize = 120;
const defaultDuration = 500;
const defaultText = '50%';

const computedProgress = ref(0);
const color = ref(props.color ?? defaultColor);
const size = ref(props.size ?? defaultSize);
const text = ref(props.text ?? defaultText);

onMounted(() => {
  setTimeout(() => {
    computedProgress.value = props.progress ?? defaultProgress;
  }, props.duration ?? defaultDuration);
});
</script>

<style scoped>
.progress-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

svg {
  transform: rotate(-90deg);
}

circle.background {
  stroke: #eee;
}

circle.progress {
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease;
}

.text {
  position: absolute;
  font-weight: bold;
}
</style>

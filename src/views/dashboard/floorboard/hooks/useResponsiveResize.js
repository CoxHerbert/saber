// hooks/useResponsiveResize.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useResponsiveResize(designWidth = 1920, designHeight = 1080) {
  const scale = ref(1);

  const calculateScale = () => {
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;
    const widthScale = clientWidth / designWidth;
    const heightScale = clientHeight / designHeight;
    scale.value = Math.min(widthScale, heightScale);
  };

  const handleResize = () => {
    calculateScale();
  };

  // 自动启动监听
  onMounted(() => {
    calculateScale(); // 初始化时计算一次
    window.addEventListener('resize', handleResize);
  });

  // 自动停止监听
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    scale,
  };
}

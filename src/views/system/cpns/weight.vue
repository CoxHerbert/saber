<template>
  <div class="weight-wrap">
    <div class="item-group">
      选择称：<el-radio-group v-model="radio">
        <el-radio value="01">地磅</el-radio>
        <el-radio value="02">台称</el-radio>
      </el-radio-group>
    </div>
    <div class="item-group">
      重量值：
      <div class="item-value">
        {{ currentWeight?.weight || '-' }}{{ currentWeight?.unit || '-' }}
      </div>
    </div>
    <div class="item-group">
      当前物料：
      <div
        class="item-value"
        :class="{
          placeholder: !currentRow?.materialNumber,
        }"
      >
        {{ currentRow?.materialNumber || '请点击某一行' }}{{ index }}
      </div>
    </div>
    <el-button
      type="primary"
      size="small"
      @click="confirm"
      :disabled="!currentWeight || !currentRow"
      >确认</el-button
    >
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { io } from 'socket.io-client';

const emit = defineEmits(['confirm']);

const props = defineProps({
  index: {
    type: [null, Number],
    default: null,
  },
  list: {
    type: Object,
    default() {
      return [];
    },
  },
});
let socket = null;
let timeLast = Date.now();
const radio = ref('02');
const currentWeight = ref(null);

const currentRow = computed(() => {
  return props?.list[props?.index] ? props?.list[props?.index] : '';
});

onMounted(() => {
  initWebSocket().then(data => {});
});
onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('socket 已断开');
  }
});

function initWebSocket() {
  return new Promise((resolve, reject) => {
    // socket = io(`${import.meta.env.VITE_WEIGHT}`, {
    socket = io('/weight', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('连接成功');
      socket.emit('message', '前端连接成功');
    });

    socket.on('weightChange', data => {
      const weightData = JSON.parse(data);
      if (
        currentWeight.value?.weight === weightData?.weight &&
        currentWeight.value?.unit === weightData?.unit &&
        currentWeight.value?.eqId === weightData?.eqId
      ) {
        return undefined;
      } else if (weightData?.eqId === radio.value) {
        console.log('前端收到重量数据:', weightData);
        currentWeight.value = weightData;
      }
    });
  });
}
const confirm = () => {
  emit('confirm', currentWeight.value);
};
</script>
<style lang="scss" scoped>
.weight-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  .item-group {
    // border-right: 1px solid #ccc;
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    color: #333;
    :deep(.el-radio-group) {
      .el-radio {
        margin-right: 8px;
      }
    }
    .item-value {
      font-weight: 600;
      color: #000;
      &.placeholder {
        color: #ccc;
      }
    }
  }
}
</style>

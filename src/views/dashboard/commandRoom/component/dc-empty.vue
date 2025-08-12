<template>
  <div class="empty-info">
    <img
      v-if="type === 'data'"
      class="empty-img"
      alt="empty"
      src="~@/styles/img/empty/empty-data-runningParam.png"
    />

    <img
      v-if="type === 'img'"
      class="empty-img"
      alt="empty"
      src="~@/styles/img/empty/empty-img.png"
    />
    <div class="description">{{ description }}</div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  data() {
    return {};
  },
  props: {
    type: {
      type: String,
      default: 'data',
    },
    description: {
      type: String,
      default: '暂无数据',
    },
  },
};
</script>

<style scoped lang="scss">
.empty-info {
  display: flex;
  width: 100%;
  height: 100%;
  transform-origin: center center;
  transform: scale(0.6, 0.6);
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  align-content: center;

  .empty-img {
    opacity: 1;
  }

  .description {
    margin-top: 20px;
    font-size: 17px;
    opacity: 0.5;
    text-align: center;
  }
}
</style>

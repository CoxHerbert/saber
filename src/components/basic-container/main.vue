<template>
  <div class="basic-container" :style="styleName" :class="{ 'basic-container--block': block }">
    <el-card class="basic-container__card">
      <slot></slot>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'basicContainer',
  props: {
    radius: {
      type: [String, Number],
      default: 10,
    },
    background: {
      type: String,
    },
    block: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    styleName() {
      return {
        borderRadius: `${this.radius}px`,
        background: this.background,
      };
    },
  },
};
</script>

<style lang="scss">
.basic-container {
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  &__card {
    height: 100%;
    .el-card__body {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: auto;
      height: 100%;
      padding-top: 6px;
    }
  }
  &--block {
    height: 100%;

    .basic-container__card {
      height: 100%;
    }
  }

  &__card {
    width: 100%;
  }

  &:first-child {
    padding-top: 0;
  }
}
</style>

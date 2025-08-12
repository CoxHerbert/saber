<template>
  <div class="comp-dc-steps">
    <div
      v-for="(step, index) in options"
      :key="index"
      class="step-item"
      :class="{
        actived: props.activeIndex > index,
        active: props.activeIndex == index,
        normal: props.activeIndex < index,
      }"
    >
      <div class="icon-box">
        <span class="icon"></span>
      </div>
      <span class="right-info">
        <span
          class="right-info-top"
          :class="{
            fix: !step[nameKey],
          }"
        >
          <span class="label">{{ step[props.labelKey] }}</span>
          <span v-if="step[nameKey]" class="name">
            <template v-if="nameType === 'realName'">({{ step[nameKey] }})</template>
            <template v-else>(<dc-view objectName="user" v-model="step[nameKey]" />)</template>
          </span>
        </span>
        <span v-if="step[nameKey]" class="right-info-bottom">
          {{ step[timeKey] || '-' }}
        </span>
      </span>
    </div>
  </div>
</template>
<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  // 渲染数据
  options: {
    type: Array,
    default() {
      return [];
    },
    required: true,
  },
  // 当前步骤
  activeIndex: {
    type: Number,
    default() {
      return 0;
    },
  },
  // label渲染字段
  labelKey: {
    type: String,
    default() {
      return 'label';
    },
  },
  // 名字渲染字段
  nameKey: {
    type: String,
    default() {
      return 'realName';
    },
  },
  nameType: {
    type: String,
    default() {
      return 'string';
    },
    validator(value) {
      // nameKey字段的类型，名字或者用户id
      return ['realName', 'userId'].includes(value);
    },
  },
  timeKey: {
    type: String,
    default() {
      return 'time';
    },
  },
});
</script>
<style lang="scss">
.comp-dc-steps {
  width: 100%;
  text-align: left;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  align-content: center;

  .step-item {
    height: 52px;
    box-sizing: border-box;
    display: inline-flex;
    flex-flow: row nowrap;
    .icon-box {
      width: 24px;
      position: relative;
      display: inline-block;
      margin-right: 8px;
      height: 52px;
      box-sizing: border-box;
    }
    .icon {
      display: block;
      position: absolute;
      left: 0;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      background-color: rgba(35, 198, 159, 0.3);
      border-radius: 50%;

      transform: translateY(15px);
      &::after {
        content: ' ';
        background-color: #23c69f;
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        left: 50%;
        top: 50%;
        z-index: 1;
        transform: translate(-50%, -50%);
      }
    }

    &.actived {
      .icon {
        background-color: rgba(35, 198, 159, 0.3);
        &::after {
          background-color: #23c69f;
        }
      }
    }
    &.active {
      .right-info-top {
        .label {
          color: #1d65f3;
        }
      }
      .icon {
        background-color: rgba(29, 101, 243, 0.3);
        &::after {
          background-color: #1d65f3;
        }
      }
    }

    &.normal {
      .right-info-top {
        .label {
          color: #666;
        }
      }
      .icon {
        width: 21px;
        height: 21px;
        border: 2px solid #bbbbbb;
        background-color: transparent;
        &::after {
          background-color: transparent;
        }
      }
    }

    .right-info {
      display: inline-flex;
      flex-flow: column nowrap;
      align-content: center;
    }
    .right-info-top {
      margin-bottom: 8px;
      &.fix {
        height: 52px;
        line-height: 52px;
        margin-bottom: 0;
      }
      .label {
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: bold;
        font-size: 16px;
        color: #333333;
        line-height: 16px;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }
      .name {
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        line-height: 14px;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }
    }

    .right-info-bottom {
      font-family: Source Han Sans CN, Source Han Sans CN;
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 12px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }

    &:not(:last-child) {
      margin-right: 72px;
      position: relative;
      &::after {
        position: absolute;
        box-sizing: border-box;
        left: 100%;
        top: 0;
        content: ' ';
        width: 56px;
        height: 52px;
        display: inline-block;
        margin: 0 8px;
        background-image: url('./img/split.png');
        background-repeat: no-repeat;
        background-size: 100% auto;
        background-position: center center;
      }
    }
  }
}
</style>

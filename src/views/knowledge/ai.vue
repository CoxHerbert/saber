<template>
  <div class="page-AI">
    <div class="left-panel">
      <div class="top">
        <div class="row">
          <el-button class="btn-new" icon="plus" round>新建对话</el-button>
          <span class="sub-icon"
            ><el-icon><Search /></el-icon
          ></span>
        </div>
        <div class="menu-list">
          <div v-for="(item, i) in leftTopMenuList" :key="i" class="menu-item row">
            <span class="icon">icon</span>
            <span class="label">{{ item.label }}</span>
          </div>
        </div>
      </div>
      <div
        class="bottom"
        :class="{
          hide: !leftBottomExpand,
        }"
      >
        <div class="title-row row">
          <div class="title">EW-AGENT</div>
          <span class="expand-icon" @click="leftBottomExpand = !leftBottomExpand">
            <img src="./img/expand.png" alt="icon" />
          </span>
        </div>
        <div class="create-row row">
          <span class="pre-icon"
            ><el-icon><Plus /></el-icon
          ></span>
          <el-button class="btn-crate" type="text"> 新建智能体</el-button>
        </div>
        <div class="menu-list">
          <div v-for="(item, i) in letAgendList" :key="i" class="menu-item row">
            <span class="icon">icon</span>
            <span class="label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      leftTopMenuList: [
        {
          label: 'PPT生成',
          value: 'ppt',
        },
        {
          label: '帮我写作',
          value: 'write',
        },
        {
          label: '图像生成',
          value: 'img',
        },
      ],
      leftBottomExpand: true,
      letAgendList: [
        {
          label: 'xxxx智能体',
          value: Math.random().toString(36),
        },
        {
          label: 'xxxx智能体',
          value: Math.random().toString(36),
        },
        {
          label: 'xxxx智能体',
          value: Math.random().toString(36),
        },
        {
          label: 'xxxx智能体',
          value: Math.random().toString(36),
        },
      ],
    };
  },
};
</script>
<style lang="scss">
.page-AI {
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;

  .left-panel {
    height: 100%;
    width: 240px;
    border-right: 1px solid #e5e5e5;
    padding: 24px 24px 24px 16px;

    .bottom {
      border-top: 1px solid #e5e5e5;
    }
  }

  .row {
    display: flex;
  }

  .btn-new {
    border: none;
    width: 160px;
    color: var(--el-color-primary);
    height: 32px;
    background: rgba(247, 132, 49, 0.1);
    border-radius: 19px 19px 19px 19px;
    margin-bottom: 12px;
  }

  .sub-icon {
    margin-left: 16px;
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    text-align: center;
    line-height: 32px;
    border: 1px solid #dadbe0;
    color: #666;
  }

  .menu-list {
    .menu-item {
      padding: 12px 12px 12px 14px;
      cursor: pointer;

      &:hover {
        background: rgba(247, 132, 49, 0.1);
        .label {
          color: var(--el-color-primary);
        }
      }
    }
    .icon {
      background-color: rgba($color: #000000, $alpha: 0.05);
      display: block;
      width: 24px;
      height: 24px;
      font-size: 8px;
      text-align: center;
      line-height: 24px;
      margin-right: 8px;
      color: #666;
    }
    .label {
      flex: 1;
      white-space: nowrap;
      word-break: break-all;
      text-overflow: ellipsis;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
      line-height: 24px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }

  .title-row {
    padding: 20px 16px 8px 10px;
    .title {
      flex: 1;
      font-weight: bold;
      font-size: 14px;
      color: #333333;
      line-height: 14px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }

    .expand-icon {
      cursor: pointer;
      transition: all ease-in 0.2s;
      img {
        display: block;
        width: 16px;
        height: 16px;
      }
    }
  }

  .create-row {
    height: 48px;
    padding-left: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;

    .pre-icon {
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background-color: #f5f5f5;
      font-size: 14px;
      text-align: center;
    }

    .btn-crate {
      margin-left: 8px;
      span {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .bottom {
    transition: all ease-in 0.2s;
    &.hide {
      height: 48px;
      overflow: hidden;

      .expand-icon {
        transform: rotate(180deg);
      }
    }
  }
}
</style>

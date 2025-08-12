<template>
  <div class="chart-wrapper">
    <Title title="待分配人员" type="sort">
      <template #right>
        <el-button
          type="primary"
          icon="el-icon-download"
          @click="exportExcle"
          size="small"
          color="rgb(40,70,76)"
          >导出</el-button
        >
      </template>
    </Title>
    <div class="title">
      <div class="scroll-item" v-for="(item, index) in titleList" :key="index">
        {{ item }}
      </div>
    </div>

    <div
      class="scroll-container"
      ref="scrollContainer"
      @mouseenter="stopScrolling"
      @mouseleave="startScrolling"
    >
      <div class="data-list" v-for="(item, index) in items" :key="index">
        <div class="data-list-item">{{ item.deptName }}</div>
        <div class="data-list-item">{{ item.userName }}</div>
        <div class="data-list-item">{{ item.jobnum || 0 }}</div>
        <div class="data-list-item">{{ item.phone || '-' }}</div>
        <div class="data-list-item">{{ item.email || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from './title.vue';
import Api from '@/api/index';
import { exportBlob } from '@/api/common';
import { downloadXls } from '@/utils/util';
import { getToken } from '@/utils/auth';
import website from '@/config/website';
import dayjs from 'dayjs';

export default {
  components: {
    Title,
  },
  data() {
    return {
      titleList: ['部门', '姓名', '工号', '手机号', '邮箱'],
      items: [],
      timer: null,
      scrollSpeed: 1, // 滚动速度
      show: false,
    };
  },

  beforeUnmount() {
    this.stopScrolling();
  },
  methods: {
    async getApi() {
      const res = await Api.mps.assemblyboard.waitingPersonnel();
      const { code, data } = res.data;
      if (code == 200) {
        this.items = data;
        this.startScrolling();
      }
    },
    startScrolling() {
      this.stopScrolling();
      this.timer = setInterval(this.scroll, 100); // 每100毫秒滚动一次
    },
    stopScrolling() {
      console.log('stopScrolling');
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    scroll() {
      const container = this.$refs.scrollContainer;
      const listHeight = container.scrollHeight; // 因为克隆了内容，所以高度需要除以2
      const containerHeight = container.clientHeight;
      let currentScrollTop = container.scrollTop;
      currentScrollTop += this.scrollSpeed;
      if (currentScrollTop >= listHeight - containerHeight) {
        currentScrollTop = 0; // 滚动到底部后回到顶部
      }
      container.scrollTop = currentScrollTop;
    },
    // 导出
    exportExcle() {
      exportBlob(
        `/blade-bip/mmr-plan-order-opt/export-waiting-personnel?${
          website.tokenHeader
        }=${getToken()}`
      ).then(res => {
        downloadXls(res.data, `待分配人员-${dayjs().format('YYYY-MM-DD HH:mm:ss')}.xlsx`);
      });
    },
  },
};
</script>

<style scoped lang="scss">
.chart-wrapper {
  width: 100%; /* 移除多余的空格 */
  height: 238px;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;

  .scroll-container {
    width: 100%;
    height: calc(100% - 100px);
    overflow-y: auto;
    margin-top: 7px;
    // 添加以下代码以隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .title {
    width: 100%;
    font-size: 14px;
    color: #33cccc;
    height: 30px;
    line-height: 30px;
    text-align: center;
    display: flex;
    margin-top: 4px;

    .scroll-item {
      width: 20%;
      &:nth-child(3),
      &:nth-child(4) {
        width: 30% !important;
      }
    }
  }

  .data-list {
    font-family: Source Han Sans CN, Source Han Sans CN;
    width: 100%;
    font-size: 14px;
    color: #ffffff;
    height: 30px;
    line-height: 30px;
    text-align: center;
    display: flex;
    height: 24px;
    line-height: 24px;
    margin-top: 8px;
    .data-list-item {
      text-align: center;
      width: 20%;
      text-align: center;
      /* 默认：文字显示不开时自动换行 */
      /* white-space: nowrap; */
      /* 1.文字显示不开时强制一行显示 */
      white-space: nowrap;
      /* 2.超出部分隐藏 */
      overflow: hidden;
      /* 3.超出部分省略号显示 */
      text-overflow: ellipsis;
      &:nth-child(3),
      &:nth-child(4) {
        width: 30% !important;
      }
    }

    .progress-bar {
      width: 59px;
      height: 8px;
      background: rgba(172, 200, 255, 0.23);
      border-radius: 15px 15px 15px 15px;
      overflow: hidden;
      display: inline-flex;
    }

    .progress-bar-inner {
      width: 0%; /* 设置实际进度值 */
      height: 100%;
      background-color: #1d65f3; /* 设置进度条颜色 */
    }
  }
  .data-list:nth-child(odd) {
    background: rgba(255, 255, 255, 0.08);
    background-repeat: no-repeat;
    background-size: cover;
  }
}
</style>

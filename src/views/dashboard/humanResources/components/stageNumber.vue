<template>
  <div class="chart-wrapper">
    <Title title="现场计划单列表" type="sort" />
    <div class="title">
      <div
        class="scroll-item"
        :class="index == 0 ? 'width30' : ''"
        v-for="(item, index) in titleList"
        :key="index"
      >
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
        <div
          class="data-list-item width30"
          @click="goPlanGantt(item.orderId)"
          :title="item.planOrderCode"
        >
          {{ item.planOrderCode }}
        </div>
        <div class="data-list-item" :title="item.productName">{{ item.productName }}</div>
        <div class="data-list-item" :title="item.currentStageProgress || 0">
          {{ item.currentStageProgress || 0 }}%
        </div>
        <div class="data-list-item">
          <div class="progress-bar" @click="goPlanGantt(item.orderId)">
            <div
              class="progress-bar-inner"
              :style="{ width: item.overallProgress + '%', backgroundColor: item.colorInfo }"
            ></div>
          </div>
        </div>
        <div class="data-list-item">{{ item.productDept }}</div>
        <div class="data-list-item">{{ item.totalNumberOfPeople || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from './title.vue';
import Api from '@/api/index';
export default {
  components: {
    Title,
  },
  data() {
    return {
      titleList: ['计划单号', '产品', '当前阶段&进度', '整体进度', '归属部门', '总人数'],
      items: [],
      timer: null,
      scrollSpeed: 1, // 滚动速度
    };
  },

  beforeUnmount() {
    this.stopScrolling();
  },
  methods: {
    // 跳转现场计划看板
    goPlanGantt(id) {
      this.$router.push({
        path: `/pdp/planSheet/onSitePlan/index`,
        query: {
          id: id,
        },
      });
    },
    async getApi(name) {
      console.log('国家' + name);
      const res = await Api.mps.assemblyboard.planOrderList({
        country: name || '中国',
      });
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
  },
};
</script>

<style scoped lang="scss">
.chart-wrapper {
  width: 100%; /* 移除多余的空格 */
  height: 283px;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  .width30 {
    width: 25% !important;
    padding-left: 6px;
    box-sizing: border-box;
    justify-content: flex-start !important;
    cursor: pointer;
  }

  .scroll-container {
    width: 100%;
    height: calc(100% - 60px);
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
    margin-top: 10px;

    .scroll-item {
      width: calc(45% / 3);
      &:last-child {
        width: 10% !important;
      }
      &:nth-child(3) {
        width: 20% !important;
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
      width: calc(45% / 3);
      text-align: center;
      /* 默认：文字显示不开时自动换行 */
      /* white-space: nowrap; */
      /* 1.文字显示不开时强制一行显示 */
      white-space: nowrap;
      /* 2.超出部分隐藏 */
      overflow: hidden;
      /* 3.超出部分省略号显示 */
      text-overflow: ellipsis;
      &:last-child {
        width: 10% !important;
      }
      &:nth-child(3) {
        width: 20% !important;
      }
    }
    .progress-bar {
      width: 59px;
      height: 8px;
      background: rgba(172, 200, 255, 0.23);
      border-radius: 15px 15px 15px 15px;
      overflow: hidden;
      display: inline-flex;
      cursor: pointer;
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

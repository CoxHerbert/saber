<template>
  <div class="chart-wrapper">
    <Title title="人员PO/FREE " type="sort" />
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
        <div
          class="data-list-item"
          style="cursor: pointer"
          :title="item.productName"
          @click="goPlanOrder(item.productName)"
        >
          {{ item.productName }}
        </div>
        <div class="data-list-item">{{ item.onHandPeopleCount || 0 }}</div>
        <div class="data-list-item">{{ item.npi || 0 }}</div>
        <div class="data-list-item">{{ item.singlePoPeopleCount || 0 }}</div>

        <div class="data-list-item">{{ item.numberOfQuotations || 0 }}</div>
        <div class="data-list-item">{{ item.mpFreePeopleCount || 0 }}</div>
        <div class="data-list-item">{{ item.numberOfSupportDept || 0 }}</div>
        <div class="data-list-item">{{ item.supportOnSite || 0 }}</div>

        <div class="data-list-item">{{ item.numberOfManagers || 0 }}</div>
        <div class="data-list-item">{{ item.numberOfPeopleOnLeave || 0 }}</div>
        <div class="data-list-item">{{ item.resignationInProgress || 0 }}</div>
      </div>
    </div>
    <div class="lookMore" @click="clickLookMore" v-if="items.length > 0">查看全部</div>
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
      titleList: [
        '线体',
        'On hand 总人数',
        'NPI',
        '单独下 PO人数',
        '机台报价内人数',
        'MP Free人数',
        '支援到装配部',
        '支援到现场项项目',
        '管理人数',
        '请假',
        '离职中',
      ],
      items: [],
      timer: null,
      scrollSpeed: 1, // 滚动速度
    };
  },

  beforeUnmount() {
    this.stopScrolling();
  },
  methods: {
    clickLookMore() {
      this.$router.push({
        path: `/pdp/planOrder/count`,
      });
      // this.$emit('lookMore', this.items);
    },
    // 跳转现场计划看板
    goPlanOrder(deptName) {
      this.$router.push({
        path: `/pdp/planOrder/count`,
        query: {
          deptName: deptName,
        },
      });
    },

    async getApi() {
      const res = await Api.mps.assemblyboard.personnelAttendance();
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
      const listHeight = container.scrollHeight;
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
.lookMore {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #33cccc;
  margin-top: 10px;
  font-size: 14px;
  cursor: pointer;
}

.chart-wrapper {
  width: 100%; /* 移除多余的空格 */
  height: 380px;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  .width30 {
    width: 30%;
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
    height: 48px;
    line-height: 48px;
    text-align: center;
    display: flex;
    margin-top: 10px;
    .scroll-item {
      width: calc(100% / 11);
      line-height: 15px;
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
    height: 32px;
    line-height: 32px;
    margin-top: 8px;
    .data-list-item {
      width: 14.2%;
      text-align: center;
      /* 默认：文字显示不开时自动换行 */
      /* white-space: nowrap; */
      /* 1.文字显示不开时强制一行显示 */
      white-space: nowrap;
      /* 2.超出部分隐藏 */
      overflow: hidden;
      /* 3.超出部分省略号显示 */
      text-overflow: ellipsis;
    }
    .progress-bar {
      width: 59px;
      height: 8px;
      background: rgba(172, 200, 255, 0.23);
      border-radius: 15px 15px 15px 15px;
      overflow: hidden;
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

<template>
  <div class="comp-recommended-knowledge-list">
    <div class="title">
      推荐知识
      <span class="all">
        更多 <el-icon><ArrowRight /></el-icon>
      </span>
    </div>
    <!-- <el-radio-group v-model="radio">
      <el-radio :value="item.value" border v-for="(item, index) in notifyType" :key="index">{{
        item.label
      }}</el-radio>
    </el-radio-group> -->
    <div class="comp-content">
      <div class="item-row" v-for="(item, i) in docData" :key="i" @click="getSopDoc(item.id)">
        <div class="avatar">{{ item.title.charAt(0) }}</div>
        <div class="item-row-right">
          <div class="row-title">{{ item.title }}</div>
          <div class="row-desc">{{ item.description || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import gql from 'graphql-tag';

export default {
  data() {
    return {
      notifyType: [
        {
          label: 'AI知识',
          value: '',
        },
        {
          label: '使用规范',
          value: 'project',
        },
        {
          label: '操作手册',
          value: 'yuliu',
        },
      ],
      docData: [],
      radio: '',
      apolloClient_: null,
      md: null,
      contentHtml: '',
    };
  },
  async mounted() {
    this.apolloClient_ = await this.apolloClient();
    this.getData();
  },
  methods: {
    async getData() {
      const result = await this.apolloClient_.query({
        query: gql`
          query {
            pages {
              list(orderBy: TITLE) {
                id
                title
                path
                description
              }
            }
          }
        `,
      });
      this.docData = result.data.pages.list;
    },
    getSopDoc(id) {
      const routeData = this.$router.resolve({
        path: '/sop-doc',
        query: { id },
      });
      window.open(routeData.href, '_blank');
    },
  },
};
</script>
<style lang="scss" scoped>
.comp-recommended-knowledge-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 8px;
  height: 346px;
  .title {
    padding: 18px 16px 11px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-bottom: 12px;
    .all {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #848488;
      line-height: 12px;
      text-align: right;
      font-style: normal;
      text-transform: none;
      user-select: none;
      cursor: pointer;
    }
  }
  .comp-content {
    padding: 0 8px 20px 20px;
    margin-right: 12px;
    flex: 1;
    overflow: auto;
    .item-row {
      padding: 10px 0;
      display: flex;
      cursor: pointer;
      .avatar {
        margin-right: 10px;
        width: 72px;
        height: 41px;
        background-color: #409eff; /* 可自定义颜色 */
        color: white;
        font-size: 20px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
      }
      &-right {
        flex: 1;
        overflow: hidden;
        .row-title {
          margin-bottom: 12px;
          font-weight: bold;
          font-size: 14px;
          color: #333333;
          line-height: 14px;
        }
        .row-desc {
          font-weight: 400;
          font-size: 12px;
          color: #666666;
          line-height: 12px;
        }
      }
    }
  }
}
</style>

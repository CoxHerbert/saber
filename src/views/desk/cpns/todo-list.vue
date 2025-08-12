<template>
  <div class="comp-todo-list">
    <div class="title">待办事项</div>
    <div class="comp-todo-content" v-loading="loading">
      <div
        class="item-row"
        v-for="(item, i) in dataList"
        :key="i"
        @dblclick="handleDynamicRoute(item, 'detail')"
      >
        <div class="item-top">
          <span class="item-status" v-if="item.status === '紧急'">{{ item.status }}</span>
          {{ item.processDefinitionName }}
        </div>
        <div class="item-desc">
          {{ item.startUsername }}发起
          <span class="start-date">
            {{ item.createTime }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import exForm from '@/views/plugin/workflow/mixins/ex-form';
import feasibilityDrawer from '@/views/plugin/workflow/pages/process/desk/components/feasibilityDrawer.vue';
import { todoList as getList } from '@/views/plugin/workflow/api/process/process';
export default {
  name: 'todo-list',
  mixins: [exForm],
  components: { feasibilityDrawer },
  data() {
    return {
      loading: false,
      queryParams: {
        current: 1,
        size: 10,
        processDefinitionName: '',
        processDefinitionKey: '',
        serialNumber: '',
        category: '',
        startUsername: '',
        taskType: '待办',
      },
      dataList: [],
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.loading = true;
      getList(this.queryParams.current, this.queryParams.size, this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.dataList = data.records;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loadingloading = false;
          console.error(err);
        });
    },
    handleDynamicRoute(row) {
      if (row.processDefinitionKey === 'feasibilityAsessment') {
        this.$refs.feasibilityDrawerRef.openDrawer({
          taskId: row.taskId,
          processInsId: row.processInstanceId || row.processId,
        });
      } else {
        this.dynamicRoute({ ...row, parentMenuId: '1872125141990576129' }, 'detail');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.comp-todo-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 8px;
  height: 332px;
  .title {
    padding: 20px 0 13px 20px;
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
  }
  .comp-todo-content {
    margin-right: 9px;
    padding-left: 16px;
    padding-right: 8px;
    margin-bottom: 5px;
    flex: 1;
    overflow: auto;
    .item-row {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 12px 12px;
      margin-bottom: 8px;
      height: 60px;
      border-radius: 4px;
      cursor: pointer;
      background: #f6f8fa;
      .item-top {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 14px;
        color: #333;
        line-height: 14px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        .item-status {
          margin-right: 8px;
          padding: 4px 8px;
          background: rgba(225, 33, 55, 0.1);
          border-radius: 4px;
          font-weight: 400;
          font-size: 12px;
          color: #e12137;
          line-height: 12px;
          text-align: center;
          font-style: normal;
          text-transform: none;
        }
      }
      .item-desc {
        font-weight: 400;
        font-size: 12px;
        color: #848488;
        line-height: 12px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        .start-date {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>

<template>
  <div class="app-container">
    <nf-container>
      <el-container>
        <el-main>
          <template v-if="mode == 'list'">
            <div class="content-warp">
              <div class="search-area">
                <el-form :inline="true" :model="queryParams" ref="searchFromRef" label-width="68px">
                  <el-form-item label="流程名称" prop="name">
                    <el-input v-model="queryParams.name" placeholder="请输入" clearable />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
                    <el-button icon="RefreshRight" @click="handleReset">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <el-tabs class="w-full" @tab-click="handleClick">
                <el-tab-pane
                  :label="tab.label"
                  v-for="(tab, index) in tabData"
                  :key="index"
                ></el-tab-pane>
              </el-tabs>
              <div class="content-body">
                <div class="content-area">
                  <div class="container">
                    <div class="item" v-for="(item, index) in data" :key="index">
                      <div class="item-title">{{ index }}类型({{ item.length }})</div>
                      <div
                        class="item-content"
                        v-for="(items, indexs) in item"
                        :key="indexs"
                        :class="{ highlight: highlightedId === items.id }"
                        @click="dynamicRoute(items, 'start')"
                      >
                        <div>{{ items.name }}</div>
                        <div class="star-wrap" @click.stop="doMark(items)">
                          <el-button :type="item.remarkColor" icon="Star" circle />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <nf-start-grid
            v-else-if="mode == 'grid'"
            :data="data"
            :form="query"
            @route="dynamicRoute($event, 'start')"
          ></nf-start-grid>
        </el-main>
      </el-container>

      <el-dialog
        v-model="bpmnVisible"
        append-to-body
        destroy-on-close
        title="流程图"
        width="70%"
        class="nf-dialog"
      >
        <nf-design ref="bpmn" style="height: 60vh" :options="bpmnOption"></nf-design>
      </el-dialog>
    </nf-container>
  </div>
</template>

<script>
import { list as getList } from '../../../api/process/process';
import { mapGetters } from 'vuex';
import exForm from '../../../mixins/ex-form';
import NfStartGrid from '../../../components/nf-start/grid.vue';
import Api from '@/api/index';

export default {
  mixins: [exForm],
  components: { NfStartGrid },
  data() {
    return {
      mode: 'list',
      form: {},
      query: {},
      queryParams: { name: '' },
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      data: [],
      bpmnVisible: false,
      bpmnOption: {},
      highlightedId: null, // 用于标记高亮的项
      tabData: [
        { label: '全部', value: '1' },
        { label: '我的收藏', value: '2' },
      ],
      collectViewList: [],
    };
  },
  computed: {
    ...mapGetters(['permission']),
  },
  methods: {
    // 搜索功能
    handleSearch() {
      this.onLoad(this.page, this.queryParams);
      if (this.queryParams.name) {
        // 高亮第一个匹配的项
        const matched = Object.values(this.data)
          .flat()
          .find(item => item.name.includes(this.queryParams.name));
        this.highlightedId = matched ? matched.id : null;
      } else {
        this.highlightedId = null;
      }
    },
    // 重置功能
    handleReset() {
      this.queryParams.name = '';
      this.highlightedId = null;
      this.onLoad(this.page, this.queryParams);
    },

    // 加载数据
    onLoad(page, params = {}) {
      this.loading = true;
      getList(page.currentPage, page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data;
        this.loading = false;
      });
    },
    // 点击切换
    handleClick(page, params = {}) {
      this.loading = true;
      getList(page.currentPage, page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data;
        this.loading = false;
      });
    },

    // 查找收藏
    async collectViewData() {
      try {
        const res = await Api.system.remark.collectView('WORKFLOW');
        const { code, data } = res.data;
        if (code === 200) {
          this.collectViewList = data;
          // 合并项目数据，初始化项目的remarkColor
          this.data.forEach(item => {
            this.remarkStatus(item);
          });
        }
      } catch (error) {
        console.error('Error collecting view data:', error);
      }
    },

    doMark(project) {
      const compareValue = project.id + ',';
      const collect = this.collectViewList;
      let targetIds = collect ? (collect.targetIds === null ? '' : collect.targetIds) : '';

      if (collect && collect.targetIds && collect.targetIds.includes(compareValue)) {
        // 已收藏
        // 取消收藏
        collect.targetIds = targetIds.replace(compareValue, '');
      } else {
        // 未收藏
        // 收藏
        collect.targetIds = targetIds + compareValue;
      }
      this.collection(collect, project, compareValue);
    },

    // 收藏
    async collection(collect, project, compareValue) {
      try {
        const res = await Api.system.remark.collectRemark('WORKFLOW', collect);
        const { code, msg } = res.data;
        if (code === 200) {
          await this.getData();
          this.$message.success(msg); // 使用 Vue 2 的 $message
          this.collectViewList = collect;
          project.remarkColor = this.changeRemarkColor(compareValue);
        }
      } catch (error) {
        console.error('Error collecting remark:', error);
      }
    },

    remarkStatus(project) {
      const compareValue = project.id + ',';
      project.remarkColor = this.changeRemarkColor(compareValue);
    },

    changeRemarkColor(compareValue) {
      if (
        this.collectViewList &&
        this.collectViewList.targetIds &&
        this.collectViewList.targetIds.includes(compareValue)
      ) {
        return 'warning';
      } else {
        return 'default';
      }
    },
  },
  created() {
    this.onLoad(this.page);
  },
};
</script>

<style lang="scss" scoped>
:deep(.nf-crud__img) {
  img {
    width: 32px;
    height: 32px;
  }
}

.highlight {
  background-color: #fff !important;
  color: #409eff !important;
  font-weight: bold;
}

.nf-container {
  padding: 0 !important;
}
</style>
<style lang="scss" scoped>
.container {
  column-count: 3;
  column-gap: 16px;
}

.content-warp {
  padding: 0 !important;
}

.content-area {
  padding: 0 !important;
}

.item {
  background: #f6f8fa;
  margin-bottom: 16px;
  border-radius: 8px;
  break-inside: avoid; /* 防止内容被剪裁 */
  padding: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  word-wrap: break-word; /* 自动换行 */
  word-break: break-word; /* 避免长单词溢出 */
  overflow-wrap: break-word; /* 兼容性更好的写法 */
  white-space: normal; /* 默认情况下允许换行 */
  border: 1px solid #f6f8fa;
  border-top: 10px solid blue;
  min-width: 300px;

  &-title {
    font-weight: 500;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: center;
    padding: 32px 0 28px 0;
  }

  &-content {
    font-weight: 500;
    font-size: 14px;
    color: #333333;
    line-height: 14px;
    padding: 13px 0 13px 26px;
    display: flex;
    justify-content: space-between;
  }

  &-content:hover {
    background: #f6f8fa;
    padding: 13px 0 13px 26px;
  }
}

.item:hover {
  background: #fff;
  border: 1px solid blue;
  border-top: 10px solid blue;
}
</style>

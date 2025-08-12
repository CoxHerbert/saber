<template>
  <div class="page-create-process">
    <div class="header">
      <dc-search
        v-if="searchConfig"
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="resetQuery"
        @search="handleQuery"
      />
    </div>
    <div class="page-content">
      <ProcessCategoryWaterfall
        v-if="collectionTreeData?.length > 0"
        :categories="collectionTreeData"
        :collectionIds="collectionIdsSet"
        @collectionData="handleCollectionData"
      />
      <div v-else class="no-data">暂无数据</div>
    </div>
  </div>
</template>
<script>
import ProcessCategoryWaterfall from './cpns/ProcessCategoryWaterfall.vue';
import {
  list as getDataList,
  collectList,
  getColectionTargetIds,
  collectCollection,
} from './../plugin/workflow/api/process/process';
export default {
  components: {
    ProcessCategoryWaterfall,
  },
  data() {
    return {
      loading: false,
      collectionIds: '',
      collectionData: {},
      dataList: [],
      total: 0,
      queryParams: {
        size: 1000,
        current: 1,
        topType: '全部',
      },
      searchConfig: {
        resetExcludeKeys: ['page', 'current', 'topType'],
        tabConfig: {
          prop: 'topType',
          items: [
            {
              label: '全部',
              value: '全部',
            },
            {
              label: '我的收藏',
              value: '我的收藏',
            },
          ],
        },
        searchItemConfig: {
          paramType: {
            name: {
              label: '流程名称',
              type: 'input',
              placeholder: '请输入关键字搜索',
              paramKey: 'name',
            },
          },
        },
      },
    };
  },
  computed: {
    collectionTreeData() {
      if (this.queryParams.topType === '全部') {
        return this.dataList;
      } else {
        const dataNew = [];

        this.dataList.forEach(row => {
          if (row.processDefs?.length > 0) {
            const processDefs = [];
            row.processDefs.forEach(item => {
              if (this.collectionIdsSet.includes(item.key)) {
                processDefs.push(item);
              }
            });
            if (processDefs.length > 0) {
              dataNew.push({
                ...row,
                processDefs: processDefs,
              });
            }
          }
        });

        this.dataList = dataNew;
        return this.dataList;
      }
    },
    collectionIdsSet() {
      return this.collectionIds ? this.collectionIds.split(',') : [];
    },
  },
  async mounted() {
    await this.getCollectionTargetids();
    await this.getData(true);
    await this.getData(false);
  },
  methods: {
    /** 查询参数列表 */
    async getData(isData) {
      this.loading = true;
      let dataparam = isData
        ? {
            ...this.queryParams,
          }
        : { collectType: this.collectionData.tableName };
      const action = isData ? getDataList : collectList;
      const res = await action({
        ...dataparam,
      });
      const { code, data } = res.data;
      if (code === 200) {
        if (isData) {
          this.dataList = (data || []).filter(item => item.processDefs?.length > 0);
        } else {
          this.collectionIds = data.targetIds ? data.targetIds : '';
        }
      }
      this.loading = false;
    },
    async getCollectionTargetids() {
      const res = await getColectionTargetIds({
        collectType: 'WORKFLOW',
      });
      const { code, data } = res.data;
      if (code === 200) {
        this.collectionData = data;
      }
    },
    handleCollectionData(data) {
      const isTrue = this.collectionIdsSet.indexOf(data.key) === -1;
      const ids = {};
      (this.collectionIds ? this.collectionIds + ',' + data.key : data.key)
        .split(',')
        .forEach(c => {
          ids[c] = true;
        });
      if (!isTrue) {
        delete ids[data.key];
      }
      collectCollection({
        tableName: 'WORKFLOW',
        targetIds: Object.keys(ids).join(','),
      }).then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          this.getData();
        }
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getData(true);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        size: 1000,
        current: 1,
        topType: '全部',
      };
      this.getData(true);
    },
  },
};
</script>
<style lang="scss">
.page-create-process {
  padding: 16px 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  .header {
    padding: 0 24px;
    border-bottom: 1px solid #eaeaeb;
  }
  .page-content {
    padding: 0 24px;
    box-sizing: border-box;
  }

  .no-data {
    text-align: center;
    font-size: 14px;
    color: #666;
    padding-top: 100px;
  }
}
</style>

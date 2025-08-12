<template>
  <div class="list-page prcess-price-config-page">
    <div class="list-page-content-wrap">
      <div class="list-page left-wrap" v-loading="loading">
        <div class="action-banner">
          <el-button icon="plus" type="primary" @click="doAction('left-add')">新增</el-button>
          <el-button
            icon="remove"
            type="danger"
            :disabled="batchActionDisabled"
            @click="doAction('left-delete')"
            >删除</el-button
          >
        </div>
        <div class="table-container">
          <el-table
            ref="tableRef"
            :data="tableData"
            row-key="id"
            @select="handleSelect"
            @select-all="handleSelectAll"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            border
          >
            <template v-for="(col, i) in columns">
              <!-- 多选 -->
              <el-table-column
                v-if="col.type === 'selection'"
                :key="i"
                type="selection"
                :align="col.align"
                :width="col.width"
              />
              <!-- 序号类型 -->
              <el-table-column
                v-else-if="col.type === 'index'"
                :key="'index' + i"
                label="序号"
                :align="col.align"
                :width="col.width"
                :min-width="col.minWidth"
              >
                <template #default="{ $index }">
                  {{ $index + 1 }}
                </template>
              </el-table-column>
              <el-table-column
                v-else-if="col.type === 'actions'"
                :key="'option' + i"
                :fixed="col.fixed"
                :label="col.label"
                :width="col.width ? col.width : 180"
                :min-width="col.minWidth"
                :align="col.align ? col.align : 'center'"
              >
                <template #default="scoped">
                  <el-button
                    v-for="(btn, j) in col.children"
                    :key="j"
                    link
                    v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                    type="primary"
                    @click="doAction(btn.action, scoped)"
                    >{{ btn.label }}</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :key="col.type + i"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :prop="col.prop"
                :align="col.align ? col.align : 'center'"
                show-overflow-tooltip
              >
                <template #default="scoped">
                  <dc-field-view
                    :value="col?.transVal ? col?.transVal(scoped, treeData) : scoped.row[col.prop]"
                    :data="col"
                    :dictMaps="dictMaps"
                  />
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>
      </div>
      <div class="list-page right-wrap" v-loading="rightLoading">
        <div class="action-banner">
          <el-button
            icon="plus"
            type="primary"
            @click="doAction('right-add')"
            :disabled="!rightDetail?.technologyItemList"
            >新增</el-button
          >
          <el-button
            icon="remove"
            type="danger"
            :disabled="!rightBatchSelectRows.length"
            @click="doAction('right-delete')"
            >删除</el-button
          >
        </div>
        <div class="table-container">
          <el-table
            ref="tableRightRef"
            :data="rightDetail?.technologyItemList || []"
            row-key="id"
            @select="handleSelectRight"
            @select-all="handleSelectAllRight"
            @selection-change="handleSelectionChangeRight"
            border
          >
            <template v-for="(col, i) in rightColumns">
              <!-- 多选 -->
              <el-table-column
                v-if="col.type === 'selection'"
                :key="i"
                type="selection"
                :align="col.align"
                :width="col.width"
              />
              <!-- 序号类型 -->
              <el-table-column
                v-else-if="col.type === 'index'"
                :key="'index' + i"
                label="序号"
                :align="col.align"
                :width="col.width"
                :min-width="col.minWidth"
              >
                <template #default="{ $index }">
                  {{ $index + 1 }}
                </template>
              </el-table-column>
              <el-table-column
                v-else-if="col.type === 'actions'"
                :key="'option' + i"
                :fixed="col.fixed"
                :label="col.label"
                :width="col.width ? col.width : 180"
                :min-width="col.minWidth"
                :align="col.align ? col.align : 'center'"
              >
                <template #default="scoped">
                  <el-button
                    v-for="(btn, j) in col.children"
                    :key="j"
                    link
                    v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                    type="primary"
                    @click="doAction(btn.action, scoped)"
                    >{{ btn.label }}</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :key="col.type + i"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :prop="col.prop"
                :align="col.align ? col.align : 'center'"
                show-overflow-tooltip
              >
                <template #default="scoped">
                  <dc-field-view
                    :value="col?.transVal ? col?.transVal(scoped, treeData) : scoped.row[col.prop]"
                    :data="col"
                    :dictMaps="dictMaps"
                  />
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>
      </div>
    </div>
    <addEditeDialog ref="addEditeDialogRef" @confirm="refreshData()" />
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import config from './list';
import Api from '@/api';
import addEditeDialog from './cpns/addEditeDialog.vue';

export default {
  mixins: [listPage],
  components: { addEditeDialog },
  name: 'pcess-price-config-page',
  data() {
    return {
      mode: 'customize',
      columns: [],
      queryParams: {
        current: 1,
        size: 100,
      },
      rightDetail: {},
      rightColumns: [],
      rightBatchSelectRows: [],
      rightLoading: false,
      selectedRow: {},
    };
  },
  created() {
    this.columns = config.leftOptions().columns;
    this.rightColumns = config.rightOptions().columns;
    this.dictKeys = [
      { key: 'DC_PROCESS_THCH_GROUP' },
      { key: 'DC_TECHNOLOGY_PRICING_METHOD' },
      { key: 'DC_TECHNOLOGY_PART_ACCURACY' },
      { key: 'DC_TECHNOLOGY_PART_CZ' },
      { key: 'DC_TECHNOLOGY_ITEM_PRICING_UNIT' },
    ];
    this.getDictData().then(() => {});
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 刷新数据 **/
    refreshData() {
      this.getData();
      this.getDetail();
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      Api.appManage.pcessPriceConfig
        .getOutsourceTechnologyList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'row-click') {
        this.selectedRow = scope;
        this.getDetail();
      } else if (action === 'left-add') {
        const options = {
          type: 'prcess',
          mode: 'add',
          row: {
            surfaceTreatment: false,
          },
          api: Api.appManage.pcessPriceConfig.postOutsourceTechnology,
        };
        this.$refs.addEditeDialogRef.openDialog(options);
      } else if (action === 'left-delete') {
        const options = {
          ids: this.batchSelectRows.map(item => item.id),
          api: Api.appManage.pcessPriceConfig.removeOutsourceTechnology,
          type: 'prcess',
        };
        this.deleteData(options);
      } else if (action === 'right-add') {
        const options = {
          type: 'item',
          mode: 'add',
          row: {
            technologyId: this.selectedRow.id,
          },
          api: Api.appManage.pcessPriceConfig.postConfigItem,
        };
        this.$refs.addEditeDialogRef.openDialog(options);
      } else if (action === 'right-delete') {
        const options = {
          ids: this.rightBatchSelectRows.map(item => item.id),
          api: Api.appManage.pcessPriceConfig.removeConfigItem,
          type: 'item',
        };
        this.deleteData(options);
      } else if (action === 'left-edit') {
        const options = {
          type: 'prcess',
          mode: 'left',
          row: row,
          api: Api.appManage.pcessPriceConfig.postOutsourceTechnology,
        };
        this.$refs.addEditeDialogRef.openDialog(options);
      } else if (action === 'right-edit') {
        const options = {
          type: 'item',
          mode: 'right',
          row: row,
          api: Api.appManage.pcessPriceConfig.postConfigItem,
        };
        this.$refs.addEditeDialogRef.openDialog(options);
      }
    },
    /** 处理删除 **/
    deleteData({ api, ids, type }) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        api,
        true
      )
        .then(() => {
          if (type === 'prcess') {
            this.refreshData();
          } else {
            this.getDetail();
          }
        })
        .catch(err => {});
    },
    /** 获取详情 **/
    getDetail() {
      this.rightLoading = true;
      Api.appManage.pcessPriceConfig
        .getOutsourceTechnologyDetail(this.selectedRow)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.rightDetail = data;
          }
          this.rightLoading = false;
        })
        .catch(err => {
          this.rightLoading = false;
        });
    },
    /** 获取选中的数据 */
    handleSelectionChangeRight(selection) {
      this.rightBatchSelectRows = selection;
    },
    /** 单个选择 **/
    handleSelectRight(selection) {
      this.rightBatchSelectRows = selection;
    },
    /** 全部选择 **/
    handleSelectAllRight(selection) {
      this.rightBatchSelectRows = selection;
    },
  },
};
</script>

<style lang="scss" scoped>
.prcess-price-config-page {
  .param-group {
    min-width: 100%;
  }
  .list-page-content-wrap {
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
    .left-wrap,
    .right-wrap {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }
    .left-wrap {
      margin-right: 8px;
    }
  }
}
</style>

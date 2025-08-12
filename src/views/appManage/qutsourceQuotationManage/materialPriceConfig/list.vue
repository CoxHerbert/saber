<template>
  <div class="list-page prod-plan-list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <!-- <div class="action-banner">
      <el-button
        icon="remove"
        type="danger"
        :disabled="batchActionDisabled"
        @click="doAction('batch-delete')"
        >删除</el-button
      >
    </div> -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
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
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
    <addEditeDialog ref="addEditeDialogRef" @confirm="getData()" />
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list';
import Api from '@/api';
import addEditeDialog from './../prcessPriceConfig/cpns/addEditeDialog.vue';

export default {
  mixins: [listPage],
  components: { addEditeDialog },
  name: 'material-price-config-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      queryParams: {
        current: 1,
        size: 20,
      },
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      Api.appManage.materialPriceConfig
        .getOutsourcePriceList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          console.error(err);
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'row-edit') {
        const options = {
          type: 'materialPrice',
          mode: 'edit',
          row: row,
          api: Api.appManage.materialPriceConfig.postOutsourcePrice,
        };
        this.$refs.addEditeDialogRef.openDialog(options);
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        Api.appManage.materialPriceConfig.removeOutsourcePrice
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.prod-plan-list-page {
}
</style>

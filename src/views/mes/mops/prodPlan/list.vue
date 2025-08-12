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
    <div class="action-banner">
      <el-button
        icon="Postcard"
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('batchPdfView')"
        >工艺卡</el-button
      >
      <el-button
        icon="Postcard"
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('materialLabel')"
        >物料标签</el-button
      >
      <el-button
        icon="SetUp"
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('assign')"
        >指派</el-button
      >
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="entryId"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
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
  </div>
  <materialLabelDialog ref="materialLabelDialogRef" />
  <assignDialog ref="assignDialogRef" @success="handleReset()" />
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list';
import materialLabelDialog from './../solutionPlan/cpns/materialLabelDialog.vue';
import assignDialog from './cpns/assignDialog.vue';

export default {
  mixins: [listPage],
  components: { materialLabelDialog, assignDialog },
  name: 'prod-plan-list',
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
      this.searchConfig.resetExcludeKeys = ['page', 'current', 'businessStatus'];
      this.searchConfig.tabConfig = {
        prop: 'businessStatus',
        items: [
          { label: '全部', value: '' },
          { label: '我的', value: '我的' },
          { label: '开立', value: '开立' },
          { label: '下达', value: '下达' },
          { label: '开工', value: '开工' },
          { label: '完工', value: '完工' },
          { label: '结案', value: '结案' },
        ],
      };
      this.queryParams.businessStatus = '';
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.mes.mops
        .getProdPlan(this.queryParams)
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
      if (action === 'materialLabel') {
        const ids = this.batchSelectRows.map(item => item.entryId).join(',');
        this.$refs.materialLabelDialogRef.openDialog(ids);
      } else if (action === 'batchPdfView') {
        const ids = this.batchSelectRows.map(row => row.entryId).join(',');
        window.open(`${this.pdfViewURL}?entryIds=${ids}`, 'target');
      } else if (action === 'delete') {
        this.deleteData([scope.row.entryId]);
      } else if (action === 'schedule') {
        this.$router.push({
          path: '/mes/mops/prodPlan/addOrEdit',
          query: {
            type: 'edit',
            id: row.entryId,
            parentMenuId: '1940952817164021761',
          },
        });
      } else if (action === 'pdfView') {
        window.open(`${this.pdfViewURL}?entryIds=${scope.row.entryId}`, 'target');
      } else if (action === 'edit') {
        this.$router.push({
          path: '/mes/mops/solutionPlan/addOrEdit',
          query: {
            type: 'edit',
            id: row.entryId,
            parentMenuId: '1940952817164021761',
          },
        });
      } else if (action === 'row-drawe') {
        window.open(`https://www.eastwinbip.com/drawing/${row.materialNumber}`, 'target');
      } else if (action === 'assign') {
        this.handleAssign();
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.scm.scmMaterial.remove
      );
    },
    /** 处理指派 **/
    handleAssign() {
      const ids = this.batchSelectRows.map(item => item.entryId);
      this.$refs.assignDialogRef.openDialog(ids);
    },
  },
};
</script>

<style lang="scss" scoped>
.prod-plan-list-page {
}
</style>

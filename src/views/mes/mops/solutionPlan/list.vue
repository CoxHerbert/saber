<template>
  <div class="list-page">
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
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list';
import materialLabelDialog from './cpns/materialLabelDialog.vue';
export default {
  mixins: [listPage],
  components: { materialLabelDialog },
  name: 'solution-plan-list',
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
      this.api.mes.mops
        .getSolutionPlan(this.queryParams)
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
        const ids = this.batchSelectRows.map(item => item.entryId).join(',');
        window.open(`${this.pdfViewURL}?entryIds=${ids}`, 'target');
      } else if (action === 'delete') {
        this.deleteData([scope.row.entryId]);
      } else if (action === 'edit') {
        this.$router.push({
          path: '/mes/mops/solutionPlan/addOrEdit',
          query: {
            type: 'edit',
            id: row.entryId,
            parentMenuId: '1942860346571812865',
          },
        });
      } else if (action === 'pdfView') {
        window.open(`${this.pdfViewURL}?entryIds=${scope.row.entryId}`, 'target');
      } else if (action === 'row-drawe') {
        window.open(`https://www.eastwinbip.com/drawing/${row.materialNumber}`, 'target');
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.mes.mops.deleteMoPlan
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.page-processing-outsourcing {
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
}
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 6px;
      padding-bottom: 0;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
</style>

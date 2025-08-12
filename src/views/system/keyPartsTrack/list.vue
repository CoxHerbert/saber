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
      <el-button icon="Plus" type="primary" @click="doAction('add')">批量生成</el-button>
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
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
                v-permission="col?.permission && col.permission(scoped)"
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
    <addInBatche ref="addInBatcheRef" @success="handleReset" />
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list.js';
import addInBatche from './cnps/addInBatche.vue';

export default {
  components: { addInBatche },
  mixins: [listPage],
  name: 'key-parts-track-list-page',
  data() {
    return {
      mode: 'customize',
      columns: options().columns,
    };
  },
  created() {
    if (this.mode === 'customize') {
      this.handleDictKeys();
      this.getDictData().then(() => {
        this.initSearchConfig();
      });
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.system.track
        .getTrackList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          ths.loading = false;
          console.error(err);
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'add') {
        this.$refs.addInBatcheRef.openDialog(row);
      }
    },
    handleDynamicRoute(row) {
      this.loading = true;
      this.api.pdp.milProcess
        .getProcessTask({ processId: row.processId })
        .then(res => {
          const { data, code } = res.data;
          if (code === 200) {
            this.dynamicRoute(
              {
                processId: row.processId,
                taskId: data.taskId,
                parentMenuId: '1892114945981734913',
              },
              'detail'
            );
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>

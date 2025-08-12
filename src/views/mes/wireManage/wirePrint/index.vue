<template>
  <basic-container>
    <div class="content-warp page-processing-outsourcing">
      <div class="header">
        <!-- tab切换 -->
        <el-tabs v-model="queryParams.printLabel" @tab-change="handleClick">
          <el-tab-pane
            :label="tab.label"
            :name="tab.value"
            v-for="(tab, index) in tabsList"
            :key="index"
          ></el-tab-pane>
        </el-tabs>
        <!-- tab结束 -->
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button
          icon="Printer"
          type="primary"
          style="margin-right: 16px"
          :disabled="batchSelectRows.length === 0"
          v-if="queryParams.printLabel === '未打印'"
          @click="doAction('print')"
          >打印</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          row-key="itemId"
          border
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
            <!-- 普通文字类型 -->
            <el-table-column
              v-else-if="col.type === 'rowText'"
              :key="'rowText' + i"
              :label="col.label"
              :width="col.width || 160"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{
                  [null, undefined, ''].includes(scoped.row[col.prop]) ? '-' : scoped.row[col.prop]
                }}
              </template>
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :key="'dc-view' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
              :prop="col.prop"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showKey="col.showKey"
                />
              </template>
            </el-table-column>
            <!-- 字典类型 -->
            <el-table-column
              v-else-if="col.type === 'dict'"
              :key="'dict' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-dict-key
                  v-if="dictMaps[col.dictKey]"
                  type="text"
                  :options="dictMaps[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict-key>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="col.type === 'actions' && queryParams.printLabel !== '未打印'"
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
  </basic-container>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './utils';
export default {
  mixins: [listPage],
  name: 'WirePrint',
  data() {
    return {
      mode: 'customize',
      columns: options().columns,
      queryParams: {
        current: 1,
        size: 20,
        type: 1,
        printLabel: '未打印',
      },
      // activeName: '未打印',
      tabsList: [
        { label: '未打印', value: '未打印' },
        { label: '未完成', value: '未完成' },
        { label: '全部', value: '全部' },
        // { label: '全部拆分', value: '全部拆分' },
      ],
      paramType: {},
      types: [
        {
          label: '执行单',
          value: 0,
        },
        {
          label: '制料',
          value: 1,
        },
      ],
    };
  },
  created() {
    if (this.mode === 'customize') {
      this.handleDictKeys();
      this.getDictData().then(() => {
        this.initSearchConfig();
      });
    }
    this.initSearchAndDict();
    this.getData();
  },
  methods: {
    handleClick(value) {
      this.queryParams.printLabel = value;
      this.getData();
    },
    /** 初始化搜索和字典 **/
    initSearchAndDict() {
      this.dictMaps = {
        ...this.dictMaps,
        types: [
          {
            label: '执行单',
            value: 0,
          },
          {
            label: '制料',
            value: 1,
          },
        ],
      };
      this.searchConfig = {
        ...this.searchConfig,
        searchItemConfig: {
          paramType: {
            mtoNo: {
              label: '专案号',
              paramKey: 'mtoNo',
              type: 'input',
            },
            finishMaterialNumber: {
              label: '成品料号',
              paramKey: 'finishMaterialNumber',
              type: 'input',
            },
            itemMaterialNumber: {
              label: '线材料号',
              paramKey: 'itemMaterialNumber',
              type: 'input',
            },
            // type: {
            //   label: '类型',
            //   paramKey: 'type',
            //   valueKey: 'value',
            //   labelKey: 'label',
            //   placeholder: '请选择类型',
            //   type: 'select',
            //   options: this.dictMaps['types'],
            //   props: {
            //     clearable: true,
            //   },
            // },
          },
        },
      };
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.mps.wireExecute
        .printList(this.queryParams)
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
    /** 操作 **/
    doAction(action, scope) {
      switch (action) {
        case 'print':
          let itemIds = this.batchSelectRows.map(item => item.itemId);
          this.queryParams.executeId = itemIds.join(',');
          this.handlePrint();
          return;
        case 'viewPrint':
          this.queryParams.executeId = scope.row.itemId;
          // this.queryParams.type = scope.row.type;
          this.handlePrint();
          return;
      }
    },
    /** 处理删除 **/
    handleDelete() {
      if (this.batchDelete.length === 0) {
        this.$message.error('请选择要删除的客户');
        return;
      }
      const ids = this.batchDelete.map(item => item.id).join(',');
      const message = `是否确认删除选中的数据项？`;
      this.handleDeleteCommon(ids, message, Api.scm.scmMaterial.remove);
    },
    /** 处理打印 **/
    handlePrint() {
      // if (this.queryParams.printLabel === '未打印') {
      //   const invalidValues = [undefined, null, ''];
      //   if (
      //     invalidValues.includes(this.queryParams.type) ||
      //     invalidValues.includes(this.queryParams.executeId)
      //   )
      //     return this.$message.error('请选择执行单号与类型后操作！');
      // }

      this.$confirm('确认是否打印？', '打印', {
        confirmButtonText: '打印',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() =>
          this.api.mps.wireExecute.printDrawv2({
            // type: this.queryParams.type,
            executeItemIds: this.queryParams.executeId,
          })
        )
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            window.open(data, '_blank');
            this.$message.success('操作成功');
          }
        })
        .catch(err => console.error(err));
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
/* 穿透 scoped 样式，去除 el-tag 底部边框 */
::v-deep .el-tabs__nav-wrap:after {
  height: 0;
}
::v-deep .el-tabs__header {
  margin: 0;
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

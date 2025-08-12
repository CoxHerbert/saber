<template>
  <basic-container>
    <div class="content-warp page-processing-outsourcing">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button icon="Plus" type="primary" style="margin-right: 16px" @click="handleInitiate()"
          >新增</el-button
        >
      </div>
      <!-- 
         lazy
            :load="loadChildren"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            :checkStrictly="true"
        -->
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
            <!-- 普通文字类型 -->
            <el-table-column
              v-else-if="col.type === 'rowText'"
              :key="'rowText' + i"
              :label="col.label"
              :width="col.width"
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
              prop="purchaserId"
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
                <dc-dict
                  v-if="pageData[col.dictKey]"
                  type="text"
                  :options="pageData[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict>
                <span v-else>-</span>
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
import options from './utils.js';
export default {
  mixins: [listPage],
  name: 'WireExecutionOrder',
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
    this.addSearchConfig();
  },
  mounted() {
    this.getData();
  },
  methods: {
    // 新增
    async handleInitiate() {
      const params = {
        processKey: 'wireExecute',
      };
      const res = await this.api.pdp.settled.processForm(params);
      const { code, data } = res.data;
      if (code === 200) {
        this.$router.push(`/workflow/process/start/${data.enCode}`);
      }
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.mps.wireExecute
        .list(this.queryParams)
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
      if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.id));
      } else if (action === 'delete') {
        deleteData([scope.row.id]);
      } else if (action === 'detail') {
        this.$router.push({
          path: '/mes/wireManage/wireExecutionOrder/addOrEdit',
          query: {
            type: 'look',
            parentMenuId: '1932609668223778818',
            id: row.id,
          },
        });
      } else if (action === 'print') {
        this.$router.push({
          path: '/mes/wireManage/wireExecutionOrder/addOrEdit',
          query: {
            type: 'print',
            parentMenuId: '1932609668223778818',
            id: row.id,
          },
        });
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids,
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        Api.scm.scmMaterial.remove
      );
    },
    addSearchConfig() {
      const commonParams = {
        noQuery: {
          label: '执行单号',
          type: 'input',
          placeholder: '请输入执行单号',
          paramKey: 'noQuery',
        },
        mtoNoQuery: {
          label: '专案号',
          type: 'input',
          placeholder: '请输入专案号',
          paramKey: 'mtoNoQuery',
        },
        projectNameQuery: {
          label: '项目名称',
          type: 'input',
          placeholder: '请输入项目名称',
          paramKey: 'projectNameQuery',
        },
        bomNoQuery: {
          label: 'bom编码',
          type: 'input',
          placeholder: '请输入bom编码',
          paramKey: 'bomNoQuery',
        },
        materialNumberQuery: {
          label: '执行物料编码',
          type: 'input',
          placeholder: '请输入执行物料编码',
          paramKey: 'materialNumberQuery',
        },
        finishMaterialNumberQuery: {
          label: '成品物料编码',
          type: 'input',
          placeholder: '请输入成品物料编码',
          paramKey: 'finishMaterialNumberQuery',
        },
      };

      // 若已存在 searchConfig，则合并 paramType
      if (this.searchConfig) {
        this.searchConfig.searchItemConfig = this.searchConfig.searchItemConfig || {};
        this.searchConfig.searchItemConfig.paramType = {
          ...(this.searchConfig.searchItemConfig.paramType || {}),
          ...commonParams,
        };
      } else {
        // 若不存在 searchConfig，则初始化
        this.searchConfig = {
          searchItemConfig: {
            paramType: { ...commonParams },
          },
        };
      }
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

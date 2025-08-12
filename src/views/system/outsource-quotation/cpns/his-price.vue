<template>
  <el-dialog v-model="open" title="历史价格" destroy-on-close append-to-body>
    <basic-container>
      <div class="content-warp page-processing-outsourcing">
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
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '-'
                      : scoped.row[col.prop]
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
      </div>
    </basic-container>
  </el-dialog>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './hisPrice';
export default {
  mixins: [listPage],
  name: 'his-price',
  data() {
    return {
      mode: 'customize',
      columns: [],
      open: false,
    };
  },
  created() {
    this.columns = options().columns;
  },
  methods: {
    openDialog(row) {
      const { fnumber } = row;
      this.open = true;
      this.getData(fnumber);
    },
    closeDialog() {
      this.open = false;
      this.tableData = [];
    },
    /** 获取列表数据 **/
    getData(fNumber) {
      this.loading = true;
      this.api.system.OutsourceQuotation.getHisPrice({ fNumber })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          console.error(err);
        });
    },
    doAction(action, scope = {}) {},
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        Api.scm.scmMaterial.remove
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

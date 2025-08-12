<template>
  <el-drawer v-model="dialogVisible" size="600" :title="title" @close="doAction('close')">
    <el-form :mode="formData">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        :row-key="rowKey || 'id'"
        height="100%"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        :row-class-name="tableRowClassName"
        border
      >
        <template v-for="(col, i) in columns">
          <el-table-column
            v-if="col.type === 'edit'"
            :key="'edit' + i"
            :align="col.align"
            :width="col.width"
            :fixed="col?.fixed || ''"
          >
            <template #header>
              <el-icon class="action-add" @click="doActionTable('add')"><Plus /></el-icon>
            </template>
            <template #default="scoped">
              <el-icon class="action-delete" @click="doActionTable('delete', scoped)"
                ><Delete
              /></el-icon>
            </template>
          </el-table-column>
          <!-- 多选 -->
          <el-table-column
            v-else-if="col.type === 'selection'"
            :key="'selection' + i"
            type="selection"
            :align="col.align"
            :width="col.width"
            :fixed="col?.fixed || ''"
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
                v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped, queryParams))"
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
            :fixed="col.fixed"
            show-overflow-tooltip
          >
            <template #header><span v-html="getLabelCode(col)"> </span></template>
            <template #default="scoped">
              <div
                class="cell-box"
                :class="getCellBoxClass(scoped, col)"
                @click.stop="handleCellClick(scoped, col)"
              >
                <dc-widget
                  v-if="coordinate?.rowIndex === scoped.$index"
                  v-model="scoped.row[col.prop]"
                  :data="col"
                  :dictMaps="dictMaps"
                  @change="
                    val => {
                      handleTableItemChange(val, scoped, col);
                    }
                  "
                />

                <dc-field-view
                  v-else
                  :value="col?.transVal ? col?.transVal(scoped) : scoped.row[col.prop]"
                  :data="col"
                  :dictMaps="dictMaps"
                />
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="doAction('submit')">提交</el-button>
        <el-button @click="doAction('close')">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script>
import Api from '@/api/index';
import editDialog from '@/mixins/edit-dialog';
import listEditPage from '@/mixins/list-edit-page';
import options from './add-in-batche.js';

export default {
  emits: ['success'],
  name: 'add-edite-dialog',
  mixins: [editDialog, listEditPage],
  data() {
    return {
      loading: false,
      planId: null,
      columns: options().columns,
      dialogVisible: false,
      title: '',
      options: [],
      tableData: [],
      formData: {},
    };
  },
  created() {
    this.handleDictKeys();
    this.getDictData().then(res => {});
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog(row) {
      this.dialogVisible = true;
      this.title = '批量生成';
      this.markAsUnsaved();
      this.columns = options().columns;
      if (row) {
        this.getDetail(row);
      }
    },
    getDetail({ id }) {
      this.loading = true;
      Api.mes.mops
        .getReportDetail({ id })
        .then(res => {
          const { data, code } = res.data;
          if (code === 200) {
            this.tableData = data;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },

    /** 处理表单项变化 **/
    handleFormItemChange(col, val) {},
    /** 页面操作 **/
    doAction(action) {
      if (action === 'close') {
        this.markAsSaved();
        this.dialogVisible = false;
        this.formData = {};
      } else if (action === 'submit') {
        this.handleSubmit();
      }
    },
    /**  **/
    doActionTable(action, scope) {
      if (action === 'add') {
        this.tableData.unshift({});
      } else if (action === 'delete') {
        const { $index } = scope;
        this.tableData.splice($index, 1);
      }
    },
    /** 处理提交 **/
    handleSubmit() {
      this.getInvalidRows(this.tableData, this.columns).then(() => {
        this.$confirm('确认是否提交本次汇报工时？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            this.loading = true;
            Api.mes.mops
              .trackBatchGenerate(this.tableData)
              .then(res => {
                const { code, msg } = res.data;
                if (code === 200) {
                  this.doAction('close');
                  this.$emit('success');
                  this.$message.success(msg);
                }
                this.loading = false;
              })
              .catch(err => {
                this.loading = false;
              });
          })
          .catch(err => {});
      });
    },
  },
};
</script>

<style scoped lang="scss">
.action-add,
.action-delete {
  cursor: pointer;
}
.action-delete {
  color: red;
}
</style>

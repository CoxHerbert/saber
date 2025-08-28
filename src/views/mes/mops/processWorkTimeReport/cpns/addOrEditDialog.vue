<template>
  <el-drawer v-model="dialogVisible" size="1000" :title="title" @close="doAction('close')">
    <el-select
      v-if="['push-erp', 'add'].includes(pageConfig.action)"
      class="mb-4"
      v-model="planId"
      placeholder="请输入专案号查询选择"
      @change="handleSelectChange"
      :remote-method="remoteMethod"
      reserve-keyword
      filterable
      remote
      clearable
    >
      <el-option
        v-for="item in options"
        :key="item.id"
        :label="`${item.mtoNo}-${item.billNo}-${item.materialNumber}-${item.materialName}`"
        :value="item.id"
      />
    </el-select>
    <el-table
      :style="{
        height: ['push-erp', 'add'].includes(pageConfig.action) ? 'calc(100% - 50px)' : '100%',
      }"
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :row-key="rowKey || 'id'"
      @select="handleSelect"
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
      :row-class-name="tableRowClassName"
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
                v-if="col?.type === 'input'"
                v-model="scoped.row[col.prop]"
                :data="{
                  ...col,
                  props: {
                    ...col.props,
                    max: scoped.row.qty - scoped.row.reportQty,
                  },
                }"
                :dictMaps="dictMaps"
                @change="
                  val => {
                    handleTableItemChange(val, scoped, col);
                  }
                "
              >
              </dc-widget>
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
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="mode === 'add'" type="primary" @click="doAction('submit')">提交</el-button>
        <el-button @click="doAction('close')">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script>
import Api from '@/api/index';
import editDialog from '@/mixins/edit-dialog';
import listEditPage from '@/mixins/list-edit-page';
import tableOptions from './addOrEditDialog.js';

export default {
  emits: ['success'],
  name: 'add-edite-dialog',
  mixins: [editDialog, listEditPage],
  data() {
    return {
      mode: 'add',
      loading: false,
      planId: null,
      columns: tableOptions('add').columns,
      dialogVisible: false,
      title: '新增',
      options: [],
      tableData: [],
      row: null,
      actionsEnum: {
        look: '查看',
        add: '新增',
        'push-erp': '提交ERP',
      },
      pageConfig: {},
    };
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog(config) {
      this.dialogVisible = true;
      this.pageConfig = config;
      this.title = this.actionsEnum[this.pageConfig.action] || '-';
      this.markAsUnsaved();
      this.columns = tableOptions(this.pageConfig.action).columns;
      if (this.pageConfig.action === 'look') {
        this.row = this.pageConfig.row;
        this.getDetail(this.pageConfig.row);
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
    remoteMethod(query) {
      if (query === 'init') {
        this.pageConfig.searchApi().then(res => {
          const {
            code,
            data: { records },
          } = res.data;
          if (code === 200) {
            this.options = records;
          }
        });
      } else if (query) {
        this.pageConfig
          .searchApi({
            mtoNo: query,
          })
          .then(res => {
            const {
              code,
              data: { records },
            } = res.data;
            if (code === 200) {
              this.options = records;
            }
          });
      }
    },
    handleTableItemChange(val, scoped, col) {},
    handleSelectChange(val) {
      Api.mes.mops
        .getItemDetail({
          planId: this.planId,
          isLast: this.pageConfig.action === 'push-erp' || null,
        })
        .then(res => {
          const {
            code,
            data: { itemList },
          } = res.data;
          if (code === 200) {
            this.tableData = itemList;
          }
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
        this.tableData = [];
        this.planId = null;
        this.pageConfig = {};
      } else if (action === 'submit') {
        this.handleSubmit();
      }
    },
    /** 处理提交 **/
    handleSubmit() {
      this.$confirm('确认是否提交本次汇报工时？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true;
          const formData = this.tableData.map(item => {
            return {
              ...item,
              thisReportHour: this.convertTime({
                value: item.thisReportHour,
                from: 'm',
                to: 's',
              }),
            };
          });
          Api.mes.mops
            .saveReport(formData)
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
    },
  },
};
</script>

<style scoped lang="scss"></style>

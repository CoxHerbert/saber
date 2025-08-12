<template>
  <el-drawer
    v-loading="loading"
    v-model="dialogVisible"
    size="1000"
    :title="title"
    @close="doAction('close')"
  >
    <el-table
      :style="{
        height: mode === 'add' ? 'calc(100% - 50px)' : '100%',
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
                v-if="col?.type === 'number'"
                v-model="scoped.row[col.prop]"
                :data="handleTableColProps(scoped, col)"
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
        <el-button type="primary" @click="doAction('submit')">查看标签</el-button>
        <el-button @click="doAction('close')">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script>
import Api from '@/api/index';
import editDialog from '@/mixins/edit-dialog';
import listEditPage from '@/mixins/list-edit-page';
import options from './materialLabelDialog.js';

export default {
  emits: ['success'],
  name: 'add-edite-dialog',
  mixins: [editDialog, listEditPage],
  data() {
    return {
      rowKey: 'id',
      loading: false,
      columns: options('add').columns,
      dialogVisible: false,
      title: '物料标签',
      tableData: [],
    };
  },
  created() {
    // this.dictKeys = [
    //   { key: 'DC_SIP_CHECK_TYPE' },
    //   { key: 'DC_SIP_CHECK_ITEM' },
    //   { key: 'DC_INSPECTION_CLASS' },
    // ];
    // this.getDictData().then(res => {});
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog(ids) {
      this.dialogVisible = true;
      this.title = '物料标签';
      this.markAsUnsaved();
      this.columns = options(this.mode).columns;
      this.getDetail(ids);
    },
    getDetail(ids) {
      this.loading = true;
      const params = {
        entryIds: ids,
      };
      Api.mes.mops
        .getLabelList(params)
        .then(res => {
          const { data, code } = res.data;
          if (code === 200) {
            this.tableData = data.map(item => {
              return { ...item, number: item?.notStockQty, printQty: 1 };
            });
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    handleTableColProps(scoped, col) {
      if (col.prop === 'number') {
        let { row } = scoped;
        return {
          ...col,
          props: {
            ...col.props,
            max: row.notStockQty,
          },
        };
      }
      return col;
    },
    handleTableItemChange(val, scoped, col) {},
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
      } else if (action === 'submit') {
        this.handleSubmit();
      }
    },
    /** 处理提交 **/
    handleSubmit() {
      this.loading = true;
      Api.mes.mops
        .postLabelPdfVo(this.tableData)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            window.open(
              `/api/blade-bip/skip-url/dc/mops/plan/pdf/get-label-pdf?key=${data}`,
              'target'
            );
            this.doAction('close');
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

<style scoped lang="scss"></style>

<template>
  <el-drawer v-model="dialogVisible" size="100%" :title="title" @close="doAction('close')">
    <div class="list-edit-page">
      <el-table
        :style="{
          height: mode === 'add' ? 'calc(100% - 50px)' : '100%',
        }"
        ref="tableRef"
        v-loading="loading"
        :data="fields"
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
                  v-if="
                    coordinate?.rowIndex === scoped.$index &&
                    scoped.cellIndex === coordinate?.cellIndex
                  "
                  v-model="scoped.row[col.prop]"
                  :data="col"
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
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="mode === 'add'" type="primary" @click="doAction('submit')">提交</el-button>
        <el-button @click="doAction('close')">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script>
import {
  getList,
  getDetail,
  add,
  update,
  remove,
  getTableList,
  getTableInfoByName,
  getModelPrototype,
  submitModelPrototype,
  modelPrototypeAdd,
} from '@/api/tool/model';
import Api from '@/api/index';
import editDialog from '@/mixins/edit-dialog';
import listEditPage from '@/mixins/list-edit-page';
import options from './modelConfigDialog.js';
import { entityDic, componentDic, queryDic, switchDic } from '@/const/tool/model';

export default {
  emits: ['success'],
  name: 'add-edite-dialog',
  mixins: [editDialog, listEditPage],
  data() {
    return {
      rowKey: 'id',
      mode: 'add',
      loading: false,
      planId: null,
      columns: options().columns,
      dialogVisible: false,
      title: '新增',
      options: [],
      fields: [],
      modelBox: false,
      dictMaps: {
        entityDic,
        componentDic,
        queryDic,
        switchDic,
      },
    };
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog(row) {
      this.dialogVisible = true;
      this.title = row ? '查看' : '新增';
      this.mode = row ? 'look' : 'add';
      this.markAsUnsaved();
      this.columns = options(this.mode).columns;
      if (row) {
        this.fields = [];
        this.modelBox = true;
        this.modelId = row.id;
        this.datasourceId = row.datasourceId;
        this.getDetail(row);
      }
    },
    handleTableItemChange() {},
    getDetail() {
      this.loading = true;
      getModelPrototype(this.modelId, this.datasourceId)
        .then(res => {
          const result = res.data;
          if (result.success) {
            this.fields = result.data;
            this.fields.forEach(item => {
              item.$cellEdit = true;
              item.modelId = this.modelId;
              // 根据字段物理类型自动适配实体类型
              if (!validatenull(item.name)) {
                item.jdbcName = item.name;
                item.jdbcType = item.propertyType;
                item.jdbcComment = item.comment;
                if (item.propertyType === 'LocalDateTime') {
                  item.propertyType = 'Date';
                  item.propertyEntity = 'java.util.Date';
                } else {
                  entityDic.forEach(d => {
                    if (d.label === item.propertyType) {
                      item.propertyType = d.label;
                      item.propertyEntity = d.value;
                    }
                  });
                }
              }
              // 首次加载配置默认值
              if (validatenull(item.id)) {
                item.isList = 1;
                item.isForm = 1;
                item.isRow = 0;
                item.isRequired = 0;
                item.isQuery = 0;
                item.componentType = 'input';
                // 默认不需要显示的字段名配置
                if (this.hideFields.includes(item.jdbcName)) {
                  item.isList = 0;
                  item.isForm = 0;
                  item.isRequired = 0;
                }
              }
            });
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
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
              thisReportHour: this.hourToSecond(item.thisReportHour),
              thisReportQty: this.hourToSecond(item.thisReportQty),
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

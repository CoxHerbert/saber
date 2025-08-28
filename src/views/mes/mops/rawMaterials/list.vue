<template>
  <div class="list-page raw-materials-list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner" v-if="queryParams.cutStatus === 'DC_MOPS_CUT_STATUS_WCL'">
      <el-button
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('deduct-inventory')"
        >扣库存</el-button
      >
      <el-button
        type="primary"
        :disabled="batchActionDisabled"
        @click="doAction('purchase-request')"
        >采购申请</el-button
      >
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
            :selectable="col.selectable"
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
    <el-dialog
      v-loading="loading"
      :title="dialog.title"
      append-to-body
      v-model="dialog.open"
      width="500px"
    >
      <div class="content">
        <el-form
          ref="formRef"
          :model="dialog.formData"
          :label-suffix="':'"
          :rules="dialog.rules"
          label-width="95px"
        >
          <el-form-item label="需求部门" prop="requestDeptName">
            <wf-select-single
              v-model="dialog.formData.requestDeptName"
              objectName="purchaseRepuestOrder"
              @change="val => handleFormItemChange('requestDeptName', val)"
            />
          </el-form-item>
        </el-form>
        <el-table :data="dialog.formData?.item || []" row-key="id" border>
          <template v-for="(col, i) in dialogColumns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :align="col.align"
              :width="col.width"
              :selectable="col.selectable"
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
                <el-input-number v-if="col.prop === 'number'" v-model="scoped.row[col.prop]" />
                <dc-field-view
                  v-else
                  :value="col?.transVal ? col?.transVal(scoped) : scoped.row[col.prop]"
                  :data="col"
                  :dictMaps="dictMaps"
                />
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <template #footer>
        <div class="footer">
          <el-button type="primary" @click="doAction('submit')">确定</el-button>
          <el-button @click="doAction('close')">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import pageConfig from './list';
import Api from '@/api';

export default {
  mixins: [listPage],
  name: 'raw-materials-list-page',
  data() {
    return {
      mode: 'customize',
      columns: [],
      dialogColumns: [],
      queryParams: {
        current: 1,
        size: 20,
      },
      dialog: {
        title: '采购申请',
        open: false,
        formData: {},
        rules: {
          requestDeptName: [{ required: true, message: '请选择需求部门', trigger: 'blur' }],
        },
      },
    };
  },
  created() {
    this.columns = pageConfig.options().columns;
    this.dialogColumns = pageConfig.dialogOptions().columns;
    this.dictKeys = [{ key: 'DC_RAW_MATERIAL_TYPE' }, { key: 'DC_MOPS_CUT_STATUS' }];
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.searchConfig.resetExcludeKeys = ['page', 'current', 'cutStatus'];
      this.searchConfig.tabConfig = {
        prop: 'cutStatus',
        items: this.dictMaps.DC_MOPS_CUT_STATUS.map(dict => {
          return {
            label: dict.dictValue,
            value: dict.dictKey,
          };
        }),
      };
      this.queryParams.cutStatus = 'DC_MOPS_CUT_STATUS_WCL';
      this.getData();
    });
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      Api.mes.mops
        .getBomList(this.queryParams)
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
      if (action === 'purchase-request') {
        this.dialog.open = true;
        this.dialog.title = '采购申请';
        this.dialog.formData.item = this.batchSelectRows.map(item => {
          return {
            id: item.id,
            materialId: item.rawMaterialId,
            materialNumber: item.rawMaterialNumber,
            number: item.demandCount,
            mtoNo: item.mtoNo,
          };
        });
      } else if (action === 'submit') {
        this.handleSubmitForm();
      } else if (action === 'close') {
        this.handleClose();
      } else if (action === 'deduct-inventory') {
        this.handleDeductInventory();
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
    handleFormItemChange(prop, val) {
      this.dialog.formData.requestDeptId = val.id;
      this.dialog.formData.requestDeptCode = val.code;
      this.dialog.formData.requestDeptName = val.name;
    },
    /** 处理扣库存 **/
    handleDeductInventory() {
      const ids = this.batchSelectRows.map(row => row.id);
      const billNos = this.batchSelectRows.map(row => row.billNo);
      this.$confirm(`确认将单据编号为“[${billNos}]”的数据项扣库存吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => Api.mes.mops.postInventoryDeduction({ ids }))
        .then(() => {
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          this.handleReset();
        })
        .catch(err => {});
    },
    /** 处理表单提交 **/
    handleSubmitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.loading = true;
          Api.mes.mops
            .postRepuestOrder(this.dialog.formData)
            .then(res => {
              const { code, data } = res.data;
              if (code === 200) {
                this.$message.success('操作成功');
                this.handleClose();
                this.getData();
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
              console.log(err);
              this.handleClose();
            });
        }
      });
    },
    handleClose() {
      this.dialog = {
        title: '采购申请',
        open: false,
        formData: {},
        rules: {
          requestDeptName: [{ required: true, message: '请选择需求部门', trigger: 'blur' }],
        },
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.raw-materials-list-page {
}
</style>

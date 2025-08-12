<template>
  <el-dialog v-model="dialogVisible" width="500" :title="title" @close="cancel" v-loading="loading">
    <el-form ref="ruleFormRef" :model="formData" label-width="auto">
      <template v-for="(col, i) in columns" :key="col.prop + i">
        <el-form-item
          v-if="!col?.display"
          :label="col.label"
          :prop="col.prop"
          :rules="getColumnRules(col)"
        >
          <dc-widget
            :data="col"
            :dictMaps="dictMaps"
            v-model="formData[col.prop]"
            @change="
              val => {
                handleFormItemChange(col, val);
              }
            "
          />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="cancel()">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import dayjs from 'dayjs';
import Api from '@/api/index';
import editDialog from '@/mixins/edit-dialog';
import options from './addEditeDialog.js';
export default {
  emits: ['success'],
  name: 'add-edite-dialog',
  mixins: [editDialog],
  data() {
    return {
      loading: true,
      columns: options().columns,
      dialogVisible: false,
      formData: {},
      ids: [],
      title: '新增',
      isCopyMode: false,
    };
  },
  created() {
    this.handleDictKeys();
    this.getDictData().then(res => {});
  },
  methods: {
    /** 处理表单项变化 **/
    handleFormItemChange(col, val) {
      if (col.prop === 'checkType') {
        if (this.formData.checkType === 'DC_SIP_CHECK_TYPE_MR') {
          this.formData.materialIdCollection = null;
          this.columns.forEach(col => {
            if (['materialIdCollection', 'materialNumberCollection'].includes(col.prop)) {
              col.display = true;
            }
          });
        } else {
          if (this.formData.checkType === 'DC_SIP_CHECK_TYPE_ZA') {
            this.formData.materialNumberCollection = '';
            this.columns
              .filter(col => {
                col.display = false;
                return col.label === '物料' || col.label === '标识';
              })
              .forEach(col => (col.display = true));
          } else if (this.formData.checkType === 'DC_SIP_CHECK_TYPE_WL') {
            this.formData.materialNumberCollection = '';
            this.columns
              .filter(col => {
                col.display = false;
                return col.label === '专案' || col.label === '标识';
              })
              .forEach(col => (col.display = true));
          } else if (this.formData.checkType === 'DC_SIP_CHECK_TYPE_BS') {
            this.formData.materialIdCollection = '';
            this.columns
              .filter(col => {
                col.display = false;
                return col.label === '专案' || col.label === '物料';
              })
              .forEach(col => (col.display = true));
          } else if (this.formData.checkType === 'DC_SIP_CHECK_TYPE_MR') {
            this.formData.materialIdCollection = '';
            this.formData.materialNumberCollection = '';
            this.columns
              .filter(col => {
                col.display = false;
                return col.label === '专案' || col.label === '物料' || col.label === '标识';
              })
              .forEach(col => (col.display = true));
          }
        }
      } else if (col.prop === 'materialIdCollection') {
        if (this.formData.checkType === 'DC_SIP_CHECK_TYPE_ZA') {
          console.log('DC_SIP_CHECK_TYPE_ZA', val);
          this.formData.materialIdCollection = val.map(item => item.billNo).join(',');
        } else if (this.formData.checkType === 'DC_SIP_CHECK_TYPE_WL') {
          console.log('DC_SIP_CHECK_TYPE_WL', val);
          this.formData.materialIdCollection = val.map(item => item.fnumber).join(',');
        }
      }
    },
    /** 打开添加弹窗 **/
    openDialog(row, isCopy) {
      this.dialogVisible = true;
      this.isCopyMode = !!isCopy;
      this.title = row ? (this.isCopyMode ? '复制' : '编辑') : '新增';
      this.formData = row ? JSON.parse(JSON.stringify(row)) : {};
      this.handleFormItemChange({
        prop: 'checkType',
      });
      if (![undefined, null].includes(row?.materialNumberCollection)) {
        this.formData.materialNumberCollection = row?.materialNumberCollection;
      }
      if (![undefined, null].includes(row?.materialIdCollection)) {
        this.formData.materialIdCollection = row?.materialIdCollection;
      }
      if (![undefined, null].includes(row?.isConfig)) {
        this.formData.isConfig = String(row?.isConfig);
      }
    },
    // 弹出框提交表单
    submitForm() {
      this.$refs.ruleFormRef.validate(async valid => {
        if (valid) {
          this.loading = true;
          let newrow = Object.assign(this.formData, {});
          newrow.configDate = dayjs().valueOf();
          if (
            Array.isArray(newrow.materialNumberCollection) &&
            newrow.materialNumberCollection.length > 0
          ) {
            let list = newrow.materialNumberCollection.map(item => {
              return item.fnumber;
            });
            newrow.materialNumberCollection = list.join(',');
          }
          Api.qms.sn
            .sipOrderSubmit({
              ...newrow,
              id: this.isCopyMode ? undefined : newrow.id,
              copyId: this.isCopyMode ? newrow.id : undefined,
            })
            .then(res => {
              const { code, msg } = res.data;
              if (code === 200) {
                this.cancel();
                this.$emit('success');
                this.$message.success(msg);
              }
              this.loading = false;
            });
        }
      });
    },
    cancel() {
      this.dialogVisible = false;
      this.$refs.ruleFormRef.resetFields();
      this.formData = {};
    },
  },
};
</script>

<style scoped lang="scss">
.dialog-search-box {
  width: 600px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 50%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 120px);
    }
  }
}
</style>

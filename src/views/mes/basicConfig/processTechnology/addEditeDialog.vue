<template>
  <el-dialog v-model="dialogVisible" width="500" :title="title" @close="doAction('close')">
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
        <el-button type="primary" @click="doAction('submit')">提交</el-button>
        <el-button @click="doAction('close')">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
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
      title: '新增',
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {});
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog(row) {
      this.dialogVisible = true;
      this.title = row ? '编辑' : '新增';
      this.formData = row
        ? JSON.parse(
            JSON.stringify({
              ...row,
              isOutSource: [true, false].includes(row.isOutSource) ? row.isOutSource : false,
            })
          )
        : {
            isOutSource: false,
          };
      this.formData.standardWorkingHour = this.secondToHour(this.formData.standardWorkingHour);
    },
    /** 处理表单项变化 **/
    handleFormItemChange(col, val) {},
    /** 页面操作 **/
    doAction(action) {
      if (action === 'close') {
        this.dialogVisible = false;
        this.$refs.ruleFormRef.resetFields();
        this.formData = {};
      } else if (action === 'submit') {
        this.handleSubmit();
      }
    },
    /** 处理提交 **/
    handleSubmit() {
      this.$refs.ruleFormRef.validate(valid => {
        if (valid) {
          this.loading = true;
          const form = {
            ...this.formData,
            standardWorkingHour: this.hourToSecond(this.formData.standardWorkingHour),
          };
          console.log(form);
          Api.mes.basicConfig
            .technologyConfigSubmit(form)
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
        }
      });
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

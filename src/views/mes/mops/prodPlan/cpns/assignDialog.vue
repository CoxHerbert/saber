<template>
  <el-dialog
    v-loading="loading"
    v-model="dialogVisible"
    width="500"
    :title="title"
    @close="doAction('close')"
  >
    <el-form ref="formRef" label-width="80px" :model="formData" label-suffix=":" :rules="rules">
      <el-form-item label="指派人" prop="userId">
        <dc-select-user v-model="formData.userId" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="doAction('close')">关闭</el-button>
        <el-button type="primary" @click="doAction('submit')">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import Api from '@/api/index';

export default {
  emits: ['success'],
  name: 'assign-dialog',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      title: '指派',
      formData: {},
      rules: {
        userId: [
          {
            required: true,
            message: '请选择指派人',
            trigger: ['blur', 'change'],
          },
        ],
      },
    };
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog(ids) {
      this.dialogVisible = true;
      this.title = '指派';
      this.formData = {
        entryId: ids,
      };
    },
    /** 页面操作 **/
    doAction(action) {
      if (action === 'close') {
        this.dialogVisible = false;
        this.formData = {};
      } else if (action === 'submit') {
        this.handleSubmit();
      }
    },
    /** 处理提交 **/
    handleSubmit() {
      this.$refs.formRef.validate().then(valid => {
        if (valid) {
          this.loading = true;
          Api.mes.mops
            .postAssignUser(this.formData)
            .then(res => {
              const { code } = res.data;
              if (code === 200) {
                this.doAction('close');
                this.$emit('success');
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

<style scoped lang="scss"></style>

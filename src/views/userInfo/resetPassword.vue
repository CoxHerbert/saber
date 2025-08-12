<template>
  <basic-container class="reset-password-container">
    <div class="wrap">
      <div class="wrap-title">重置密码</div>
      <el-form
        ref="ruleFormRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        status-icon
        :inline="false"
      >
        <el-form-item label="旧密码" prop="oldPw">
          <el-input v-model="formData.oldPw" show-password placeholder="请输入旧密码" />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="formData.newPassword" show-password placeholder="请输入新密码" />
        </el-form-item>

        <el-form-item label="验证新密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <div>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
  </basic-container>
</template>

<script setup name="ResetPassword">
import Api from '@/api/index';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();
const router = useRouter();
const ruleFormRef = ref(null);

const data = reactive({
  formData: {
    oldPw: '',
    newPassword: '',
    confirmPassword: '',
  },
  rules: {
    oldPw: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 16, message: '密码长度需为6-16位', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== data.formData.newPassword) {
            callback(new Error('两次输入的新密码不一致'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
  },
});

const { formData, rules } = toRefs(data);

const handleSubmit = () => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      console.log(formData.value);
      Api.system.user
        .checkOldPw(formData.value)
        .then(res => {
          const { code } = res.data;
          if (code === 200) {
            const form = {
              oldPassword: formData.value.oldPw,
              newPassword: formData.value.newPassword,
            };
            Api.system.user
              .updatePassword(form)
              .then(res => {
                const { code, msg } = res.data;
                if (code === 200) {
                  proxy.$message.success('密码修改成功');
                  proxy.$store.dispatch('GetUserInfo').then(() => {
                    router.push({ path: '/desk/index' });
                  });
                }
              })
              .catch(err => console.log(err));
          }
        })
        .catch(err => console.log(err));
    }
  });
};

const handleReset = () => {
  ruleFormRef.value.resetFields();
};
</script>

<style lang="scss" scoped>
.reset-password-container {
}
.wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 500px;
  margin: 0 auto;
  &-title {
    margin-bottom: 20px;
    font-size: 22px;
    font-weight: 600;
  }
  .el-form {
    width: 100%;
  }
}
</style>

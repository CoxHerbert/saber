<template>
  <div class="reset-pw-page-container">
    <div class="reset-pw-container_logo">
      <img class="logo-icon" src="/img/logo-v2.png" />
    </div>

    <div class="form-container">
      <div class="form-header">
        <el-button type="primary" text @click="logout">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
          <span class="back-text"> 返回登录 </span>
        </el-button>
      </div>
      <div class="form_title">重置密码</div>

      <div class="login-main">
        <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
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
        <el-button class="submit" type="primary" @click="handleSubmit" :round="false"
          >保存</el-button
        >
      </div>
    </div>
  </div>
</template>
<script setup name="ResetPassword">
import Api from '@/api/index';
import { onMounted, reactive, ref } from 'vue';
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

const userInfoAll = computed(() => proxy.$store.getters.userInfoAll);

onMounted(() => {
  switch (userInfoAll.value.pwStatus) {
    case 1:
      proxy.$message.warning('密码为初始密码，请重置密码后使用系统!');
      break;
    case 2:
      proxy.$message.warning('前密码已失效，请更新密码后使用系统!');
      break;
  }
});

const handleSubmit = () => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
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

const logout = () => {
  proxy
    .$confirm(proxy.$t('logoutTip'), proxy.$t('tip'), {
      confirmButtonText: proxy.$t('submitText'),
      cancelButtonText: proxy.$t('cancelText'),
      type: 'warning',
    })
    .then(() => {
      proxy.$store.dispatch('LogOut').then(() => {
        proxy.$router.push({ path: '/login' });
      });
    })
    .catch(() => {});
};
</script>
<style lang="scss">
#wx_reg {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.reset-pw-page-container {
  .el-input {
    border: 1px solid #e5e5e5;
    &__wrapper {
      padding: 5px 10px;
      border: 0px;
    }
    .el-input__wrapper {
      text-indent: 5px;
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      color: #333;
    }
    .is-focus {
      box-shadow: none;
    }
  }
  .form .el-form-item {
    margin-bottom: 18px;
  }
  .login-submit {
    width: 100%;
  }
}
</style>
<style lang="scss" scoped>
.reset-pw-page-container {
  width: 100%;
  height: 100%;
  background-image: url('https://static.eastwinbip.com/static/image/login-bg.webp');
  background-size: cover;
  background-repeat: no-repeat; /* 不重复 */
  background-position: center; /* 居中显示 */
  .reset-pw-container_logo {
    height: 60px;
    position: relative;
    left: 36px;
    top: 20px;
    float: left;
    display: flex;
    align-items: center;
    .logo-icon {
      height: 60px;
    }
    .logo-title {
      font-weight: bold;
      font-size: 28px;
      color: #333;
      line-height: 27px;
    }
  }

  .form-container {
    position: absolute;
    top: 200px;
    right: 160px;
    padding: 70px 64px 110px 36px;
    display: flex;
    flex-direction: column;
    background: #fff;
    width: 500px;
    .form-header {
      padding-left: 20px;
      margin-bottom: 40px;
      .back-icon {
        padding: 2px;
        border: 1px solid #f78431;
        border-radius: 50%;
        margin-right: 5px;
        font-size: 18px;
      }
      .back-text {
        line-height: 32px;
        font-weight: 600;
        font-size: 16px;
        color: #f78431;
      }
    }
    .form_title {
      padding-left: 40px;
      font-weight: bold;
      font-size: 28px;
      color: #333;
      line-height: 32px;
      margin-bottom: 32px;
    }
    .tabs-container {
      width: 65%;
    }
    .submit {
      margin-left: 30px;
      margin-top: 50px;
      width: 375px;
      height: 48px;
      background: #f29346;
      border-radius: 0px 0px 0px 0px;
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
    }
  }
}
</style>
<style lang="scss">
@use '@/styles/login.scss';
</style>

<template>
  <div>
    <basic-container>
      <avue-form
        ref="formRef"
        :option="option"
        v-model="form"
        @tab-change="handleTabClick"
        @submit="handleSubmit"
      ></avue-form>
    </basic-container>
  </div>
</template>

<script>
import option from '@/option/user/info';
import { getUserInfo, updateInfo, updatePassword } from '@/api/system/user';
import md5 from 'js-md5';
import func from '@/utils/func';
import { validatenull } from '@/utils/validate';

export default {
  data() {
    return {
      index: 0,
      option: option,
      form: {},
    };
  },
  created() {
    this.handleWitch();
  },
  methods: {
    handleSubmit(form, done) {
      if (this.$refs.formRef.activeName === '1') {
        updateInfo(form).then(
          res => {
            if (res.data.success) {
              this.$message({
                type: 'success',
                message: '修改信息成功!',
              });
            } else {
              this.$message({
                type: 'error',
                message: res.data.msg,
              });
            }
            done();
          },
          error => {
            window.console.log(error);
            done();
          }
        );
      } else {
        updatePassword(md5(form.oldPassword), md5(form.newPassword), md5(form.newPassword1)).then(
          res => {
            if (res.data.success) {
              this.$message({
                type: 'success',
                message: '修改密码成功!',
              });
            } else {
              this.$message({
                type: 'error',
                message: res.data.msg,
              });
            }
            done();
          },
          error => {
            window.console.log(error);
            done();
          }
        );
      }
    },
    handleWitch() {
      if (this.index === 0) {
        getUserInfo().then(res => {
          const user = res.data.data;

          this.form = {
            id: user.id,
            avatar: user.avatar,
            name: user.name,
            realName: user.realName,
            phone: user.phone,
            email: user.email,
          };
        });
      }
    },
    handleTabClick(tabs) {
      if (validatenull(tabs.index)) {
        return;
      }
      this.index = func.toInt(tabs.index, 0);
      this.handleWitch();
    },
  },
};
</script>

<style></style>

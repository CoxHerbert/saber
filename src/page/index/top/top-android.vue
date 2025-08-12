<template>
  <img class="img-icon" src="/img/layout/icon-android.svg" @click="handleOpen" alt="" />
  <el-dialog class="dialog-pda" v-model="open" title="扫码下载最新版本pda" width="332px">
    <qrcode-vue :value="downloadUrl" :size="300" />
  </el-dialog>
</template>
<script setup>
import { reactive, toRefs } from 'vue';
import QrcodeVue from 'qrcode.vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const data = reactive({
  open: false,
  downloadUrl: '',
});
const { open, downloadUrl } = toRefs(data);

const handleOpen = async () => {
  const res = await Api.system.pda.getAppLatestVersion();
  const { code, data } = res.data;
  if (code === 200) {
    downloadUrl.value = data.downloadUrl;
    open.value = true;
  } else {
    proxy.$message.error('接口异常');
  }
};
</script>
<style lang="scss">
.dialog-pda {
  .el-dialog__body {
    height: 300px;
  }
}
</style>

<style lang="scss" scoped>
.img-icon {
  width: 26px;
  height: 26px;
}
</style>

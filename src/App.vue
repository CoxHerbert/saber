<template>
  <router-view />
</template>
<script>
import { updateSopToken } from '@/api/graphql/index';
import website from '@/config/website';

export default {
  beforeCreate() {
    if (website.urlTokenWhiteList.includes(this.$route.path)) {
      return;
    } else {
      console.log('this.$route.path', this.$route.path);
    }
    if (
      this.$store.state.user.userInfo?.user_name !== 'unauth' &&
      !['/login'].includes(this.$route.path)
    ) {
      updateSopToken();
    }
  },
};
</script>
<style>
html {
  overscroll-behavior-x: none;
}
body {
  transform-origin: 0 0;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
}
.el-drawer__close-btn {
  top: 19px !important;
}
</style>

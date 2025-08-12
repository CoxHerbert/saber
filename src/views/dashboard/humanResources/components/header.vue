<template>
  <div class="header-wrapper">
    <div class="header-left-wrapper">
      <img src="../img/logo.png" alt="" class="logo" />
      <div class="title">项目现场人力看板</div>
    </div>
    <Time />
  </div>
</template>

<script setup>
import Time from './time.vue';
</script>

<style scoped lang="scss">
.header-wrapper {
  padding: 0px 21px 13px 16px;
  box-sizing: border-box;
  width: 100%;
  height: 106px;
  position: relative;
  width: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url('../img/title-main@2x.png');
  display: flex;
  align-items: center;
  justify-content: space-between;
  .header-left-wrapper {
    display: flex;
    align-items: center;
    .logo {
      width: 125px;
      height: 45px;
    }
    .title {
      margin-left: 62px;
      font-weight: 400;
      font-size: 42px;
      line-height: 52px;
      letter-spacing: 10px;
      text-shadow: 0px 8px 8px rgba(0, 0, 0, 0.3);
      text-align: justified;
      font-style: normal;
      text-transform: none;
      color: #edf6ff;
      font-family: 'MyCustomFont', sans-serif;
    }
  }
}

@font-face {
  font-family: 'MyCustomFont';
  src: url('../font/title.ttf') format('woff2');
  font-weight: normal;
  font-style: normal;
}
</style>

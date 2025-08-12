<template>
  <div class="title-wrapper" :class="type == 'long' ? 'long' : 'sort'">
    {{ title }}
  </div>
</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: () => ({}),
  },
  type: {
    type: String,
    default: 'long',
  },
});
</script>

<style lang="scss" scoped>
.title-wrapper {
  width: 100%;
  height: 43px;
  min-height: 43px;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  padding-left: 20px;
  align-items: center;
  font-size: 16px;
  color: #eaf0ff;
  background-image: url('../img/title-bg.png');
  background-size: 100% 100%;
  font-family: 'MyCustomFont', sans-serif;
}

.sort {
  background-image: url('../img/sort-title.png') !important;
  font-size: 21px;
  background-size: 100% 100%;
}

@font-face {
  font-family: 'MyCustomFont';
  src: url('../humanResources//font/title.ttf') format('woff2');
  font-weight: normal;
  font-style: normal;
}
</style>

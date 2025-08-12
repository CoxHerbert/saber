<template>
  <div class="title-wrapper" :class="type == 'long' ? 'long' : 'sort'">
    {{ title }}
    <slot name="right"></slot>
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
    default: 'sort',
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
  justify-content: space-between;
  padding-left: 51px;
  align-items: center;
  font-weight: bold;
  font-size: 21px;
  color: #ffffff;
  letter-spacing: 2px;
  text-shadow: 0px 8px 8px rgba(0, 0, 0, 0.3);
}
.long {
  background-image: url('../img/title-long@2x.png');
  background-size: 100% 100%;
}
.sort {
  background-image: url('../img/title-short@2x.png');
  font-size: 21px;
  background-size: 100% 100%;
}
</style>

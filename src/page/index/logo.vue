<template>
  <div
    class="avue-logo"
    :class="{
      'avue-logo_center': isCollapse,
    }"
  >
    <img class="logo" src="/img/logo.png" alt="logo" v-if="isCollapse" />
    <img class="logo" src="/img/logo-v2.png" alt="logo" v-else />

    <div
      class="avue-breadcrumb"
      :class="[{ 'avue-breadcrumb--active': isCollapse }]"
      v-if="setting.collapse && !isHorizontal"
    >
      <img class="icon" @click="setCollapse" src="/img/layout/icon-collapse.png" alt="" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'logo',
  data() {
    return {};
  },
  created() {},
  computed: {
    ...mapGetters(['setting', 'isCollapse', 'isHorizontal']),
  },
  methods: {
    setCollapse() {
      this.$store.commit('SET_COLLAPSE');
    },
  },
};
</script>

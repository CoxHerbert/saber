<template>
  <el-scrollbar class="avue-menu">
    <div v-if="menus && menus.length == 0 && !isHorizontal" class="avue-sidebar--tip">
      {{ $t('menuTip') }}
    </div>
    <el-menu
      unique-opened
      :default-active="activeMenu"
      :mode="setting.sidebar"
      :collapse="getScreen(isCollapse)"
    >
      <sidebar-item :menu="menus" :activeMenu="activeMenu"></sidebar-item>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex';
import sidebarItem from './sidebarItem.vue';
import { transformTreeDataByMeta } from '@/utils/util';

export default {
  name: 'sidebar',
  components: { sidebarItem },
  inject: ['index'],
  computed: {
    ...mapGetters(['isHorizontal', 'setting', 'menu', 'tag', 'isCollapse']),
    menus() {
      const menuId =
        this.$route.query?.parentMenuId ||
        this.$route.meta?.parentMenuId ||
        this.$route.meta?.menuId;
      const menuObj = this.findRootInTreeArray(this.menu, this.index.clickMenuId || menuId);
      const result = menuObj ? menuObj?.children : [];
      return transformTreeDataByMeta(result);
    },
    activeMenu() {
      const route = this.$route;
      const { meta, name } = route;
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      const result =
        this.$route.query?.parentMenuId || this.$route.meta.parentMenuId || name.split(',')[1];
      return result;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>

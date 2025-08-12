<template>
  <template v-for="item in menu">
    <el-menu-item
      :index="getPath(item)"
      @click="open(item)"
      :class="{
        'dc-active': activeMenu === item.id,
      }"
      :key="item[labelKey]"
      v-if="item.path === '/desk/myprocess' || item.path === '/desk/myTask'"
    >
      <i :class="item[iconKey]"></i>
      <template #title>
        <el-badge
          :value="workCountStatistic[workCountStatisticKeys[item.path]]"
          :max="99"
          :offset="[10, 15]"
          v-if="workCountStatistic[workCountStatisticKeys[item.path]] > 0"
        >
          <span :alt="item[pathKey]">{{ getTitle(item) }}</span>
        </el-badge>
        <span :alt="item[pathKey]" v-else>{{ getTitle(item) }} </span>
      </template>
    </el-menu-item>
    <el-menu-item
      v-else-if="validatenull(item[childrenKey]) && validRoles(item)"
      :index="getPath(item)"
      @click="open(item)"
      :class="{
        'dc-active': activeMenu === item.id,
      }"
      :key="item[labelKey]"
    >
      <i :class="item[iconKey]"></i>
      <template #title>
        <span :alt="item[pathKey]">{{ getTitle(item) }}</span>
      </template>
    </el-menu-item>
    <el-sub-menu
      v-else-if="!validatenull(item[childrenKey]) && validRoles(item)"
      :index="getPath(item)"
      :key="item[labelKey]"
      class="dc-submenu-item"
      :class="{
        'active-sub': checkIsActive(item),
      }"
    >
      <template #title>
        <i :class="item[iconKey]"></i>
        <span>{{ getTitle(item) }}</span>
      </template>
      <template v-for="(child, cindex) in item[childrenKey]" :key="child[labelKey]">
        <el-menu-item
          :index="getPath(child)"
          @click="open(child)"
          :class="{
            'dc-active': activeMenu === child.id,
          }"
          v-if="validatenull(child[childrenKey])"
        >
          <i :class="child[iconKey]"></i>
          <template #title>
            <span>{{ getTitle(child) }}</span>
          </template>
        </el-menu-item>
        <sidebar-item v-else :menu="[child]" :key="cindex" :active-menu="activeMenu"></sidebar-item>
      </template>
    </el-sub-menu>
  </template>
</template>
<script>
import { mapGetters } from 'vuex';
import { validatenull } from 'utils/validate';
import website from '@/config/website';

export default {
  name: 'sidebarItem',
  data() {
    return {
      props: website.menu,
      key: 'id',
      workCountStatisticKeys: {
        '/desk/myprocess': 'processCount',
        '/desk/myTask': 'taskCount',
      },
    };
  },
  props: {
    menu: Array,
    activeMenu: {
      type: String,
      default() {
        return '';
      },
    },
  },
  computed: {
    ...mapGetters(['roles', 'workCountStatistic']),
    labelKey() {
      return this.props.label;
    },
    pathKey() {
      return this.props.path;
    },
    queryKey() {
      return this.props.query;
    },
    iconKey() {
      return this.props.icon;
    },
    childrenKey() {
      return this.props.children;
    },
  },
  methods: {
    validatenull,
    getPath(item) {
      return item[this.key];
      // return item[this.pathKey];
    },
    getTitle(item) {
      return this.$router.$avueRouter.generateTitle(item, this.props);
    },
    validRoles(item) {
      item.meta = item.meta || {};
      return item.meta.roles ? item.meta.roles.includes(this.roles) : true;
    },
    checkIsActive(item) {
      const isMatched = this.$route.matched.find(m => m.path === item.path);
      return isMatched;
    },
    open(item) {
      switch (item.routeType) {
        case 'menu_route_type_iframe':
        case 'menu_route_type_inside':
          this.$router.push({
            path: item[this.pathKey],
            query: item[this.queryKey],
          });
          break;
        case 'menu_route_type_outside':
          if (item.query.url.startsWith('http://') || item.query.url.startsWith('https://')) {
            window.open(item.query.url, '_blank');
          } else {
            console.error('URL 格式不正确:', url);
          }
          break;
      }
    },
  },
};
</script>
<style lang="scss">
.dc-submenu-item {
  &.active-sub > .el-sub-menu__title:first-child {
    span {
      color: #333333;
    }
    font-weight: bold;
    .iconfont {
      color: var(--el-color-primary);
    }
  }
}
</style>

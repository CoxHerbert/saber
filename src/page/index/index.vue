<template>
  <div class="avue-contail" :class="{ 'avue--collapse': isCollapse }">
    <div class="avue-layout" :class="{ 'avue-layout--horizontal': isHorizontal }">
      <div class="avue-sidebar sidebar-fix" v-show="validSidebar">
        <!-- 左侧导航栏 -->
        <logo />
        <sidebar />
      </div>
      <div class="avue-main">
        <!-- 顶部导航栏 -->
        <top ref="top" />
        <!-- 顶部标签卡 -->
        <tags />
        <search class="avue-view" v-show="isSearch"></search>
        <!-- 主体视图层 -->
        <div id="avue-view" v-show="!isSearch" v-if="isRefresh">
          <router-view #="{ Component }">
            <keep-alive :include="$store.getters.tagsKeep">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import index from '@/mixins/index';
import { mapGetters } from 'vuex';
import tags from './tags.vue';
import search from './search.vue';
import logo from './logo.vue';
import top from './top/index.vue';
import sidebar from './sidebar/index.vue';

export default {
  mixins: [index],
  components: {
    top,
    logo,
    tags,
    search,
    sidebar,
  },
  name: 'index',
  provide() {
    return {
      index: this,
    };
  },
  data() {
    return {
      clickMenuId: null,
    };
  },
  computed: {
    ...mapGetters(['isHorizontal', 'isRefresh', 'isCollapse', 'isSearch', 'menuAll']),
    validSidebar() {
      return !(
        (this.$route.meta || {}).menu === false || (this.$route.query || {}).menu === 'false'
      );
    },
  },
  props: [],
  async mounted() {
    await this.$store.dispatch('UpdateWorkCountStatistic');
  },
  methods: {
    //打开菜单
    async openMenu(item = {}) {
      if (item && typeof item.path === 'string' && item.path !== '') {
        this.clickMenuId = item.id;
        // this.$router.push(item.path).catch(err => {
        //   console.error('Routing error:', err);
        // });
      } else {
        return false;
      }
    },
  },
};
</script>

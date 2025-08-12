<template>
  <div class="avue-top">
    <div class="top-bar__title"><top-menu></top-menu></div>
    <div class="top-bar__right">
      <!-- <top-search class="top-bar__item" v-if="setting.search"></top-search> -->
      <div class="top-bar__item">
        <top-notice></top-notice>
      </div>
      <div class="top-bar__item" v-if="!!isCurl">
        <top-curl></top-curl>
      </div>
      <div class="top-bar__item">
        <top-android></top-android>
      </div>
      <div class="top-bar__item">
        <top-full></top-full>
      </div>
      <!-- <div class="top-bar__item">
        <top-lang></top-lang>
      </div> -->
      <div class="top-bar__item" v-if="menuManage">
        <div class="menu" @click="openMenu(menuManage)">
          <i class="menu_icon" :class="menuManage.source" />
        </div>
      </div>
      <!-- <top-notice /> -->
      <div class="top-user">
        <img class="top-bar__img" :src="userInfo.avatar" />
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ userInfo.real_name }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- <el-dropdown-item>
                <router-link to="/">{{ $t('navbar.dashboard') }}</router-link>
              </el-dropdown-item> -->
              <el-dropdown-item>
                <router-link to="/info/index">{{ $t('navbar.userinfo') }}</router-link>
              </el-dropdown-item>
              <el-dropdown-item @click="logout" divided
                >{{ $t('navbar.logOut') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import topMenu from './top-menu.vue';
// import topSearch from './top-search.vue';
// import topLang from './top-lang.vue';
import topFull from './top-full.vue';
import topNotice from './top-notice.vue';
import topAndroid from './top-android.vue';
import topCurl from './top-curl.vue';

export default {
  components: {
    topMenu,
    // topSearch,
    // topLang,
    topFull,
    topNotice,
    topAndroid,
    topCurl,
  },
  name: 'top',
  data() {
    return {};
  },
  filters: {},
  inject: ['index'],
  created() {},
  computed: {
    ...mapGetters(['setting', 'userInfo', 'menu']),
    hasUnsavedChanges() {
      return this.$store.state.page.hasUnsavedChanges;
    },
    menuManage() {
      if (Array.isArray(this.menu)) {
        return this.menu.find(({ id }) => id === '1872121685527564290');
      } else {
        return false;
      }
    },
    isCurl() {
      return this.$route.query.isCurl;
    },
  },
  methods: {
    setCollapse() {
      this.$store.commit('SET_COLLAPSE');
    },
    logout() {
      if (this.hasUnsavedChanges) {
        this.$confirm('当前页面有未保存的数据，确定要离开吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.logout_();
        });
      } else {
        this.logout_();
      }
    },
    logout_() {
      this.$confirm(this.$t('logoutTip'), this.$t('tip'), {
        confirmButtonText: this.$t('submitText'),
        cancelButtonText: this.$t('cancelText'),
        type: 'warning',
      })
        .then(() => {
          this.$store.dispatch('updateHasUsavedChanges', false);
          this.$store.dispatch('LogOut').then(() => {
            this.$router.push({ path: '/login' });
          });
        })
        .catch(() => {});
    },
    openMenu(item) {
      if (this.hasUnsavedChanges) {
        this.$confirm('当前页面有未保存的数据，确定要离开吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.$store.dispatch('updateHasUsavedChanges', false);
          this.index.openMenu(item);
        });
      } else {
        this.index.openMenu(item);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.menu_icon {
  font-size: 18px;
  font-weight: 600;
}
</style>

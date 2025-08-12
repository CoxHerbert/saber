<template>
  <div class="header-menu">
    <!-- 菜单按钮 -->
    <div class="menus-default">
      <div
        class="menu"
        :class="{
          'active-menu': menu?.id === menuObj?.id,
        }"
        v-for="(menu, index) in defaultMenus"
        @click="openMenu(menu, index)"
        :key="index"
      >
        <span class="menu_text" v-if="menu?.id === '1872118955253764097'">
          <el-badge :value="totalCount" :max="99" v-if="totalCount > 0">{{ menu?.name }}</el-badge>
          <span v-else>{{ menu?.name }}</span>
        </span>
        <span class="menu_text" v-else>{{ menu?.name }}</span>
      </div>
    </div>
    <div
      class="menu-wrap"
      :class="{
        'active-menu': findMenuGroup?.id === menuObj?.id,
      }"
      @click="visibleMask = !visibleMask"
    >
      <img
        class="icon"
        v-if="findMenuGroup?.id === menuObj?.id"
        src="/img/layout/icon-menu_active.png"
        alt=""
      />
      <img class="icon" v-else src="/img/layout/icon-menu.png" alt="" />
      <div class="menu-title" v-if="findMenuGroup">{{ menuObj?.name }}</div>
    </div>
    <!-- 菜单 -->
    <div v-if="visibleMask" class="menu-box">
      <div class="menu-content">
        <div
          v-for="(item, index) in menuGroup"
          :key="index"
          :index="item.id + ''"
          @click="openMenu(item)"
          class="menu-item"
        >
          <i class="menu-item_icon" :class="item.source" style="padding-right: 5px"></i>
          <span class="menu-item_text">{{ item.name }}</span>
        </div>
      </div>
    </div>
    <!-- 遮罩层 -->
    <div v-if="visibleMask" class="mask" @click="visibleMask = !visibleMask"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'top-menu',
  data() {
    return {
      visibleMask: false,
    };
  },
  inject: ['index'],
  created() {
    this.$router.$avueRouter.formatRoutes(this.menu, true);
  },
  computed: {
    ...mapGetters(['menu', 'workCountStatistic']),
    hasUnsavedChanges() {
      return this.$store.state.page.hasUnsavedChanges;
    },
    totalCount() {
      const { processCount, taskCount } = this.workCountStatistic;
      return (processCount || 0) + (taskCount || 0);
    },
    defaultMenus() {
      return this.menu?.filter(
        ({ id }) =>
          id === '1872118955253764097' ||
          id === '1872119173441458177' ||
          id === '1872120151091777537'
      );
    },
    menuGroup() {
      return this.menu?.filter(
        ({ id }) =>
          id !== '1872118955253764097' &&
          id !== '1872119173441458177' &&
          id !== '1872121685527564290' &&
          id !== '1872120151091777537'
      );
    },
    menuObj() {
      const menuId =
        this.$route.query?.parentMenuId ||
        this.$route.meta?.parentMenuId ||
        this.$route.meta?.menuId;
      const menuObj = this.findRootInTreeArray(this.menu, menuId);
      return menuObj;
    },
    findMenuGroup() {
      return this.menuGroup.find(item => item.id === this.menuObj?.id) || null;
    },
  },
  methods: {
    openMenu(item) {
      if (this.hasUnsavedChanges) {
        this.$confirm('当前页面有未保存的数据，确定要离开吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.$store.dispatch('updateHasUsavedChanges', false);
          this.index.openMenu(item);
          this.visibleMask = false;
        });
      } else {
        this.index.openMenu(item);
        this.visibleMask = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.active-menu {
  .menu-title,
  .menu_text {
    color: #f78431 !important;
  }
}
.header-menu {
  display: flex;
  align-items: center;
  overflow: auto;
  height: 100%;
  .menu-wrap {
    display: flex;
    align-items: center;
    cursor: pointer;
    .menu-title {
      margin-left: 8px;
      font-weight: bold;
      font-size: 14px;
      color: #333;
      line-height: 14px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
    .icon {
      width: 24px;
      height: 24px;
    }
  }
  .menus-default {
    margin-right: 16px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 20px;
    border-right: 1px solid #e5e5e5;
    .menu {
      display: flex;
      align-items: center;
      cursor: pointer;

      .iconfont {
        font-size: 24px;
      }
      &_icon {
        padding: 0;
      }
      &_text {
        font-weight: bold;
        font-size: 14px;
        color: #333;
        line-height: 24px;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }
    }
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0;
    z-index: 999;

    .menu-box {
      z-index: 1000;
    }
  }
  .menu-box {
    box-sizing: border-box;
    width: 380px;
    height: auto;
    background: #fff;
    border: 1px solid#e5e5e5;
    position: absolute;
    top: 55px;
    left: -1px;
    z-index: 9999;
    .menu-content {
      padding: 0;
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      margin: 12px;
      gap: 12px;
      overflow: scroll;

      .menu-item {
        padding: 10px 0;
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;
        width: calc((100% - 12px * 3) / 4);
        justify-content: space-around;
        align-items: center;
        background: #f0f2f5;

        &_icon {
          padding: 0;
          width: 40px;
          height: 40px;
          line-height: 40px;
          font-size: 40px;
        }
        &_text {
          margin-top: 5px;
          font-weight: 400;
          font-size: 12px;
          color: #333;
          line-height: 12px;
          text-align: left;
          font-style: normal;
        }
      }
    }
  }
}
</style>

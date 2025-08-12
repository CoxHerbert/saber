<template>
  <div class="page-workflow-history">
    <div class="header">
      <div class="title">
        流程查询 <span v-if="currentNode">({{ currentNode.name }})</span>
      </div>
    </div>
    <div class="content">
      <div
        class="left-panel"
        :class="{
          hide: !showLeft,
        }"
      >
        <div class="handler" @click="totggleLeft">
          <svg
            width="16"
            height="50"
            viewBox="0 0 16 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0 L16 8 L16 42 L0 50 Z" fill="#FFF" stroke="#e5e5e5" />
          </svg>
        </div>
        <div class="left-content">
          <div class="search-box">
            <el-input
              v-model="processSearchKey"
              placeholder="请输入关键字"
              prefix-icon="Search"
              clearable
            />
          </div>
          <el-scrollbar height="calc(100% - 60px)" width="100%">
            <div class="tree-box">
              <el-tree
                ref="menuTreeRef"
                :data="menus"
                default-expand-all
                @node-click="menuNodeClick"
                :current-node-key="queryParams.id"
                :default-expanded-keys="defaultExpandKeys"
                node-key="id"
                :filter-node-method="menuFilterNode"
              >
                <template #default="{ data }">
                  <div
                    class="default-node"
                    :class="{
                      'is-active': data.id === queryParams.id || $route.path === data.path,
                    }"
                  >
                    {{ data.name }}
                  </div>
                </template>
              </el-tree>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div
        class="router-box"
        :class="{
          hide: showLeft,
        }"
      >
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  inject: ['index'],
  data() {
    return {
      processSearchKey: '',
      queryParams: {},
      showLeft: true,
      menuData: [],
      defaultExpandKeys: [],
      currentNode: null,
    };
  },
  computed: {
    ...mapGetters(['menu']),
    menus() {
      const menuId = this.$route.meta?.menuId;
      const menuObj = this.findRootInTreeArray(this.menu, this.index.clickMenuId || menuId);
      const result = menuObj.children?.find(m => m.id === menuId)?.children_ || [];
      this.defaultExpandKeys = [result?.[0]?.id];
      return result;
    },
  },
  watch: {
    processSearchKey: {
      handler(val) {
        this.$refs.menuTreeRef.filter(val);
      },
    },
    '$route.path': {
      handler(val) {
        if (this.$route.path === '/desk/workflow-history') {
          this.$router.push({
            path: '/desk/workflow-history/HR/driving-record',
            query: {
              parentMenuId: '1932365219625013249',
            },
          });
          const currentNode = this.findByPath(
            this.menus,
            '/desk/workflow-history/HR/driving-record'
          );
          this.queryParams.id = currentNode?.id;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.$route.path === '/desk/workflow-history') {
      this.$router.push({
        path: '/desk/workflow-history/HR/driving-record',
        query: {
          parentMenuId: '1932365219625013249',
        },
      });
      const currentNode = this.findByPath(this.menus, '/desk/workflow-history/HR/driving-record');
      this.queryParams.id = currentNode?.id;
    } else {
      const currentNode = this.findByPath(this.menus, this.$route.path);
      this.queryParams.id = currentNode?.id;
    }
  },
  methods: {
    findByPath(treeData, path) {
      let result = null;
      (treeData || []).forEach(d => {
        if (d.children?.length > 0) {
          result = this.findByPath(d.children, path);
        } else {
          if (d.path === path) {
            result = d;
          }
        }
      });
      return result;
    },
    menuNodeClick(node) {
      if (node.children?.length > 0) {
        return;
      }
      this.queryParams.id = node.id;
      this.currentNode = node;
      this.$router.push({
        path: node.path,
        query: {
          parentMenuId: '1932365219625013249',
        },
      });
    },
    totggleLeft() {
      this.showLeft = !this.showLeft;
    },
    menuFilterNode(value, data) {
      if (!value) return true;
      return data.name.includes(value);
    },
  },
};
</script>
<style lang="scss">
.page-workflow-history {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  background-color: #fff;
  .header {
    height: 48px;
    .title {
      padding-left: 24px;
      padding-top: 8px;
      font-size: 16px;
      font-weight: bold;
      line-height: 32px;
    }
    border-bottom: 1px solid #e5e5e5;
  }
  .content {
    flex: 1;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }
  .left-panel {
    position: relative;
    width: 200px;
    transition: all ease-in 0.2s;
    border-right: 1px solid #e5e5e5;

    .handler {
      width: 16px;
      height: 50px;
      position: absolute;
      left: 100%;
      top: 45%;
      cursor: pointer;
      z-index: 100;
      svg {
        fill: #333;
      }

      &::after {
        content: ' ';
        position: absolute;
        left: 4px;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        width: 1px;
        height: 1px;
        border: 6px solid transparent;
        border-right-color: #666;
      }
    }

    &.hide {
      width: 0;
      .left-content {
        display: none;
      }
      .handler::after {
        left: 12px;
        border-right-color: transparent;
        border-left-color: #666;
      }
    }
  }
  .router-box {
    flex: 1;
    box-sizing: border-box;
    padding-left: 6px;

    &.hide {
      width: calc(100% - 200px);
    }
  }

  .left-content {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    box-sizing: border-box;
    overflow: hidden;
    .tree-box {
      padding: 8px 12px;
      width: 100%;

      .el-tree-node.is-current {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    .search-box {
      padding: 8px;
    }
  }
}
</style>

<template>
  <div class="page-workflow-history">
    <div class="header">
      <div class="title">
        考核记录
        <span v-if="currentNode">({{ currentNode.name ? currentNode.name : '一级部门考核' }})</span>
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
              <!-- {{ menus }} -->
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
      const result = this.findMenuChildrenRecursive(menuObj.children || [], menuId);
      // 过滤掉 code 等于 'ceishi' 的对象
      const filteredResult = result.filter(item => item.code !== 'ceishi');
      this.defaultExpandKeys = [filteredResult?.[0]?.id];
      return filteredResult;
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
        if (this.$route.path === '/system/companyUser/comprouter') {
          // console.log(this.$route.path);
          // return;
          this.$router.push({
            path: '/system/companyUser/comprouter/index',
            query: {
              templateId: '2001',
              parentMenuId: '1948179894740680706',
            },
          });
          const currentNode = this.findByPath(this.menus, '/system/companyUser/comprouter/index');
          this.queryParams.id = currentNode?.id;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.menus?.length) {
      this.menuNodeClick(this.menus[0]);
    }
    // this.menuNodeClick(this.menus[1]);
  },
  methods: {
    // 递归查找菜单子项
    findMenuChildrenRecursive(menuItems, targetId) {
      if (!menuItems || !menuItems.length) return [];

      for (const item of menuItems) {
        // 找到目标菜单，返回其子项
        if (item.id === targetId) {
          return item.children_ || [];
        }

        // 递归查找子菜单
        if (item.children && item.children.length) {
          const found = this.findMenuChildrenRecursive(item.children, targetId);
          if (found.length) return found;
        }
      }

      // 未找到返回空数组
      return [];
    },
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
        return; // 只有子节点才返回，避免跳转
      }
      // 更新当前节点状态
      this.queryParams.id = node.id;
      this.currentNode = node;
      // 解析节点path中的路径和参数（关键：拆分path和query）
      const { purePath, templateId } = this.parsePathWithParams(node.path);
      // 正确跳转：拆分path和query，避免直接使用带参数的path字符串
      this.$router.push({
        path: purePath,
        query: {
          templateId: templateId,
          parentMenuId: '1948179894740680706', // 保留必要的父菜单ID参数
        },
      });
    },
    parsePathWithParams(path) {
      if (!path) return { purePath: '', templateId: '' };
      const [purePath, queryStr] = path.split('?'); // 拆分路径和参数部分
      const params = new URLSearchParams(queryStr || ''); // 解析参数
      return {
        purePath: purePath || '', // 纯路径（如"/system/companyUser/comprouter/index"）
        templateId: params.get('templateId') || '', // 提取templateId
      };
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
<style lang="scss" scoped>
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

<template>
  <div class="avue-tags">
    <!-- 面包屑盒子 -->
    <div class="row">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          @click="handleBreadcrumbClick(crumb)"
          class="breadcrumb-item"
          :class="{ 'breadcrumb-item_active': index === breadcrumbs.length - 1 }"
        >
          {{ getLabel(crumb.label) }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <span
        v-if="
          (breadcrumbs.length > 2 ||
            $route.meta?.hasTagReturnBtn ||
            $route.query?.hasTagReturnBtn) &&
          !$route.meta?.hideTagReturnBtn
        "
        @click="handleClickBack"
        class="back-btn"
      >
        <el-icon class="icon-back"><ArrowLeft /></el-icon> <span class="text">返回上一页</span>
      </span>
    </div>

    <span v-if="showHelp" title="帮助文档" @click="showDoc" class="help"
      ><img src="./img/question.png"
    /></span>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
function findTreeNodeByPath(path, treeData) {
  // 防御性编程：检查输入是否合法
  if (!Array.isArray(treeData) || typeof path !== 'string') {
    console.warn('Invalid  input: treeData should be an array and path should be a string');
    return null;
  }

  // 递归查找函数
  const findNode = nodes => {
    for (const node of nodes) {
      // 检查当前节点是否匹配
      if (node.path === path) {
        return node;
      }

      // 如果有子节点则递归查找
      if (node.children && node.children.length > 0) {
        const foundNode = findNode(node.children);
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return null;
  };

  return findNode(treeData);
}

function findTreeNodePath(treeData, targetId) {
  function _finder(nodes, path) {
    for (const node of nodes) {
      // 构造当前路径节点（确保包含完整字段）
      const currentNode = {
        id: node.id,
        name: node.name,
        label: node.name,
        path: node.path, // 假设原数据已包含path字段
        children: node.children, // 保留子节点引用（可选）
      };
      const currentPath = [...path, currentNode];

      // 找到目标节点
      if (node.id === targetId) {
        return currentPath;
      }

      // 递归子节点
      if (node.children?.length) {
        const foundPath = _finder(node.children, currentPath);
        if (foundPath) return foundPath;
      }
    }
    return null;
  }
  return _finder(treeData, []);
}

export default {
  name: 'Breadcrumbs',
  data() {
    return {
      showHelp: false,
    };
  },
  computed: {
    ...mapGetters(['setting', 'menu']),
    // 计算面包屑列表
    breadcrumbs() {
      let breadcrumbs = [];
      const parentMenuId = this.$route.query?.parentMenuId
        ? this.$route.query?.parentMenuId
        : this.$route.meta.parentMenuId;
      if (parentMenuId) {
        const result = findTreeNodePath(this.$store.getters.menuAll, parentMenuId);
        const [_, ...items] = result;
        breadcrumbs = [...items];

        const current = this.$route;
        if (breadcrumbs?.[breadcrumbs.length - 1]?.path !== current.path) {
          breadcrumbs.push({
            path: current.path,
            label: current.name,
          });
        }
      } else {
        const matchedRoutes = this.$route.matched;
        const [_, ...crumbs] = matchedRoutes;

        crumbs.forEach(route => {
          breadcrumbs.push({
            path: this.$route.path,
            label: route.name,
          });
        });
        const parentMenuId = this.$route.query?.parentMenuId
          ? this.$route.query?.parentMenuId
          : this.$route.meta.parentMenuId;
        if (parentMenuId) {
          const menuAll = this.$store.getters.menuAll;
          const menuItem = this.findNode(menuAll, parentMenuId);
          breadcrumbs.unshift({
            path: menuItem?.path,
            label: menuItem?.name,
          });
        }
      }
      return breadcrumbs;
    },
    currentMenuInfo() {
      const find = findTreeNodeByPath(this.$route.path, this.$store.state.user.menuAll);
      return {
        sopDocId: find?.sopDocId,
        sopDocName: find?.sopDocName,
        sopDocPath: find?.sopDocPath,
      };
    },
  },
  watch: {
    currentMenuInfo: {
      handler(newVal) {
        this.$nextTick(() => {
          this.showHelp = !!newVal?.sopDocId;
        });
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    // 处理面包屑点击事件，导航到相应路径
    handleBreadcrumbClick(crumb) {
      this.$router.push(crumb.path);
    },
    // 获取逗号前面的 label 部分
    getLabel(label) {
      try {
        return label.split(',')[0];
      } catch (err) {
        return label;
      }
    },
    handleClickBack() {
      this.$router.go(-1);
    },
    showDoc() {
      const url = this.$router.resolve({
        path: `/sop-doc`,
        query: {
          id: this.currentMenuInfo.sopDocId,
        },
      });
      window.open(url.href, '_blank');
    },
  },
};
</script>
<style lang="scss" scoped>
.row {
  display: flex;
  flex-flow: row nowrap;

  .back-btn {
    margin-left: 24px;
    transform: translateY(-4px);
    background: #ffffff;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #dadbe0;
    padding: 4px 6px;
    font-weight: 400;
    font-size: 12px;
    color: #848488;
    line-height: 12px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    cursor: pointer;
    justify-content: center;
    align-items: center;

    .icon-back {
      transform: translateY(1px);
      color: #333;
    }
  }
}
</style>
<style>
.avue-tags {
  position: relative;
  height: 35px;
}

.help {
  cursor: pointer;
  position: absolute;
  padding: 0;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  right: 10px;
  top: 8px;
  color: #666;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>

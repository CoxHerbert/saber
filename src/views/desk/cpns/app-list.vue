<template>
  <div class="comp-app-list">
    <div class="title">
      常用应用
      <!-- <el-button type="primary" plain @click="open = true">自定义</el-button> -->
    </div>

    <!-- <div class="item-row" v-loading="loading">
      <div class="data-item" v-for="(item, i) in appList" :key="i">
        <span class="icon"></span>
        <span class="label">{{ item.label }}</span>
      </div>
    </div> -->

    <el-dialog v-model="open" title="添加应用" width="800" @close="open = false">
      <div class="menu-group">
        <div class="group-name">
          常用应用
          <span class="count">{{ appList.length }}/{{ maxCount }}</span>
        </div>
        <el-row :gutter="24" class="menu-content">
          <el-col class="menu-item" :span="8" v-for="(menu, index) in appList" :key="index">
            <div class="menu-name">
              <i class="used-icon" :class="menu.source" />
              {{ menu.name }}
            </div>
            <el-icon
              class="delete-icon"
              @click="
                handleMenu({
                  action: 'remove',
                  menu,
                  index,
                })
              "
              ><DeleteFilled
            /></el-icon>
          </el-col>
        </el-row>
      </div>

      <div class="menu-group" v-for="(menuGroup, index) in menuList" :key="index">
        <div class="group-name">
          {{ menuGroup.name }}
        </div>
        <el-row :gutter="24" class="menu-content">
          <el-col
            class="menu-item"
            :span="8"
            v-for="(menu, index) in menuGroup.leafChildren"
            :key="index"
          >
            <div class="menu-name">
              <el-icon
                class="star-icon"
                :class="{
                  'is-active': appList.map(app => app.id).includes(menu.id),
                }"
                @click="handleMenu({ menu })"
                ><StarFilled
              /></el-icon>
              {{ menu.name }}
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import Api from '@/api';

const { proxy } = getCurrentInstance();
const menu = computed(() => proxy.$store.getters.menu);
const compData = reactive({
  loading: false,
  appList: [],
  open: false,
  menuList: [],
  maxCount: 18,
});

const { loading, appList, open, menuList, maxCount } = toRefs(compData);

const getData = () => {
  loading.value = true;
  Api.desk.home
    .getAppList({
      collectType: 'MEMU',
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        const targetIds = data.targetIds ? data.targetIds.split(',') : [];
        appList.value = targetIds.map(id => {
          return findNodeById(menu, id);
        });
      }
      loading.value = false;
    })
    .catch(err => {
      loading.value = false;
      console.error(err);
    });
};
function findNodeById(tree, targetId) {
  for (const node of tree) {
    if (node.id === targetId) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null; // 没有找到
}

function extractTopLevelWithLeafChildren(tree) {
  function getLeafNodes(node) {
    const result = [];

    function traverse(n) {
      if (!n.children || n.children.length === 0) {
        result.push(n);
      } else {
        for (const child of n.children) {
          traverse(child);
        }
      }
    }

    traverse(node);
    return result;
  }

  return tree.map(node => {
    let leafChildren = [];

    if (node.children && node.children.length > 0) {
      leafChildren = getLeafNodes(node);
    } else {
      // 没有子级，自己是叶子
      leafChildren = [node];
    }

    return {
      ...node,
      children: undefined,
      leafChildren,
    };
  });
}

const handleMenu = ({ action, menu, index }) => {
  if (action === 'remove') {
    appList.value.splice(index, 1);
  } else {
    const findIndex = appList.value.findIndex(app => app.id === menu.id);
    if (findIndex >= 0) {
      appList.value.splice(findIndex, 1);
    } else {
      if (appList.value.length === maxCount.value)
        return proxy.$message({
          type: 'error',
          message: `常用应用最多可添加${maxCount.value}个`,
        });

      appList.value.push(menu);
    }
  }
};

onMounted(() => {
  menuList.value = extractTopLevelWithLeafChildren(menu.value);
  getData();
});
</script>
<style lang="scss" scoped>
.comp-app-list {
  box-sizing: border-box;
  padding: 20px;
  width: calc(100% - 410px);
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 16px;
  .data-item {
    box-sizing: border-box;
    width: 20%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
  }
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-bottom: 20px;
  }
  .item-row {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }

  .label {
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 400;
    font-size: 14px;
    color: #999999;
    line-height: 14px;
    text-align: center;
    font-style: normal;
    text-transform: none;
  }
  .icon {
    width: 40px;
    height: 40px;
    background-image: url('../img/app-icon.png');
    background-size: 100% auto;
    margin-bottom: 8px;
  }
  .menu-group {
    margin: 0 !important;
    .group-name {
      margin-bottom: 5px;
      color: #000;
      font-size: 16px;
      font-weight: bold;
      .count {
        font-weight: 400;
        font-size: 12px;
      }
    }
    .menu-content {
      margin: 0 !important;
      .menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        .menu-name {
          display: flex;
          align-items: center;
          .star-icon {
            margin-right: 5px;
            font-size: 16px;
            color: #ccc;
            &.is-active {
              color: var(--el-color-primary);
            }
          }
          .used-icon {
            margin-right: 5px;
            font-size: 16px;
            color: #000;
          }
        }
        &:hover {
          .delete-icon {
            display: block;
          }
        }
        .delete-icon {
          display: none;
          color: red;
        }
      }
    }
  }
}
</style>

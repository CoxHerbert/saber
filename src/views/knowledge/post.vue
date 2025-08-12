<template>
  <div class="page-document">
    <div class="left">
      <div class="top-area">
        <div class="title">{{ detailInfo?.wikiPage?.title }}</div>
        <div class="info">
          <dc-view-user v-model="detailInfo.dcWikiDocumentPublishing.userId" />
          <span class="time">
            <span class="label">发布时间：</span>
            <span class="value">{{ detailInfo.dcWikiDocumentPublishing.createTime || '-' }}</span>
          </span>
          <span class="tags">
            <span v-for="(tag, i) in detailInfo?.wikiPage?.tags || []" :key="i" class="tag">{{
              tag.title
            }}</span>
          </span>
        </div>
      </div>

      <div class="content">
        <dcEditor :modelValue="detailInfo?.wikiPage?.content" :disabled="true" />
      </div>
    </div>
    <div class="right">
      <div class="search-box">
        <el-input v-model="treeSearch" placeholder="请输入关键字" prefix-icon="Search" clearable />
      </div>
      <el-scrollbar height="calc(100% - 50px)" width="100%">
        <div class="tree-box">
          <el-tree
            ref="menuTreeRef"
            :data="treeData"
            @node-click="menuNodeClick"
            :current-node-key="queryParams.id"
            :default-expanded-keys="defaultExpandKeys"
            node-key="id"
            :props="{
              label: 'title',
              children: 'children',
              isLeaf: 'leaf',
            }"
            :filter-node-method="treeFilterNode"
          >
            <template #default="{ data }">
              <div
                class="default-node"
                :class="{
                  'is-active': data.id === queryParams.id || $route.path === data.path,
                }"
              >
                <span class="node folder-node" v-if="data.isFolder">
                  <el-icon><Folder /></el-icon>
                  <span class="node-title folder">{{ data.title }}</span>
                </span>
                <span v-else class="doc-node">
                  <span class="node-title">{{ data.title }} </span>
                </span>
              </div>
            </template>
          </el-tree>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
import dcEditor from '@/components/dc/components/dc-editor/index.vue';
import Api from '@/api';
import gql from 'graphql-tag';

function arrayToTree(arr) {
  // 创建节点映射表（O(n)时间复杂度）
  const nodeMap = new Map();
  arr.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] }); // 初始化children数组
  });

  // 构建父子关系（O(n)时间复杂度）
  const roots = [];
  arr.forEach(node => {
    const parentId = node.parent;
    const parent = nodeMap.get(parentId);

    if (parent) {
      parent.children.push(nodeMap.get(node.id));
    } else {
      roots.push(nodeMap.get(node.id));
    }
  });

  return roots;
}

export default {
  components: {
    dcEditor,
  },
  data() {
    return {
      treeSearch: '',
      apolloClient_: null,
      detailInfo: {},
      treeData: [],
      queryParams: {},
      defaultExpandKeys: [],
    };
  },
  async mounted() {
    this.apolloClient_ = await this.apolloClient();
    const id = this.$route.params.id;
    // this.getSopDoc(id);
    this.getRightTree();
    this.getDetailByid(id);
  },
  watch: {
    treeSearch: {
      handler(val) {
        this.$refs.menuTreeRef.filter(val);
      },
    },
  },
  methods: {
    async getSopDoc(id) {
      const result = await this.apolloClient_.query({
        query: gql`
          query ($id: Int!) {
            pages {
              single(id: $id) {
                id
                title
                path
                content
              }
            }
          }
        `,
        variables: {
          id: parseInt(id, 10),
        },
      });

      this.detailInfo = result.data?.pages?.single;
    },
    getDetailByid(id) {
      Api.knowledge.wiki
        .getDetailById({
          id,
        })
        .then(res => {
          console.log('res', res);
          const { code, data } = res.data;
          if (code === 200) {
            this.detailInfo = data;
            console.log('data===>', data);
          }
        });
    },
    menuNodeClick(node) {
      if (!node.isFolder) {
        Api.knowledge.wiki
          .shot({
            pageId: node.id,
            path: node.path,
            description: node.description,
            title: node.title,
          })
          .then(() => {
            window.open(`/knowledge/post/${node.pageId}`);
          });
      }
    },
    treeFilterNode(value, data) {
      if (!value) return true;
      return data.title.includes(value);
    },
    getRightTree() {
      const expandKeys = [];
      Api.knowledge.wiki.rightTree().then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          this.treeData = arrayToTree(
            (data || []).map(d => {
              if (d.isFolder) {
                expandKeys.push(d.id);
              }
              return {
                ...d,
                leaf: !d.isFolder,
              };
            })
          );
        }
      });
      this.defaultExpandKeys = expandKeys;
    },
  },
};
</script>
<style lang="scss" scoped>
.page-document {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-flow: row nowrap;

  .top-area {
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e5e5;
  }

  .left {
    background-color: #fff;
    flex: 1;
    padding: 33px 48px;

    .title {
      font-weight: bold;
      font-size: 36px;
      color: #333333;
      line-height: 44px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }

  .info {
    display: flex;
    margin-top: 13px;
    .name {
      font-size: 14px;
      color: #666666;
      line-height: 20px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      margin-right: 20px;
    }
    .time {
      margin-right: 14px;
      font-weight: 400;
      font-size: 14px;
      color: #848488;
      line-height: 20px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }

    .tag {
      background: rgba(247, 132, 49, 0.1);
      border-radius: 2px 2px 2px 2px;
      line-height: 12px;
      font-size: 12px;
      text-align: center;
      font-style: normal;
      text-transform: none;
      padding: 4px 13px;
      display: inline-block;
      margin-right: 8px;
      color: #f78431;
    }
  }

  .info {
    display: flex;
    align-items: center;
    .time {
      margin-left: 16px;
    }
  }
  .right {
    background-color: #fff;
    margin-left: 16px;
    max-width: 395px;
    width: 24%;
    box-sizing: border-box;
    padding: 35px 20px;
    .search-box {
      margin-bottom: 16px;
    }
    .node-title {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding-left: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }
    .folder-node {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
    }
    :deep(.el-tree-node__content) {
      box-sizing: border-box;
      overflow: hidden;
      padding-left: 16px !important;
      display: flex;
      flex-flow: row nowrap;

      .default-node {
        flex: 1;
        width: calc(100% - 24px);

        .doc-node {
          height: 100%;
          display: block;
          overflow: hidden;
          width: 100%;
        }
      }
    }
  }

  :deep(.comp-dc-editor.disabled) {
    border: none !important;
    .w-e-toolbar {
      display: none;
    }
  }
}
</style>

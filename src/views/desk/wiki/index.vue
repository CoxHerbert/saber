<template>
  <div class="page-wiki-index" v-loading="loading">
    <div
      class="left-panel"
      ref="leftRef"
      :class="{
        draging: isDraggin,
        hide: hideLeft,
      }"
      :style="{
        width: `${hideLeft ? 0 : leftWidth > 200 ? leftWidth : 200}px`,
      }"
    >
      <span class="spliter" @mousedown="handleMouseDown"></span>
      <div class="left-content">
        <h4 class="title">
          我的文档
          <span class="add" title="新建文档" @click.stop="handleAdd(null)"
            ><el-icon><Plus /></el-icon
          ></span>
        </h4>
        <div class="search-box">
          <el-input
            v-model="treeSearch"
            placeholder="请输入关键字"
            prefix-icon="Search"
            clearable
          />
        </div>
        <el-scrollbar height="calc(100% - 50px)" width="100%">
          <div class="tree-box">
            <el-tree
              ref="menuTreeRef"
              :data="treeData"
              @node-click="menuNodeClick"
              default-expand-all
              :current-node-key="queryParams.id"
              :default-expanded-keys="defaultExpandKeys"
              node-key="id"
              :props="{
                label: 'title',
                children: 'children',
                isLeaf: 'leaf',
              }"
              :filter-node-method="treeFilterNode"
              :load="loadNode"
              lazy
            >
              <template #default="{ data }">
                <div
                  class="default-node"
                  :class="{
                    'is-active': data.id === queryParams.id || $route.path === data.path,
                  }"
                >
                  <span class="node" v-if="data.isFolder">
                    <el-icon><Folder /></el-icon>
                    <span class="node-title folder">{{ data.title }}</span>
                    <span class="add" title="新建文档" @click.stop="handleAdd(data)"
                      ><el-icon><Plus /></el-icon
                    ></span>
                  </span>
                  <span v-else class="doc-node">
                    <!--  @click.stop="handleAdd(data)" -->
                    <span class="node-title">{{ data.title }} </span>
                    <!-- <el-popover class="left-menu" placement="bottom">
                      <template #default>
                        <div class="left-menu-box">
                          <div @click.stop="handleEdit(data)" class="menu-item">
                            <el-icon><Edit /></el-icon>编辑
                          </div>
                          <div @click.stop="handleDelete(data)" class="menu-item">
                            <el-icon><Delete /></el-icon>删除
                          </div>
                        </div>
                      </template>
                      <template #reference>
                        <span class="more"
                          ><el-icon><More /></el-icon
                        ></span> </template
                    ></el-popover> -->
                  </span>
                </div>
              </template>
            </el-tree>
            <!-- <div v-if="treeData.length === 0" class="btn-box">
              <el-button style="margin: 0 auto" @click.stop="doAction('add')" pre-icon="plus"
                >创建文章</el-button
              >
            </div> -->
          </div>
        </el-scrollbar>
      </div>
      <div class="handler" @click="totggleLeft">
        <svg
          width="20"
          height="50"
          viewBox="0 0 20 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0 L16 8 L16 42 L0 50 Z" fill="none" stroke="#e5e5e5" />
        </svg>
      </div>
    </div>
    <div class="right-box">
      <div v-if="!pageInfo" class="error-page">
        <div class="img" style="background-image: url('/img/404.svg')"></div>
        <div class="content">
          <h1>NO DATA</h1>
          <div class="desc">抱歉，你还未创建过相关文档</div>
          <div class="actions">
            <el-button type="primary" icon="plus" @click="doAction('sartWiki')"
              >开启WIKI之旅</el-button
            >
          </div>
        </div>
      </div>
      <div class="doc-main" v-if="pageInfo">
        <articleView
          :pageInfo="pageInfo"
          :status="
            dcWikiDocumentPublishing
              ? {
                  label: dcWikiDocumentPublishing?.publishStatusName,
                  id: dcWikiDocumentPublishing?.publishStatus,
                }
              : null
          "
          :disabled="true"
          @deleted="handleDeleted"
          @publish="handlePublish"
          :mode="'component'"
        />
      </div>
    </div>
    <publishDialog ref="publishDialog" @published="handlePublished" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import gql from 'graphql-tag';
import Api from '@/api';
import { Base64 } from 'js-base64';
import DcEditor from '@/components/dc/components/dc-editor/index.vue';
import articleView from './wiki/article.vue';
import publishDialog from './wiki/publishDialog.vue';

export default {
  components: {
    DcEditor,
    articleView,
    publishDialog,
  },
  data() {
    return {
      dcWikiDocumentPublishing: null,
      publishInfo: null,
      treeSearch: '',
      defaultInfo: null,
      loading: false,
      apolloClient_: null,
      queryParams: {},
      directories: [],
      hideLeft: false,
      treeData: [],
      defaultExpandKeys: [],
      pageInfo: null,
      leftWidth: 200,
      isDraggin: false, // 是否拖动
      initClientX: 0, // 鼠标按下去的时候x位置
      offsetX: 0, // 按下后拖拽偏移量
      initWidth: 0, // 鼠标按下时候左侧初试宽度
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  watch: {
    treeSearch: {
      handler(val) {
        this.$refs.menuTreeRef.filter(val);
      },
    },
  },
  async mounted() {
    const expandKeys = window.sessionStorage.getItem(this.getDefaultExpandKey())
      ? JSON.parse(window.sessionStorage.getItem(this.getDefaultExpandKey()))
      : [];
    this.defaultExpandKeys = expandKeys;
    this.apolloClient_ = await this.apolloClient();
    this.loginWiki();
    // this.queryAll();
    // this.getPageTree('users', 23);
  },
  methods: {
    addWindowEvent() {
      document.body.classList.add('no-select');
      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
    },
    removeWindowEvent() {
      this.isDraggin = false;
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
      document.body.classList.remove('no-select');
    },

    handleMouseDown(event) {
      if (event.button === 0) {
        this.isDraggin = true;
        this.initClientX = event.clientX;
        this.initWidth = this.$refs.leftRef.offsetWidth;
        this.addWindowEvent();
      }
    },
    mouseMove(event) {
      if (this.isDraggin) {
        this.offsetX = event.clientX - this.initClientX;
        this.leftWidth = this.initWidth + parseInt(this.offsetX, 10);
      }
    },
    mouseUp(event) {
      this.removeWindowEvent();
    },
    loginWiki() {
      this.loading = true;
      Api.desk.wiki
        .loginWiki()
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            if (data) {
              this.defaultInfo = data;
              this.getPgeTree(this.defaultInfo.defaultTreeId);
              this.getDocById(
                window.sessionStorage.getItem(this.getCurrentDocInfoKey()) ||
                  this.defaultInfo.defaultPageId
              );
            }
            // else {
            //   this.startWiki();
            // }
          } else {
            this.loading = false;
          }
        })
        .catch(error => {
          this.loading = false;
          this.startWiki();
          console.log('error', error);
        });
    },
    startWiki() {
      this.loading = true;
      Api.desk.wiki
        .startWiki()
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.defaultInfo = data;
            this.getPgeTree(this.defaultInfo.defaultTreeId);
            this.getDocById(
              window.sessionStorage.getItem(this.getCurrentDocInfoKey()) ||
                this.defaultInfo.defaultPageId
            );
          } else {
            this.loading = false;
          }
        })
        .catch(error => {
          this.loading = false;
          console.log('error', error);
        });
    },
    getPgeTree(parentId) {
      this.loading = true;
      Api.desk.wiki
        .getPageTree({
          path: 'users',
          mode: 'ALL',
          locale: 'zh',
          parent: parentId,
          includeAncestors: true,
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.treeData = data.map(d => {
              return {
                ...d,
                leaf: !d.isFolder,
              };
            });
          } else {
            this.loading = false;
          }
        })
        .catch(error => {
          this.loading = false;
          console.log('error', error);
        });
    },
    totggleLeft() {
      this.hideLeft = !this.hideLeft;
    },
    findParentIds(treeData, currentNodeId) {
      // 深度优先遍历查找目标节点
      function dfs(node, path) {
        // 找到目标节点时，返回当前路径（不包含当前节点）
        if (node.id === currentNodeId) {
          return path.slice().reverse(); // 反转数组以实现自底向上顺序
        }

        if (node.children && node.children.length > 0) {
          for (let child of node.children) {
            const result = dfs(child, [...path, node.id]); // 将当前节点加入路径
            if (result) return result; // 找到则提前返回
          }
        }
        return null; // 当前分支未找到
      }

      // 处理多根节点情况
      for (let node of treeData) {
        const result = dfs(node, []);
        if (result) return result;
      }

      return []; // 未找到时返回空数组
    },
    getDefaultExpandKey() {
      return `doc-${this.userInfo?.user_id}-expandKeys`;
    },
    getCurrentDocInfoKey() {
      return `doc-${this.userInfo?.user_id}-currentDoc`;
    },
    menuNodeClick(node) {
      if (node.leaf) {
        const defaultExpandKeys = this.findParentIds(this.treeData, node.id);
        this.queryParams.id = node.id;
        window.sessionStorage.setItem(
          this.getDefaultExpandKey(),
          JSON.stringify(defaultExpandKeys)
        );
        window.sessionStorage.setItem(this.getCurrentDocInfoKey(), node.pageId);
        this.getDocById(node.pageId);
      }
    },
    handleAdd(data) {
      const queryId = `${Base64.encode(
        JSON.stringify({
          mode: 'create',
          folder: {
            path: data?.path || `users/${this.userInfo?.user_id}`,
            title: data?.title || '我的文档',
          },
        })
      )}`.replaceAll('/', '[斜杠]');

      this.$router.push({
        path: '/desk/article/' + queryId,
      });
    },
    handleEdit(data) {
      this.$router.push(
        '/desk/article/' +
          Base64.encode(
            JSON.stringify({
              mode: 'edit',
              id: data.pageId,
            })
          )
      );
    },
    handleDeleted() {
      this.loginWiki();
    },
    handleDelete(data) {
      if (data.pageId === this.defaultInfo.defaultPageId) {
        this.$message.error('默认不可删除');
        return;
      }
      this.$confirm(`确认是否删除${data.isFolder ? '文件夹' : '文章'}"${data.title}"？`)
        .then(async () => {
          return await Api.desk.wiki.deletePageByid(data.pageId);
        })
        .then(res => {
          const { code } = res.data;
          if (code === 200) {
            this.loginWiki();
            this.$message.success('操作成功');
          }
        });
    },
    handlePublished() {
      if (this.pageInfo) {
        this.getDataById(this.pageInfo.id);
      }
    },
    getDocById(id) {
      this.loading = true;
      Api.desk.wiki.getPageById(id).then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          // let content = '';
          // try {
          //   content = Base64.decode(data.content);
          // } catch (error) {}
          // if (!content) {
          //   content = /^<(.*)+>$/.test(data.content) ? data.content : `<p> ${data.content} </p>`;
          // }
          this.pageInfo = {
            ...data.wikiPage,
            tags: data.wikiPage.tags.map(t => t.title),
            // content: content,
          };
          this.dcWikiDocumentPublishing = data.dcWikiDocumentPublishing;
        }
        this.loading = false;
      });
    },
    // async getDocById(id) {
    //   const result = await this.apolloClient_.query({
    //     query: gql`
    //       query ($id: Int!) {
    //         pages {
    //           single(id: $id) {
    //             id
    //             title
    //             path
    //             content
    //             description
    //             tags {
    //               id
    //               tag
    //               title
    //               createdAt
    //               updatedAt
    //             }
    //           }
    //         }
    //       }
    //     `,
    //     variables: {
    //       id: parseInt(id, 10),
    //     },
    //   });

    //   const doc = result.data?.pages?.single;
    //   if (doc) {
    //     const content =
    //       Base64.decode(doc.content) || /^<(.*)+>$/.test(doc.content)
    //         ? doc.content
    //         : `<p> ${doc.content} </p>`;
    //     this.pageInfo = {
    //       ...doc,
    //       tags_: doc.tags,
    //       tags: doc.tags.map(t => t.title),
    //       content: content,
    //     };
    //   } else {
    //     this.$message.error('获取文章信息失败');
    //   }
    // },
    handlePublish(params) {
      this.publishInfo = params;
      this.$refs.publishDialog.show(this.publishInfo);
      // console.log('params====>', params);
    },
    doAction(action) {
      if (action === 'add') {
        this.$router.push('/desk/article/create');
      } else if (action === 'sartWiki') {
        this.startWiki();
      }
    },
    async queryAll() {
      const result = await this.apolloClient_.query({
        query: gql`
          query ($path: String, $locale: String!) {
            pages {
              tree(path: $path, mode: ALL, locale: $locale, includeAncestors: true) {
                id
                path
                title
                isFolder
                pageId
                parent
                locale
                __typename
              }
              __typename
            }
          }
        `,
        variables: {
          path: 'users',
          locale: 'zh',
        },
      });
      const usersFolder = (result?.data?.pages?.tree || []).find(f => f.path === 'users');
      if (!usersFolder) {
        this.$message.error('获取文件夹失败');
      } else {
        await this.getByParentId(usersFolder.id);
      }
    },
    async loadNode(node, resolve, reject) {
      const result = await this.apolloClient_.query({
        query: gql`
          query ($parent: Int, $locale: String!) {
            pages {
              tree(parent: $parent, mode: ALL, locale: $locale) {
                id
                path
                title
                isFolder
                pageId
                parent
                locale
                __typename
              }
              __typename
            }
          }
        `,
        variables: {
          parent: node.data.id,
          locale: 'zh',
        },
      });
      const data = JSON.parse(JSON.stringify(result?.data?.pages?.tree || [])).map(d => {
        return {
          ...d,
          leaf: !d.isFolder,
        };
      });
      if (data) {
        const dataSet = JSON.parse(JSON.stringify(data));
        node.data.children = dataSet;
        return resolve(dataSet);
      } else {
        return reject();
      }
    },
    treeFilterNode(value, data) {
      if (!value) return true;
      return data.title.includes(value);
    },
    async getByParentId(id) {
      const currentPath = `users/${this.userInfo.user_id}`;
      const result = await this.apolloClient_.query({
        query: gql`
          query ($parent: Int, $locale: String!, $path: String) {
            pages {
              tree(parent: $parent, mode: ALL, locale: $locale, path: $path) {
                id
                path
                title
                isFolder
                pageId
                parent
                locale
                __typename
              }
              __typename
            }
          }
        `,
        variables: {
          parent: id,
          locale: 'zh',
          path: currentPath,
        },
      });
      const homeFolder = (result?.data?.pages?.tree || []).find(d => d.path === currentPath);
      if (homeFolder) {
        const treeData = [{ ...homeFolder, title: '我的文档', folderId: homeFolder.id }];
        this.treeData = treeData;
        this.defaultExpandKeys = [homeFolder.id];
      } else {
        this.treeData = [];
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.page-wiki-index {
  width: 100%;
  height: 100%;
  padding: 0;
  background-color: #fff;
  display: flex;
  flex-flow: row nowrap;
  .left-panel {
    padding-left: 0;
    position: relative;
    width: 200px;
    transition: all ease-in 0.2s;
    border-right: 1px solid #e5e5e5;

    &.draging {
      transition: none;
    }

    .spliter {
      position: absolute;
      width: 4px;
      height: 100%;
      right: 0;
      top: 0;
      cursor: ew-resize;
      z-index: 10;
    }

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
    .left-content {
      height: 100%;
      overflow: hidden;
      .title {
        height: 48px;
        padding: 0 16px;
        border-bottom: 1px solid #eaeaeb;

        .add {
          cursor: pointer;
          float: right;
        }
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

    .title {
      line-height: 48px;
      font-size: 14px;
      font-weight: bold;
    }

    .search-box {
      padding: 8px 16px;
    }
  }

  .tree-box {
    padding-left: 8px;
    padding-right: 8px;
    .node {
      position: absolute;
      width: calc(100% - 16px);
      display: flex;
      flex-flow: row nowrap;
      overflow: hidden;
      align-items: center;
    }
    .default-node {
      height: 24px;
      position: relative;
      width: 100%;
      display: flex;
    }
    .doc-node {
      width: 100%;
      display: flex;
      padding-right: 8px;

      .more {
        cursor: pointer;
        display: block;
        width: 24px;
        line-height: 24px;
        transform: rotate(90deg);
        text-align: center;
      }

      .node-title {
        flex: 1;
        // max-width: calc(100% - 40px);
      }
    }
    :deep(.el-tree-node__content) {
      padding-left: 0 !important;
      width: 100%;
    }
    .node-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
      &.folder {
        padding-left: 8px;
      }
      &.doc {
        width: 100%;
        flex: 1;
        border: 1px solid red;
      }
    }
    .add {
      justify-self: flex-end;
      cursor: pointer;
      display: block;
      margin-left: 8px;
      cursor: pointer;
      transform: translateY(2px);
      padding: 0 2px;
    }

    .btn-box {
      display: flex;
      width: 100%;
    }
  }

  .right-box {
    flex: 1;
    display: flex;
    .error-page {
      background: #fff;
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .img {
        margin-right: 80px;
        height: 360px;
        width: 100%;
        max-width: 430px;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-size: contain;
      }

      .content {
        h1 {
          color: #434e59;
          font-size: 72px;
          font-weight: 600;
          line-height: 72px;
          margin-bottom: 24px;
        }

        .desc {
          color: rgba(0, 0, 0, 0.45);
          font-size: 20px;
          line-height: 28px;
          margin-bottom: 16px;
        }
      }
    }

    .doc-main {
      padding: 0;
      width: 100%;
      .title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 24px;
      }
      .desc {
        font-size: 12px;
        color: #666;
      }
    }

    .tags {
      display: flex;
      padding: 8px 10px;

      .tag {
        font-size: 12px;
        border: 1px solid #eaeaeb;
        padding: 2px 8px;
        border-radius: 4px;
        color: #666;
        margin-right: 8px;
      }
    }
  }
}

.left-menu-box {
  display: block;
  .menu-item {
    line-height: 32px;
    height: 32px;
    text-align: left;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    :deep(.el-icon) {
      margin-right: 4px;
      margin-left: 8px;
    }
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}
</style>

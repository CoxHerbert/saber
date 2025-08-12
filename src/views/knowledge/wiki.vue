<template>
  <div class="page-wiki">
    <div
      class="left"
      :class="{
        'has-content': searchMode,
      }"
    >
      <h2 class="title-main">EW-WIKI</h2>
      <el-input
        size="large"
        v-model="keyword"
        style="max-width: 900px"
        placeholder="学知识，搜文档，任何需要的都可以找我"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <span @click="handleSearch" class="btn-wiki-search">WIKI一下</span>
        </template>
      </el-input>
      <div v-if="searchMode" class="result-content">
        <p v-if="!(dataList.length > 0)">暂无搜索结果内容...</p>
        <div v-else class="result-list">
          <div v-for="(item, i) in dataList" :key="i" class="result-item">
            <p class="title title-row" @click="toDetail(item)">
              <span class="tag-type">文章</span>
              <span
                class="title"
                v-html="transformData(item.wikiPgaeSearchResultWithId.title)"
              ></span>
            </p>
            <div class="content">
              <div v-if="item.imgage" class="result-item__left"></div>
              <div class="right">
                <div
                  v-html="transformData(item.wikiPgaeSearchResultWithId.description)"
                  class="desc"
                ></div>
                <div class="info">
                  <span v-if="item.dcWikiDocumentPublishing.userId" class="user">
                    <dc-view-user
                      v-model="item.dcWikiDocumentPublishing.userId"
                      objectName="user"
                    />
                  </span>
                  <span v-if="item.dcWikiDocumentPublishing.createTime" class="time"
                    ><span class="label">发布时间：</span
                    >{{ item.dcWikiDocumentPublishing.createTime }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="history.length > 0" class="history">
      <!-- <el-input
        class="search-round"
        v-model="historyKeyword"
        size="small"
        placeholder="输入文字搜索历史"
        suffix-icon="Search"
        @keyup.enter="handleHistorySearch"
      >
      </el-input> -->
      <div class="history-list">
        <!-- {{ history }} -->
        <div
          v-for="(group, i) in history"
          :key="i"
          :style="{
            display: group.searchList?.length > 0 ? 'block' : 'none',
          }"
          class="history-group"
        >
          <div class="title">{{ group.label }}</div>
          <div
            v-for="(h, j) in group.searchList"
            :key="j"
            @click="toDetail2(h)"
            class="history-item"
          >
            {{ h.pageTitle }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Api from '@/api';
// import { Base64 } from 'js-base64';

export default {
  data() {
    return {
      searchMode: false,
      keyword: '',
      dataList: [],
      historyKeyword: '',
      history: [
        // {
        //   label: 'today',
        //   key: 'lastDay',
        //   searchList: [
        //     '智能制造AI知识库设计建议...',
        //     '智能制造AI知识库设计建议指南',
        //     '智能制造AI知识库设计建议指南',
        //     '智能制造AI知识库设计建议指南',
        //   ],
        // },
        // {
        //   label: '昨天',
        //   key: 'lastDay',
        //   searchList: [
        //     '智能制造AI知识库设计建议指南',
        //     '智能制造AI知识库设计建议指南',
        //     '智能制造AI知识库设计建议指南',
        //     '智能制造AI知识库设计建议指南',
        //   ],
        // },
        // {
        //   label: '30天内',
        //   key: 'lastDay',
        //   searchList: [
        //     '智能制造AI知识库设计建议...',
        //     '智能制造AI知识库设计建议指南',
        //     '智能制造AI知识库设计建议指南',
        //     '智能制造AI知识库设计建议指南',
        //   ],
        // },
      ],
    };
  },
  mounted() {
    this.getHotDocument();
  },
  methods: {
    getHotDocument() {
      Api.knowledge.wiki.hotDocument().then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          if (data) {
            let result = {};
            const labelMaps = {
              today: '今天',
              recent7Days: '近7天',
              recent30Days: '近30天',
            };
            const indexMaps = {
              today: 1,
              recent7Days: 2,
              recent30Days: 3,
            };
            Object.keys(data).forEach(key => {
              result[key] = {
                label: labelMaps[key] || key,
                key: key,
                sortIndex: indexMaps[key],
                searchList: data[key],
              };
            });
            this.history = Object.values(result).sort((a, b) => {
              return a.sortIndex - b.sortIndex;
            });
          } else {
            this.history = [];
          }
        }
      });
    },
    handleHistorySearch() {
      this.$message.info('功能开发中...');
    },
    handleHistorySearch(history) {
      this.keyword = history;
      this.handleSearch();
    },
    transformData(data) {
      if (data?.length > 0) {
        return data.replaceAll(
          this.keyword,
          `<span class="keyword-hilight">${this.keyword}</span>`
        );
      }
      return data;
    },
    handleSearch() {
      Api.knowledge.wiki
        .search({
          keyword: this.keyword,
        })
        .then(res => {
          const { data, code } = res.data;
          console.log('data', data);
          if (code === 200) {
            this.dataList = data.pages || [];
          }
        });
      this.searchMode = true;
    },
    toDetail2(item) {
      Api.knowledge.wiki
        .shot({
          pageId: item.pageId,
          path: item.pagePath,
          description: item.pageDescription,
          title: item.pageTitle,
        })
        .then(() => {
          if (item.pageId) {
            const link = this.$router.resolve({
              path: `/knowledge/post/${item.pageId}`,
            });

            window.open(link.href, '__blank');
          }
        });
    },
    test() {
      this.$router.push('/knowledge/post/123');
    },
    toDetail(item) {
      Api.knowledge.wiki
        .shot({
          pageId: item.wikiPgaeSearchResultWithId.pageId,
          path: item.wikiPgaeSearchResultWithId.path,
          description: item.wikiPgaeSearchResultWithId.description,
          title: item.wikiPgaeSearchResultWithId.title,
        })
        .then(() => {
          if (item.wikiPgaeSearchResultWithId.pageId) {
            const link = this.$router.resolve({
              path: `/knowledge/post/${item.wikiPgaeSearchResultWithId.pageId}`,
            });
            window.open(link.href, '__blank');
          }
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.page-wiki {
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  width: 100%;
  background-color: #fff;
  box-sizing: border-box;
  padding: 24px 16px;
  .left {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    padding-bottom: 20%;

    .title-main {
      font-weight: bold;
      font-size: 40px;
      color: #333333;
      line-height: 40px;
      text-align: center;
      font-style: normal;
      text-transform: none;
      margin-bottom: 28px;
    }

    .search-input {
      :deep(.el-input-group__append) {
        background: linear-gradient(270deg, #f29346 0%, #f05466 100%) !important;
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
      }
      :deep(.el-input__wrapper) {
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
        height: 56px;
        line-height: 56px;
        border: none;
      }
      :deep(.el-input-group__append) {
        transform: translateY(-1px);
      }
      .btn-wiki-search {
        display: block;
        width: 100%;
        cursor: pointer;
        height: 100%;
        font-size: 20px;
        line-height: 58px;
        transform: translateY(-1px);
        color: #fff;
        background-color: transparent;
      }
    }

    &.has-content {
      align-items: center;
      justify-content: flex-start;
      .title-main {
        display: none;
      }
    }

    .result-item {
      display: flex;
      flex-flow: column nowrap;
      :deep(.keyword-hilight) {
        color: #f78431;
      }

      .info {
        display: flex;
        align-items: center;
        margin-top: 12px;
        :deep(.user-info) {
          margin-right: 20px;
          .avatar {
            width: 24px;
            height: 24px;
          }
          .real-name {
            font-size: 14px;
            color: #666666;
            line-height: 14px;
            text-align: left;
            font-style: normal;
            text-transform: none;
          }
        }
        .time {
          font-size: 12px;
          color: #848488;
          line-height: 12px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
      }
      .title-row {
        cursor: pointer;
        display: flex;
        flex-flow: row;
        margin-bottom: 16px;
        font-weight: 500;
        font-size: 18px;
        color: #333333;
        line-height: 24px;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }
      .tag-type {
        margin-right: 12px;
        padding: 4px 8px;
        font-size: 12px;
        line-height: 12px;
        color: #fff;
        background: #23c69f;
        border-radius: 4px 4px 4px 4px;
      }
      .content {
        display: flex;
        flex-flow: row nowrap;

        .result-item__left {
          width: 120px;
          height: 90px;
          margin-right: 16px;
        }
        .right {
          flex: 1;

          .desc {
            font-weight: 400;
            font-size: 14px;
            color: #333333;
            line-height: 22px;
            text-align: left;
            font-style: normal;
            text-transform: none;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
          }
        }
      }
    }

    .result-content {
      width: 100%;
      max-width: 900px;
      display: block;
      padding-top: 24px;
    }
  }
  .history {
    width: 20%;
    max-width: 240px;
    .search-round {
      :deep(.el-input__wrapper) {
        border-radius: 11px;
        padding-left: 16px;
        padding-right: 16px;
      }
      margin-bottom: 12px;
    }
    .title {
      margin: 12px 0;
      font-weight: bold;
      font-size: 16px;
      color: #333333;
      line-height: 16px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }

    .history-item {
      cursor: pointer;
      font-size: 14px;
      color: #666666;
      line-height: 36px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      white-space: nowrap;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      border-radius: 19px 19px 19px 19px;
      padding: 0 12px;

      &:hover {
        background: rgba(247, 132, 49, 0.1);
        color: #333;
      }
    }
  }
}
</style>

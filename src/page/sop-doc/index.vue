<template>
  <div class="page-sop-doc dc-sop-doc">
    <h1 class="title-main"><span class="icon"></span><span class="title">东创知识库</span></h1>
    <div class="contents" v-html="contentHtml"></div>
  </div>
</template>
<script>
import gql from 'graphql-tag';
import MarkdownIt from 'markdown-it';
export default {
  data() {
    return {
      apolloClient_: null,
      md: null,
      contentHtml: '',
    };
  },
  async mounted() {
    this.apolloClient_ = await this.apolloClient();
    this.init();
  },
  methods: {
    init() {
      const md = new MarkdownIt({
        html: true, // 允许 HTML 标签
        linkify: true, // 自动转换链接
        typographer: true, // 优化排版（如引号转换）
      });
      this.md = md;
      const query = this.$route.query;
      this.getSopDoc(query.id);
    },
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

      const doc = result.data?.pages?.single;
      this.contentHtml = doc?.content
        ? this.addPrefixToImgSrc(this.md.render(doc.content), 'https://wiki.eastwinbip.com')
        : '未查询到相关文档数据';
    },
    addPrefixToImgSrc(html, prefix) {
      return html.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/gi, (match, before, src, after) => {
        // 跳过已包含前缀或绝对路径的 src
        if (src.startsWith('http') || src.startsWith('data:')) {
          return match;
        }
        return `<img${before}src="${prefix}${src}"${after}>`;
      });
    },
  },
};
</script>
<style lang="scss">
@import url('./doc.css');
.page-sop-doc {
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding-top: 48px;
  .title-main {
    display: flex;
    align-items: center;
    align-content: center;
    width: 100%;
    position: fixed;
    z-index: 100;
    left: 0;
    top: 0;
    height: 48px;
    background-color: #fff;
    margin: 0 0 20px 0;
    background-color: #000;
    padding: 0 10px;
    .title {
      display: block;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      line-height: 16px;
    }
    .icon {
      display: block;
      width: 40px;
      height: 40px;
      margin-right: 8px;
      background-image: url('https://wiki.eastwinbip.com/logo.png');
      background-position: center center;
      background-size: 32px 32px;
      background-repeat: no-repeat;
    }
  }

  .contents {
    display: block;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>

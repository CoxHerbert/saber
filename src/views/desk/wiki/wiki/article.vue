<template>
  <div
    v-loading="loading"
    class="page-article"
    :class="{
      'component-mode': mode === 'component',
    }"
  >
    <div class="title-row">
      <div class="title">
        <span
          class="status"
          v-if="status"
          :style="{
            '--el-color-label': colors[status.value || 0],
          }"
          >{{ status?.label }}</span
        >
        {{ title }}
      </div>
      <div v-if="mode === 'component' && status?.label" class="btn-box">
        <el-button
          v-if="!['待审核'].includes(status?.label)"
          type="primary"
          @click="doAction('edit')"
          >编辑</el-button
        >
        <el-button v-if="!['待审核', '已发布'].includes(status?.label)" @click="doAction('publish')"
          >发布</el-button
        >
        <el-button v-if="['待发布'].includes(status?.label)" @click="doAction('delete')"
          >删除</el-button
        >
      </div>
    </div>
    <div class="form-box">
      <div class="scroll-box">
        <el-scrollbar style="height: 100%">
          <el-form
            ref="formRef"
            :disabled="formDisabled"
            :model="formData"
            label-suffix=":"
            label-width="100px"
          >
            <template v-for="(col, i) in columns">
              <el-form-item
                v-if="!col.showFunc || (col.showFunc?.call && col.showFunc(col, formData))"
                :label="col.label"
                :prop="col.prop"
                :rules="getRules(col)"
              >
                <el-input
                  v-if="col.type === 'el-input'"
                  v-model="formData[col.prop]"
                  v-bind="col.props"
                />
                <el-select
                  v-if="col.type === 'el-select'"
                  v-model="formData[col.prop]"
                  v-bind="col.props"
                  :remote-method="remoteSearch"
                  :loading="optionLoading"
                >
                  <el-option
                    v-for="(op, j) in options"
                    :key="j"
                    :label="op.label"
                    :value="op.value"
                  ></el-option>
                </el-select>
                <dc-editor
                  v-else-if="col.type === 'dc-editor'"
                  v-model="formData[col.prop]"
                  :disabled="formDisabled"
                />
              </el-form-item>
            </template>
          </el-form>
        </el-scrollbar>
      </div>
    </div>
    <div v-if="['create', 'edit'].includes(mode || modeInfo)" class="footer">
      <el-button type="primary" @click="doAction('submit')">提交</el-button>
      <el-button @click="doAction('cancel')">取消</el-button>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import DcEditor from '@/components/dc/components/dc-editor/index.vue';
import Api from '@/api';
import gql from 'graphql-tag';
import dayjs from 'dayjs';
import { Base64 } from 'js-base64';

export default {
  components: {
    DcEditor,
  },
  data() {
    const that = this;
    return {
      colors: ['rgb(17, 175, 167)', 'rgb(131, 207, 92)', 'rgb(22, 139, 232)', 'rgb(255, 255, 255)'],
      apolloClient_: null,
      folderInfo: null,
      modeInfo: '',
      loading: false,
      options: [],
      optionLoading: false,
      columns: [
        {
          label: '父目录',
          prop: 'parentFolder',
          type: 'el-input',
          showFunc() {
            return that.mode !== 'component' && that.modeInfo !== 'edit';
          },
          props: {
            disabled: true,
          },
        },
        {
          label: '标题',
          prop: 'title',
          required: true,
          type: 'el-input',
          showFunc() {
            return that.mode !== 'component';
          },
          props: {
            maxlength: 50,
            placeholder: '请输入标题,如果包含目录请用"/"隔开',
          },
        },
        {
          label: 'tags',
          prop: 'tags',
          required: true,
          type: 'el-select',
          props: {
            multiple: true,
            filterable: true,
            remote: true,
            'allow-create': true,
            placeholder: '输入关键词搜索或新增选项',
          },
        },
        {
          label: '文章描述',
          prop: 'description',
          type: 'el-input',
          required: true,
          props: {
            maxlength: 100,
            placeholder: '请输入文章描述',
            type: 'textarea',
            rows: 2,
          },
        },
        {
          label: '文章内容',
          prop: 'content',
          required: true,
          type: 'dc-editor',
          props: {
            placeholder: '请输入',
          },
        },
      ],
      formData: {},
    };
  },
  props: {
    pageInfo: {
      type: Object,
      default() {
        return {};
      },
    },
    status: {
      type: Object,
      default() {
        return null;
      },
    },
    disabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
    mode: {
      type: String,
      default() {
        return ''; //component
      },
    },
  },
  computed: {
    ...mapGetters(['userInfo']),
    formDisabled() {
      return this.disabled;
    },
    title() {
      if (this.$route.params.id === 'create' || this.modeInfo === 'create') {
        return '创建文章';
      } else if (this.mode === 'component') {
        return this.formData.title;
      } else {
        return '编辑文章';
      }
    },
  },
  watch: {
    pageInfo: {
      handler(newVal) {
        if (this.mode === 'component') {
          this.formData = JSON.parse(JSON.stringify(newVal));
        }
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    this.apolloClient_ = await this.apolloClient();
    if (this.mode === 'component') {
      this.formData = JSON.parse(JSON.stringify(this.pageInfo));
    } else if (!/^\d+$/.test(this.$route.params.id || '') && this.$route.params.id !== 'create') {
      const queryId = this.$route.params.id?.replaceAll('[斜杠]', '/');
      const data = JSON.parse(Base64.decode(queryId));
      const mode = data.mode || 'create';
      this.modeInfo = data.mode || 'create';
      this.folderInfo = data.folder;
      if (mode === 'create') {
        this.formData = {
          parentFolder: this.folderInfo?.title,
        };
      } else if (mode === 'edit') {
        this.getDataById(data.id);
      }
    }
    if (this.$route.params.id === 'create') {
      this.formData = {
        parentFolder: '我的文档',
        path: '/', // `users/${this.userInfo.user_id}`,
      };
      this.modeInfo = 'create';
    }
  },
  methods: {
    getDataById(id) {
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
          this.formData = {
            ...data.wikiPage,
            tags: data.wikiPage.tags.map(t => t.title),
            // content: content,
          };
        }
        this.loading = false;
      });
    },
    async remoteSearch(query) {
      if (!query.trim()) return;
      this.optionLoading = true;
      const result = await this.apolloClient_.query({
        query: gql`
          query ($query: String!) {
            pages {
              searchTags(query: $query)
            }
          }
        `,
        variables: {
          query,
        },
      });
      const tags = (result?.data?.pages?.searchTags || []).map(item => {
        return {
          label: item,
          value: item,
        };
      });

      this.options = tags || [];
      this.optionLoading = false;
    },
    getRules(item) {
      if (!item.required) {
        return;
      }
      if (item.type === 'el-input') {
        let result = [
          {
            required: true,
            trigger: ['blur', 'change'],
            validator(rule, value, callback) {
              if ([null, undefined, ''].includes(value)) {
                callback(new Error(`${item.label}不能为空`));
              } else {
                callback();
              }
            },
          },
        ];
        if (item.prop === 'title') {
          const that = this;
          result.push({
            required: true,
            trigger: ['blur', 'change'],
            validator(rule, value, callback) {
              if (value && /\/$/.test(value)) {
                callback(new Error('标题不能以"/"结尾'));
              } else if (that.modeInfo === 'edit' && /\//.test(value)) {
                callback(new Error('编辑模式下标题不能包含"/"，因为目录不可更改'));
              } else {
                callback();
              }
            },
          });
        }

        return result;
      } else if (item.type == 'el-select') {
        return [
          {
            required: true,
            trigger: ['blur', 'change'],
            validator(rule, value, callback) {
              if (
                [null, undefined, ''].includes(value) ||
                (Array.isArray(value) && value?.length === 0)
              ) {
                callback(new Error(`${item.label}不能为空`));
              } else {
                callback();
              }
            },
          },
        ];
      } else if (item.type === 'dc-editor') {
        return [
          {
            required: true,
            trigger: ['blur', 'change', 'update:modelValue'],
            validator(rule, value, callback) {
              if ([null, undefined, ''].includes(value) || value === '<p><br></p>') {
                callback(new Error(`${item.label}不能为空`));
              } else {
                callback();
              }
            },
          },
        ];
      }
    },
    getCurrentDocInfoKey() {
      return `doc-${this.userInfo?.user_id}-currentDoc`;
    },

    doAction(action) {
      if (action === 'cancel') {
        this.$router.go(-1);
      } else if (action === 'submit') {
        this.$refs.formRef.validate(valid => {
          if (valid) {
            const parentFolderPath = this.formData.title.replace(/^\//, '').split('/');
            let pathSet = this.folderInfo
              ? `${this.folderInfo.path}/${parentFolderPath.join('/')}`
              : `${parentFolderPath.join('/')}`;
            if (pathSet.startsWith(`users/${this.userInfo?.user_id}/`)) {
              pathSet = pathSet.replace(`users/${this.userInfo?.user_id}/`, '');
            }
            const formData = {
              ...this.formData,
              render: undefined,
              title: this.formData.title.split('/').at(-1),
              content: Base64.encode(this.formData.content),
              editor: 'ckeditor',
              isPrivate: false,
              isPublished: true,
              locale: 'zh',
              path: pathSet, // `users/${this.userInfo?.user_id}/${parentFolderPath.join('/')}`,
              publishStartDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              publishEndDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            };
            this.loading = true;
            const action = this.formData.id
              ? Api.desk.wiki.updateArticle
              : Api.desk.wiki.createArticle;
            action(formData)
              .then(res => {
                const { code, data } = res.data;
                if (code === 200) {
                  if (data.wikiPage.id) {
                    window.sessionStorage.setItem(this.getCurrentDocInfoKey(), data.wikiPage.id);
                  }
                  this.$router.go(-1);
                }
                this.loading = false;
              })
              .catch(() => {
                this.loading = false;
              });
          }
        });
      } else if (action === 'delete') {
        this.$confirm(`确认是否删除文章"${this.formData.title}"？`)
          .then(async () => {
            return await Api.desk.wiki.deletePageByid(this.formData.id);
          })
          .then(res => {
            const { code } = res.data;
            if (code === 200) {
              this.$emit('deleted');
              this.$message.success('操作成功');
              this.close();
            }
          });
        // Api.desk.wiki.deletePageByid(this.formData.id).then
      } else if (action === 'edit') {
        this.$router.push(
          '/desk/article/' +
            Base64.encode(
              JSON.stringify({
                mode: 'edit',
                expandKeys: this.parendIds,
                id: this.formData.id,
              })
            )
        );
      } else if (action === 'publish') {
        this.$emit('publish', {
          ...this.formData,
        });
      }
    },
  },
};
</script>
<style lang="scss">
.page-article {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 0;
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
  flex: 1;
  &.component-mode {
    padding-top: 0;
    z-index: 1;
    transform: translateY(-1px);
  }

  .title-row {
    display: flex;
    padding: 0 16px;
    line-height: 48px;
    font-weight: bold;
    border-bottom: 1px solid #eaeaeb;
    margin-bottom: 20px;
    .title {
      flex: 1;
    }
    .status {
      display: inline-block;
      padding: 6px 12px;
      color: #fff;
      background-color: var(--el-color-label);
    }
  }

  .form-box {
    flex: 1;
    padding: 0 24px;
    position: relative;

    .scroll-box {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #eaeaeb;
    background-color: #fff;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 48px;
    text-align: center;
  }
}
</style>

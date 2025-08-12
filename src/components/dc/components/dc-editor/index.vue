<template>
  <div
    class="comp-dc-editor"
    :class="{
      disabled: disabled,
    }"
  >
    <div class="toolbar-box" :id="toolbarId"></div>
    <div class="editor-box" :id="id"></div>
  </div>
</template>
<script>
import '@wangeditor/editor/dist/css/style.css';
import { createEditor, createToolbar } from '@wangeditor/editor';
import { getToken } from '@/utils/auth';
import website from '@/config/website';
import { Base64 } from 'js-base64';
import axios from '@/axios';

export default {
  emits: ['update:modelValue', 'change', 'input'],
  data() {
    const that = this;
    return {
      id: 'dc-editor-' + Math.random().toString(36).slice(2, 16),
      toolbarId: 'dc-editor-toolbar-' + Math.random().toString(36).slice(2, 16),
      valueSet: '',
      editorRef: null,
      toolbarRef: null,
      toolbarConfig: {},
      editorConfig: {
        placeholder: '请输入内容',
        MENU_CONF: {
          uploadVideo: {
            customInsert(res, insertFn) {
              if (res.code === 200) {
                insertFn(res.data.link, '');
              }
            },
            onError(file, error) {
              if (error.message === 'Upload error') {
                that.$message.error('上传失败');
              }
            },
            fieldName: 'file',
            server: `/api/blade-resource/oss/endpoint/put-file-attach-path`,
            maxFileSize: 100 * 1024 * 1024, // 100M
            maxNumberOfFiles: 1,
            allowedFileTypes: ['video/*'],
            metaWithUrl: false,
            headers: {
              Accept: 'application/json, text/plain, */*',
              [website.tokenHeader]: 'bearer ' + getToken(),
              Authorization: `Basic ${Base64.encode(
                `${website.clientId}:${website.clientSecret}`
              )}`,
              'Blade-Requested-With': 'BladeHttpRequest',
              'x-dev-id': import.meta.env.VITE_APP_BACKEND_USER_COUNT,
            },
          },
          uploadImage: {
            fieldName: 'file',
            server: `/api/blade-resource/oss/endpoint/put-file-attach-path`,
            maxFileSize: 5 * 1024 * 1024, // 1M
            maxNumberOfFiles: 100,
            // 可指定允许上传的文件类型
            allowedFileTypes: ['image/*'],
            // meta: {
            //   token: 'bearer ' + getToken(),
            //   // otherKey: 'yyy',
            // },
            // 将 meta 拼接到 url 参数中，默认 false
            metaWithUrl: false,

            // 自定义增加 http  header
            headers: {
              Accept: 'application/json, text/plain, */*',
              [website.tokenHeader]: 'bearer ' + getToken(),
              Authorization: `Basic ${Base64.encode(
                `${website.clientId}:${website.clientSecret}`
              )}`,
              'Blade-Requested-With': 'BladeHttpRequest',
              'x-dev-id': import.meta.env.VITE_APP_BACKEND_USER_COUNT,
            },
            customInsert(res, insertFn) {
              const { code, data } = res;
              if (code === 200) {
                insertFn(data.link, 'img', data.link);
              }
              // insertFn(url, alt, href);
            },
            onError(file, error) {
              if (error.message === 'Upload error') {
                that.$message.error('上传失败');
              }
            },
            // onFailed(file, res) {
            //   const { code, data } = res;
            //   if (code === 200) {
            //     const match = data.link.match(/\/\d{6}\-/);
            //     let sublink = data.link.substring(match.index);
            //     let devAvatarId = 'https://static.eastwinbip.com' + sublink;
            //     const link = process.env.NODE_ENV === 'development' ? data.link : devAvatarId;
            //     that.editorRef?.dangerouslyInsertHtml(`<img class="dc-img" src="${link}" />`);
            //   }
            // },
          },
        },
      },
      mode: 'default',
    };
  },
  watch: {
    modelValue: {
      handler(newValue) {
        if (this.editorRef) {
          const html = this.editorRef.getHtml();
          if (html !== newValue) {
            this.editorRef.setHtml(newValue);
          }
        }
      },
      immediate: true,
    },
  },
  props: {
    disabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
    hideToolbar: {
      type: Boolean,
      default() {
        return false;
      },
    },
    readonly: {
      type: Boolean,
      default() {
        return false;
      },
    },

    modelValue: {
      type: String,
      default() {
        return '';
      },
    },
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    const editor = this.editorRef;
    if (editor == null) return;
    editor.destroy();
  },
  methods: {
    init() {
      const that = this;
      const editor = createEditor({
        selector: `#${this.id}`,
        config: this.editorConfig,
        html: this.modelValue || '<p><br></p>',
        onError: error => {
          console.error(' 编辑器错误:', error);
          // 自动恢复方案
          setTimeout(() => editor.restoreSelection(), 100);
        },
      });

      // if (this.disabled) {
      //   editor.toolbarElem?.style?.display = 'none';
      // }

      editor.on('change', () => {
        const html = editor.getHtml();
        that.$emit('update:modelValue', html);
        that.$emit('input', html);
        that.$emit('change', html);
      });

      if (this.disabled || this.readonly) {
        editor?.disable();
      }

      // 创建工具栏实例
      const toolbar = createToolbar({
        editor,
        selector: `#${this.toolbarId}`,
      });

      this.editorRef = editor;
      this.toolbarRef = toolbar;
    },
  },
};
</script>
<style lang="scss" scoped>
.comp-dc-editor {
  border: 1px solid var(--el-border-color);

  &.disabled {
    border: 1px solid rgb(229, 231, 235);
    background-color: var(--el-disabled-bg-color);
  }
}
.editor {
  min-height: 400px;
  // border: 1px solid var(--el-border-color);
}

:deep(.w-e-text-container) {
  min-height: 200px;
}

.toolbar-box,
.editor-box {
  display: block;
  width: 100%;
}
:deep(.w-e-modal) {
  .button-container {
    button {
      line-height: 18px;
    }
  }
}
</style>

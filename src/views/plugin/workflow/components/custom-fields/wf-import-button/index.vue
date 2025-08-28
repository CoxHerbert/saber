<template>
  <div style="display: flex; gap: 8px">
    <!-- 导入按钮 -->

    <el-upload
      action="/blade-bip/dcQt/dcExcelAnalysis"
      accept=".xlsx,.xls,.csv"
      :show-file-list="false"
      size="medium"
      :data="importParams"
      :http-request="handleCustomUpload"
      :on-success="handleImportSuccess"
      :on-error="handleImportError"
      :before-upload="handleBeforeUpload"
    >
      <el-button type="primary" icon="el-icon-upload" size="medium">导入</el-button>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'wf-import-button',
  props: {
    showImport: {
      type: Boolean,
      default: true,
    },
    showExport: {
      type: Boolean,
      default: true,
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
    importParams: {
      type: Object,
      default: () => ({}),
    },
    exportParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      importLoading: false,
      exportLoading: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    };
  },
  methods: {
    // 自定义上传，使用固定地址
    async handleCustomUpload(option) {
      try {
        const formData = new FormData();
        formData.append('file', option.file);
        for (const key in this.importParams) {
          if (this.importParams.hasOwnProperty(key)) {
            formData.append(key, this.importParams[key]);
          }
        }

        // 修复axios post请求格式
        const response = await this.$axios({
          url: '/blade-bip/dcQt/dcExcelAnalysis',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (response.data.success) {
          option.onSuccess(response.data);
        } else {
          option.onError(new Error(response.data.msg || '导入失败'));
        }
      } catch (error) {
        option.onError(error);
      }
    },

    handleBeforeUpload(file) {
      this.importLoading = true;
      if (file.size > this.maxFileSize) {
        this.importLoading = false;
        this.$message.error(`文件大小不能超过${this.maxFileSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    },

    handleImportSuccess(response) {
      this.importLoading = false;
      this.$message.success(response.msg || '导入成功');
      this.$emit('import-success', response);
    },

    handleImportError(err) {
      this.importLoading = false;
      this.$message.error('导入失败：' + (err.message || '未知错误'));
      this.$emit('import-error', err);
    },
  },
};
</script>

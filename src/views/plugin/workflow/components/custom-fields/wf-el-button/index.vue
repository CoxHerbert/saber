<template>
  <div style="display: flex; gap: 8px">
    <!-- 导入按钮 -->
    <el-button
      type="primary"
      icon="el-icon-upload2"
      size="mini"
      :loading="importLoading"
      style="position: relative; overflow: hidden"
    >
      导入
      <el-upload
        :action="importAction"
        accept=".xlsx,.xls,.csv"
        :show-file-list="false"
        size="mini"
        :data="getImportParams"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        :before-upload="handleBeforeUpload"
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        "
      >
        <el-button type="primary" size="mini">导入</el-button>
      </el-upload>
    </el-button>

    <!-- 导出按钮 -->
    <el-button
      type="success"
      icon="el-icon-download"
      size="mini"
      :loading="exportLoading"
      @click="handleExport"
    >
      导出
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'wf-el-button',
  props: {
    // 导入需要传递的参数
    importParams: {
      type: Object,
      default: () => ({}),
    },
    // 导出需要传递的参数
    exportParams: {
      type: Object,
      default: () => ({}),
    },
    // 导入接口地址
    importUrl: {
      type: String,
      default: '/blade-bip/dcQt/dcExcelAnalysis',
    },
    // 导出接口地址
    exportUrl: {
      type: String,
      default: '/blade-bip/dcQt/exportQtList',
    },
  },
  data() {
    return {
      importLoading: false,
      exportLoading: false,
      // 最大文件大小限制，这里设置为5MB
      maxFileSize: 5 * 1024 * 1024, // 5MB
    };
  },
  computed: {
    // 导入接口地址
    importAction() {
      return this.importUrl;
    },
    // 获取导入参数（可以在这里对参数进行加工处理）
    getImportParams() {
      // 可以根据需要对参数进行处理
      return {
        ...this.importParams,
        // 可以添加固定参数
        timestamp: new Date().getTime(),
      };
    },
  },
  methods: {
    // 上传前的验证
    handleBeforeUpload(file) {
      // 开始加载状态
      this.importLoading = true;

      // 验证文件大小
      if (file.size > this.maxFileSize) {
        this.importLoading = false;
        this.$message.error(`文件大小不能超过${this.maxFileSize / 1024 / 1024}MB`);
        return false; // 阻止上传
      }

      return true; // 允许上传
    },

    // 导入成功
    handleImportSuccess() {
      this.importLoading = false;
      this.$message.success('导入成功');
      // 可以添加导入成功后的回调
      this.$emit('import-success');
    },

    // 导入失败
    handleImportError(err) {
      this.importLoading = false;
      this.$message.error('导入失败：' + (err.response?.data?.msg || err.message || '未知错误'));
      this.$emit('import-error', err);
    },

    // 处理导出
    handleExport() {
      this.exportLoading = true;

      // 构建带参数的导出URL
      const params = new URLSearchParams({
        ...this.exportParams,
        // 可以添加固定参数
        timestamp: new Date().getTime(),
      });

      const url = `${this.exportUrl}?${params.toString()}`;

      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 延迟关闭加载状态，避免闪一下
      setTimeout(() => {
        this.exportLoading = false;
        this.$emit('export-success');
      }, 500);
    },
  },
};
</script>

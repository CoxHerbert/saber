<template>
  <div style="display: flex; gap: 8px">
    <!-- 导出按钮 -->
    <el-button
      v-if="showExport"
      type="success"
      icon="el-icon-download"
      size="medium"
      :loading="exportLoading"
      @click="handleExport"
    >
      <span>导出</span>
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'wf-export-button',
  props: {
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
      exportLoading: false,

      // 静态导出文件地址
      exportStaticUrl:
        'https://static.eastwinbip.com/static/%E7%89%A9%E6%96%99%E8%AF%A2%E4%BB%B7.xlsx',
    };
  },
  methods: {
    handleExport() {
      this.exportLoading = true;
      // 在新窗口打开导出文件地址
      //   window.open(this.exportStaticUrl, '_blank');
      const link = document.createElement('a');

      link.href = this.exportStaticUrl;
      link.click();
      link.remove();

      setTimeout(() => {
        this.exportLoading = false;
        this.$message.success('导出成功');
        this.$emit('export-success');
      }, 500);
    },
  },
};
</script>

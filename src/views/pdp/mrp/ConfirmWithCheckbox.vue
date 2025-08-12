<template>
  <el-dialog
    class="ConfirmDialog"
    v-model="visible"
    :title="title"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="onCancel"
  >
    <slot></slot>

    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    title: String,
  },
  data() {
    return {
      visible: false,
      _resolve: null,
      _reject: null,
    };
  },
  methods: {
    open() {
      this.visible = true;
      return new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
      });
    },
    onConfirm() {
      this.visible = false;
      this._resolve?.();
      this.remove();
    },
    onCancel() {
      this.visible = false;
      this._reject?.();
      this.remove();
    },
    remove() {
      this.$el?.parentNode?.removeChild(this.$el);
      this.$destroy?.();
    },
  },
};
</script>

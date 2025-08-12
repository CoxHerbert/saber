<template>
  <div class="comp-remote-select">
    <el-select
      v-bind="$attrs"
      :model-value="modelValue"
      filterable
      remote
      clearable
      :remote-method="remoteSearch"
      :loading="selectLoading"
      :placeholder="placeholder"
      @change="handleChange"
    >
      <el-option
        v-for="(item, i) in chekListOptions"
        :key="i"
        :label="item[labelKey]"
        :value="item[valueKey]"
      />
    </el-select>
    <el-icon v-if="modelValue" title="点击复制" class="copy-icon" @click="handleDblClick">
      <CopyDocument />
    </el-icon>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CompRemoteSelect',
  props: {
    action: {
      type: Function,
      default: () => {
        console.error('action is Null');
      },
    },
    renderLabel: {
      type: Function,
      default: null,
    },
    dataCallback: {
      type: Function,
      default: res => res.data.data,
    },
    queryKey: {
      type: String,
      default: 'name',
    },
    placeholder: {
      type: String,
      default: '请输入关键字',
    },
    labelKey: {
      type: String,
      default: 'label',
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    modelValue: {
      type: [String, Object],
      default: '',
    },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      selectLoading: false,
      chekListOptions: [],
    };
  },
  mounted() {
    if (this.modelValue) {
      this.remoteSearch(this.modelValue);
    }
  },
  methods: {
    async remoteSearch(query) {
      if (!query.trim()) return;
      this.selectLoading = true;
      try {
        const res = await this.action({ [this.queryKey]: query });
        if (res.data.code === 200) {
          const dataList = this.dataCallback(res);
          this.chekListOptions = dataList.map(item => ({
            ...item,
            label: item[this.labelKey],
            value: item[this.valueKey],
          }));
        }
      } finally {
        this.selectLoading = false;
      }
    },
    handleChange(val) {
      this.$emit('update:modelValue', val);
      const find = this.chekListOptions.find(item => item[this.valueKey] === val);
      this.$emit('change', find);
    },
    copyTextToClipboard(text, options = { successMsg: '复制成功', errorMsg: '复制失败' }) {
      const { successMsg, errorMsg } = options;
      if (!text || typeof text !== 'string') {
        errorMsg && this.$message.error(errorMsg);
        return Promise.resolve(false);
      }
      if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return Promise.resolve(this.fallbackCopy(text));
    },
    fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const success = document.execCommand('copy');
        if (!success) this.$message.error('复制命令被拒绝');
        return success;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    },
    handleDblClick() {
      if (this.modelValue) {
        const find = this.chekListOptions.find(item => item[this.valueKey] === this.modelValue);
        this.copyTextToClipboard(find?.[this.labelKey] || this.modelValue)
          .then(() => {
            this.$message.success('复制成功');
          })
          .catch(() => {
            this.$message.error('复制失败');
          });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.comp-remote-select {
  position: relative;
  width: 100%;
  height: auto;

  .copy-icon {
    position: absolute;
    right: 1px;
    top: 1px;
    height: 30px;
    display: none;
    align-items: center;
    background-color: #fff;

    &:hover {
      display: block;
    }
  }

  &:hover {
    .copy-icon {
      display: block;
    }
  }
}
</style>

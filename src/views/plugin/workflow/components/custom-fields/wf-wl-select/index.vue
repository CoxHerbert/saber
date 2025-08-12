<template>
  <div class="wl-wrapper">
    <el-select
      readonly
      :disabled="disabled"
      class="organization"
      v-model="fuseorgid"
      placeholder="请选组织"
      clearable
    >
      <el-option
        v-for="(item, index) in ORG_LIST_CACHE"
        :key="index"
        :value="item.value"
        :label="item.label"
      />
    </el-select>
    <el-input
      v-model="name"
      :size="size"
      suffix-icon="el-icon-search"
      :placeholder="placeholder || '物料选择'"
      readonly
      :disabled="disabled"
      @click="handleSelect"
    ></el-input>
    <!-- 物料选择弹窗 -->
    <nf-wl-select
      ref="material-select"
      :check-type="checkType"
      :default-checked="modelValue"
      :fuseorgid="fuseorgid"
      checkType="radio"
      @onConfirm="handleSelectConfirm"
    ></nf-wl-select>
  </div>
</template>
<script>
import { getCurrentInstance } from 'vue';
import NfWlSelect from '../../nf-wl-select/index.vue';

export default {
  name: 'wl-select',
  components: { NfWlSelect },
  emits: ['update:modelValue'],
  props: {
    modelValue: [String, Number, Object],
    checkType: {
      // radio单选 checkbox多选
      type: String,
      default: () => {
        return 'radio';
      },
    },
    size: {
      type: String,
      default: () => {
        return 'default';
      },
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
    userUrl: {
      type: String,
      default: () => {
        return '/blade-system/search/user';
      },
    },
    change: Function,
  },

  watch: {
    modelValue: {
      handler(val) {
        if (val) {
          this.name = this.modelValue.fname;
        } else this.name = '';
      },
      immediate: true,
    },
  },

  data() {
    return {
      name: '',
      fuseorgid: '100006',
      ORG_LIST_CACHE: [],
    };
  },

  mounted() {
    console.log(this);
    const { proxy } = getCurrentInstance();
    // 数据字典
    const { ORG_LIST_CACHE } = proxy.useCache([{ key: 'ORG_LIST_CACHE' }]);
    this.ORG_LIST_CACHE = ORG_LIST_CACHE;
  },
  methods: {
    handleSelect() {
      if (this.readonly || this.disabled) return;
      if (!this.fuseorgid) {
        this.$message.warning('请先选择组织');
        return;
      }
      this.$refs['material-select'].visible = true;
    },
    handleSelectConfirm(fnumber, names, list) {
      this.name = list[0].fname;
      this.$emit('update:modelValue', list[0]);
      if (this.change && typeof this.change == 'function') this.change({ value: list[0] });
    },
  },
};
</script>
<style lang="scss" scoped>
.wl-wrapper {
  display: flex;
  align-items: center;
  .organization {
    margin-right: 20px;
  }
}
</style>

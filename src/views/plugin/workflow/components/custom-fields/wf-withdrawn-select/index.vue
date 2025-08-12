<template>
  <div class="wl-wrapper">
    <el-input
      v-model="name"
      :size="size"
      suffix-icon="el-icon-search"
      :placeholder="placeholder || '离职人员查询'"
      readonly
      :disabled="disabled"
      @click="handleSelect"
    ></el-input>
    <!-- 选择弹窗 -->
    <WithdrawnSelect
      ref="material-select"
      title="离职人员查询"
      :check-type="checkType"
      :default-checked="modelValue"
      checkType="radio"
      @onConfirm="handleSelectConfirm"
    ></WithdrawnSelect>
  </div>
</template>
<script>
import WithdrawnSelect from '../../nf-withdrawn-select/index.vue';

export default {
  name: 'withdrawn-select',
  components: { WithdrawnSelect },
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
    change: Function,
  },

  watch: {
    modelValue: {
      handler(val) {
        if (val) {
          this.name = this.modelValue.name;
        } else this.name = '';
      },
      immediate: true,
    },
  },
  data() {
    return {
      name: '',
    };
  },

  methods: {
    handleSelect() {
      if (this.readonly || this.disabled) return;
      this.$refs['material-select'].visible = true;
    },
    handleSelectConfirm(list) {
      this.name = list[0].name;
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

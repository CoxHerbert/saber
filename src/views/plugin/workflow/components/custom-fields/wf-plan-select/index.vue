<template>
  <div class="wl-wrapper">
    <el-input
      v-model="name"
      :size="size"
      suffix-icon="el-icon-search"
      :placeholder="placeholder || '现场计划查询'"
      readonly
      :disabled="disabled"
      @click="handleSelect"
    ></el-input>
    <!-- 选择弹窗 -->
    <nf-plan-select
      ref="material-select"
      :check-type="checkType"
      :default-checked="modelValue"
      checkType="radio"
      @onConfirm="handleSelectConfirm"
    ></nf-plan-select>
  </div>
</template>
<script>
import NfPlanSelect from '../../nf-plan-select/index.vue';

export default {
  name: 'plan-select',
  components: { NfPlanSelect },
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

  data() {
    return {
      name: '',
    };
  },

  watch: {
    modelValue: {
      handler(val) {
        if (val) {
          this.name = this.modelValue.lineCode;
        } else this.name = '';
      },
      immediate: true,
    },
  },

  methods: {
    handleSelect() {
      if (this.readonly || this.disabled) return;
      this.$refs['material-select'].visible = true;
    },
    handleSelectConfirm(list) {
      this.name = list[0].lineCode;
      this.$emit('update:modelValue', list[0]);
      if (this.change && typeof this.change == 'function') this.change({ value: list[0] });
      //  用于表单数据回显change事件
      //   Object.getOwnPropertyNames(value).forEach(item => {
      //     console.log(item, '-----------', value[item]);
      //     if (this.form.hasOwnProperty(item)) {
      //       this.form[item] = value[item];
      //     }
      //   });
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

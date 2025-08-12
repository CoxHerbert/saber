<template>
  <div>
    <component
      v-if="!readonly && !disabled"
      v-bind="VBind"
      :is="VBind.is"
      :params="params"
      :multipleLimit="multipleLimit"
      v-model="text"
      @change="
        e => {
          handleChange(e);
        }
      "
    ></component>
    <dc-view v-else v-model="text" :objectName="VBind.objectName" />
  </div>
</template>

<script>
export default {
  name: 'wf-select-render',
  emits: ['change'],
  props: {
    modelValue: {},
    uploadBefore: Function,
    uploadDelete: Function,
    uploadAfter: Function,
    uploadPreview: Function,
    uploadError: Function,
    uploadExceed: Function,
    columnSlot: {
      type: Array,
      default: () => {
        return [];
      },
    },
    props: {
      type: Object,
    },
    clearable: {
      type: Boolean,
    },
    enter: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
    propsHttp: {
      type: Object,
      default: () => {
        return {};
      },
    },
    dic: {
      type: Array,
    },
    size: {
      type: String,
    },
    disabled: {
      type: Boolean,
    },
    readonly: {
      type: Boolean,
    },
    column: {
      type: Object,
      default: () => {
        return {};
      },
    },
    dynamicIndex: {
      type: Number,
    },
    showLabel: {
      type: Boolean,
      default: true,
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    multipleLimit: {
      type: Number,
      default: 1,
    },
    change: Function,
    prop: Object,
  },
  watch: {
    text: {
      handler(val) {
        if (this.init || !this.validateNull(val)) {
          this.init = true;
          this.$emit('update:modelValue', val);
          this.$emit('change', val);
        } else {
          this.init = true;
        }
      },
    },
    modelValue: {
      handler(val) {
        this.text = val;
      },
      immediate: true,
    },
  },
  computed: {
    VBind() {
      const _attrs = this.$attrs;
      const that = this;
      // 表单设计器返回的自定义参数
      const params = this.$attrs?.params;
      return {
        is: _attrs.is,
        objectName: _attrs.objectName,
        placeholder: _attrs.placeholder,
        type: this.type,
        disabled: that.disabled,
        readonly: that.readonly,
        ...params,
      };
    },
  },
  data() {
    return {
      init: false,
      text: undefined,
    };
  },
  methods: {
    handleChange(item) {
      this.changeValue = item;
      if (typeof this.change === 'function') {
        const obj = {
          value: item,
          column: this.column,
          index: this.dynamicIndex,
          text: this.text,
        };
        this.change(obj);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>

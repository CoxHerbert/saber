<template>
  <template v-if="$slots.default">
    <slot></slot>
  </template>
  <template v-else-if="data?.transVal">
    <span v-bind="data?.props">{{ val }}</span>
  </template>
  <template
    v-else-if="
      [
        'input',
        'el-input',
        'date',
        'el-date-picker',
        'number',
        'el-input-number',
        'rowText',
      ].includes(data.type)
    "
  >
    {{ [undefined, null, ' ', ''].includes(val) ? '-' : val }}
  </template>
  <template v-else-if="['dict', 'el-select', 'select'].includes(data.type)">
    <dc-dict-key :options="dictMaps?.[data.dictKey]" :value="val"></dc-dict-key>
  </template>
  <template
    v-else-if="
      [
        'dc-select-user',
        'dc-select-dialog',
        'dc-select-dialog-v2',
        'wf-select-dialog',
        'wf-select-single',
        'dc-view',
      ].includes(data.type)
    "
  >
    <template v-if="[undefined, null, '', ' '].includes(val)">-</template>
    <dc-view v-if="'dc-select-user' === data.type" v-model="val" :objectName="data.objectName" />
    <dc-view v-else v-model="val" :objectName="data.objectName" />
  </template>
  <template v-else-if="['dc-upload'].includes(data.type)">
    <dc-upload v-model="val" :isUpload="false" :isRemove="false" :limit="99999" />
  </template>
  <template v-else>
    {{ [undefined, null, ' ', ''].includes(val) ? '-' : val }}
  </template>
</template>

<script>
export default {
  name: 'dc-field-view',
  props: {
    // 绑定的值
    value: {
      type: [String, Number, Object, null],
      default: null,
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    dictMaps: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  watch: {
    value: {
      handler(newVal) {
        this.val = newVal;
      },
      immediate: true,
    },
  },
  data() {
    return { val: null };
  },
};
</script>

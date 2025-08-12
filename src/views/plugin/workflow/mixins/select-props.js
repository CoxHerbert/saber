import cacheData from '@/components/dc/constant/cacheData';
export default {
  props: {
    modelValue: { type: [String, Array, Object, null], default: null },
    title: { type: String, default: '' },
    useSlot: {
      type: Boolean,
      default: false,
    },
    objectName: {
      type: String,
      default: '',
      validator: value => Object.keys(cacheData).includes(value),
    },
    returnType: {
      type: String,
      default: 'string',
      validator: value => ['string', 'object'].includes(value),
    },
    width: { type: String, default: '100%' },
    placeholder: { type: String, default: '请点击选择' },
    disabled: { type: Boolean, default: false },
    dialogWidth: { type: String, default: '1200px' },
    query: {
      type: Object,
      default: () => {
        return {};
      },
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
    multiple: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    showKey: { type: String, default: '' },
    masterKey: { type: String, default: '' },
    inputProps: { type: Object, default: () => ({}) },
    change: Function,
  },
};

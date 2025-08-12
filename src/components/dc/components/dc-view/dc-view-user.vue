<template>
  <div class="user-info">
    <span class="avatar">
      <img class="img" :src="currentUser?.avatar || emptyImg" alt="头像" />
    </span>
    <span class="real-name">
      {{ viewText || props.modelValue }}
    </span>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import ComponentApi from './../../api/index';
import store from '@/store/';
import cacheData from './../../constant/cacheData';

const emptyImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const props = defineProps({
  // 需要展示的类名 比如用户 user
  objectName: {
    type: String,
    default() {
      return 'user';
    },
  },
  // 绑定的值
  modelValue: {
    type: [String, Number],
    default: null,
  },
  // 显示的键名
  showKey: {
    type: String,
    default: null,
  },
});
const componentData = reactive({
  // 输入框数据
  iptTagData: [],

  currentUser: {},
  // 当前对象
  currentObject: null,
});
const { iptTagData, currentObject, currentUser } = toRefs(componentData);
watch(
  () => props.modelValue,
  async (newVal, oldVal) => {
    try {
      currentObject.value = cacheData[props.objectName];
      let ids;
      if (Array.isArray(newVal)) {
        ids = newVal.map(item => item?.id || item);
      } else if (typeof newVal === 'object' && newVal !== null) {
        try {
          ids = [newVal?.id];
        } catch (error) {
          ids = '';
        }
      } else if (typeof newVal === 'string') {
        ids = newVal.split(',');
      } else if (typeof newVal === 'number') {
        ids = [String(newVal)];
      } else {
        ids = '';
      }
      if (!ids || (Array.isArray(ids) && ids.length === 0)) return;
      await ComponentApi.cache.getView({
        url: currentObject.value.url,
        data: ids,
      });
      const currentGlobalData = store.getters.globalData[currentObject.value.url];
      componentData.iptTagData = ids.map(id => currentGlobalData[id] || id);
    } catch (error) {
      console.error(error);
      return `Error: ${error.message}`;
    }
  },
  { deep: true, immediate: true }
);
const viewText = computed(() => {
  if (Array.isArray(iptTagData.value) && iptTagData.value.length) {
    return iptTagData.value
      .map(item => {
        let value = item.id;
        if (currentObject.value?.defaultLabel || props?.showKey) {
          try {
            value = item[currentObject.value?.defaultLabel || props?.showKey];
            currentUser.value = item;
          } catch (error) {
            value = item.id;
          }
        }
        return value;
      })
      .join(',');
  } else {
    return '-';
  }
});
</script>
<style lang="scss" scoped>
.user-info {
  display: flex;
  line-height: 24px;
  align-items: center;

  .img {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;

    background-color: rgba($color: #000000, $alpha: 0.05);
  }
  .real-name {
    font-weight: 400;
    font-size: 14px;
    color: #666666;
    line-height: 14px;
    text-align: left;
    font-style: normal;
    text-transform: none;
  }
}
</style>

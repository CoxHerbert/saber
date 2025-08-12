<template>
  <div v-if="type == 'tag'" class="tag-rows">
    <div
      class="tag"
      :style="{
        background: bgColor,
        color: textColor,
      }"
      v-for="item in viewText.split(',')"
      :key="tag + item"
    >
      {{ item || '-' }}
    </div>
  </div>
  <div class="dc-view" v-if="type == 'text'">
    {{ viewText || props.modelValue || '-' }}
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import ComponentApi from './../../api/index';
import store from '@/store/';
import cacheData from './../../constant/cacheData';
const props = defineProps({
  // 类型
  type: {
    type: String,
    default: 'text',
  },

  bgColor: {
    type: String,
    default: 'rgb(252.5, 245.7, 235.5)',
  },
  textColor: {
    type: String,
    default: '#e6a23c',
  },
  // 需要展示的类名 比如用户 user
  objectName: {
    type: String,
    default: null,
  },
  // 绑定的值
  modelValue: {
    type: [String, Number],
    default: null,
  },
  // 显示的键名
  showLabel: {
    type: String,
    default: null,
  },
});
const componentData = reactive({
  // 输入框数据
  iptTagData: [],
  // 当前对象
  currentObject: null,
});
const { iptTagData, currentObject } = toRefs(componentData);
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
        const labelSet = props?.showLabel ? props?.showLabel : currentObject.value?.defaultLabel;
        if (labelSet) {
          try {
            value = item[labelSet];
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
<style lang="scss">
.tag-rows {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  .tag {
    margin: 0px 2px;
    border-radius: 6px;
    padding: 0px 8px;
    box-sizing: border-box;
    font-size: 12px;
  }
}
.dc-view {
  display: inline-block;
}
</style>

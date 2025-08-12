<template>
  <div class="comp-page-search">
    <!-- 左侧tab -->
    <div v-if="tabConfig && tabConfig?.items?.length > 0" class="comp-search-left">
      <el-tabs
        class="search-tab-box"
        :modelValue="modelValue[tabConfig.prop]"
        @tab-change="handleTabClick"
      >
        <el-tab-pane
          :label="item.label"
          :name="item.value"
          v-for="(item, index) in tabConfig?.items || []"
          :key="index"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <!-- 右侧搜索 -->
    <div class="comp-search-right">
      <searchGroup
        v-if="searchItemConfig?.paramType"
        :config="searchItemConfig"
        :labelMaps="labelMaps"
        :initParams="{ startTime: null, endTime: null }"
        :modelValue="modelValue"
        @dcTimeRangeClose="handleDcTimeRangeClose"
        @change="handleChangeSearchGroup"
        @search="handleSearch"
        @closeKey="hanldleCloseKey"
        style="width: 100%"
      >
        <template #controls="scoped">
          <dc-date-range
            v-if="scoped.item?.type === 'dc-date-range'"
            v-model:startDate="scoped.queryParams.startTime"
            v-model:endDate="scoped.queryParams.endTime"
            :clearable="false"
            @keyup.enter="handleKeyupEnter"
            @change="
              val => {
                handleSearchItemChange(scoped, val);
              }
            "
          />
          <dc-select
            v-else-if="scoped.item?.type === 'dc-select'"
            v-bind="scoped.item.props"
            :modelValue="scoped.queryParams[scoped.paramKey]"
            class="param-value"
            @keyup.enter="handleKeyupEnter"
            @change="
              val => {
                handleSearchItemChange(scoped, val);
              }
            "
          />
          <dc-select-dialog-v2
            v-else-if="scoped.item?.type === 'dc-select-dialog'"
            class="param-value"
            :modelValue="scoped.queryParams[scoped.paramKey]"
            v-bind="scoped.item.props"
            type="input"
            @iptTagDataUpdate="
              val => {
                handleSearchItemChange(scoped, val);
              }
            "
          >
            <template #search-items="selectDialogScoped">
              <slot name="dc-select-dialog-search-items" v-bind="{ ...scoped, selectDialogScoped }">
              </slot>
            </template>
          </dc-select-dialog-v2>
          <wf-select-dialog
            v-else-if="scoped.item?.type === 'wf-select-dialog'"
            class="param-value"
            :modelValue="scoped.queryParams[scoped.paramKey]"
            v-bind="scoped.item.props"
            @change="
              val => {
                handleSearchItemChange(scoped, val);
              }
            "
          >
          </wf-select-dialog>
          <dc-select-user
            v-else-if="scoped.item?.type === 'dc-select-user'"
            v-bind="scoped.item.props"
            :modelValue="scoped.queryParams[scoped.paramKey]"
            @keyup.enter="handleKeyupEnter"
            @iptTagDataUpdate="
              val => {
                handleSearchItemChange(scoped, val);
              }
            "
          />
          <!-- 自定义扩展 -->
          <slot v-bind="scoped"></slot>
        </template>
        <template #btn-sub="scoped">
          <slot name="btn-sub" v-bind="scoped">
            <el-button @click="handleReset(scoped)">重置</el-button>
          </slot>
        </template>
      </searchGroup>
    </div>
  </div>
</template>

<script setup>
// 通用search搜索栏组件

import { onMounted, defineExpose, defineEmits, reactive, watch } from 'vue'; // defineProps,
import cacheData from './../../constant/cacheData';
import SearchGroup from './search-group.vue';

const emit = defineEmits(['search', 'update:modelValue', 'itemChange', 'reset']);
const EmptyData = [null, undefined, ''];
const compData = reactive({
  labelMaps: {},
});

const { labelMaps } = toRefs(compData);

const props = defineProps({
  initializeValue: {
    type: Object,
    default() {
      return {
        size: 20,
        current: 1,
      };
    },
  },
  // reset 重置时忽略的字段,可自定义
  resetExcludeKeys: {
    type: Array,
    default() {
      return ['page', 'current'];
    },
  },
  // model 绑定值
  modelValue: {
    type: Object,
    default() {
      return {};
    },
  },
  /** 左侧tab配置
   * 示例:
   * {
   *    prop: 'status', // 绑定到search参数的字段
   *    items: [  // 选项
   *        {
   *            label: '未指派',
   *            value: '1',
   *        },
   *        {
   *            label: '已指派',
   *            value: '2',
   *        },
   *        {
   *            label: '全部',
   *            value: '3',
   *        },
   *    ]
   * }
   */
  tabConfig: {
    type: Object,
    default() {
      return null;
    },
    validator(value) {
      const NullArr = ref([null, undefined]);
      if (NullArr.value.includes(value)) {
        return true;
      } else {
        if (NullArr.value.includes(value?.prop)) {
          console.error('tabConfig.prop不能为空');
          return false;
        } else if (!(Array.isArray(value?.items) && value?.items?.length > 0)) {
          console.error('tabConfig.items选项不能为空');
          return false;
        } else if (
          !value?.items?.every(item => {
            return !(NullArr.value.includes(item.label) && NullArr.value.includes(item.value));
          })
        ) {
          console.error(
            'tabConfig.items每个选项必须包含label字段和value字段且不能为【null | undefined】'
          );
          return false;
        }
      }
      return true;
    },
  },
  searchItemConfig: {
    type: Object,
    default() {
      return null;
    },
  },
});

const updataMaps = value => {
  Object.keys(labelMaps.value).forEach(key => {
    if (
      Array.isArray(value[key]) &&
      value[key]?.length === 0 &&
      props.searchItemConfig?.paramType?.[key].type !== 'dc-date-range'
    ) {
      labelMaps.value[key] = null;
    }
    if ([null, undefined, ''].includes(value[key])) {
      if (props.searchItemConfig?.paramType?.[key].type === 'dc-date-range') {
        if ([null, undefined, ''].includes(value.startTime)) {
          labelMaps.value[key] = null;
        }
      } else {
        labelMaps.value[key] = null;
      }
    }
  });
};

watch(
  () => props.modelValue,
  value => {
    updataMaps(value);
  },
  {
    deep: true,
  }
);

/** 值变化 */
const handleSearchItemChange = (scoped, val) => {
  let cacheObj =
    scoped.item?.type === 'dc-select-user'
      ? cacheData.user
      : cacheData[scoped.item.props?.objectName];
  let labelKey = scoped.item.props?.labelKey ? scoped.item.props?.labelKey : cacheObj?.defaultLabel;
  // 默认取的id，后续可能需要扩展
  const valueKey = 'id';
  let valueSet = null;

  switch (scoped.item?.type) {
    case 'dc-select':
    case 'dc-select-dialog':
    case 'dc-select-user':
      if (EmptyData.includes(labelKey)) {
        console.error('请指定labelKey', scoped.item);
        return;
      }
      labelMaps.value[scoped.paramKey] = Array.isArray(val)
        ? val.map(row => row?.[labelKey]).join(',')
        : val?.[labelKey];
      // 默认取的id，后续可能需要扩展
      if (scoped.item?.props?.returnType === 'string') {
        if (Array.isArray(val)) {
          if (val?.length > 0) {
            valueSet = val.map(row => row[valueKey]).join(',');
          } else {
            valueSet = null;
          }
        } else {
          valueSet = val?.[valueKey] || val;
        }
      } else {
        if (Array.isArray(val)) {
          if (val?.length > 0) {
            valueSet = val.map(row => row[valueKey]);
          } else {
            valueSet = null;
          }
        } else {
          valueSet = val?.[valueKey] || val;
        }
      }
      // let valueSet = Array.isArray(val)
      //   ? scoped.item?.props?.returnType === 'string'
      //     ? val.map(row => row[valueKey]).join(',')
      //     : val.map(row => row[valueKey])
      //   : val?.[valueKey];
      // 特殊情况
      valueSet = valueSet || val;
      scoped.changeCallback(valueSet);
      // 抛给外面使用，兼容联动的情况
      emit('itemChange', { item: scoped.item, val });
      break;
    case 'dc-date-range':
      labelMaps.value[scoped.paramKey] = val?.[0] && val?.[1] ? `${val[0]}至${val[1]}` : null;
      const dataEmit = { ...props.modelValue, startTime: val?.[0], endTime: val?.[1] };
      emit('update:modelValue', dataEmit);
      break;
    case 'wf-select-dialog':
      if (EmptyData.includes(labelKey)) {
        console.error('请指定labelKey', scoped.item);
        return;
      }
      labelMaps.value[scoped.paramKey] = Array.isArray(val)
        ? val.map(row => row?.[labelKey]).join(',')
        : val?.[labelKey];

      if (scoped.item?.props?.returnType === 'object') {
        if (Array.isArray(val)) {
          if (val?.length > 0) {
            valueSet = val.map(row => row[valueKey]);
          } else {
            valueSet = null;
          }
        } else {
          valueSet = val?.[valueKey] || val;
        }
      } else {
        if (Array.isArray(val)) {
          if (val?.length > 0) {
            valueSet = val.map(row => row[valueKey]).join(',');
          } else {
            valueSet = null;
          }
        } else {
          valueSet = val?.[valueKey] || val;
        }
      }
      // let valueSet = Array.isArray(val)
      //   ? scoped.item?.props?.returnType === 'string'
      //     ? val.map(row => row[valueKey]).join(',')
      //     : val.map(row => row[valueKey])
      //   : val?.[valueKey];
      // 特殊情况
      valueSet = valueSet || val;
      scoped.changeCallback(valueSet);
      // 抛给外面使用，兼容联动的情况
      emit('itemChange', { item: scoped.item, val });
      break;
    default:
      console.warn('值变化监听, 未支持的类型', 'scoped', scoped, 'value', val);
      break;
  }
};

/** 重置 */
const handleReset = scoped => {
  Object.keys(scoped.queryParams)
    .filter(k => k !== props.tabConfig?.prop || !(props.resetExcludeKeys || []).includes(k))
    .forEach(key => {
      if (!EmptyData.includes(labelMaps.value[key])) {
        labelMaps.value[key] = null;
      }
      scoped.queryParams[key] = null;
    });
  emit('update:modelValue', {
    ...scoped.queryParams,
    ...JSON.parse(JSON.stringify(props.initializeValue)),
  });
  setTimeout(() => {
    emit('reset');
  }, 10);
};

const handleTabClick = val => {
  const value = {
    ...props.modelValue,
    [props.tabConfig?.prop]: val,
  };
  emit('update:modelValue', value);
  emit('search', value);
};

const handleDcTimeRangeClose = key => {
  labelMaps.value[key] = null;
};

const handleChangeSearchGroup = value => {
  emit('update:modelValue', value);
};

const hanldleCloseKey = key => {
  labelMaps.value[key] = null;
};

const handleKeyupEnter = () => {
  emit('search', props.modelValue);
};

const handleSearch = params => {
  emit('search', params);
};

onMounted(() => {});

// 开放方法给外面调用
defineExpose({
  handleReset,
});
</script>
<style lang="scss" scoped>
.comp-page-search {
  height: 44px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  width: 100%;

  .comp-search-left {
    width: auto;
    box-sizing: border-box;
  }
  .search-tab-box {
    :deep(.el-tabs__header) {
      margin-bottom: 0;
      transform: translateY(4px);
    }
    :deep(.el-tabs__nav) {
      height: 40px;
    }
  }

  .comp-search-right {
    flex: 1;
    box-sizing: border-box;

    :deep(.select-param) {
      min-width: 100px;
    }
    // el-select-user css hack
    :deep(.ipt-tag-select) {
      min-width: 150px;
      border-radius: 0;
      border-top: 1px solid #dadbe0;
      border-bottom: 1px solid #dadbe0;
      border-left: none;
      border-right: none;
      box-shadow: none;
      height: 34px;
    }
    :deep(.param-value) {
      min-width: 200px;
      border-radius: 0;
      border-top: 1px solid #dadbe0;
      border-bottom: 1px solid #dadbe0;
    }
  }

  :deep(.el-tabs__nav-wrap):after {
    height: 0px !important;
  }

  :deep(.el-tabs__item) {
    height: 32px;
  }
}
</style>

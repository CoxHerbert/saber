<template>
  <div class="search-group">
    <div class="param-group">
      <div class="tag-box">
        <div
          class="render-box"
          :class="{
            'has-next-row': needExpandTag,
          }"
        >
          <div
            ref="tagList"
            class="tag-list"
            :class="{
              fix: needExpandTag,
            }"
          >
            <template v-for="(key, index) in paramsTag">
              <span
                v-if="config.paramType[paramKey]"
                class="search-item-tag"
                :key="index"
                @click.stop="tagClick"
              >
                <span class="el-tag__content">
                  {{ getLabelValue(key) }}
                </span>
                <span class="tag-close" @click.stop="close(key)">
                  <el-icon><CircleCloseFilled /></el-icon>
                </span>
              </span>
            </template>
          </div>
          <span class="expand" v-if="needExpandTag"
            >全部参数<ArrowRight style="width: 10px; height: 10px; margin-left: 2px"
          /></span>
        </div>
      </div>
    </div>
    <!-- 选择器-->
    <div class="control-box">
      <el-select
        class="select-param"
        v-model="paramKey"
        @keyup.enter="handleKeyupEnter"
        placeholder="选择类型"
      >
        <el-option
          v-for="(option, index) in paramOption"
          :label="option.label"
          :value="option.paramKey"
          :key="index"
        />
      </el-select>
      <div class="param-value-box">
        <el-input
          v-if="paramKey && ['input', 'el-input'].includes(config.paramType[paramKey]?.type)"
          class="param-value"
          @keyup.enter="handleKeyupEnter"
          :placeholder="
            config.paramType[paramKey]?.placeholder
              ? config.paramType[paramKey]?.placeholder
              : '请输入'
          "
          :modelValue="modelValue[paramKey]"
          @input="
            val => {
              handleItemChange(val, paramKey, config.paramType[paramKey]);
            }
          "
        />
        <el-select
          class="param-value"
          v-else-if="
            paramKey && ['dict', 'select', 'el-select'].includes(config.paramType[paramKey]?.type)
          "
          :modelValue="modelValue[paramKey]"
          :placeholder="
            config.paramType[paramKey]?.placeholder
              ? config.paramType[paramKey]?.placeholder
              : '请选择'
          "
          @keyup.enter="handleKeyupEnter"
          @change="
            val => {
              handleItemChange(val, paramKey, config.paramType[paramKey]);
            }
          "
        >
          <!-- 配置里面有withGroup的情况 -->
          <template v-if="config.paramType[paramKey].withGroup">
            <el-option-group
              v-for="(group, i) in config.paramType[paramKey].options"
              :key="i"
              :label="
                config.paramType[paramKey]?.labelKey
                  ? group[config.paramType[paramKey]?.labelKey]
                  : group.label
              "
            >
              <el-option
                v-for="(option, j) in group.children"
                :key="j"
                :label="
                  config.paramType[paramKey]?.labelKey
                    ? option[config.paramType[paramKey]?.labelKey]
                    : option.label
                "
                :value="
                  config.paramType[paramKey]?.valueKey
                    ? option[config.paramType[paramKey]?.valueKey]
                    : option.value
                "
              />
            </el-option-group>
          </template>
          <template v-else>
            <el-option
              v-for="(option, index) in config.paramType[paramKey].options"
              :key="index"
              :label="
                config.paramType[paramKey]?.labelKey
                  ? option[config.paramType[paramKey]?.labelKey]
                  : option.label
              "
              :value="
                config.paramType[paramKey]?.valueKey
                  ? option[config.paramType[paramKey]?.valueKey]
                  : option.value
              "
            />
          </template>
        </el-select>
        <component
          v-if="paramKey && config.paramType[paramKey]?.type === 'el-date-picker'"
          v-bind="config.paramType[paramKey].props"
          :is="config.paramType[paramKey].type"
          class="param-value"
          v-model="modelValue[paramKey]"
          @keyup.enter="handleKeyupEnter"
          @input="
            val => {
              handleItemChange(val, paramKey, config.paramType[paramKey]);
            }
          "
        />
        <!-- slot支持更多 -->
        <!-- <div v-else class="param-value"> -->
        <slot
          name="controls"
          :key="paramKey"
          :paramKey="paramKey"
          :item="config.paramType[paramKey]"
          :queryParams="modelValue"
          :config="config"
          :changeCallback="
            val => {
              handleItemChange(val, paramKey, config.paramType[paramKey]);
            }
          "
        ></slot>
        <!-- </div> -->
      </div>
      <!--操作-->
      <el-button class="search-btn" icon="Search" type="primary" @click="search" />
      <slot name="btn-sub" :queryParams="modelValue"></slot>
    </div>
  </div>
</template>

<script setup>
// getCurrentInstance,
import { onBeforeMount, onBeforeUnmount, defineEmits, onMounted } from 'vue';

const tagList = ref(null);

const emit = defineEmits(['search', 'change', 'dcTimeRangeClose', 'update:modelValue', 'closeKey']);

const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {};
    },
  },
  labelMaps: {
    type: Object,
    default() {
      return {};
    },
  },
  config: {
    type: Object,
    default: {
      paramType: {},
    },
  },
});

const data = reactive({
  paramKey: null,
  needExpandTag: false,
});

// 已输入选择的参数
const paramsTag = computed(() => {
  const result = Object.keys(props.modelValue)
    .filter(key => (!!props.modelValue[key] || getLabelValue(key)) && props.config.paramType[key])
    .sort((a, b) => {
      const aMatch = a === paramKey.value;
      const bMatch = b === paramKey.value;
      return aMatch && !bMatch ? -1 : 1;
    });
  // watch 一个控件绑定多个数据有时候监听不到数据变化
  setTimeout(calcData, 100);
  return result;
});

const calcData = () => {
  needExpandTag.value = tagList.value?.scrollHeight > 34;
};

// 参数选项
const paramOption = computed(() => {
  return Object.keys(props.config.paramType).map(key => props.config.paramType[key]);
});

const { paramKey, needExpandTag } = toRefs(data);

const addEvent = () => {
  window.addEventListener('resize', calcData);
};

const removeEvent = () => {
  window.removeEventListener('resize', calcData);
};

onBeforeMount(() => {
  Object.keys(props.config.paramType).forEach((key, index) => {
    if (!index) paramKey.value = key;
    props.modelValue[key] = undefined === props.modelValue[key] ? null : props.modelValue[key];
  });
  addEvent();
});

onBeforeUnmount(() => {
  removeEvent();
});

/** 递归寻找匹配的数据 */
function findMatches(items, condition) {
  let results = [];
  function search(arr) {
    arr.forEach(item => {
      if (condition(item)) {
        results.push(item);
      }
      if (item.children) {
        search(item.children); // 递归调用
      }
    });
  }
  search(items);
  return results;
}

const getSelectLabel = key => {
  const itemConfig = props.config.paramType[key];
  const options = itemConfig.options || [];
  const result = findMatches(
    options,
    item =>
      item.value === props.modelValue[key] || item[itemConfig.valueKey] === props.modelValue[key]
  );
  return result?.[0]?.label || result?.[0]?.[itemConfig.labelKey];
};

// 获取label:value
const getLabelValue = key => {
  const paramType = props.config.paramType[key];
  if (!paramType) {
    return;
  }
  // 优先从props.labelMaps里面拿
  if (![null, undefined, ''].includes(props.labelMaps[key])) {
    return `${paramType.label}：${props.labelMaps[key]}`;
  }
  // 然后看看配置里面有没有getLabelValue方法，有就从里面拿
  if (paramType?.getLabelValue?.call) {
    return paramType?.getLabelValue(props.modelValue);
  }
  // 然后是默认的方式获取
  if (
    [null, undefined, ''].includes(props.modelValue[key]) ||
    (Array.isArray(props.modelValue[key]) && props.modelValue[key].length === 0)
  ) {
    return;
  }
  // 需要考虑 带children的情况
  const paramValue = paramType?.type === 'select' ? getSelectLabel(key) : props.modelValue[key];
  if ([100006, '100006'].includes(paramValue))
    return `${paramType.label}：广东金龙东创智能装备有限公司`;
  return `${paramType.label}：${paramValue}`;
};

const close = key => {
  const valueSet = { ...props.modelValue };
  // 如果配置里面写了clear就调它自己的，多用于一个控件绑定多个key的情况
  if (props.config.paramType[key].type === 'dc-date-range') {
    valueSet.startTime = null;
    valueSet.endTime = null;
    emit('dcTimeRangeClose', key);
  }
  if (props.config.paramType[key].clear?.call) {
    props.config.paramType[key].clear(props.modelValue);
  } else {
    valueSet[key] = null;
  }
  emit('change', valueSet);
  emit('closeKey', key);
};

const handleItemChange = (val, key, item) => {
  const value = {
    ...props.modelValue,
    [key]: val,
  };
  emit('change', value);
};

const handleKeyupEnter = () => {
  emit('search', props.modelValue);
};

// 查询
const search = () => {
  emit('search', props.modelValue);
};
</script>

<style lang="scss" scoped>
.search-group {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  border-radius: 4px;

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    box-shadow: none !important;
  }

  .select-param {
    height: 100%;
    width: 120px;
    border: 1px solid #dadbe0;
    box-sizing: border-box;
    border-radius: 4px 0 0 4px;

    :deep(.el-select__wrapper) {
      background-color: #f5f5f5;
    }
  }
  .param-value-box {
    max-width: 260px;
    height: 100%;
  }

  .param-value {
    height: 100%;
    width: 150px;
    border-top: 1px solid #dadbe0;
    border-bottom: 1px solid #dadbe0;
    box-sizing: border-box;
  }

  .search-btn {
    height: 100%;
    border: 1px solid #f26c0c;
    min-height: 34px;
    border-radius: 0 4px 4px 0;
  }

  .param-group {
    height: 34px;
    min-width: 300px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    flex: 1;
    box-sizing: border-box;
    position: relative;

    .tag-box {
      box-sizing: border-box;
      position: absolute;
      right: 0;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: flex-end;
      min-height: 34px;
      z-index: 201;
      .expand {
        position: absolute;
        z-index: 202;
        right: 0;
        top: 0;
        font-size: 10px;
        height: 34px;
        line-height: 34px;
        display: flex;
        flex-flow: row nowrap;
        align-content: center;
        align-items: center;
        padding-right: 5px;
        color: #606266;
      }

      .render-box {
        padding-left: 5px;
        box-sizing: border-box;
        padding-top: 3px;
        position: absolute;
        max-width: 100%;
        width: 100%;
        height: auto;
        text-align: right;
        z-index: 200;
        min-height: 34px;
        background: #fff;
        height: 34px;
        transition: height ease-in 0.3s;
        transform-origin: center top;
        overflow: hidden;
        display: flex;
        flex-flow: row nowrap;

        &.has-next-row:hover {
          height: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

          .expand {
            :deep(svg) {
              transform: rotate(90deg);
            }
          }
        }

        .tag-list {
          width: 100%;
          height: auto;
          text-align: right;
          min-height: 34px;
          padding-right: 5px;
          z-index: 205;

          &.fix {
            padding-right: 80px;
          }
        }
      }

      .search-tag {
        margin: 3px 0 3px 3px;
        max-width: 100%;
        :deep(.el-tag__content) {
          white-space: nowrap;
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .search-item-tag {
        box-sizing: border-box;
        margin: 3px 0 3px 3px;
        max-width: 100%;
        padding: 5px 6px;
        border: 1px solid var(--el-color-primary-light-8);
        background-color: rgb(237, 242, 250);
        display: inline-flex;
        border-radius: 2px;
        font-size: 12px;
        line-height: 12px;
        color: var(--el-color-primary);
        .el-tag__content {
          flex: 1;
          display: block;
          overflow: hidden;
          white-space: nowrap;
          word-break: break-all;
          text-overflow: ellipsis;
        }
      }
      .tag-close {
        display: block;
        padding-left: 4px;
        cursor: pointer;
      }
    }
  }
  :deep(.el-date-editor) {
    border-top: 1px solid #dadbe0;
    border-bottom: 1px solid #dadbe0;
    border-radius: 0;
    height: 34px;
    max-width: 220px;
  }

  .control-box {
    display: flex;
    text-align: left;
    height: 34px;
  }
}
</style>

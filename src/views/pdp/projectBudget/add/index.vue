<template>
  <basic-container>
    <div class="content-warp page-project-budget-edit" :class="pageRenderSize">
      <div v-loading="loading" class="drawer-container">
        <h4 class="title-box">
          <span class="title-text"> {{ title }}</span>
          <div class="right-btn-box">
            <el-button type="primary" :disabled="loading" @click="submit()">提交</el-button>
            <el-button @click="close">取消</el-button>
          </div>
        </h4>
        <div v-if="detailData" class="content-box">
          <!-- <el-scrollbar ref="scrollbarRef" style="height: calc(100vh - 210px)"> -->
          <div class="form-box">
            <el-form
              ref="formRef"
              :model="detailData"
              label-suffix=":"
              class="form-main"
              :disabled="allDisabled"
              :label-width="'120px'"
            >
              <div
                v-for="(group, i) in columns"
                class="group-box"
                :class="group.classList"
                :key="group"
              >
                <div :key="i" class="group-header">{{ group.name }}</div>
                <template v-if="group.renderType === 'form'">
                  <template v-for="col in group.items">
                    <el-form-item
                      v-if="
                        !col.showFunc ||
                        (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                      "
                      class="form-item-operation-detail"
                      :class="`form-item-${col.prop}`"
                      :label="col.label"
                      :prop="col.prop"
                      :rules="getColumnRules(col)"
                      :key="col"
                    >
                      <el-input
                        v-if="col.type === 'input'"
                        :placeholder="col.props?.placeholder || `请输入${col.label}`"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                        clearable
                      />
                      <el-select
                        class="param-value"
                        v-else-if="col.type === 'dict'"
                        v-model="detailData[col.prop]"
                        :placeholder="col.props?.placeholder || `请选择${col.label}`"
                        v-bind="col.props"
                        clearable
                      >
                        <template v-if="col.withGroup">
                          <el-option-group
                            v-for="(opGroup, i) in dictMaps?.[col.dictKey] || []"
                            :key="i"
                            :label="opGroup[col.labelKey]"
                          >
                            <el-option
                              v-for="(option, j) in opGroup.children"
                              :key="j"
                              :label="option[col.labelKey]"
                              :value="option[col.valueKey]"
                            />
                          </el-option-group>
                        </template>
                        <template v-else>
                          <el-option
                            v-for="(option, j) in dictMaps?.[col.dictKey] || []"
                            :key="j"
                            :label="option[col.labelKey]"
                            :value="option[col.valueKey]"
                          />
                        </template>
                      </el-select>
                      <el-date-picker
                        v-else-if="col.type === 'date'"
                        v-model="detailData[col.prop]"
                        :placeholder="col.props?.placeholder || `请选择${col.label}`"
                        v-bind="col.props"
                        value-format="YYYY-MM-DD"
                        format="YYYY-MM-DD"
                        clearable
                      ></el-date-picker>
                      <el-input-number
                        v-else-if="col.type === 'number'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        :placeholder="col.props?.placeholder || `请输入${col.label}`"
                      />
                      <dc-select-user
                        v-else-if="col.type === 'dc-select-user'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                      />
                    </el-form-item>
                  </template>
                </template>
                <template v-if="group.renderType === 'table'">
                  <el-form-item
                    class="form-item-table"
                    :prop="group.prop"
                    :label-width="0"
                    :rules="getTableRule(group.items)"
                  >
                    <el-table
                      border
                      :data="detailData[group.prop]"
                      :row-class-name="tableRowClassName"
                      style="height: 100%"
                      @row-click="handleRowClick"
                      @selection-change="handleSelectionChange"
                    >
                      <template v-for="(col, i) in group.items">
                        <el-table-column
                          v-if="
                            col.type === 'selection' &&
                            (!col.showFunc ||
                              (col.showFunc && col.showFunc?.call && col.showFunc(detailData)))
                          "
                          type="selection"
                          :fixed="col.fixed"
                          :width="col.width"
                          :min-width="col.minWidth"
                          :key="i"
                        >
                        </el-table-column>
                        <el-table-column
                          v-else-if="
                            !col.showFunc ||
                            (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                          "
                          :key="`other-${i}`"
                          :fixed="col.fixed"
                          :width="col.width"
                          align="left"
                          :min-width="col.minWidth"
                          :prop="col.prop"
                        >
                          <template #header><span v-html="getLabelCode(col)"> </span></template>
                          <template #default="scoped">
                            <!-- && editColumn === col.prop -->
                            <template v-if="scoped.$index === editIndex">
                              <el-select
                                class="param-value"
                                :class="{
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                v-if="col.type === 'dict'"
                                v-model="scoped.row[col.prop]"
                                :placeholder="col.props?.placeholder || `请选择${col.label}`"
                                v-bind="col.props"
                                clearable
                              >
                                <template v-if="col.withGroup">
                                  <el-option-group
                                    v-for="(opGroup, i) in dictMaps?.[col.dictKey] || []"
                                    :key="i"
                                    :label="opGroup[col.labelKey]"
                                  >
                                    <el-option
                                      v-for="(option, j) in opGroup.children"
                                      :key="j"
                                      :label="option[col.labelKey]"
                                      :value="option[col.valueKey]"
                                    />
                                  </el-option-group>
                                </template>
                                <template v-else>
                                  <el-option
                                    v-for="(option, j) in dictMaps?.[col.dictKey] || []"
                                    :key="j"
                                    :label="option[col.labelKey]"
                                    :value="option[col.valueKey]"
                                  />
                                </template>
                              </el-select>
                              <remote-select
                                v-else-if="col.type === 'remote-select'"
                                v-model="scoped.row[col.prop]"
                                v-bind="col.props"
                                :class="{
                                  [col.props.class]: true,
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                @change="
                                  val => {
                                    handleTableItemChange(val, scoped, col);
                                  }
                                "
                              />
                              <component
                                v-else
                                :is="col.is"
                                :class="getCellClass(col, scoped.row)"
                                :placeholder="getPlaceholder(col)"
                                v-bind="col.props"
                                v-model="scoped.row[col.prop]"
                              >
                              </component>
                            </template>
                            <span
                              v-else
                              @click="handleClickCeil(scoped.$index, col.prop)"
                              class="ceil-value"
                              >{{ scoped.row[col.prop] || '-' }}</span
                            >
                          </template>
                        </el-table-column>
                      </template>
                    </el-table>
                  </el-form-item>
                </template>
              </div>
            </el-form>
          </div>
          <!-- </el-scrollbar> -->
        </div>
      </div>
    </div>
  </basic-container>
</template>
<script setup>
import {
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  computed,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Api from '@/api/index';
import detailConfig from './utils';
import remoteSelect from '../cpns/remote-select.vue';
import prefixTextMaps from '@/const/modules/prefixTextMaps';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const pageData = reactive({
  editIndex: -1,
  editColumn: '',
  boxWidth: 0,
  loading: false,
  detailId: '',
  detailData: null,
  roleIdOptions: [],
  dictMaps: {},
  selectionRows: [],
  title: '',
  titleEnum: {
    add: '新增执行单核价',
    edit: '编辑执行单核价',
    look: '执行单核价详情',
  },
});

const { columns } = detailConfig;

const {
  detailId,
  detailData,
  loading,
  dictMaps,
  boxWidth,
  selectionRows,
  editIndex,
  title,
  titleEnum,
} = toRefs(pageData);

const getCellClass = (col, row) => {
  return {};
};

const getColumnRules = col => {
  if (col.required) {
    return [
      {
        required: true,
        message: `${prefixTextMaps[col.type]}${col.label}`,
        trigger: ['blur', 'input', 'change'],
      },
    ];
  }
  return undefined;
};

const getPlaceholder = col => {
  if (col.is === 'el-input') {
    return `请输入${col.label}`;
  }
  return '';
};

const handleClickCeil = (index, prop) => {
  editIndex.value = index;
  // editColumn.value = prop;
};

const handleRowClick = row => {
  const index = detailData.value.executePricingItemList.findIndex(item => item === row);
  editIndex.value = index;
};

const pageRenderSize = computed(() => {
  if (boxWidth.value < 800) {
    return 'render-small';
  } else if (boxWidth.value >= 800 && boxWidth.value < 1200) {
    return 'render-middle';
  } else {
    return 'render-large';
  }
});

const getLabelCode = col => {
  const result = col.required ? `<span class="label-suffix">*</span>${col.label}` : col.label;
  return result;
};

const show = async id => {
  // title.value = id ? '编辑执行单' : '新增执行单';
  loading.value = true;
  if (id) {
    detailId.value = id;
    // visible.value = true;
    const res = await Api.pdp.pdpExecutePricing.detail({
      id: detailId.value,
    });
    const { code, data } = res.data;
    if (code === 200) {
      const dataSet = {
        ...data,
        executePricingItemList: (data.executePricingItemList || []).map(row => {
          return {
            ...row,
            // 加个临时id用来标记数据，因为新增的数据没有id
            ___tempId: Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6),
          };
        }),
      };
      detailData.value = dataSet;
    }
  }
  loading.value = false;
};

const close = () => {
  if (route.query.from === 'add') {
    router.push({
      path: '/pdp/projectBudget/index',
    });
  } else {
    router.go(-1);
  }
};

const formRef = ref(null);

/** 选择变更 */
const handleSelectionChange = val => {
  selectionRows.value = val;
};

const tableRowClassName = ({ row }) => {
  return undefined;
};

const removeRow = () => {
  if (selectionRows.value?.length < 1) {
    proxy.$message.error('请先选中要删除的行');
    return;
  }
  if (detailData.value.executePricingItemList?.length == selectionRows.value?.length) {
    proxy.$message.error('明细信息至少应保留1条数据');
    return;
  }

  // if (selectionRows.value.find(row => row.id)) {
  //   proxy.$message.error('仅支持删除复制或新建(蓝色角标)的行');
  //   return;
  // }
  detailData.value.executePricingItemList = detailData.value.executePricingItemList.filter(row => {
    return !selectionRows.value.find(r => row.___tempId === r.___tempId);
  });
  setTimeout(() => {
    formRef.value?.validateField(['executePricingItemList']);
  }, 30);
};
const addRow = () => {
  detailData.value.executePricingItemList.push({
    ___tempId: Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6),
  });
};

const copyRow = () => {
  if (selectionRows.value?.length < 1) {
    proxy.$message.error('请先选中要复制的行');
    return;
  } else {
    selectionRows.value.forEach(row => {
      detailData.value.executePricingItemList.push({
        ...row,
        id: undefined,
        ___tempId: Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6),
      });
    });
  }
};

const submit = () => {
  // if (!checkSelectedSupervisor() && detailData.value?.dcErpOrderStatus !== '1876789881673412609') {
  //   proxy.$message.error('请先指定审核主管');
  //   return;
  // }
  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      Api.pdp.pdpExecutePricing
        .submit(detailData.value)
        .then(res => {
          const { code, msg } = res.data;
          if (code === 200) {
            proxy.$message.success(msg);
            window.location.href = `/pdp/projectBudget/addorEdite?id=${data.id}&type=edit`;
          } else {
            proxy.$message.error(msg);
          }
          loading.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch(errors => {
      console.error(errors);
      const firstKey = Object.keys(errors)?.[0];
      formRef.value.scrollToField(firstKey);
    });
};

const addResize = () => {
  const box = proxy.$el;
  if (box) {
    proxy.$erd.listenTo(box, element => {
      boxWidth.value = element.scrollWidth;
    });
  }
};

const removeResize = () => {
  const box = proxy.$el;
  proxy.$erd.uninstall(box);
};

// 字典或缓存数据
const getDictData = async () => {
  // const res = await proxy.useAsyncCache([
  // ]);
  // dictMaps.value = res?.value;
  return true;
};

const allDisabled = computed(() => {
  return route.query.type === 'look';
});

const getTableRule = columns => {
  return [
    {
      required: true,
      validator(_, value, callback) {
        if (value.length === 0) {
          callback(new Error('明细信息不能为空'));
        } else {
          let findCol = null;
          const findIndex = detailData.value.executePricingItemList.findIndex(row => {
            findCol = columns.find(col => {
              if (col.prop === 'version' && !row.isMustVersion) {
                return false;
              }
              return col.required && [null, undefined, ''].includes(row[col.prop]);
            });
            return !!findCol;
          });
          if (findIndex > -1) {
            callback(new Error(`第${findIndex + 1}行${findCol.label}不能为空`));
          } else {
            callback();
          }
        }
      },
      trigger: 'change',
    },
  ];
};

const getOptions = async () => {
  const res = await Api.pdp.execution.optionTypeMap();
  const { code, data } = res.data;
  if (code === 200) {
    Object.keys(data || {}).forEach(key => (dictMaps.value[key] = data[key]));
  }
};

onBeforeMount(async () => {
  await getDictData();
  await getOptions();
  title.value = titleEnum.value[route.query.type];
  const { id } = route.query;
  show(id);
});
onMounted(() => {
  addResize();
});
onBeforeUnmount(() => {
  removeResize();
});
</script>
<style lang="scss" scoped>
.page-project-budget-edit {
  .group-toolbar {
    padding: 4px 0 10px;
  }
  .ceil-value {
    word-break: break-all;
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :deep(.el-table__row.new-row) {
    position: relative;
    td:first-child .cell::before {
      content: ' ';
      position: absolute;
      left: -6px;
      top: -6px;
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-left-color: rgb(21, 96, 243);
      transform: rotate(-135deg);
    }
  }
  .form-item-table {
    &.is-error {
      :deep(.el-input__wrapper),
      :deep(.el-select__wrapper) {
        box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
      }

      .is-null {
        :deep(.el-input__wrapper),
        :deep(.el-select__wrapper) {
          box-shadow: 0 0 0 1px var(--el-color-danger) inset;
        }
        &.is-not-required {
          :deep(.el-input__wrapper),
          :deep(.el-select__wrapper) {
            box-shadow: 0 0 0 1px var(--el-input-border-color) inset;
          }
        }
      }
    }
  }
  &.render-small {
    .form-basic-group {
      .form-item-operation-detail {
        width: 100%;
        margin-right: 0 !important;
      }
    }
  }
  &.render-middle {
    .form-basic-group {
      .form-item-operation-detail {
        width: 49%;
        &:nth-child(2n + 1) {
          margin-right: 2%;
        }
      }
    }
  }
  &.render-large {
    .form-basic-group {
      .form-item-operation-detail {
        width: 32%;
        &:nth-child(3n) {
          margin-right: 1%;
        }
        &:nth-child(3n + 1) {
          margin-right: 1%;
        }
        &:nth-child(3n + 2) {
          margin-right: 1%;
        }
      }
    }
  }

  :deep(.form-item-table) {
    flex: 1;
    position: relative;
    .el-form-item__content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: calc(100% - 20px);
      margin-left: 0 !important;
    }
    .el-input-number .el-input__inner {
      text-align: left;
    }
  }
}
:deep(.label-suffix) {
  color: #f56c6c;
}
.drawer-container {
  display: flex;
  flex-flow: column nowrap;
  min-height: calc(100vh - 200px);
  box-sizing: border-box;
  .title-box {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    font-weight: bold;
    font-size: 18px;
    color: #333333;
    line-height: 48px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    height: 60px;
    border-bottom: 2px solid #dadbe0;
  }
  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  .content-box {
    display: flex;
    flex-flow: column nowrap;
    min-height: calc(100vh - 170px);
  }

  .form-box {
    padding: 0 20px 0 0;
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
  }

  .group-box:last-child {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
  }
  .form-main {
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
  }

  .group-header {
    font-weight: bold;
    box-sizing: border-box;
    padding-left: 4px;
    border-left: 3px solid #f78431;
    line-height: 16px;
    font-size: 16px;
    margin: 10px 0;
  }

  .form-item-operation-detail {
    width: 49%;
    display: inline-flex;
    margin-bottom: 16px;
    &:nth-child(2n + 1) {
      margin-right: 2%;
    }

    .detail-column-value {
      width: 100%;
      display: block;
      white-space: wrap;
      word-break: break-all;
      text-overflow: ellipsis;
      line-height: 20px;
      padding-top: 6px;
    }
  }
}
</style>

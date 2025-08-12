<template>
  <basic-container class="page-container">
    <div
      class="content-warp page-process-outsourcing-edit"
      :style="{
        width: pageMode !== 'look' ? '70%' : '100%',
      }"
      :class="pageRenderSize"
    >
      <div v-loading="loading" class="drawer-container">
        <div v-if="detailData" class="content-box">
          <!-- <el-scrollbar ref="scrollbarRef" style="height: calc(100vh - 210px)"> -->
          <div class="form-box">
            <el-form
              ref="formRef"
              class="form-main"
              :model="detailData"
              label-suffix=":"
              :disabled="allDisabled"
              :label-width="'120px'"
            >
              <div
                v-for="(group, i) in columns"
                class="group-box"
                :class="group.classList + `${expand[group.prop] ? ' ' : ' hide-expand'}`"
                :key="i"
              >
                <div :key="i" class="group-header">
                  {{ group.name }}
                  <el-icon
                    v-if="group.showToggleExpand"
                    @click="toggleExpand(group.prop, !expand[group.prop])"
                    class="toggle-expand-icon"
                    ><CaretRight v-if="!expand[group.prop]" /> <CaretBottom v-else
                  /></el-icon>
                </div>
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
                      :key="col.prop"
                    >
                      <el-input
                        v-if="col.type === 'input'"
                        :placeholder="col.props?.placholder || `请输入${col.label}`"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                        clearable
                      />
                      <el-select
                        class="param-value"
                        v-else-if="col.type === 'dict'"
                        v-model="detailData[col.prop]"
                        :placeholder="col.props?.placholder || `请选择${col.label}`"
                        v-bind="col.props"
                        clearable
                        @change="
                          val => {
                            handleFormItemChange(val, {}, col);
                          }
                        "
                      >
                        <!-- 配置里面有withGroup的情况 -->
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
                        :placeholder="col.props?.placholder || `请选择${col.label}`"
                        v-bind="col.props"
                        value-format="YYYY-MM-DD"
                        format="YYYY-MM-DD"
                        clearable
                      ></el-date-picker>
                      <el-input-number
                        v-else-if="col.type === 'number'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        :placeholder="col.props?.placholder || `请输入${col.label}`"
                      />
                      <UserRemoteQuery
                        v-else-if="col.type === 'select-user'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                      />
                      <dc-select-user
                        v-else-if="col.type === 'dc-select-user'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                      />
                      <dc-upload
                        v-else-if="col.type === 'dc-upload'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        :limit="5"
                      />
                      <dc-select
                        v-else-if="col.type === 'dc-select'"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                        @change="
                          val => {
                            handleFormItemChange(val, {}, col);
                          }
                        "
                      />
                    </el-form-item>
                  </template>
                </template>
                <template v-if="group.renderType === 'table'">
                  <div class="group-toolbar">
                    <!-- <el-button @click="addRow">新增行</el-button>
                    <el-button @click="copyRow">复制行</el-button> -->
                  </div>
                  <el-form-item
                    class="form-item-table"
                    :prop="group.prop"
                    :label-width="0"
                    :rules="getTableRule(group.items)"
                  >
                    <el-table
                      border
                      :data="detailData[group.prop]"
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
                          :selectable="col.selectable"
                        >
                        </el-table-column>
                        <el-table-column
                          v-else-if="col.type === 'index'"
                          :prop="col.prop"
                          label="序号"
                          fixed="left"
                          align="center"
                          min-width="80px"
                        >
                          <template #default="scoped">{{ scoped.$index + 1 }}</template>
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
                          show-overflow-tooltip
                        >
                          <template #header><span v-html="getLabelCode(col)"> </span></template>
                          <template #default="scoped">
                            <template v-if="editIndex === scoped.$index">
                              <el-select
                                class="param-value"
                                :class="{
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                v-if="col.type === 'dict'"
                                v-model="scoped.row[col.prop]"
                                :placeholder="col.props?.placholder || `请选择${col.label}`"
                                v-bind="col.props"
                                clearable
                                @change="
                                  val => {
                                    handleTableItemChange(val, scoped, col);
                                  }
                                "
                              >
                                <!-- 配置里面有withGroup的情况 -->
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
                              <el-input
                                v-else-if="col.type === 'input'"
                                :placeholder="col.props?.placholder || `请输入${col.label}`"
                                v-bind="col.props"
                                v-model="scoped.row[col.prop]"
                                clearable
                              />
                              <dc-select-user
                                v-else-if="col.type === 'dc-select-user'"
                                v-bind="col.props"
                                v-model="scoped.row[col.prop]"
                                @iptTagDataUpdate="
                                  val => {
                                    handleTableItemChange(val, scoped, col);
                                  }
                                "
                              />
                              <UserRemoteQuery
                                v-else-if="col.type === 'select-user'"
                                :class="{
                                  // 'is-null':
                                  //   col.required &&
                                  //   [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                v-model="scoped.row[col.prop]"
                                v-bind="col.props"
                              />
                              <el-input-number
                                v-else-if="col.type === 'number'"
                                v-model="scoped.row[col.prop]"
                                v-bind="col.props"
                                :placeholder="col.props?.placholder || `请输入${col.label}`"
                                @change="
                                  val => {
                                    handleTableItemChange(val, scoped, col);
                                  }
                                "
                              />
                              <component
                                v-else
                                :is="col.is"
                                :class="{
                                  // 'is-not-required':
                                  //   col.prop === 'version' && !scoped.row.isMustVersion,
                                  // 'is-null':
                                  //   col.required &&
                                  //   [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
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
                            >
                              <span v-if="col.type === 'dict' || col?.randerText">
                                {{ col?.randerText ? col?.randerText(scoped) : '-' }}
                              </span>
                              <span v-else>
                                {{ scoped.row[col.prop] || '-' }}
                              </span>
                            </span>
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
          <div class="footer">
            <el-button @click="close">取消</el-button>
          </div>
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
  watch,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  computed,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Api from '@/api/index';
import detailConfig from './utils';
import UserRemoteQuery from '@/components/dc/components/dc-select-user/remote-query.vue';
import useUnsavedChanges from '@/mixins/unsaved-changes-guard';
import prefixTextMaps from '@/const/modules/prefixTextMaps';

const { markAsUnsaved, markAsSaved } = useUnsavedChanges();

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const pageData = reactive({
  boxWidth: 0,
  editIndex: null,
  loading: false,
  detailId: '',
  detailData: {},
  dictMaps: {
    DC_BILL_TYPE: [],
    ProWorkList: [],
  },
  selectionRows: [],
  pageMode: 'edit',
  columns: [],
});

const {
  pageMode,
  detailId,
  detailData,
  loading,
  dictMaps,
  boxWidth,
  selectionRows,
  editIndex,
  columns,
} = toRefs(pageData);

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
  } else if (col.type === 'remote-select') {
    return `请选择${col.label}`;
  }
  return '';
};

const handleClickCeil = (index, prop) => {
  editIndex.value = index;
  // editColumn.value = prop;
};

const handleRowClick = row => {
  if (!!row?.erpStatus) {
    proxy.$message({
      type: 'error',
      message: '已外发物料不可编辑!',
    });
    editIndex.value = null;
    return;
  } else {
    const index = detailData.value.wireBomItemList.findIndex(item => item === row);
    editIndex.value = index;
  }
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

const handleFormItemChange = (val, scoped, col) => {};

const handleTableItemChange = (val, scoped, col) => {};

const show = async id => {
  const { type } = route.query;
  pageMode.value = type;

  if (!id) {
    detailData.value = {
      wireBomItemList: [],
    };
    return;
  }
  loading.value = true;
  if (id) {
    detailId.value = id;
    const res = await Api.mps.wireBom.detail({
      id: detailId.value,
    });
    const { code, data } = res.data;
    if (code === 200) {
      detailData.value = data;
    }
  }
  loading.value = false;
};

const close = () => {
  router.go(-1);
};

const formRef = ref(null);

/** 选择变更 */
const handleSelectionChange = val => {
  selectionRows.value = val;
};

watch(
  () => detailData.value,
  newVal => {
    if (Object.keys(newVal).length > 1) {
      markAsUnsaved();
    }
  },
  { deep: true }
);

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
  const res = await proxy.useAsyncCache([{ key: 'DC_BILL_TYPE' }]);
  dictMaps.value = res?.value;
  dictMaps.value.StatusMaps = [
    {
      label: '未外发',
      value: 0,
    },
    {
      label: '已外发',
      value: 1,
    },
  ];
  dictMaps.value.WeightUnitEnum = [
    {
      label: 'kg',
      value: 'kg',
    },
    {
      label: 'g',
      value: 'g',
    },
  ];

  return true;
};

const allDisabled = computed(() => {
  if (pageMode.value === 'add' || pageMode.value === 'edit') {
    return false;
  }
  return true;
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
          const findIndex = detailData.value.wireBomItemList.findIndex(row => {
            findCol = columns.find(col => {
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

const expand = ref({
  basic: true,
  wireBomItemList: true,
});

const toggleExpand = (key, status) => {
  expand.value[key] = !!status;
};

onBeforeMount(async () => {
  await getDictData();
  const { id, type } = route.query;
  show(id);
  columns.value = detailConfig(type).columns;
});
onMounted(() => {
  addResize();
});
onBeforeUnmount(() => {
  removeResize();
});
</script>
<style lang="scss">
.page-container {
  .basic-container__card {
    .el-card__body {
      display: flex;
      align-items: center;
      flex-direction: row;
      .page-process-outsourcing-right {
        .param-group {
          display: none;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.page-process-outsourcing-edit {
  .group-toolbar {
    display: flex;
    justify-content: space-between;
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
  .form-item-attachmentId {
    width: 100% !important;
  }
  .form-item-table {
    height: calc(100% - 80px);
    overflow: hidden;
    position: relative;
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
  .step-new {
    display: block;
    width: 100%;
    margin: 0 auto;
    margin-bottom: 10px;
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
    .el-form-item__content {
      position: absolute;
      width: 100%;
      height: calc(100% - 20px);
      z-index: 1;
      margin-left: 0 !important;
    }
    .el-input-number .el-input__inner {
      text-align: left;
    }
  }
}
.page-process-outsourcing-right {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  overflow-x: auto;
  flex: 1;
  height: 100%;
  .table-container {
    flex: 1;
    overflow: hidden;
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

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  .step-box {
    padding: 0 60px 20px;
    height: 48px;
    box-sizing: border-box;
  }

  .content-box {
    min-height: calc(100vh - 200px);
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
  }

  .footer {
    padding-top: 8px;
    border-top: 1px solid #eaeaeb;
    padding-left: 20px;
    height: 34px;
  }

  .form-box {
    padding: 0 20px 0 0;
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
  }
  .form-main {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    flex: 1;
  }

  .group-box {
    transform-origin: 0 0;
    transition: all ease-in 0.3s;
    &:last-child {
      flex: 1;
      min-height: 300px;
    }
    &.hide-expand {
      height: 40px;
      overflow: hidden !important;
    }
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

  .toggle-expand-icon {
    cursor: pointer;
  }
}
</style>

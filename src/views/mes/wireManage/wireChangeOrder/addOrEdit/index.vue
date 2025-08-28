<template>
  <div
    class="add-or-edit-page"
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
                              :placeholder="col.props?.placeholder || `请选择${col.label}`"
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
                              :placeholder="col.props?.placeholder || `请输入${col.label}`"
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
                              :placeholder="col.props?.placeholder || `请输入${col.label}`"
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
    const index = detailData.value.wireChangeItemList.findIndex(item => item === row);
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
      wireChangeItemList: [],
    };
    return;
  }
  loading.value = true;
  if (id) {
    detailId.value = id;
    const res = await Api.mps.wireChange.changeDetail({
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
          const findIndex = detailData.value.wireChangeItemList.findIndex(row => {
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
  wireChangeItemList: true,
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

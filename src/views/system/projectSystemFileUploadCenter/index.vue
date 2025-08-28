<template>
  <basic-container>
    <div class="content-warp page-execution-edit" :class="pageRenderSize">
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
              :rules="formRules"
            >
              <div
                v-for="(group, i) in columns"
                class="group-box"
                :class="group.classList + `${expand[group.prop] ? ' ' : ' hide-expand'}`"
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
                            handleFormItemChange(val, scoped, col);
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
                      <remote-select
                        v-else-if="col.type === 'remote-select'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        @change="
                          val => {
                            handleFormItemChange(val, {}, col);
                          }
                        "
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
                      <dc-select-dialog
                        v-else-if="col.type === 'dc-select-dialog'"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                        @change="
                          val => {
                            handleFormItemChange(val, {}, col);
                          }
                        "
                      >
                      </dc-select-dialog>
                      <upload
                        v-else-if="col.type === 'upload'"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                      >
                      </upload>
                      <dc-select-dialog-v2
                        v-else-if="col.type === 'dc-select-dialog-v2'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        @iptTagDataUpdate="
                          val => {
                            handleFormItemChange(val, {}, col);
                          }
                        "
                      >
                        <template #search-items="{ queryParams }">
                          <div class="dialog-search-box">
                            <el-form-item label-width="100px" label="项目名称">
                              <el-input
                                placeholder="请输入项目名称"
                                clearable
                                v-model="queryParams.projectName"
                              />
                            </el-form-item>
                            <el-form-item label-width="100px" label="项目编码">
                              <el-input
                                placeholder="请输入项目编码"
                                clearable
                                v-model="queryParams.projectCode"
                              />
                            </el-form-item>
                            <!-- <el-form-item label-width="100px" label="station">
                              <el-input
                                v-model="queryParams.station"
                                placeholder="请输入station"
                                clearable
                              />
                            </el-form-item> -->
                          </div>
                        </template>
                      </dc-select-dialog-v2>
                      <el-cascader
                        v-else-if="col.type === 'el-cascader'"
                        :placeholder="getPlaceholder(col)"
                        :options="dictMaps[col.dictKey]"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                      >
                      </el-cascader>
                      <el-tree-select
                        v-else-if="col.type === 'el-tree-select'"
                        :placeholder="getPlaceholder(col)"
                        :data="dictMaps[col.dictKey]"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                      >
                      </el-tree-select>
                      <template v-else-if="col.type === 'actions'">
                        <el-button
                          v-for="(btn, j) in col.children"
                          :key="j"
                          v-bind="btn.props"
                          @click.stop="doAction(btn.action)"
                          >{{ btn.label }}</el-button
                        >
                      </template>
                    </el-form-item>
                  </template>
                </template>
                <template v-if="group.renderType === 'table'">
                  <div class="group-toolbar">
                    <!-- <el-button @click="addRow">新增行</el-button>
                    <el-button @click="copyRow">复制行</el-button> -->
                    <el-button @click="removeRow">删除选中行</el-button>
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
                          v-else-if="col.type === 'actions'"
                          :key="'option' + i"
                          :fixed="col.fixed"
                          :label="col.label"
                          :width="col.width ? col.width : 180"
                          :align="col.align ? col.align : 'center'"
                        >
                          <template #default="scoped">
                            <el-button
                              v-for="(btn, j) in col.children"
                              :key="j"
                              link
                              type="primary"
                              @click.stop="doAction(btn.action, scoped)"
                              >{{ btn.label }}</el-button
                            >
                          </template>
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
                                    handleFormItemChange(val, scoped, col);
                                  }
                                "
                              />
                              <div class="file-item" v-else-if="col.type === 'file'">
                                <div class="file-item-type">
                                  <svg class="file-item-type_icon" aria-hidden="true">
                                    <use :xlink:href="getFileIconByUrl(scoped.row.fileName)"></use>
                                  </svg>
                                  <div class="file-item-type_operate">
                                    <el-icon @click="handleDownload(scoped.row)">
                                      <Download />
                                    </el-icon>
                                  </div>
                                </div>
                              </div>
                              <span class="file-item-name" v-else-if="col.type === 'file-name'">
                                {{ scoped.row.fileName }}
                              </span>
                              <el-cascader
                                v-else-if="col.type === 'el-cascader'"
                                :placeholder="getPlaceholder(col)"
                                :options="dictMaps[col.dictKey]"
                                v-bind="col.props"
                                v-model="scoped.row[col.prop]"
                              >
                              </el-cascader>
                              <el-tree-select
                                v-else-if="col.type === 'el-tree-select'"
                                :placeholder="getPlaceholder(col)"
                                :data="dictMaps[col.dictKey]"
                                v-bind="col.props"
                                v-model="scoped.row[col.prop]"
                              >
                              </el-tree-select>
                              <component
                                v-else
                                :is="col.is"
                                :class="{
                                  'is-not-required':
                                    col.prop === 'version' && !scoped.row.isMustVersion,
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
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
                              <span v-if="col.type === 'dict' || col.type === 'el-cascader'">
                                <dc-dict-key
                                  :options="dictMaps?.[col.dictKey]"
                                  :value="scoped.row[col.prop]"
                                />
                              </span>
                              <span v-if="col.type === 'el-tree-select'">
                                <dc-dict-key
                                  v-for="(val, index) in handleSplit(scoped.row[col.prop])"
                                  :options="dictMaps?.[col.dictKey]"
                                  :value="val"
                                  :key="index"
                                />
                              </span>
                              <div class="file-item" v-else-if="col.type === 'file'">
                                <div class="file-item-type">
                                  <svg class="file-item-type_icon" aria-hidden="true">
                                    <use :xlink:href="getFileIconByUrl(scoped.row.fileName)"></use>
                                  </svg>
                                  <div class="file-item-type_operate">
                                    <el-icon @click="handleDownload(scoped.row)">
                                      <Download />
                                    </el-icon>
                                  </div>
                                </div>
                              </div>
                              <div class="file-item-name" v-else-if="col.type === 'file-name'">
                                {{ scoped.row.fileName }}
                              </div>
                              <span v-else>{{ scoped.row[col.prop] || '-' }}</span>
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
  nextTick,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/store/index';
import Api from '@/api/index';
import detailConfig from './utils';
import UserRemoteQuery from '@/components/dc/components/dc-select-user/remote-query.vue';
import remoteSelect from '../cpns/remote-select.vue';
import useUnsavedChanges from '@/mixins/unsaved-changes-guard';
const { markAsUnsaved, markAsSaved } = useUnsavedChanges();
import upload from './../cpns/upload.vue';
import prefixTextMaps from '@/const/modules/prefixTextMaps';

import { downloadFileBlob, getFileIconByUrl } from '@/utils/util';

const userId = computed(() => store.getters.userInfo.user_id);

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const formRef = ref(null);

const pageData = reactive({
  boxWidth: 0,
  editIndex: 0,
  loading: false,
  detailData: null,
  dictMaps: {
    DC_PDP_PROJECT_FILE: [],
  },
  selectionRows: [],
  pageMode: 'edit',
  columns: [],
});

const { pageMode, detailData, loading, dictMaps, boxWidth, selectionRows, editIndex, columns } =
  toRefs(pageData);

const formRules = computed(() => {
  const result = {};
  (columns.value[0]?.items || []).forEach(col => {
    result[col.prop] = getColumnRules(col);
  });
  return result;
});

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
  const index = detailData.value.tableList.findIndex(item => item === row);
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

const handleFormItemChange = (val, scoped, col) => {
  if (col.prop === 'materialId') {
    let findItem = columns.value[0].items.find(item => item.prop === 'materialVersionCode');
    detailData.value.materialCode = val?.materialNumber || null;
    detailData.value.materialName = val?.materialName || null;
    detailData.value.isMustVersion = val?.isMustVersion;
    if (val.isMustVersion) {
      findItem.required = true;
      console.log(columns.value, findItem);
    } else {
      findItem.required = false;
      formRef.value.clearValidate('materialVersionCode');
    }
  } else if (col.prop === 'projectId') {
    detailData.value.projectId = val[0] ? val[0]?.id : null;
    detailData.value.projectCode = val[0] ? val[0]?.projectCode : null;
  } else if (col.prop === 'mtonoId') {
    detailData.value.projectNumber = val?.mtoNo || null;
  }
  nextTick(() => {
    getData();
  });
};

const show = async id => {
  if (!id) {
    pageMode.value = 'add';
    detailData.value = {};
    return;
  }

  pageMode.value = 'edit';
  // title.value = id ? '编辑执行单' : '新增执行单';
  loading.value = true;
  loading.value = false;
};

const close = () => {
  router.go(-1);
};

/** 选择变更 */
const handleSelectionChange = val => {
  selectionRows.value = val;
};

/** 批量删除 */
const removeRow = () => {
  if (selectionRows.value.length === 0) {
    proxy.$message.error('请选择要删除的数据');
    return;
  }
  const ids = selectionRows.value.map(item => item.id).join(',');
  const message = `是否确认删除选中的数据项？`;
  handleDeleteCommon(ids, message, Api.system.pdpProject.removes);
};

// 删除and批量删除接口
const handleDeleteCommon = (ids, message, deleteApi) => {
  proxy
    .$confirm(message)
    .then(async () => {
      const configIds = { ids };
      await deleteApi(configIds); // 调用传入的删除接口
    })
    .then(() => {
      getData(); // 更新数据
      proxy.$message.success('删除成功');
    })
    .catch(() => {
      // 错误处理
    });
};

const handleDownload = row => {
  try {
    downloadFileBlob(row.fileLink, row.fileName);
  } catch (err) {
    proxy.$message.error('下载异常');
  }
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

const doAction = (action, scope = {}) => {
  const { row } = scope;
  switch (action) {
    case 'updatedVersion':
      detailData.value = {
        ...detailData.value,
        ...row,
        roleIds: row.roleIds,
        isUpdate: true,
      };
      columns.value = detailConfig(true).columns;
      return;
    case 'edit':
      detailData.value = {
        ...detailData.value,
        ...row,
        roleIds: row.roleIds,
        isUpdate: false,
      };
      columns.value = detailConfig(false).columns;
      return;
    case 'submitData':
      submitData();
      return;
    case 'resetData':
      resetData();
      return;
  }
};

const resetData = () => {
  detailData.value = {
    tableList: [],
  };
  columns.value = detailConfig(false).columns;
  formRef.value?.resetFields();
};

const submitData = () => {
  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      let _detailData = JSON.parse(JSON.stringify(detailData.value));
      delete _detailData.tableList;
      _detailData.roleIds = !!_detailData.roleIds ? _detailData.roleIds.join(',') : '';
      const formData = new FormData();
      formData.append('file', detailData.value.file[0].raw);
      Api.system.pdpProject
        .upload(_detailData, formData)
        .then(res => {
          const { code, msg, data } = res.data;
          if (code === 200) {
            proxy.$message.success(msg);
            detailData.value.tableList.push(data);
            detailData.value = {
              ...detailData.value,
              isUpdate: null,
              file: null,
            };
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
  const res = await proxy.useAsyncCache([{ key: 'DC_PDP_PROJECT_FILE' }]);
  dictMaps.value = res?.value;
  const resRole = await Api.system.role.getList({ roleCategory: 'DC_ROLE_CATEGORY_BUSINESS' });
  dictMaps.value.ROLES = addDictKeyAndLabel(resRole.data.data);
  console.log(dictMaps.value.ROLES);
  return true;
};

function addDictKeyAndLabel(tree) {
  return tree.map(node => {
    const newNode = {
      ...node,
      dictKey: node.id,
      label: node.roleName,
      listClass: 'dict-1',
    };

    if (node.children && node.children.length) {
      newNode.children = addDictKeyAndLabel(node.children);
    }

    return newNode;
  });
}

const allDisabled = computed(() => {
  return false;
});

const getTableRule = columns => {
  return [];
};

const getData = async () => {
  const _detailData = JSON.parse(JSON.stringify(detailData.value));
  const params = {
    projectId: _detailData?.projectId,
    projectCode: _detailData?.projectCode,
    materialCode: _detailData?.materialCode,
    fileTypeCode: _detailData?.fileTypeCode,
    projectNumber: _detailData?.projectNumber,
  };
  const res = await Api.system.pdpProject.list(params);
  const { code, data } = res.data;
  if (code === 200) {
    detailData.value.tableList = data.records.map(item => {
      return {
        ...item,
        roleIds: item.roleIds ? item.roleIds.split(',') : [],
      };
    });
  }
};

const expand = ref({
  basic: true,
  tableList: true,
});

const toggleExpand = (key, status) => {
  expand.value[key] = !!status;
};

const handleSplit = values => {
  if (Array.isArray(values)) {
    return values;
  }
  return [];
};

onBeforeMount(async () => {
  columns.value = detailConfig(false).columns;
  await getDictData();
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
.page-execution-edit {
  .group-toolbar {
    padding: 4px 0 10px;
    &-submit {
      display: flex;
      justify-content: flex-end;
    }
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
    .file-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 60px;

      &-type {
        position: relative;
        border-radius: 6px;
        overflow: hidden;

        &:hover {
          .file-item-type_operate {
            display: flex;
          }
        }

        &_icon {
          width: 36px;
          height: 32px;
        }

        &_operate {
          display: none;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
          cursor: pointer;
          color: #fff;
          font-size: 16px;
          gap: 4px;
        }
      }

      &_name {
        margin-top: 5px;
        text-align: center;
        width: 100%;
        font-size: 12px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
  .form-item-files {
    width: 100% !important;
  }

  .toggle-expand-icon {
    cursor: pointer;
  }
}
.dialog-search-box {
  width: 900px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 30%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 100px);
    }
  }
}
</style>

<template>
  <basic-container>
    <div
      class="top-header"
      :class="{
        'edit-mode': pageMode !== 'look',
      }"
    >
      <div class="title">
        {{ pageMode !== 'look' ? '工序外发编辑' : '工序外发查看' }}
        <div class="title-desc" v-if="detailData?.isTransfer">（{{ '已推送至ERP' }}）</div>
      </div>
      <div class="btn-box">
        <el-button v-if="pageMode === 'look'" type="primary" @click="toEdit">编辑</el-button>
        <el-button
          v-if="pageMode !== 'look'"
          @click="saveData"
          type="primary"
          :disabled="loading || detailData?.isTransfer"
        >
          工序外发保存
        </el-button>
        <el-button v-if="!!detailId" @click="sendErp" :disabled="loading || detailData?.isTransfer"
          >抛转ERP</el-button
        >
        <el-button
          v-if="!!detailId && detailData?.isTransfer"
          icon="delete"
          type="danger"
          @click="handleInvalid"
          :disabled="loading"
          >作废</el-button
        >
        <el-button @click="close">取消</el-button>
      </div>
    </div>
    <div class="page-container">
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
                        <remote-select
                          v-else-if="col.type === 'remote-select'"
                          v-model="detailData[col.prop]"
                          v-bind="col.props"
                          :params="col.props.params(detailData)"
                          :class="{
                            [col.props.class]: true,
                            'is-null':
                              col.required && [null, undefined, ''].includes(detailData[col.prop]),
                          }"
                          @change="
                            val => {
                              handleFormItemChange(val, {}, col);
                            }
                          "
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
                      <el-button @click="removeRow">删除选中行</el-button>
                      <weight
                        v-if="!allDisabled"
                        @confirm="confirmWeight"
                        :index="editIndex"
                        :list="detailData?.proMaterialList"
                      />
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
                                    'is-null':
                                      col.required &&
                                      [null, undefined, ''].includes(scoped.row[col.prop]),
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
                                <remote-select
                                  v-else-if="col.type === 'remote-select'"
                                  v-model="scoped.row[col.prop]"
                                  v-bind="col.props"
                                  :params="col.props.params(detailData)"
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
            <!-- <div class="footer">
              
            </div> -->
          </div>
        </div>
      </div>
      <el-button
        v-if="!['look'].includes(pageMode)"
        @click="confirm"
        icon="DArrowLeft"
        size="small"
        type="primary"
      />
      <div
        class="page-process-outsourcing-right"
        v-if="!['look'].includes(pageMode)"
        v-loading="loading || tableLoading"
      >
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
        <div class="table-container">
          <el-table
            ref="tableRef"
            :data="tableData"
            row-key="fId"
            @select="handleSelect"
            @select-all="handleSelectAll"
            height="100%"
          >
            <template v-for="(col, i) in tableColumns.columns">
              <!-- 多选 -->
              <el-table-column
                v-if="col.type === 'selection'"
                :key="i"
                type="selection"
                :align="col.align"
                :width="col.width"
              />
              <!-- 序号类型 -->
              <el-table-column
                v-else-if="col.type === 'index'"
                :key="'index' + i"
                label="序号"
                :align="col.align"
                :width="col.width"
              >
                <template #default="{ $index }">
                  {{ $index + 1 }}
                </template>
              </el-table-column>
              <!-- 普通文字类型 -->
              <el-table-column
                v-else-if="col.type === 'rowText'"
                :key="'rowText' + i"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :prop="col.prop"
                :align="col.align ? col.align : 'center'"
                show-overflow-tooltip
              >
                <template #default="scoped">
                  {{
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '-'
                      : scoped.row[col.prop]
                  }}
                </template>
              </el-table-column>
              <!-- 人员类型 -->
              <el-table-column
                v-else-if="col.type === 'dc-view'"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :align="col.align ? col.align : 'center'"
                prop="purchaserId"
              >
                <template #default="scoped">
                  <dc-view
                    v-model="scoped.row[col.prop]"
                    :objectName="col.objectName"
                    :showKey="col.showKey"
                  />
                </template>
              </el-table-column>
              <!-- 字典类型 -->
              <el-table-column
                v-else-if="col.type === 'dict'"
                :key="'dict' + i"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :prop="col.prop"
                :align="col.align ? col.align : 'center'"
                show-overflow-tooltip
              >
                <template #default="scoped">
                  <dc-dict
                    v-if="pageData[col.dictKey]"
                    type="text"
                    :options="pageData[col.dictKey]"
                    :value="scoped.row[col.prop]"
                  ></dc-dict>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>

        <dc-pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.current"
          v-model:limit="queryParams.size"
          @pagination="getStockdataList"
          layout="total, prev, jumper, next"
        >
        </dc-pagination>
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
import store from '@/store/index';
import Api from '@/api/index';
import detailConfig from './utils';
import tableConfig from './table';
import weight from '../../cpns/weight.vue';
import remoteSelect from '../../cpns/remote-select.vue';
import UserRemoteQuery from '@/components/dc/components/dc-select-user/remote-query.vue';
import useUnsavedChanges from '@/mixins/unsaved-changes-guard';
import prefixTextMaps from '@/const/modules/prefixTextMaps';

const { markAsUnsaved, markAsSaved } = useUnsavedChanges();

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const userInfo = computed(() => store.getters.userInfo);

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
  dataList: [],
  tableColumns: tableConfig(),
  selected: [],
  queryParams: {},
  total: 0,
  tableLoading: false,
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
  dataList,
  tableColumns,
  selected,
  queryParams,
  total,
  tableLoading,
  columns,
} = toRefs(pageData);

const tableData = computed(() =>
  dataList.value.filter(
    item =>
      !detailData.value.proMaterialList
        .map(item => item.materialNumber)
        .includes(item.materialNumber)
  )
);

const searchConfig = ref({});

function getParamType(col) {
  if (col.searchProps.is === 'dict') {
    return {
      label: col.label,
      type: 'select',
      withGroup: true,
      options: pageData[col.dictKey],
      labelKey: 'dictValue',
      placeholder: `请选择${col.label}`,
      valueKey: 'dictValue',
      paramKey: col.prop,
    };
  } else if (col.searchProps.is === 'input') {
    return {
      label: col.label,
      type: 'input',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
    };
  } else if (col.searchProps.is === 'dc-date-range') {
    return {
      label: col.label,
      type: 'dc-date-range',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
      // 注意这里使用的是ref类型参数
      clear(queryParams) {
        queryParams.value.startTime = null;
        queryParams.value.endTime = null;
      },
      getLabelValue(queryParams) {
        if (queryParams.startTime && queryParams.endTime) {
          return `${col.label}：${queryParams.startTime} 至 ${queryParams.endTime}`;
        }
        return null;
      },
    };
  } else if (col.searchProps.is === 'dc-select-user') {
    return {
      label: col.label,
      type: 'dc-select-user',
      placeholder: `请选择${col.label}`,
      paramKey: col.prop,
      objectName: 'user',
      props: {
        multipleLimit: 1,
        returnType: 'string',
      },
    };
  } else {
    console.error('undefined type', col.type, col);
    return {
      label: col.label,
      type: 'input',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
    };
  }
}

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current'],
    searchItemConfig: {
      paramType: tableColumns.value.columns
        .filter(item => item.search)
        .sort((a, b) => a.searchIndex < b.searchIndex)
        .reduce((rec, item) => {
          rec[item.prop] = getParamType(item);
          return rec;
        }, {}),
    },
  };
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
    const index = detailData.value.proMaterialList.findIndex(item => item === row);
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

const handleFormItemChange = (val, scoped, col) => {
  if (col.prop === 'prdOrgId') {
    detailData.value.prdOrgName = val?.orgName || null;
    detailData.value.supplierName = null;
    detailData.value.supplierId = null;
  } else if (col.prop === 'supplierId') {
    detailData.value.supplierName = val?.supplierName || null;
  }
};

const handleTableItemChange = (val, scoped, col) => {
  if (col.prop === 'materialNumber') {
    scoped.row.materialName = val?.fname || '';
    scoped.row.inventoryCategoryName = val?.fcategoryName;
    scoped.row.isMustVersion = !!val?.isMustVersion;
  } else if (col.prop === 'workId') {
    const options = dictMaps.value[col.dictKey];
    const findOpt = options.find(item => item.fId === val);
    let isProWorkList = Array.isArray(scoped.row?.proWorkList) && !!scoped.row?.proWorkList[0];
    let proWorkItem = {};
    if (isProWorkList) {
      proWorkItem = scoped.row?.proWorkList[0];
    }
    proWorkItem = {
      ...proWorkItem,
      workCenterId: findOpt?.fId || null,
      workCenterName: findOpt?.workName || null,
    };
    scoped.row.proWorkList = [proWorkItem];
  } else if (col.prop === 'activityId') {
    let isProWorkList = Array.isArray(scoped.row?.proWorkList) && !!scoped.row?.proWorkList[0];
    let proWorkItem = {};
    if (isProWorkList) {
      proWorkItem = scoped.row?.proWorkList[0];
    }
    proWorkItem = {
      ...proWorkItem,
      processId: val?.fId || null,
      processName: val?.activityName || null,
    };
    scoped.row.proWorkList = [proWorkItem];
  } else if (col.prop === 'qty' || col.prop === 'price') {
    scoped.row.totalAmount = (scoped.row.qty || 0) * (scoped.row.price || 0);
  } else if (col.prop === 'pickerId') {
    scoped.row.pickerName = val[0] ? val[0].name : null;
    scoped.row.pickerNo = val[0] ? val[0].account : null;
  }
};

const show = async id => {
  const { type } = route.query;
  pageMode.value = type;

  if (!id) {
    detailData.value = {
      prdOrgId: '100006',
      prdOrgName: '广东金龙东创智能装备有限公司',
      proMaterialList: [],
    };
    getStockdataList();
    getOptions();
    return;
  }
  loading.value = true;
  if (id) {
    detailId.value = id;
    const res = await Api.system.erpProcessOutsourc.proDetail({
      id: detailId.value,
    });
    const { code, data } = res.data;
    if (code === 200) {
      data.proMaterialList = data.proMaterialList.map(item => {
        const { proWorkList } = item;
        const isProWorkList = Array.isArray(proWorkList) && proWorkList[0];
        return {
          ...item,
          workId: isProWorkList ? proWorkList[0].workCenterId : null,
          activityId: isProWorkList ? proWorkList[0].processId : null,
        };
      });
      detailData.value = data;
      getStockdataList();
      getOptions();
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

const removeRow = () => {
  if (selectionRows.value?.length < 1) {
    proxy.$message.error('请先选中要删除的行');
    return;
  }
  // if (detailData.value.proMaterialList?.length == selectionRows.value?.length) {
  //   proxy.$message.error('明细信息至少应保留1条数据');
  //   return;
  // }
  detailData.value.proMaterialList = detailData.value.proMaterialList.filter(row => {
    return !selectionRows.value.find(r => row.___tempId === r.___tempId);
  });
  setTimeout(() => {
    formRef.value?.validateField(['proMaterialList']);
  }, 30);
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

const saveData = () => {
  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      const formDataSend = {
        ...JSON.parse(JSON.stringify(detailData.value)),
        attachmentId: Array.isArray(detailData.value?.attachmentId)
          ? detailData.value?.attachmentId?.map(at => at.id)?.join(',')
          : '',
      };
      Api.system.erpProcessOutsourc
        .proSubmit(formDataSend)
        .then(res => {
          const { code, msg, data } = res.data;
          if (code === 200) {
            markAsSaved();
            proxy.$message.success(msg);
            router.push({
              path: '/system/process-outsourcing/addorEdite2',
              query: {
                type: 'edit',
                id: data.id,
                parentMenuId: '1924309011956502529',
              },
            });
            show(data.id);
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

const sendErp = () => {
  loading.value = true;
  const params = {
    id: detailId.value,
  };
  Api.system.erpProcessOutsourc
    .proOutsourcing(params)
    .then(res => {
      const { code, msg, data } = res.data;
      if (code === 200) {
        markAsSaved();
        proxy.$message.success(msg);
        router.go('-1');
      } else {
        proxy.$message.error(msg);
      }
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
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
          const findIndex = detailData.value.proMaterialList.findIndex(row => {
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

// 获取物料列表
const getStockdataList = () => {
  tableLoading.value = true;
  Api.system.pro
    .getStockMaterialList({
      ...queryParams.value,
      orgId: detailData.value.prdOrgId,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        dataList.value = data.records;
        total.value = data.total;
      }
      tableLoading.value = false;
    });
};

// 获取工作作业 和 工作内容列表
const getOptions = () => {
  Api.system.pro
    .getWorkCenterList({
      orgId: detailData.value.prdOrgId,
      size: 999,
      current: 1,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        dictMaps.value['WorkCenterList'] = data.records;
      }
    });
  Api.system.pro
    .getActivityCenterList({
      orgId: detailData.value.prdOrgId,
      size: 999,
      current: 1,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        dictMaps.value['ActivityCenterList'] = data.records;
      }
    });
};

const expand = ref({
  basic: true,
  proMaterialList: true,
});

const toggleExpand = (key, status) => {
  expand.value[key] = !!status;
};

const confirmWeight = weightData => {
  detailData.value.proMaterialList[editIndex.value].weight = weightData.weight;
  detailData.value.proMaterialList[editIndex.value].weightUnit = weightData.unit;
  const len = detailData.value.proMaterialList.length;
  if (editIndex.value < len - 1) {
    editIndex.value++;
  }
};

onBeforeMount(async () => {
  await getDictData();
  const { id, type } = route.query;
  show(id);
  columns.value = detailConfig(type).columns;
});
onMounted(() => {
  addResize();
  initSearchConfig();
});
onBeforeUnmount(() => {
  removeResize();
});

const handleSelect = (selection, row) => {
  selected.value = selection;
};

const handleSelectAll = selection => {
  selected.value = selection;
};
/** 搜索按钮操作 */
const handleSearch = params => {
  queryParams.value = {
    ...queryParams.value,
    ...params,
    current: 1,
  };
  getStockdataList();
};

/** 重置 */
const handleReset = () => {
  queryParams.value.current = 1;
  getStockdataList();
};

const confirm = () => {
  const arr = selected.value.map(item => {
    return {
      ...item,
      pickerName: userInfo.value.real_name,
      pickerNo: userInfo.value.account,
      pickerId: userInfo.value.user_id,
    };
  });
  detailData.value.proMaterialList = [...arr, ...detailData.value.proMaterialList];
};

const toEdit = () => {
  const link = router.resolve({
    path: '/system/process-outsourcing/addorEdite2',
    query: {
      ...route.query,
      type: 'edit',
    },
  });
  window.location.href = link.href;
};

const handleInvalid = () => {
  proxy
    .$confirm(
      `<strong style="color:red;font-size: 18px;">注意：本单据已抛转至ERP系统，当前作废仅影响本系统，不会同步作废ERP单据。请务必登录ERP系统手动作废对应单据。</strong>`,
      {
        type: 'error',
        dangerouslyUseHTMLString: true,
        showCancelButton: false,
      }
    )
    .then(() => {})
    .catch(err => {});
};
</script>
<style lang="scss" scoped>
.page-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  .page-process-outsourcing-right {
    :deep(.param-group) {
      display: none;
    }
  }
}
.top-header {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaeb;
  &.edit-mode {
    width: 70%;
  }
  .title {
    display: flex;
    align-items: center;
    line-height: 32px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    flex: 1;
    &-desc {
      color: red;
    }
  }
}
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

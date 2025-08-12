<template>
  <!-- 新增、修改入库单 -->
  <basic-container class="business-container page-warehous-entry-add-or-edit">
    <div class="wrap page-content">
      <h4 class="title-box">
        <span class="title-text"> {{ title }} </span>
        <div class="right-btn-box">
          <el-button
            type="primary"
            v-if="type !== 'look'"
            @click="doAction('submit')"
            icon="position"
            >提交</el-button
          >
          <el-button type="default" v-if="['add', 'edit'].includes(type)" @click="doAction('save')"
            ><img src="~@/styles/img/submit.svg" class="self-icon" alt="icon-submit" />
            保存</el-button
          >
          <!-- <el-button type="default" @click="doAction('save')"
            ><img src="~@/styles/img/save.svg" class="self-icon" alt="icon-submit" />
            草稿</el-button
          > -->
          <el-button @click="doAction('cancel')" icon="circleClose">取消</el-button>
        </div>
      </h4>
      <div class="form-content">
        <el-form
          ref="formMainRef"
          :model="form"
          inline
          :disabled="disabled"
          label-width="100px"
          label-suffix=":"
          :rules="formRules"
        >
          <template v-for="group in formConfig">
            <div
              v-if="!group.showFunc || (group.showFunc && group.showFunc())"
              class="group"
              :class="{
                'table-group': group.type === 'tableGroup',
                'group-hide': group.hide,
                'full-mode': group.isFull,
              }"
            >
              <div class="group-title">
                {{ group.label }}
                <div
                  v-if="group.type === 'tableGroup'"
                  @click="toggleFullScreen(group)"
                  class="full-screen"
                >
                  <svg
                    v-if="!group.isFull"
                    t="1750213930736"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="4309"
                    width="200"
                    height="200"
                  >
                    <path
                      d="M149.333333 394.666667c17.066667 0 32-14.933333 32-32v-136.533334l187.733334 187.733334c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c12.8-12.8 12.8-32 0-44.8l-187.733333-187.733334H362.666667c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32H149.333333c-4.266667 0-8.533333 0-10.666666 2.133334-8.533333 4.266667-14.933333 10.666667-19.2 17.066666-2.133333 4.266667-2.133333 8.533333-2.133334 12.8v213.333334c0 17.066667 14.933333 32 32 32zM874.666667 629.333333c-17.066667 0-32 14.933333-32 32v136.533334L642.133333 597.333333c-12.8-12.8-32-12.8-44.8 0s-12.8 32 0 44.8l200.533334 200.533334H661.333333c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h213.333334c4.266667 0 8.533333 0 10.666666-2.133334 8.533333-4.266667 14.933333-8.533333 17.066667-17.066666 2.133333-4.266667 2.133333-8.533333 2.133333-10.666667V661.333333c2.133333-17.066667-12.8-32-29.866666-32zM381.866667 595.2l-200.533334 200.533333V661.333333c0-17.066667-14.933333-32-32-32s-32 14.933333-32 32v213.333334c0 4.266667 0 8.533333 2.133334 10.666666 4.266667 8.533333 8.533333 14.933333 17.066666 17.066667 4.266667 2.133333 8.533333 2.133333 10.666667 2.133333h213.333333c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32h-136.533333l200.533333-200.533333c12.8-12.8 12.8-32 0-44.8s-29.866667-10.666667-42.666666 0zM904.533333 138.666667c0-2.133333 0-2.133333 0 0-4.266667-8.533333-10.666667-14.933333-17.066666-17.066667-4.266667-2.133333-8.533333-2.133333-10.666667-2.133333H661.333333c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h136.533334l-187.733334 187.733333c-12.8 12.8-12.8 32 0 44.8 6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466667-8.533333l187.733333-187.733333V362.666667c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V149.333333c-2.133333-4.266667-2.133333-8.533333-4.266667-10.666666z"
                      fill="#8a8a8a"
                      p-id="4310"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    t="1750214104245"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="4549"
                    width="200"
                    height="200"
                  >
                    <path
                      d="M313.6 358.4H177.066667c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h213.333333c4.266667 0 8.533333 0 10.666667-2.133333 8.533333-4.266667 14.933333-8.533333 17.066666-17.066667 2.133333-4.266667 2.133333-8.533333 2.133334-10.666667v-213.333333c0-17.066667-14.933333-32-32-32s-32 14.933333-32 32v136.533333L172.8 125.866667c-12.8-12.8-32-12.8-44.8 0-12.8 12.8-12.8 32 0 44.8l185.6 187.733333zM695.466667 650.666667H832c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32H618.666667c-4.266667 0-8.533333 0-10.666667 2.133333-8.533333 4.266667-14.933333 8.533333-17.066667 17.066667-2.133333 4.266667-2.133333 8.533333-2.133333 10.666666v213.333334c0 17.066667 14.933333 32 32 32s32-14.933333 32-32v-136.533334l200.533333 200.533334c6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466667-8.533333c12.8-12.8 12.8-32 0-44.8l-204.8-198.4zM435.2 605.866667c-4.266667-8.533333-8.533333-14.933333-17.066667-17.066667-4.266667-2.133333-8.533333-2.133333-10.666666-2.133333H192c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h136.533333L128 851.2c-12.8 12.8-12.8 32 0 44.8 6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466666-8.533333l200.533334-200.533333V832c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V618.666667c-2.133333-4.266667-2.133333-8.533333-4.266667-12.8zM603.733333 403.2c4.266667 8.533333 8.533333 14.933333 17.066667 17.066667 4.266667 2.133333 8.533333 2.133333 10.666667 2.133333h213.333333c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32h-136.533333L896 170.666667c12.8-12.8 12.8-32 0-44.8-12.8-12.8-32-12.8-44.8 0l-187.733333 187.733333V177.066667c0-17.066667-14.933333-32-32-32s-32 14.933333-32 32v213.333333c2.133333 4.266667 2.133333 8.533333 4.266666 12.8z"
                      fill="#8a8a8a"
                      p-id="4550"
                    ></path>
                  </svg>
                </div>
                <div
                  class="toggle"
                  @click="toggleGroup(group)"
                  :class="{
                    hide: group.hide,
                  }"
                >
                  <el-icon><ArrowDown /></el-icon>
                </div>
              </div>
              <template v-if="group.type === 'formItemGroup'">
                <template v-for="item in group.children">
                  <el-form-item
                    v-if="!item.showFunc || item.showFunc(form)"
                    :label="item.label"
                    :prop="item.prop"
                    :class="item.class"
                  >
                    <el-select
                      v-if="item.type === 'el-select'"
                      v-bind="item.props"
                      v-model="form[item.prop]"
                      @change="
                        (...args) => {
                          handleFormItemChange(item, ...args);
                        }
                      "
                    >
                      <template v-if="dictCache[item.dictKey].value">
                        <el-option
                          v-for="(op, m) in dictCache[item.dictKey].value"
                          :key="m"
                          :label="item.labelKey ? op[item.labelKey] : op.dictValue"
                          :value="item.valueKey ? op[item.valueKey] : op.dictKey"
                        ></el-option>
                      </template>
                    </el-select>
                    <span v-else-if="item.type === 'text'">{{
                      [null, undefined, ''].includes(form[item.prop]) ? '-' : form[item.prop]
                    }}</span>
                    <component
                      v-else
                      v-bind="item.props"
                      :is="item.type"
                      v-model="form[item.prop]"
                      @change="
                        (...args) => {
                          handleFormItemChange(item, ...args);
                        }
                      "
                    >
                    </component>
                  </el-form-item>
                </template>
              </template>
              <template v-else-if="group.type === 'tableGroup'">
                <template v-for="(item, i) in group.children">
                  <!-- 操作 -->
                  <div v-if="item.type === 'actions'" class="actions">
                    <template v-for="(btn, k) in item.children">
                      <template v-if="!btn.showFunc || (btn.showFunc && btn.showFunc())">
                        <dc-select-dialog-v2
                          v-if="btn.type === 'dc-select-btn'"
                          v-bind="btn.selectProps.props"
                          @change="selectListChange"
                          :params="{
                            supplierId: form.supplierId,
                            sourceType: form.inType,
                          }"
                        >
                          <template #default>
                            <el-button
                              v-bind="btn.props"
                              :disabled="btn.disabled && btn.disabled()"
                            >
                              {{ btn.label }}
                            </el-button>
                          </template>
                        </dc-select-dialog-v2>
                        <dc-select-dialog-v2
                          v-else-if="btn.type === 'dc-select-btn2'"
                          v-bind="btn.selectProps.props"
                          @change="selectMultipleWarehouseChange"
                          :params="{
                            // supplierId: form.supplierId,
                            // sourceType: form.inType,
                          }"
                        >
                          <template #default>
                            <el-button
                              v-bind="btn.props"
                              :disabled="btn.disabled && btn.disabled()"
                            >
                              {{ btn.label }}
                            </el-button>
                          </template>
                        </dc-select-dialog-v2>
                        <dc-select-dialog-v2
                          v-else-if="btn.type === 'dc-select-btn3'"
                          v-bind="btn.selectProps.props"
                          :params="getWarehouseParam(detailList.selectData?.[0])"
                          @change="selectMultipleLocationIdChange"
                        >
                          <template #default>
                            <el-button
                              v-bind="btn.props"
                              :disabled="btn.disabled && btn.disabled()"
                            >
                              {{ btn.label }}
                            </el-button>
                          </template>
                        </dc-select-dialog-v2>
                        <el-button
                          v-else
                          v-bind="btn.props"
                          :disabled="btn.disabled()"
                          @click="doAction(btn.action, btn)"
                          >{{ btn.label }}</el-button
                        >
                      </template>
                    </template>
                  </div>
                  <!-- 表格数据 -->
                  <template v-else-if="item.type === 'table'">
                    <div class="table-box">
                      <el-form-item
                        class="form-item-table"
                        style="width: 100%"
                        :label-width="0"
                        :prop="item.prop"
                      >
                        <el-table
                          v-bind="item.props"
                          ref="detailTable"
                          :data="form[item.prop]"
                          height="100%"
                          style="height: 100%"
                          @row-click="handleRowClick"
                          @selection-change="handleSelectionChange"
                        >
                          <el-table-column
                            v-for="(col, x) in item.children"
                            :key="x"
                            :width="col.width"
                            :min-width="col.minWidth"
                            :fixed="col.fixed"
                            :type="col.type === 'rowText' ? '' : col.type"
                            :label="col.label"
                            :prop="col.prop"
                          >
                            <template v-if="col.type === 'rowText'" #default="scoped">
                              <el-form-item
                                v-if="editIndex === scoped.$index"
                                label-width="0"
                                :rule="null"
                                style="margin-right: 0"
                              >
                                <component
                                  v-bind="col.props"
                                  :max="
                                    col.formType === 'el-input-number' && scoped.row.max
                                      ? scoped.row.max
                                      : undefined
                                  "
                                  :min="col.formType === 'el-input-number' ? 0 : undefined"
                                  :disabled="
                                    col.prop === 'locationId'
                                      ? getLocationDisableStatus(scoped.row)
                                      : col.props?.disabled
                                  "
                                  :placeholder="
                                    col.prop === 'locationId'
                                      ? getLocationDisableStatus(scoped.row) === true
                                        ? '仓位未启用'
                                        : col.props?.placeholder
                                      : col.props?.placeholder
                                  "
                                  :params="
                                    col.props?.params
                                      ? col.prop === 'locationId'
                                        ? getWarehouseParam(scoped.row)
                                        : col.props?.params
                                      : undefined
                                  "
                                  v-model="form.detailList[scoped.$index][col.prop]"
                                  :is="col.formType"
                                  @change="
                                    val => {
                                      handleDrawerFormItemChange(col, val, scoped.$index);
                                    }
                                  "
                                ></component>
                              </el-form-item>
                              <template v-else>
                                <dc-view
                                  v-if="col.normType === 'dc-view'"
                                  v-model="scoped.row[col?.prop]"
                                  :objectName="col?.objectName"
                                />
                                <span v-else>{{ scoped.row[col.prop] || '-' }}</span>
                              </template>
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-form-item>
                    </div>
                  </template>
                </template>
              </template>
            </div>
          </template>
        </el-form>
      </div>
    </div>
  </basic-container>
</template>
<script setup>
import { computed, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserInfo } from '@/api/system/user';

import getTableColumn from './addOrEditConfig';
import api from '@/api';

const { proxy } = getCurrentInstance();
/** 是否全局禁用表单 */
const disabled = ref(false);
const formMainRef = ref(null);
const router = useRouter();
const params = ref({
  warehouseName: '',
});
const titleMaps = {
  add: '新增入库单',
  edit: '编辑入库单',
  look: '入库单详情',
  audit: '入库单审核',
};

const datas = reactive({
  laoding: false,
  editIndex: -1,
  detailList: {
    selectData: [],
    selectRows: [],
  },
});

const { detailList, editIndex, laoding } = toRefs(datas);

const route = useRoute();

const { type, id } = route.query;

const detailTable = ref(null);

const title = computed({
  get() {
    return titleMaps[type];
  },
  set(value) {
    titleMaps[type] = value;
  },
});

const handleSelectionChange = (selectData, ...args) => {
  const selected = detailTable.value[0].getSelectionRows() || [];
  const indexes = selected.map(row => form.value.detailList.indexOf(row));
  detailList.value.selectData = selected;
  detailList.value.selectRows = indexes;
  // checkDisabled();
};

const handleRowClick = (row, column, event) => {
  const trElement = event.currentTarget.closest('tr');
  const rowIndex = Array.from(trElement.parentNode.children).indexOf(trElement);
  editIndex.value = rowIndex;
};

const getWarehouseParam = (row = {}) => {
  return {
    warehouseId: row.warehouseId?.id ? row.warehouseId?.id : row.warehouseId,
    warehouseName: row.warehouseName,
  };
};

/** 控制是否可以选择仓位 */
const getLocationDisableStatus = row => {
  return row.warehouseName && row.enableLocation ? false : true;
};

const dictCache = proxy.useCache([{ key: 'DC_WMS_IN_TYPE_SCM' }, { key: 'SCMORG_LIST_CACHE' }]);

const pageData = reactive({
  form: {
    inType: '',
    detailList: [],
  },
});

const { form } = toRefs(pageData);

const formRules = computed(() => {
  const result = {
    detailList: [
      {
        required: false,
        trigger: ['blur', 'change'],
        validator: (_, value, callback) => {
          if (!(value && value.length > 0)) {
            callback(new Error('明细信息不能为空'));
            return;
          }
          const result = value.every(row => {
            if (!row.productName) {
              return false;
            }
            if (!row.productCode) {
              return false;
            }
            if (!row.warehouseId) {
              return false;
            }
            if (!row.locationId && row.enableLocation) {
              return false;
            }

            if (!(row.productQty > 0)) {
              return false;
            }
            return true;
          });
          if (result) {
            if (value.find(row => row.productQty === 0)) {
              callback(new Error('物料入库数量必须大于0'));
            } else {
              callback();
            }
          } else {
            const resultIndex = value.findIndex(row => {
              if (!row.productName) {
                return true;
              }
              if (!row.productCode) {
                return true;
              }
              if (!row.warehouseId) {
                return true;
              }
              if (!row.locationId && row.enableLocation) {
                return true;
              }

              if (!(row.productQty > 0)) {
                return true;
              }
              return false;
            });

            const data = value[resultIndex];
            const columns = formConfig.value[1].children[1].children || [];
            let msgs = [];
            if (!data.productName) {
              const find = columns.find(c => c.prop === 'productName');
              msgs.push(`${find.label || 'productName'}不能为空`);
            } else if (!data.productCode) {
              const find = columns.find(c => c.prop === 'productCode');
              msgs.push(`${find.label || 'productCode'}不能为空`);
            } else if (!data.warehouseId) {
              const find = columns.find(c => c.prop === 'warehouseId');
              msgs.push(`${find.label || 'warehouseId'}不能为空`);
            } else if (data.enableLocation && !data.locationId) {
              console.log('data.enableLocation', data.enableLocation, data, resultIndex);
              msgs.push(`仓位不能为空`);
            } else if (!(data.productQty > 0)) {
              msgs.push(`入库数量必须大于0`);
            }

            callback(new Error(`请完成第${resultIndex + 1}行明细信息填写：${msgs.join(';')}`));
          }
        },
      },
    ],
  };
  formConfig.value[0].children.forEach(item => {
    if (item.required) {
      result[item.prop] = [
        {
          required: true,
          trigger: ['blur', 'change'],
          validator(_, value, callback) {
            if ([null, '', undefined].includes(value)) {
              callback(new Error(item.props.placeholder));
            } else {
              callback();
            }
          },
        },
      ];
    }
  });

  return result;
});

// 表单配置
const formConfig = ref([
  {
    label: '基本信息',
    type: 'formItemGroup',
    children: [
      {
        type: 'el-select',
        label: '组织',
        prop: 'scmOrgId',
        required: true,
        class: 'w33',
        dictKey: 'SCMORG_LIST_CACHE',
        labelKey: 'label',
        valueKey: 'value',
        props: {
          filterable: true,
          placeholder: '请选择组织',
        },
      },
      {
        type: 'el-input',
        label: '入库单号',
        prop: 'inStockCode',
        class: 'w33',
        props: {
          disabled: true,
          class: 'system-auto-fill',
          placeholder: '系统自动生成',
        },
      },
      {
        type: 'el-select',
        label: '入库类型',
        required: true,
        prop: 'inType',
        dictKey: 'DC_WMS_IN_TYPE_SCM',
        class: 'w33',
        props: {
          placeholder: '请选择入库类型',
        },
      },
      {
        type: 'el-date-picker',
        label: '创建日期',
        prop: 'businessDate',
        class: 'w33',
        props: {
          type: 'date',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          placeholder: '请选择日期',
        },
      },
      {
        type: 'dc-select-user',
        label: '仓管员',
        prop: 'processingPersonnel',
        class: 'w33',
        props: {
          disabled: true,
          objectName: 'user',
          suffixIcon: 'Search',
          placeholder: '系统自动填入',
        },
      },
      {
        type: 'dc-select-user',
        label: '采购员',
        prop: 'prUserId',
        class: 'w33',
        props: {
          multiple: false,
          multipleLimit: 1,
          objectName: 'user',
          suffixIcon: 'Search',
          placeholder: '请选择采购员',
        },
      },
      {
        type: 'dc-select-dialog',
        label: '供应商',
        prop: 'supplierId',
        required: true,
        class: 'w33',
        props: {
          type: 'input',
          params: { flagStatusDict: 1 },
          multiple: false,
          'multiple-limit': 1,
          clearable: true,
          returnType: 'string',
          objectName: 'scmSupplier',
          placeholder: '请选择供应商',
        },
      },
      {
        type: 'el-input',
        label: '专案号',
        prop: 'mtono',
        class: 'w33',
        props: {
          placeholder: '请输入专案号',
          clearable: true,
        },
      },
    ],
  },
  {
    label: '明细信息',
    type: 'tableGroup',
    children: [
      {
        type: 'actions',
        children: [
          {
            showFunc() {
              return ['add', 'edit'].includes(type) && form.value.inType !== 'DC_WMS_IN_TYPE_CGRK';
            },
            label: '新增',
            action: 'addrow',
            disabled() {
              return false;
            },
            // disabled() {
            //   return [null, undefined, ''].includes(form.value.inType);
            // },
            props: {
              title: '请先选择入库类型',
              plain: true,
              type: 'primary',
            },
          },
          {
            showFunc() {
              return ['add', 'edit'].includes(type) && form.value.inType === 'DC_WMS_IN_TYPE_CGRK';
            },
            label: '获取采购明细',
            action: 'getInSockDetail',
            type: 'dc-select-btn',
            disabled() {
              return (
                [null, undefined, ''].includes(form.value.inType) ||
                [null, undefined, ''].includes(form.value.supplierId)
              );
            },
            props: {
              plain: true,
              title: '请先选择供应商',
              style: {
                'margin-right': '10px',
              },
              type: 'primary',
            },
            selectProps: {
              type: 'dc-select-btn',
              label: '供应商物料清单',
              prop: 'supplierId',
              required: true,
              class: 'w33',
              props: {
                type: 'input',
                multiple: true,
                clearable: true,
                multipleLimit: 10,
                objectName: 'scmInStockDetailList',
                rowKey: 'sourceId',
                placeholder: '请选择物料清单',
              },
            },
          },
          {
            label: '删除',
            action: 'delrow',
            showFunc() {
              return ['add', 'edit'].includes(type);
            },
            disabled() {
              return !(detailList.value.selectRows.length > 0);
            },
            props: {
              plain: true,
            },
          },
          {
            label: '复制行',
            action: 'copyrow',
            showFunc() {
              return ['add', 'edit'].includes(type) && form.value.inType !== 'DC_WMS_IN_TYPE_CGRK';
            },
            disabled() {
              return !(detailList.value.selectRows.length > 0);
            },
            props: {
              plain: true,
            },
          },
          {
            label: '批量选择仓库',
            action: 'multipleInsetWarehouseId',
            type: 'dc-select-btn2',
            showFunc() {
              return ['add', 'edit'].includes(type);
            },
            disabled() {
              const rows = detailList.value.selectData;
              return !(rows.length > 1);
            },
            props: {
              style: {
                margin: '0 8px',
              },
              plain: true,
            },
            selectProps: {
              type: 'dc-select-btn',
              label: '供应商物料清单',
              prop: 'supplierId',
              required: true,
              class: 'w33',
              props: {
                objectName: 'warehouse',
                type: 'input',
                suffixIcon: 'Search',
                multiple: false,
                multipleLimit: 1,
                clearable: true,
                params: {
                  // siteWarehouse: true,
                },
                placeholder: '请点击选择仓库',
              },
            },
          },
          {
            label: '批量选择库位',
            action: 'multipleInsetWarehouseId',
            type: 'dc-select-btn3',
            showFunc() {
              return ['add', 'edit'].includes(type);
            },
            disabled() {
              const rows = detailList.value.selectData;
              if (rows.length > 1) {
                const tag = rows[0].warehouseId;
                if (tag && rows.every(r => r.warehouseId === tag)) {
                  return false;
                }
              }
              return true;
            },
            props: {
              plain: true,
            },
            selectProps: {
              prop: 'locationId',
              label: '仓位(*)',
              type: 'rowText',
              formType: 'dc-select-dialog',
              required: true,
              props: {
                objectName: 'warehouseLocation',
                type: 'input',
                suffixIcon: 'Search',
                multiple: false,
                multipleLimit: 1,
                clearable: true,
                params: {
                  warehouseName: '',
                },
                placeholder: '请点击选择库位',
              },
            },
          },
        ],
      },
      {
        type: 'table',
        props: {
          border: true,
        },
        prop: 'detailList',
        children: getTableColumn(form.value.inType),
      },
    ],
  },
  {
    label: '基础信息',
    type: 'formItemGroup',
    showFunc() {
      return type !== 'add';
    },
    children: [
      {
        label: '创建人',
        prop: 'createUser',
        class: 'w25',
        type: 'dc-view',
        props: {
          objectName: 'user',
        },
      },
      {
        label: '创建时间',
        prop: 'createTime',
        class: 'w25',
        type: 'text',
      },
      {
        label: '审核人',
        prop: 'auditUserId',
        class: 'w25',
        type: 'dc-view',
        props: {
          objectName: 'user',
        },
      },
      {
        label: '审核时间',
        prop: 'auditTime',
        class: 'w25',
        type: 'text',
      },
    ],
  },
]);

/** 获取详情数据 */
const getDetail = async () => {
  laoding.value = true;
  const res = await api.scm.wareHouse.getDetail({
    id,
  });
  if (res.data.code === 200) {
    form.value = res.data.data;
    formConfig.value[1].children[1].children = getTableColumn(form.value.inType);
    setTimeout(() => {
      laoding.value = false;
      formMainRef.value?.validateField(['detailList']);
    }, 100);
  }
  laoding.value = false;
};

watch(
  () => form.value.detailList,
  newVal => {
    formMainRef.value?.validateField(['detailList']);
  },
  {
    deep: true,
  }
);

const saveData = () => {
  const submitData = JSON.parse(
    JSON.stringify({
      ...form.value,
    })
  );
  submitData.detailList = submitData.detailList.map(row => {
    return {
      ...row,
      wareHouseId: row.warehouseId?.id ? row.warehouseId?.id : row.warehouseId,
    };
  });
  formMainRef.value.validate(valid => {
    if (valid) {
      api.scm.wareHouse.submit(submitData).then(res => {
        if (res.data.code === 200) {
          router.go(-1);
          // router.push({
          //   path: '/scm/inventoryMng/warehouseEntry/index',
          // });
        }
      });
    }
  });
};

/** 审核 */
const submitData = () => {
  formMainRef.value.validate(valid => {
    if (valid) {
      api.scm.wareHouse
        .wareHouseAudit({
          ...form.value,
        })
        .then(res => {
          if (res.data.code === 200) {
            router.go(-1);
            // router.push({
            //   path: '/scm/inventoryMng/warehouseEntry/index',
            // });
          }
        });
    }
  });
};

const showInSockDetailModal = (btn, scoped) => {
  scoped.bindObj.openDialog();
};

/** 执行相关操作 */
const doAction = (action, ...args) => {
  switch (action) {
    case 'addrow':
      if ([null, undefined, ''].includes(form.value.inType)) {
        proxy.$message.error('请先选择基本信息的入库类型');
        formMainRef.value.validateField(['inType']);
        return;
      }
      const newRow = {
        productId: '',
        productName: '',
        productCode: '',
        productSpec: '',
        brand: '',
        warehouseId: '',
        warehouseName: '',
        productUnit: '',
        locationId: '',
        productQty: 1,
        sourceSeq: '',
      };
      form.value.detailList.push(newRow);
      // openDrawer();
      break;
    case 'delrow':
      form.value.detailList = form.value.detailList.filter((_, index) => {
        return !detailList.value.selectRows.includes(index);
      });
      break;
    case 'copyrow':
      const copyData = JSON.parse(JSON.stringify(detailList.value.selectData));
      copyData.forEach(row => {
        form.value.detailList.push(row);
      });
      break;
    case 'getInSockDetail':
      showInSockDetailModal(...args);
      break;

    case 'save':
      saveData();
      break;
    case 'submit':
      submitData();
      break;
    case 'cancel':
      router.go(-1);
      // router.push({
      //   path: '/scm/inventoryMng/warehouseEntry/index',
      // });
      break;

    default:
      console.warn('action not done', action);
  }
};

/**
 * 数据改变
 * @param val
 */
const selectListChange = val => {
  form.value.detailList = JSON.parse(
    JSON.stringify(
      val.map(row => {
        return {
          ...row,
          max: row.productQty,
        };
      })
    )
  );
};

const toggleGroup = group => {
  group.hide = !group.hide;
};

const toggleFullScreen = group => {
  group.isFull = !group.isFull;
};

/** 仓库批量改变 */
const selectMultipleWarehouseChange = value => {
  // const detailListSet = JSON.parse(JSON.stringify(form.value.detailList));
  detailList.value.selectRows.forEach($index => {
    form.value.detailList[$index].warehouseId = value.id;
    form.value.detailList[$index].enableLocation = value.enableLocation;
    form.value.detailList[$index].warehouseName = value.warehouseName;
    form.value.detailList[$index].locationId = '';
  });
  // form.value.detailList = detailListSet;
};

/** 批量库位选择 */
const selectMultipleLocationIdChange = value => {
  detailList.value.selectRows.forEach($index => {
    form.value.detailList[$index].locationId = value.id;
  });
};

/**
 * 基本信息变更回调
 * @param item
 * @param args
 */
const handleFormItemChange = (item, ...args) => {
  if (item.prop === 'inType') {
    formConfig.value[1].children[1].children = getTableColumn(args[0]);
    form.value.detailList = [];
  } else if (item.prop === 'supplierId') {
    form.value.supplierId = args[0].id;
  }
};

// 选择物料后自动填入
const selectMapFilter = {
  productId: 'id',
  productName: 'materialName',
  productCode: 'materialNumber',
  productSpec: 'specification',
  brand: 'brand',
  productQty: '',
  productUnit: 'unitDict',
  locationId: '',
  sourceSeq: '',
};
/**
 * 物料信息变更
 * @param item
 * @param value
 */
const handleDrawerFormItemChange = (item, value, $index) => {
  if (item.prop === 'productId') {
    Object.keys(selectMapFilter).forEach(k => {
      if (selectMapFilter[k]?.length > 0) {
        form.value.detailList[$index][k] =
          value && value[selectMapFilter[k]] ? value[selectMapFilter[k]] : '';
      }
    });
  } else if (item.prop === 'warehouseId') {
    form.value.detailList[$index].warehouseId = value.id;
    form.value.detailList[$index].enableLocation = value.enableLocation;
    form.value.detailList[$index].warehouseName = value.warehouseName;
    form.value.detailList[$index].locationId = '';
  } else if (item.prop === 'locationId') {
    form.value.detailList[$index].locationId = value.id;
    // form.value.detailList[$index].locationId = value.id;
  }
  // console.log('item', item, 'value', value);
};

/** 自动填入 */
const getUserInfoData = () => {
  console.log('done=== 0005');
  getUserInfo().then(res => {
    // 自动填入当前用户
    if (res.data.code === 200) {
      form.value.processingPersonnel = res.data.data.id;
    }
  });
};

onMounted(async () => {
  if (['add'].includes(type)) {
    await getUserInfoData();
  } else if (['edit', 'audit', 'look'].includes(type)) {
    disabled.value = type === 'edit' ? false : true;

    await getDetail();
  }
});
</script>
<style lang="scss" scoped>
.page-warehous-entry-add-or-edit {
  display: flex;
  .wrap {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
  }

  .form-content {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;

    :deep(.el-form) {
      flex: 1;
      display: flex;
      flex-flow: column nowrap;
    }
    .table-group {
      flex: 1;
      display: flex;
      flex-flow: column nowrap;
      transition: all ease 0.2s;

      &.full-mode {
        position: fixed;
        z-index: 200;
        width: 100%;
        height: 100%;
        background: #fff;
        left: 0;
        top: 0;
      }

      .table-box {
        flex: 1;
        display: flex;

        .form-item-table {
          flex: 1;

          :deep(.el-form-item__content) {
            flex: 1;
            overflow: hidden;
            position: relative;
            .el-table {
              left: 24px;
              position: absolute;
              width: calc(100% - 24px);
              height: calc(100% - 16px) !important;
            }
            .el-form-item__error {
              position: absolute;
              z-index: 1000;
              top: calc(100% - 16px);
            }
          }
        }
      }
    }
  }
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

  .self-icon {
    display: inline-block;
    margin-right: 4px;
    transform: translateY(-1px);
  }

  :deep(.el-input) {
    display: block;
    width: 100%;
    .el-input__wrapper {
      width: 100%;
    }
  }

  :deep(.el-table__empty-text) {
    width: 100%;
    text-align: center;
    line-height: 200px;
    height: 200px;
    border-bottom: none; //1px solid rgb(229, 231, 235);
  }

  :deep(.el-table) {
    .el-input-number {
      width: calc(100% - 16px);
    }
  }
  .group-hide {
    height: 48px;
    overflow: hidden;
  }

  .group-title {
    width: 100%;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    padding-left: 9px;
    position: relative;
    padding-top: 20px;
    padding-bottom: 16px;
    display: flex;

    &::before {
      display: inline-block;
      content: ' ';
      width: 4px;
      height: 13px;
      background: #f78431;
      margin-right: 8px;
    }

    .toggle {
      cursor: pointer;
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      justify-self: flex-end;

      &.hide {
        transform: translateY(-50%) rotate(-90deg);
      }
    }
  }

  .full-screen {
    display: block;
    width: 32px;
    height: 32px;
    position: absolute;
    right: 40px;
    top: 12px;
    cursor: pointer;
    svg {
      width: 80%;
      height: auto;
    }
  }

  .actions {
    padding-left: 24px;
    padding-bottom: 12px;
  }
  .w33 {
    width: 30%;
    margin-right: 3%;
  }
  .w25 {
    width: 23%;
    margin-right: 2%;
  }
}
</style>

<template>
  <!-- 新增、修改出库单 -->
  <basic-container class="business-container page-warehous-entry-add-or-edit">
    <div class="wrap">
      <h4 class="title-box">
        <span class="title-text"> {{ title }} </span>
        <div class="right-btn-box">
          <el-button
            v-if="type !== 'look' && form.outStockStatus !== 'DC_WMS_OUT_STATUS_C'"
            type="primary"
            @click="doAction('submit')"
            icon="position"
            >审核</el-button
          >
          <el-button v-if="type !== 'look'" type="default" @click="doAction('save')"
            ><img src="~@/styles/img/submit.svg" class="self-icon" alt="icon-submit" />
            保存</el-button
          >
          <el-button @click="doAction('cancel')" icon="circleClose">取消</el-button>
        </div>
      </h4>
      <div class="form-content">
        <el-form
          ref="formMainRef"
          :model="form"
          inline
          :disabled="disabled"
          label-width="85px"
          label-suffix=":"
          :rules="formRules"
        >
          <template v-for="group in formConfig">
            <div v-if="!group.showFunc || (group.showFunc && group.showFunc())" class="group">
              <div class="group-title">{{ group.label }}</div>
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
                  <div v-if="item.type === 'actions'" class="actions" :key="i">
                    <template v-for="(btn, k) in item.children">
                      <template v-if="!btn.showFunc || (btn.showFunc && btn.showFunc())">
                        <dc-select-dialog-v2
                          v-if="btn.type === 'dc-select-btn'"
                          :key="k"
                          v-bind="btn.selectProps.props"
                          @change="selectListChange"
                          :params="{
                            supplierId: form.supplierId,
                            sourceType: form.inType,
                          }"
                        >
                          <template #default>
                            <el-button v-bind="btn.props" :disabled="btn.disabled()">
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
                    <el-form-item style="width: 100%" :label-width="0" :prop="item.prop">
                      <el-table
                        v-bind="item.props"
                        ref="detailTable"
                        :data="form[item.prop]"
                        @selection-change="handleSelectionChange"
                      >
                        <el-table-column
                          v-for="(col, x) in item.children"
                          :key="x"
                          :type="col.type === 'rowText' ? '' : col.type"
                          :label="col.label"
                          :prop="col.prop"
                        >
                          <template v-if="col.type === 'rowText'" #default="scoped">
                            <el-form-item label-width="0" :rule="null" style="margin-right: 0">
                              <el-select
                                v-if="col.formType === 'el-select'"
                                v-bind="col.props"
                                :remote-method="
                                  query => {
                                    handleRemoteQuery(query, col, scoped.$index);
                                  }
                                "
                                @change="
                                  val => {
                                    handleDrawerFormItemChange(col, val, scoped.$index);
                                  }
                                "
                                v-model="form.detailList[scoped.$index][col.prop]"
                              >
                                <template v-if="form.detailList[scoped.$index][col.options]">
                                  <el-option
                                    v-for="(op, m) in form.detailList[scoped.$index][col.options]"
                                    :key="m"
                                    :label="col.labelKey ? op[col.labelKey] : op.dictValue"
                                    :value="col.valueKey ? op[col.valueKey] : op.dictKey"
                                  >
                                  </el-option>
                                </template>
                              </el-select>
                              <component
                                v-else
                                v-bind="col.props"
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
                                    ? ['locationId', 'productId'].includes(col.prop)
                                      ? getWarehouseParam(scoped.row)
                                      : col.props?.params
                                    : undefined
                                "
                                :max="
                                  col.prop === 'productQty' && scoped.row.max
                                    ? scoped.row.max
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
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-form-item>
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
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/index';
import dayjs from 'dayjs';

const { proxy } = getCurrentInstance();
/** 是否全局禁用表单 */
const disabled = ref(false);
const formMainRef = ref(null);
const router = useRouter();
const params = ref({
  warehouseName: '',
});
const titleMaps = {
  add: '新增出库单',
  edit: '编辑出库单',
  look: '出库单详情',
};

const route = useRoute();

const datas = reactive({
  detailList: {
    selectData: [],
    selectRows: [],
  },
});

const { detailList } = toRefs(datas);

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
  console.log(' 程序获取行号:', indexes);
  console.log('选择', detailList.value);
};

const getWarehouseParam = row => {
  console.log(
    'row.warehouseName',
    row.warehouseName,
    'form.value.warehouseId',
    form.value.warehouseId
  );
  return {
    warehouseId: form.value.warehouseId?.id ? form.value.warehouseId?.id : form.value.warehouseId,
    warehouseName: form.value.warehouseName,
  };
};

/** 控制是否可以选择仓位 */
const getLocationDisableStatus = row => {
  return row.warehouseName && row.enableLocation ? false : true;
};

const dictCache = proxy.useCache([{ key: 'SCMORG_LIST_CACHE' }, { key: 'DC_WMS_OUT_TYPE_SCM' }]);

const form = ref({
  detailList: [],
});

const { SCMORG_LIST_CACHE, DC_WMS_OUT_TYPE_SCM } = dictCache;

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
            return row.productName && row.productQty >= 0;
          });
          if (result) {
            if (value.find(row => row.productQty === 0)) {
              callback(new Error('出库数量必须大于0'));
            } else {
              callback();
            }
          } else {
            callback(new Error('请完成明细信息填写'));
          }
        },
      },
    ],
  };
  formConfig.value[0].children.forEach(item => {
    if (item.required) {
      result[item.prop] =
        item.prop === 'processingPersonnel'
          ? [
              {
                required: true,
                validator(_, value, callback) {
                  if ([null, '', undefined].includes(value)) {
                    callback(new Error('请选择仓管员'));
                  }
                  if (value && value?.split?.(',')?.length > 1) {
                    callback(new Error('不允许有多个仓管员'));
                  } else {
                    callback();
                  }
                },
                trigger: 'blur',
              },
            ]
          : [
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

/** drawer选项和表格列公用 */
const tableColumns = [
  {
    type: 'selection',
    width: 55,
  },
  {
    prop: 'productId',
    label: '物料名称(*)',
    type: 'rowText',
    width: '200px',
    required: true,
    formType: 'dc-select-dialog',
    props: {
      params: {},
      placeholder: '请选择物料名称',
      objectName: 'warehouseCount',
      type: 'input',
      multiple: false,
      inputProps: {
        readonly: true,
      },
      mutableLimit: 1,
      clearable: true,
    },
  },
  // {
  //   prop: 'warehouseCountId',
  //   label: '物料名称',
  //   type: 'rowText',
  //   required: true,
  //   formType: 'el-select',
  //   options: 'productOptions',
  //   labelKey: 'productName',
  //   valueKey: 'id',
  //   props: {
  //     placeholder: '请输入物料名称',
  //     filterable: true,
  //     remote: true,
  //     'reserve-keyword': true,
  //     'remote-show-suffix': true,
  //     clearable: true,
  //   },
  // },
  {
    prop: 'productCode',
    label: '物料编码',
    type: 'rowText',
    required: true,
    formType: 'el-input',
    props: {
      disabled: true,
      placeholder: '选择物料后自动填入',
    },
  },
  {
    prop: 'productSpec',
    label: '规格型号',
    type: 'rowText',
    required: true,
    formType: 'el-input',
    props: {
      disabled: true,
      placeholder: '选择物料后自动填入',
    },
  },
  // {
  //   prop: 'brand',
  //   label: '品牌',
  //   type: 'rowText',
  //   required: true,
  //   formType: 'el-input',
  //   props: {
  //     disabled: true,
  //     placeholder: '选择物料后自动填入',
  //   },
  // },
  {
    prop: 'productQty',
    label: '出库数量',
    type: 'rowText',
    formType: 'el-input-number',
    required: true,
    validator: (_, value, callback) => {
      if (value <= 0) {
        callback(new Error('出库数量必须大于0'));
      } else if ([null, undefined, ''].includes(value)) {
        callback(new Error('请输入出库数量'));
      } else {
        callback();
      }
    },
    props: {
      placeholder: '请输入',
    },
  },
  {
    prop: 'productUnit',
    label: '库存单位',
    type: 'rowText',
    required: true,
    formType: 'el-input',
    props: {
      disabled: true,
      placeholder: '选择物料后自动填入',
    },
  },
  {
    prop: 'locationId',
    label: '出库仓位',
    type: 'rowText',
    formType: 'dc-select-dialog',
    required: true,
    props: {
      objectName: 'warehouseLocation',
      type: 'input',
      suffixIcon: 'Search',
      multiple: false,
      returnType: 'string',
      multipleLimit: 1,
      clearable: true,
      params: {
        warehouseName: params.value.warehouseName,
      },
      placeholder: '请点击选择仓库',
    },
  },
];
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
        valueKey: 'id',
        props: {
          filterable: true,
          placeholder: '请选择组织',
        },
      },
      {
        type: 'el-input',
        label: '出库单号',
        prop: 'outStockCode',
        required: false,
        class: 'w33',
        props: {
          disabled: true,
          class: 'system-auto-fill',
          placeholder: '系统自动生成',
        },
      },
      {
        type: 'el-select',
        label: '出库类型',
        required: true,
        prop: 'outStockType',
        dictKey: 'DC_WMS_OUT_TYPE_SCM',
        class: 'w33',
        props: {
          placeholder: '请选择出库类型',
        },
      },
      {
        type: 'el-date-picker',
        label: '创建日期',
        prop: 'businessDate',
        required: true,
        class: 'w33',
        props: {
          type: 'date',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          placeholder: '请选择日期',
        },
      },
      {
        type: 'dc-select-dialog',
        label: '客户',
        prop: 'customerId',
        required: true,
        class: 'w33',
        props: {
          type: 'input',
          params: { flagStatusDict: 1 },
          multiple: false,
          'multiple-limit': 1,
          clearable: true,
          dialogWidth: '800px',
          title: '客户选择',
          inputProps: {
            readonly: true,
          },
          objectName: 'customer',
          placeholder: '请选择客户',
        },
      },
      {
        type: 'dc-select-dialog',
        label: '仓库',
        prop: 'warehouseId',
        required: true,
        class: 'w33',
        props: {
          objectName: 'warehouse',
          type: 'input',
          suffixIcon: 'Search',
          multiple: false,
          multipleLimit: 1,
          inputProps: {
            readonly: true,
          },
          clearable: true,
          placeholder: '请点击选择仓库',
        },
      },
      {
        type: 'dc-select-user',
        label: '仓管员',
        prop: 'processingPersonnel',
        required: true,
        class: 'w33',
        props: {
          objectName: 'user',
          suffixIcon: 'Search',
          placeholder: '请选择仓管员',
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
            props: {
              plain: true,
              title: '选择仓库后方可使用',
              type: 'primary',
            },
          },
          {
            showFunc() {
              return ['add', 'edit'].includes(type);
            },
            label: '删除',
            action: 'delrow',
            disabled() {
              return !(detailList.value.selectRows.length > 0);
            },
            props: {
              plain: true,
            },
          },
          // {
          //   showFunc() {
          //     return ['add', 'edit'].includes(type) && form.value.inType !== 'DC_WMS_IN_TYPE_CGRK';
          //   },
          //   label: '复制行',
          //   action: 'copyrow',
          //   disabled() {
          //     return !(detailList.value.selectRows.length > 0);
          //   },
          //   props: {
          //     plain: true,
          //   },
          // },
        ],
      },
      {
        type: 'table',
        props: {
          border: true,
        },
        prop: 'detailList',
        children: [...tableColumns],
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

// /**
//  * 获取仓库信息
//  */
// const getWareHouseList = async () => {
//   const res = await api.wms.warehouse.list({
//     current: 1,
//     size: 100,
//   });
//   const { code, data } = res.data;
//   if (code === 200) {
//     wareHouseList.value = data.records;
//     total.value = data.total;
//   }
// };

// /** 获取验证规则 */
// const drawerRules = computed(() => {
//   const result = {};
//   tableColumns.forEach(c => {
//     if (c.required) {
//       result[c.prop] = [
//         {
//           required: true,
//           validator: c.validator
//             ? c.validator
//             : (_, value, callback) => {
//                 // const value = drawerConfig.form[rule.prop];
//                 if ([null, '', undefined].includes(value)) {
//                   callback(new Error(c.props.placeholder));
//                 } else {
//                   callback();
//                 }
//               },
//           prop: c.prop,
//           trigger: ['change', 'blur'],
//         },
//       ];
//     }
//   });
//   return result;
// });

const submitData = () => {
  formMainRef.value.validate(valid => {
    if (valid) {
      form.value.detailList.forEach(item => delete item.productOptions);
      api.scm.scmOutStock
        .audit({
          ...form.value,
        })
        .then(res => {
          if (res.data.code === 200) {
            proxy.$message({
              type: 'success',
              message: '审核提交成功!',
            });
            router.go(-1);
          }
        });
    }
  });
};

const saveData = () => {
  formMainRef.value.validate(valid => {
    if (valid) {
      form.value.detailList.forEach(item => delete item.productOptions);
      const submitData = JSON.parse(JSON.stringify(form.value));
      submitData.warehouseId = submitData.warehouseId?.id
        ? submitData.warehouseId?.id
        : submitData.warehouseId;
      submitData.detailList = submitData.detailList.map(row => {
        return {
          ...row,
          wareHouseId: row.warehouseId?.id ? row.warehouseId?.id : row.warehouseId,
        };
      });
      api.scm.scmOutStock.submit(submitData).then(res => {
        if (res.data.code === 200) {
          proxy.$message({
            type: 'success',
            message: '保存成功!',
          });
          router.go(-1);
        }
      });
    }
  });
};

const cancel = () => {
  router.go(-1);
};

/** 执行相关操作 */
const doAction = action => {
  switch (action) {
    case 'addrow':
      if (!form.value.warehouseId) {
        proxy.$message.error('请先选择基本信息中的仓库信息');
        formMainRef.value.validateField(['warehouseId']);
        return;
      }
      const newRow = {
        productOptions: [],
        productId: '',
        productName: '',
        productCode: '',
        productSpec: '',
        brand: '',
        productUnit: '',
        locationId: '',
        productQty: 1,
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
      form.value.detailList = [...form.value.detailList, ...copyData];
    case 'submit':
      submitData();
      break;
    case 'save':
      saveData();
      break;
    case 'cancel':
      cancel();
      break;
    default:
      console.log('action not done', action);
  }
};

/**
 * 基本信息变更回调
 * @param item
 * @param args
 */
const handleFormItemChange = (item, ...args) => {
  if (item.prop === 'warehouseId') {
    setTimeout(() => {
      form.value.processingPersonnel = args[0].warehouseSupervisor
        ? args[0].warehouseSupervisor
        : null;
      form.value.warehouseName = args[0].warehouseName ? args[0].warehouseName : null;
      form.value.warehouseId = args[0].id ? args[0].id : null;
      form.value.detailList = [];
    }, 10);
  }
};

// 选择物料后自动填入
const selectMapFilter = {
  productId: 'productId',
  warehouseCountId: 'id',
  productName: 'productName',
  productCode: 'productCode',
  productSpec: 'productSpec',
  warehouseId: 'warehouseId',
  warehouseName: 'warehouseName',
  locationName: 'locationName',
  locationId: 'locationId',
  max: 'number',
  // brand: 'brand',
  productQty: '',
  productUnit: 'unit',
  sourceSeq: '',
};
/**
 * 物料信息变更
 * @param item
 * @param value
 */
const handleDrawerFormItemChange = (item, value, $index) => {
  if (item.prop === 'productId') {
    if (form.value.detailList.find((row, i) => row.warehouseCountId === value.id)) {
      proxy.$message.error('明细列表已存在物料：' + value.productName);
      form.value.detailList[$index].productId = value.id;
      setTimeout(() => {
        form.value.detailList[$index] = {
          productOptions: [],
          productId: '',
          warehouseCountId: '',
          productName: '',
          productCode: '',
          productSpec: '',
          productUnit: '',
          locationId: '',
          productQty: 1,
        };
      }, 10);
      return;
    }
    Object.keys(selectMapFilter).forEach(k => {
      if (selectMapFilter[k]?.length > 0) {
        form.value.detailList[$index][k] =
          value && value[selectMapFilter[k]] ? value[selectMapFilter[k]] : '';
      }
    });
  }
};

/**
 * 处理远程查询
 * @param item
 * @param value
 */
const handleRemoteQuery = async (query, col, $index) => {
  try {
    if (query || query === 'init') {
      const res = await api.wms.common.list({
        productName: query !== 'init' ? query : undefined,
        warehouseId: form.value.warehouseId,
        size: 1000,
        current: 1,
      });
      const { code, data: resData } = res.data;
      if (code === 200) {
        form.value.detailList[$index][col.options] = resData.records;
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
  }
};

const getUserInfoData = () => {
  const userInfo = useStore().getters.userInfo;
  form.value.createUser = userInfo.user_id;
  form.value.createTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
};

/** 自动填入 */
const getDetail = async () => {
  const res = await api.scm.scmOutStock.getDetail({ id });
  const { code, data: resData } = res.data;
  if (code === 200) {
    resData.detailList = resData.detailList.map(item => {
      return {
        ...item,
        productOptions: [
          {
            ...item,
            id: item.warehouseCountId,
            unit: item.productUnit,
          },
        ],
      };
    });
    form.value = resData;
  }
};

onMounted(async () => {
  if (['add'].includes(type)) {
    await getUserInfoData();
  } else if (['edit', 'look'].includes(type)) {
    disabled.value = type === 'edit' ? false : true;
    await getDetail();
  }
});
</script>
<style lang="scss" scoped>
.page-warehous-entry-add-or-edit {
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
    border-bottom: 1px solid rgb(229, 231, 235);
  }

  .group-title {
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
    padding-bottom: 32px;

    &::before {
      display: inline-block;
      content: ' ';
      width: 4px;
      height: 13px;
      background: #f78431;
      margin-right: 8px;
    }
  }

  .actions {
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

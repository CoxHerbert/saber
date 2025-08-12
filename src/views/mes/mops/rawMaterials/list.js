/** 原材料物料 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40px',
        align: 'center',
        selectable(row) {
          return !row?.purchaseOrderNo;
        },
      },
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'purchaseOrderNo',
        label: '采购申请单号',
        type: 'rowText',
        search: true,
        width: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入采购申请单号',
        },
      },
      {
        prop: 'billNo',
        label: '单据编号',
        type: 'rowText',
        search: true,
        width: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入单据编号',
        },
      },
      {
        prop: 'mtoNo',
        label: '计划跟踪号',
        type: 'rowText',
        search: true,
        width: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入计划跟踪号',
        },
      },
      {
        prop: 'rawMaterialNumber',
        label: '原材料编码',
        type: 'rowText',
        search: true,
        minWidth: 120,
        searchProps: {
          is: 'input',
          placeholder: '请输入物料编码',
        },
      },
      {
        prop: 'rawMaterialName',
        label: '原材料名称',
        type: 'rowText',
        search: false,
        minWidth: 120,
      },

      {
        prop: 'shape',
        label: '形状',
        type: 'dict',
        dictKey: 'DC_RAW_MATERIAL_TYPE',
        width: 80,
      },
      {
        prop: 'cutNumber',
        label: '下料数量',
        type: 'rowText',
        search: false,
        width: 90,
      },
      {
        prop: 'materialSize',
        label: '尺寸',
        type: 'rowText',
        search: false,
        minWidth: 120,
      },
      {
        prop: 'cutStatus',
        label: '下料状态',
        type: 'dict',
        dictKey: 'DC_MOPS_CUT_STATUS',
        search: false,
        width: 100,
      },
      {
        prop: 'demandCount',
        label: '需求量(KG)',
        type: 'rowText',
        search: false,
        width: 120,
      },
      {
        prop: 'materialSize',
        label: '尺寸',
        type: 'rowText',
        search: false,
        minWidth: 140,
      },
      {
        prop: 'pageNumberString',
        label: '排版',
        type: 'rowText',
        search: false,
        width: 80,
      },
      {
        prop: 'stockCount',
        label: '库存量',
        type: 'rowText',
        search: false,
        width: 80,
      },
    ],
  };
};

const dialogOptions = () => {
  return {
    columns: [
      {
        prop: 'materialNumber',
        label: '原材料编码',
        type: 'rowText',
        search: false,
        width: 130,
      },
      {
        prop: 'mtoNo',
        label: '计划跟踪号',
        type: 'rowText',
        search: false,
        width: 130,
      },
      {
        prop: 'number',
        label: '需求量',
        type: 'number',
        props: {
          placeholder: '请输入需求量',
          precision: 4,
        },
      },
    ],
  };
};

export default {
  options,
  dialogOptions,
};

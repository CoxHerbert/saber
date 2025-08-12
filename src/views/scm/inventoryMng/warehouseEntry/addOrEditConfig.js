export default inType => {
  if (inType === 'DC_WMS_IN_TYPE_XBCRK') {
    return [
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
          placeholder: '请输入物料名称',
          objectName: 'scmMaterial',
          type: 'input',
          multiple: false,
          mutableLimit: 1,
          clearable: true,
        },
      },
      {
        prop: 'productCode',
        label: '物料编码',
        type: 'rowText',
        width: '140px',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '系统自动填入',
        },
      },
      {
        prop: 'brand',
        label: '品牌',
        type: 'rowText',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '系统自动填入',
        },
      },
      {
        prop: 'productUnit',
        label: '库存单位',
        type: 'rowText',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '系统自动填入',
        },
      },

      {
        prop: 'productSpec',
        label: '规格型号',
        type: 'rowText',
        minWidth: '200px',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '系统自动填入',
        },
      },
      {
        prop: 'warehouseId',
        label: '仓库(*)',
        type: 'rowText',
        width: '200px',
        normType: 'dc-view',
        objectName: 'warehouse',
        formType: 'dc-select-dialog',
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
      {
        prop: 'locationId',
        label: '仓位(*)',
        type: 'rowText',
        width: '200px',
        formType: 'dc-select-dialog',
        normType: 'dc-view',
        objectName: 'warehouseLocation',
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
      {
        prop: 'productQty',
        label: '入库数量(*)',
        type: 'rowText',
        width: '140px',
        fixed: 'right',
        formType: 'el-input-number',
        props: {
          controls: false,
          precision: 2,
          placeholder: '请输入',
        },
      },
      {
        prop: 'sourceSeq',
        label: '批次',
        type: 'rowText',
        width: '140px',
        formType: 'el-input',
        fixed: 'right',
        props: {
          disabled: true,
          placeholder: '系统自动生成',
        },
      },
    ];
  } else if (inType === 'DC_WMS_IN_TYPE_CGRK') {
    return [
      {
        type: 'selection',
        width: 55,
      },
      {
        prop: 'productName',
        label: '物料名称(*)',
        type: 'rowText',
        width: '200px',
        required: true,
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '请输入物料名称',
        },
      },
      {
        prop: 'productCode',
        label: '物料编码(*)',
        type: 'rowText',
        width: '140px',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '请输入物料编码',
        },
      },
      {
        prop: 'brand',
        label: '品牌',
        type: 'rowText',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '请输入物料品牌',
        },
      },
      {
        prop: 'productUnit',
        label: '库存单位',
        type: 'rowText',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '请输入库存单位',
        },
      },

      {
        prop: 'productSpec',
        label: '规格型号',
        minWidth: '200px',
        type: 'rowText',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '请输入规格型号',
        },
      },
      {
        prop: 'warehouseId',
        label: '仓库(*)',
        type: 'rowText',
        width: '200px',
        formType: 'dc-select-dialog',
        normType: 'dc-view',
        objectName: 'warehouse',
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
      {
        prop: 'locationId',
        label: '仓位(*)',
        type: 'rowText',
        width: '200px',
        normType: 'dc-view',
        objectName: 'warehouseLocation',
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
          placeholder: '请点击选择仓库',
        },
      },
      {
        prop: 'productQty',
        label: '入库数量(*)',
        type: 'rowText',
        formType: 'el-input-number',
        width: '140px',
        fixed: 'right',
        // required: true,
        // validator(_, value, callback) {
        //   if (value <= 0) {
        //     callback(new Error('入库数量必须大于0'));
        //   } else if ([null, undefined, ''].includes(value)) {
        //     callback(new Error('请输入入库数量'));
        //   } else {
        //     callback();
        //   }
        // },
        props: {
          precision: 2,
          controls: false,
          placeholder: '请输入',
        },
      },
      {
        prop: 'sourceSeq',
        label: '批次',
        type: 'rowText',
        fixed: 'right',
        width: '140px',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '系统自动生成',
        },
      },
    ];
  } else {
    return [
      {
        type: 'selection',
        width: 55,
      },
      {
        prop: 'productName',
        label: '物料名称(*)',
        type: 'rowText',
        width: '200px',
        required: true,
        formType: 'el-input',
        props: {
          placeholder: '请输入物料名称',
        },
      },
      {
        prop: 'productCode',
        label: '物料编码(*)',
        type: 'rowText',
        formType: 'el-input',
        width: '140px',
        props: {
          placeholder: '请输入物料编码',
        },
      },
      {
        prop: 'brand',
        label: '品牌',
        type: 'rowText',
        formType: 'el-input',
        props: {
          placeholder: '请输入物料品牌',
        },
      },
      {
        prop: 'productUnit',
        label: '库存单位',
        type: 'rowText',
        formType: 'el-input',
        props: {
          placeholder: '请输入库存单位',
        },
      },

      {
        prop: 'productSpec',
        label: '规格型号',
        minWidth: '200px',
        type: 'rowText',
        formType: 'el-input',
        props: {
          placeholder: '请输入规格型号',
        },
      },
      {
        prop: 'warehouseId',
        label: '仓库(*)',
        type: 'rowText',
        width: '200px',
        formType: 'dc-select-dialog',
        normType: 'dc-view',
        objectName: 'warehouse',
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
      {
        prop: 'locationId',
        label: '仓位(*)',
        type: 'rowText',
        width: '200px',
        formType: 'dc-select-dialog',
        normType: 'dc-view',
        objectName: 'warehouseLocation',
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
          placeholder: '请点击选择仓库',
        },
      },
      {
        prop: 'productQty',
        label: '入库数量(*)',
        type: 'rowText',
        width: '140px',
        formType: 'el-input-number',
        fixed: 'right',
        // required: true,
        // validator(_, value, callback) {
        //   if (value <= 0) {
        //     callback(new Error('入库数量必须大于0'));
        //   } else if ([null, undefined, ''].includes(value)) {
        //     callback(new Error('请输入入库数量'));
        //   } else {
        //     callback();
        //   }
        // },
        props: {
          precision: 2,
          controls: false,
          placeholder: '请输入',
        },
      },
      {
        prop: 'sourceSeq',
        label: '批次',
        type: 'rowText',
        width: '140px',
        fixed: 'right',
        formType: 'el-input',
        props: {
          disabled: true,
          placeholder: '系统自动生成',
        },
      },
    ];
  }
};

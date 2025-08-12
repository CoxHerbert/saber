/** 工艺价格配置 */
const leftOptions = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40px',
        align: 'center',
      },
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'technologyName',
        label: '工艺名称',
        type: 'rowText',
        minWidth: 100,
      },
      {
        prop: 'technologyCode',
        label: '工艺编码',
        type: 'rowText',
        minWidth: 100,
      },
      {
        prop: 'technologyOrder',
        label: '工艺顺序',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'surfaceTreatment',
        label: '是否表面处理',
        type: 'rowText',
        width: 130,
        transVal(scope) {
          if ([false, true].includes(scope.row.surfaceTreatment)) {
            return scope.row.surfaceTreatment ? '是' : '否';
          }
          return '-';
        },
      },
      {
        prop: 'processGroupKey',
        label: '工序工艺分类',
        type: 'dict',
        width: 150,
        dictKey: 'DC_PROCESS_THCH_GROUP',
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 80,
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'left-edit',
          },
        ],
      },
    ],
  };
};

/** 右侧详情列表 **/
const rightOptions = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40px',
        align: 'center',
      },
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'cz',
        label: '材质名称',
        type: 'dict',
        minWidth: 120,
        dictKey: 'DC_TECHNOLOGY_PART_CZ',
      },
      {
        prop: 'partAccuracy',
        label: '零件精度',
        type: 'dict',
        width: 100,
        dictKey: 'DC_TECHNOLOGY_PART_ACCURACY',
      },
      {
        prop: 'pricingMethod',
        label: '计价方式',
        type: 'dict',
        width: 100,
        dictKey: 'DC_TECHNOLOGY_PRICING_METHOD',
      },
      {
        prop: 'price',
        label: '单价',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'pricingUnit',
        label: '单位',
        type: 'dict',
        dictKey: 'DC_TECHNOLOGY_ITEM_PRICING_UNIT',
        width: 100,
      },
      {
        prop: 'minPrice',
        label: '最低价',
        type: 'rowText',
        width: 100,
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 100,
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'right-edit',
          },
        ],
      },
    ],
  };
};

export default {
  leftOptions,
  rightOptions,
};

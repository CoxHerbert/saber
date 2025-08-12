const options = pageMode => {
  if (pageMode === 'print') {
    return {
      columns: [
        {
          name: '基本信息',
          classList: 'form-basic-group',
          renderType: 'form',
          showToggleExpand: true,
          prop: 'basic',
          items: [
            {
              prop: 'auditStatus',
              label: '审核状态',
              type: 'input',
              width: 100,
              props: {
                disabled: true,
              },
            },
            {
              prop: 'no',
              label: '执行单号',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'mtoNo',
              label: '专案号',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'projectName',
              label: '项目名称',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'bomNo',
              label: 'bom编码',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'materialName',
              label: '物料编码',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'materialName',
              label: '物料名称',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'qty',
              label: '加工件数',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'bomVersion',
              label: 'bom版本',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'etd',
              label: '齐套日',
              type: 'input',
              props: {
                disabled: true,
              },
            },
          ],
        },
        {
          name: '明细信息',
          classList: 'form-detail-group',
          renderType: 'table',
          showToggleExpand: false,
          prop: 'executeItemList',
          items: [
            // {
            //   type: 'selection',
            //   fixed: 'left',
            //   width: '55',
            //   selectable(row) {
            //     return !row?.erpStatus;
            //   },
            // },
            {
              type: 'index',
              prod: 'dataIndex',
              fixed: 'left',
              width: '55',
            },
            {
              prop: 'materialNumber',
              type: 'common',
              label: '物料编码',
              minWidth: '140px',
              is: 'el-input',
              props: {
                disabled: true,
                placeholder: '物料编码',
              },
            },
            {
              prop: 'materialName',
              type: 'common',
              label: '物料名称',
              minWidth: '140px',
              is: 'el-input',
              props: {
                disabled: true,
                placeholder: '物料名称',
              },
            },
            {
              prop: 'specification',
              minWidth: '120px',
              type: 'common',
              is: 'el-input',
              label: '规格型号',
              props: {
                disabled: true,
                placeholder: '规格型号',
              },
            },
            {
              prop: 'qty',
              width: '60px',
              type: 'common',
              is: 'el-input',
              label: '数量',
              props: {
                disabled: true,
                placeholder: '数量',
              },
            },
            {
              label: '单位',
              prop: 'unit',
              width: '60px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '系统生成',
              },
            },
            {
              label: '物料属性',
              prop: 'materialProperties',
              minWidth: '120px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '物料属性',
              },
            },
            {
              label: '图纸地址',
              prop: 'drawAddress',
              minWidth: '120px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '图纸地址',
              },
            },
            {
              label: '图纸类型',
              prop: 'drawType',
              minWidth: '120px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '图纸类型',
              },
            },
            {
              label: '变更单号',
              prop: 'changeNo',
              minWidth: '120px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '变更单号',
              },
            },
            {
              label: '齐套状态',
              prop: 'fullStatus',
              minWidth: '120px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '齐套状态',
              },
            },
            {
              label: '领料状态',
              prop: 'pickStatus',
              minWidth: '120px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '领料状态',
              },
            },
            {
              label: '领料数量',
              prop: 'pickQty',
              minWidth: '120px',
              type: 'input',
              props: {
                disabled: true,
                placeholder: '领料数量',
              },
            },
            {
              prop: 'options',
              width: 120,
              label: '操作',
              fixed: 'right',
              slot: '',
              type: 'actions',
              children: [
                {
                  type: 'button',
                  label: '补打',
                  action: 'print',
                  showFunc({ row }) {
                    return !!row?.drawAddress;
                  },
                },
                {
                  type: 'button',
                  label: '日志',
                  action: 'log',
                  showFunc({ row }) {
                    return !!row?.drawAddress;
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  }
  return {
    columns: [
      {
        name: '基本信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: true,
        prop: 'basic',
        items: [
          {
            prop: 'auditStatus',
            label: '审核状态',
            type: 'input',
            width: 100,
          },
          {
            prop: 'no',
            label: '执行单号',
            type: 'input',
          },
          {
            prop: 'mtoNo',
            label: '专案号',
            type: 'input',
          },
          {
            prop: 'projectName',
            label: '项目名称',
            type: 'input',
          },
          {
            prop: 'bomNo',
            label: 'bom编码',
            type: 'input',
          },
          {
            prop: 'materialName',
            label: '物料编码',
            type: 'input',
          },
          {
            prop: 'materialName',
            label: '物料名称',
            type: 'input',
          },
          {
            prop: 'qty',
            label: '加工件数',
            type: 'input',
          },
          {
            prop: 'bomVersion',
            label: 'bom版本',
            type: 'input',
          },
          {
            prop: 'etd',
            label: '齐套日',
            type: 'input',
          },
        ],
      },
      {
        name: '明细信息',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'executeItemList',
        items: [
          // {
          //   type: 'selection',
          //   fixed: 'left',
          //   width: '55',
          //   selectable(row) {
          //     return !row?.erpStatus;
          //   },
          // },
          {
            type: 'index',
            prod: 'dataIndex',
            fixed: 'left',
            width: '55',
          },
          {
            prop: 'materialNumber',
            type: 'common',
            label: '物料编码',
            minWidth: '140px',
            is: 'el-input',
            props: {
              disabled: true,
              placeholder: '物料编码',
            },
          },
          {
            prop: 'materialName',
            type: 'common',
            label: '物料名称',
            minWidth: '140px',
            is: 'el-input',
            props: {
              disabled: true,
              placeholder: '物料名称',
            },
          },
          {
            prop: 'specification',
            minWidth: '120px',
            type: 'common',
            is: 'el-input',
            label: '规格型号',
            props: {
              disabled: true,
              placeholder: '规格型号',
            },
          },
          {
            prop: 'qty',
            width: '60px',
            type: 'common',
            is: 'el-input',
            label: '数量',
            props: {
              disabled: true,
              placeholder: '数量',
            },
          },
          {
            label: '单位',
            prop: 'unit',
            width: '60px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '系统生成',
            },
          },
          {
            label: '物料属性',
            prop: 'materialProperties',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '物料属性',
            },
          },
          {
            label: '图纸地址',
            prop: 'drawAddress',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '图纸地址',
            },
          },
          {
            label: '图纸类型',
            prop: 'drawType',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '图纸类型',
            },
          },
          {
            label: '变更单号',
            prop: 'changeNo',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '变更单号',
            },
          },
          {
            label: '齐套状态',
            prop: 'fullStatus',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '齐套状态',
            },
          },
          {
            label: '领料状态',
            prop: 'pickStatus',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '领料状态',
            },
          },
          {
            label: '领料数量',
            prop: 'pickQty',
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '领料数量',
            },
          },
        ],
      },
    ],
  };
};

export default options;

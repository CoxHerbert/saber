import Api from '@/api';

const options = () => {
  return {
    columns: [
      {
        name: 'BOM信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: false,
        showToggleHeader: true,
        prop: 'basic',
        items: [
          {
            prop: 'rawMaterialId',
            label: '原材料',
            type: 'remote-select',
            objectName: 'rawList',
            required: true,
            props: {
              action: Api.mes.mops.getRawList,
              placeholder: '请输入查询选择原材料',
              labelKey: 'materialLabel',
              valueKey: 'id',
              dataCallback(res) {
                return res.data.data.records.map(item => {
                  return {
                    ...item,
                    materialLabel: `${item.materialNumber}-${item.materialName}`,
                  };
                });
              },
            },
          },
          {
            prop: 'shape',
            label: '形状',
            type: 'dict',
            dictKey: 'DC_RAW_MATERIAL_TYPE',
            labelKey: 'dictValue',
            valueKey: 'dictKey',
            required: true,
            props: {
              placeholder: '请选择形状',
              disabled: true,
            },
          },
          {
            prop: 'materialSize',
            label: '下料尺寸',
            type: 'input',
            required: true,
            props: {
              placeholder: '请输入下料尺寸(mm)',
            },
          },
          {
            prop: 'cutNumber',
            label: '下料数量',
            type: 'number',
            required: true,
            props: {
              min: 0,
              placeholder: '请输入下料数量',
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'bomNumber',
            label: '分子用量',
            type: 'number',
            required: true,
            props: {
              disabled: true,
              min: 0,
              placeholder: '<计算得出分子用量>',
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'number1',
            label: '排版',
            type: 'compose',
            required: true,
            props: {
              min: 0,
              precision: 0,
              placeholder: '请输入排版',
            },
          },
        ],
      },
      {
        name: 'BOM明细',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        showToggleHeader: false,
        prop: 'rawMaterialBom',
        items: [
          // {
          //   prop: 'bomOrder',
          //   type: 'drag',
          //   label: '拖拽',
          // },
          // {
          //   prop: 'bomOrder',
          //   type: 'input',
          //   label: 'BOM顺序',
          //   width: 100,
          //   props: {
          //     disabled: true,
          //     type: 'number',
          //     placeholder: 'BOM顺序',
          //   },
          // },
          {
            prop: 'rawMaterialName',
            type: 'input',
            label: '原材料名称',
            props: {
              disabled: true,
              placeholder: '原材料名称',
            },
          },
          {
            label: '原材料编码',
            prop: 'rawMaterialNumber',
            type: 'input',
            props: {
              placeholder: '原材料编码',
            },
          },
          {
            label: '分子用量',
            prop: 'numeratorNumber',
            type: 'number',
            props: {
              style: { width: '100%' },
            },
          },
          {
            prop: 'denominatorNumber',
            type: 'input',
            label: '尺寸',
            props: {
              placeholder: '尺寸',
            },
          },
          {
            prop: 'pageNumberString',
            type: 'input',
            label: '排版',
            props: {
              placeholder: '排版',
            },
          },
          {
            label: '操作',
            prop: 'action',
            type: 'actions',
            slotName: 'action',
            fixed: 'right',
            width: 60,
            children: [
              {
                type: 'button',
                label: '删除',
                action: 'row-delete',
                showFunc(scope) {
                  return !scope.row?.bomMaterialId;
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

export default options;

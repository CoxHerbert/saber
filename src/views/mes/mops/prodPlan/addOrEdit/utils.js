const options = pageMode => {
  if (pageMode === 'look') {
    return {
      columns: [
        {
          name: '基本信息',
          classList: 'form-basic-group',
          renderType: 'form',
          showToggleExpand: false,
          prop: 'basic',
          items: [
            {
              prop: 'billNo',
              label: '单据编号',
              type: 'input',
              width: 100,
              props: {
                placeholder: '请输入单据编号',
                disabled: true,
              },
            },
            {
              prop: 'mtoNo',
              label: '跟踪号',
              type: 'input',
              props: {
                placeholder: '请输入跟踪号',
                disabled: true,
              },
            },
            {
              prop: 'planStartTime',
              label: '计划开始',
              type: 'date',
              props: {
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD',
                clearable: true,
                style: {
                  width: '100%',
                },
              },
            },
            {
              prop: 'materialNumber',
              label: '物料编号',
              type: 'input',
              props: {
                placeholder: '请输入物料编号',
                disabled: true,
              },
            },
            {
              prop: 'number',
              label: '计划数量',
              type: 'input',
              props: {
                disabled: true,
              },
            },
            {
              prop: 'planEndTime',
              label: '计划结束',
              type: 'date',
              props: {
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD',
                clearable: true,
                style: {
                  width: '100%',
                },
              },
            },
          ],
        },
        {
          name: '工序信息',
          classList: 'form-detail-group',
          renderType: 'table',
          showToggleExpand: false,
          prop: 'createdProcessDetail',
          items: [
            {
              prop: 'technologyOrder',
              type: 'input',
              label: '顺序',
              props: {
                disabled: true,
                type: 'number',
                placeholder: '顺序',
              },
            },
            {
              prop: 'technologyName',
              type: 'input',
              label: '名称',
              props: {
                disabled: true,
                placeholder: '名称',
              },
            },
            {
              label: '描述',
              prop: 'description',
              type: 'input',
              props: {
                placeholder: '描述',
              },
            },
            {
              label: '委外',
              prop: 'isOutSource',
              type: 'switch',
              required: true,
              props: {
                activeValue: true,
                inactiveValue: false,
              },
              transVal(scope) {
                if ([undefined, null].includes(scope.row.isOutSource)) {
                  return '-';
                }
                return scope.row.isOutSource ? '是' : '否';
              },
            },
            {
              prop: 'prepareWorkingHour',
              type: 'input',
              label: '准备(分)',
              required: true,
              props: {
                placeholder: '准备(分)',
              },
            },
            {
              prop: 'singleWorkingHour',
              type: 'input',
              label: '标工(分)',
              required: true,
              props: {
                placeholder: '标工(分)',
              },
            },
            {
              prop: 'allWorkingHour',
              type: 'input',
              label: '总(分)',
              required: true,
              props: {
                disabled: true,
                placeholder: '总(分)',
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
        showToggleExpand: false,
        prop: 'basic',
        items: [
          {
            prop: 'billNo',
            label: '单据编号',
            type: 'input',
            props: {
              placeholder: '请输入单据编号',
              disabled: true,
            },
          },
          {
            prop: 'mtoNo',
            label: '跟踪号',
            type: 'input',
            props: {
              placeholder: '请输入跟踪号',
              disabled: true,
            },
          },
          {
            prop: 'planStartTime',
            label: '计划开始',
            type: 'date',
            props: {
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
              clearable: true,
              style: {
                width: '100%',
              },
            },
          },
          {
            prop: 'materialNumber',
            label: '物料编号',
            type: 'input',
            props: {
              placeholder: '请输入物料编号',
              disabled: true,
            },
          },
          {
            prop: 'number',
            label: '计划数量',
            type: 'input',
            props: {
              disabled: true,
            },
          },
          {
            prop: 'planEndTime',
            label: '计划结束',
            type: 'date',
            props: {
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
              clearable: true,
              style: {
                width: '100%',
              },
            },
          },
        ],
      },
      {
        name: '工序信息',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'createdProcessDetail',
        items: [
          {
            prop: 'technologyOrder',
            type: 'input',
            label: '顺序',
            props: {
              disabled: true,
              type: 'number',
              placeholder: '顺序',
            },
          },
          {
            prop: 'technologyName',
            type: 'input',
            label: '名称',
            props: {
              disabled: true,
              placeholder: '名称',
            },
          },
          {
            label: '描述',
            prop: 'description',
            type: 'input',
            props: {
              placeholder: '描述',
            },
          },
          {
            label: '委外',
            prop: 'isOutSource',
            type: 'switch',
            required: true,
            props: {
              activeValue: true,
              inactiveValue: false,
            },
            transVal(scope) {
              if ([undefined, null].includes(scope.row.isOutSource)) {
                return '-';
              }
              return scope.row.isOutSource ? '是' : '否';
            },
          },
          {
            prop: 'prepareWorkingHour',
            type: 'input',
            label: '准备(分)',
            required: true,
            props: {
              placeholder: '准备(分)',
            },
          },
          {
            prop: 'singleWorkingHour',
            type: 'input',
            label: '标工(分)',
            required: true,
            props: {
              placeholder: '标工(分)',
            },
          },
          {
            prop: 'allWorkingHour',
            type: 'input',
            label: '总(分)',
            required: true,
            props: {
              disabled: true,
              placeholder: '总(分)',
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
              },
            ],
          },
        ],
      },
    ],
  };
};

export default options;

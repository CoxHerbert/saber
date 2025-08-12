import Api from '@/api/index';
const options = pageMode => {
  console.log('pageMode', pageMode);
  if (pageMode === 'add') {
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
              prop: 'prdOrgId',
              type: 'dc-select',
              label: '生产组织',
              required: true,
              props: {
                objectName: 'org',
                placeholder: '请选择生产组织',
                disabled: true,
              },
            },
            {
              prop: 'supplierId',
              label: '供应商',
              type: 'remote-select',
              required: true,
              props: {
                labelKey: 'supplierName',
                valueKey: 'supplierId',
                queryKey: 'supplierName',
                initQueryKey: 'supplierId',
                action: Api.system.pro.getSupplierList,
                dataCallback() {
                  return res => {
                    return res.data.data.records;
                  };
                },
                params(data) {
                  return {
                    orgId: data.prdOrgId,
                  };
                },
              },
            },
          ],
        },
        {
          name: '明细信息',
          classList: 'form-detail-group',
          renderType: 'table',
          showToggleExpand: false,
          prop: 'proMaterialList',
          items: [
            {
              type: 'selection',
              fixed: 'left',
              width: '55',
              selectable(row) {
                return !row?.erpStatus;
              },
            },
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
              prop: 'mtoNo',
              minWidth: '120px',
              type: 'common',
              is: 'el-input',
              label: '专案号',
              props: {
                disabled: true,
                placeholder: '专案号',
              },
            },
            {
              prop: 'materialName',
              minWidth: '160px',
              type: 'common',
              is: 'el-input',
              props: {
                disabled: true,
                placeholder: '选择物料编码自动生成',
              },
              label: '物料名称',
            },
            {
              label: '工序工作',
              prop: 'workId',
              minWidth: '120px',
              type: 'dict',
              dictKey: 'WorkCenterList',
              withGroup: false,
              labelKey: 'workName',
              valueKey: 'fId',
              required: true,
              randerText(scope) {
                const { row } = scope;
                const isProWorkList = Array.isArray(row.proWorkList) && row.proWorkList[0];
                return isProWorkList ? row.proWorkList[0]?.workCenterName : '-';
              },
            },
            {
              label: '工序作业',
              prop: 'activityId',
              minWidth: '160px',
              type: 'remote-select',
              // fixed: 'left',
              required: true,
              randerText(scope) {
                const { row } = scope;
                const isProWorkList = Array.isArray(row.proWorkList) && row.proWorkList[0];
                return isProWorkList ? row.proWorkList[0]?.processName : '-';
              },
              props: {
                labelKey: 'activityName',
                valueKey: 'fId',
                queryKey: 'activityCenterName',
                action: Api.system.pro.getActivityCenterList,
                initQueryKey: 'fId',
                dataCallback() {
                  return res => {
                    return res.data.data.records;
                  };
                },
                params(data) {
                  return {
                    orgId: data.prdOrgId,
                    size: 999,
                    current: 1,
                  };
                },
              },
            },
            // {
            //   label: '工序作业',
            //   prop: 'activityId',
            //   minWidth: '120px',
            //   type: 'dict',
            //   dictKey: 'ActivityCenterList',
            //   withGroup: false,
            //   labelKey: 'activityName',
            //   valueKey: 'fId',
            //   required: true,
            //   randerText(scope) {
            //     const { row } = scope;
            //     const isProWorkList = Array.isArray(row.proWorkList) && row.proWorkList[0];
            //     return isProWorkList ? row.proWorkList[0]?.processName : '-';
            //   },
            // },
            {
              label: '表面处理',
              prop: 'assistant',
              minWidth: '130px',
              type: 'input',
            },
            {
              label: '数量',
              prop: 'qty',
              minWidth: '130px',
              type: 'number',
              required: true,
              props: {
                style: {
                  width: '100px',
                },
                'controls-position': 'right',
                precision: 0,
              },
            },
            {
              label: '单价',
              prop: 'price',
              minWidth: '130px',
              type: 'number',
              required: true,
              props: {
                style: {
                  width: '100px',
                },
                'controls-position': 'right',
                precision: 2,
              },
            },
            {
              label: '总价',
              prop: 'totalAmount',
              minWidth: '130px',
              type: 'number',
              required: true,
              props: {
                style: {
                  width: '100px',
                },
                'controls-position': 'right',
              },
            },
            {
              label: '重量',
              prop: 'weight',
              minWidth: '130px',
              type: 'input',
              // required: true,
              props: {
                style: {
                  width: '100px',
                },
                'controls-position': 'right',
              },
            },
            {
              label: '重量单位',
              prop: 'weightUnit',
              minWidth: '100px',
              type: 'input',
              type: 'dict',
              dictKey: 'WeightUnitEnum',
              withGroup: false,
              labelKey: 'label',
              valueKey: 'value',
              required: true,
              randerText(scope) {
                const { row } = scope;
                return row.weightUnit || '-';
              },
              props: {},
            },
            {
              label: '领料人',
              prop: 'pickerId',
              minWidth: '180px',
              type: 'dc-select-user',
              required: true,
              props: {
                returnType: 'string',
                // isDisabled(scope) {
                //   const {row} = scope;
                //   return !!row?.erpStatus
                // },
              },
              randerText(scope) {
                const { row } = scope;
                return row?.pickerName || '-';
              },
            },

            // {
            //   label: '工序工作',
            //   prop: 'workId',
            //   minWidth: '160px',
            //   type: 'dict',
            //   fixed: 'left',
            //   required: true,
            //   randerText(scope) {
            //     const { row } = scope;
            //     const isProWorkList = Array.isArray(row.proWorkList) && row.proWorkList[0];
            //     return isProWorkList ? row.proWorkList[0]?.workCenterName : '-';
            //   },
            //   props: {
            //     labelKey: 'workName',
            //     valueKey: 'fId',
            //     queryKey: 'workCenterName',
            //     action: Api.system.pro.getWorkCenterList,
            //     dataCallback() {
            //       return res => {
            //         return res.data.data.records;
            //       };
            //     },
            //     params(data) {
            //       return {
            //         orgId: data.prdOrgId,
            //         size: 999,
            //         current: 1,
            //       };
            //     },
            //   },
            // },
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
            prop: 'prdOrgId',
            type: 'dc-select',
            label: '生产组织',
            required: true,
            props: {
              objectName: 'org',
              placeholder: '生产组织',
              disabled: true,
            },
          },
          {
            prop: 'supplierId',
            label: '供应商',
            type: 'remote-select',
            required: true,
            props: {
              labelKey: 'supplierName',
              valueKey: 'supplierId',
              queryKey: 'supplierName',
              initQueryKey: 'supplierId',
              action: Api.system.pro.getSupplierList,
              dataCallback() {
                return res => {
                  return res.data.data.records;
                };
              },
              params(data) {
                return {
                  supplierName: data?.supplierName || '',
                  orgId: data.prdOrgId,
                };
              },
            },
          },
        ],
      },
      {
        name: '明细信息',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'proMaterialList',
        items: [
          {
            type: 'selection',
            fixed: 'left',
            width: '55',
            selectable(row) {
              return !row?.erpStatus;
            },
          },
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
            prop: 'mtoNo',
            minWidth: '120px',
            type: 'common',
            is: 'el-input',
            label: '专案号',
            props: {
              disabled: true,
              placeholder: '专案号',
            },
          },
          {
            prop: 'materialName',
            minWidth: '160px',
            type: 'common',
            is: 'el-input',
            props: {
              disabled: true,
              placeholder: '选择物料编码自动生成',
            },
            label: '物料名称',
          },
          {
            label: '错误信息',
            prop: 'erpMessage',
            minWidth: '160px',
            type: 'input',
            props: {
              disabled: true,
              placeholder: '系统生成',
            },
          },
          {
            label: '外发状态',
            prop: 'erpStatus',
            minWidth: '120px',
            type: 'dict',
            dictKey: 'StatusMaps',
            withGroup: false,
            labelKey: 'label',
            valueKey: 'value',
            randerText(scope) {
              const { row } = scope;
              const statusMaps = {
                0: '未外发',
                1: '已外发',
              };
              return statusMaps[row.erpStatus] || '-';
            },
            props: {
              placeholder: '系统生成',
              disabled: true,
            },
          },
          {
            label: '工序工作',
            prop: 'workId',
            minWidth: '120px',
            type: 'dict',
            dictKey: 'WorkCenterList',
            withGroup: false,
            labelKey: 'workName',
            valueKey: 'fId',
            required: true,
            randerText(scope) {
              const { row } = scope;
              const isProWorkList = Array.isArray(row.proWorkList) && row.proWorkList[0];
              return isProWorkList ? row.proWorkList[0]?.workCenterName : '-';
            },
          },
          {
            label: '工序作业',
            prop: 'activityId',
            minWidth: '160px',
            type: 'remote-select',
            // fixed: 'left',
            required: true,
            randerText(scope) {
              const { row } = scope;
              const isProWorkList = Array.isArray(row.proWorkList) && row.proWorkList[0];
              return isProWorkList ? row.proWorkList[0]?.processName : '-';
            },
            props: {
              labelKey: 'activityName',
              valueKey: 'fId',
              queryKey: 'activityCenterName',
              action: Api.system.pro.getActivityCenterList,
              initQueryKey: 'fId',
              dataCallback() {
                return res => {
                  return res.data.data.records;
                };
              },
              params(data) {
                return {
                  orgId: data.prdOrgId,
                  size: 999,
                  current: 1,
                };
              },
            },
          },
          {
            label: '表面处理',
            prop: 'assistant',
            minWidth: '130px',
            type: 'input',
          },
          {
            label: '数量',
            prop: 'qty',
            minWidth: '130px',
            type: 'number',
            required: true,
            props: {
              style: {
                width: '100px',
              },
              'controls-position': 'right',
              precision: 0,
            },
          },
          {
            label: '单价',
            prop: 'price',
            minWidth: '130px',
            type: 'number',
            required: true,
            props: {
              style: {
                width: '100px',
              },
              'controls-position': 'right',
              precision: 2,
            },
          },
          {
            label: '总价',
            prop: 'totalAmount',
            minWidth: '130px',
            type: 'number',
            required: true,
            props: {
              style: {
                width: '100px',
              },
              'controls-position': 'right',
            },
          },
          {
            label: '重量',
            prop: 'weight',
            minWidth: '130px',
            type: 'number',
            // required: true,
            props: {
              style: {
                width: '100px',
              },
              'controls-position': 'right',
            },
          },
          {
            label: '重量单位',
            prop: 'weightUnit',
            minWidth: '100px',
            type: 'input',
            type: 'dict',
            dictKey: 'WeightUnitEnum',
            withGroup: false,
            labelKey: 'label',
            valueKey: 'value',
            required: true,
            randerText(scope) {
              const { row } = scope;
              return row.weightUnit || '-';
            },
          },
          {
            label: '领料人',
            prop: 'pickerId',
            minWidth: '180px',
            type: 'dc-select-user',
            required: true,
            props: {
              returnType: 'string',
            },
            randerText(scope) {
              const { row } = scope;
              return row?.pickerName || '-';
            },
          },

          // {
          //   label: '工序工作',
          //   prop: 'workId',
          //   minWidth: '160px',
          //   type: 'dict',
          //   fixed: 'left',
          //   required: true,
          //   randerText(scope) {
          //     const { row } = scope;
          //     const isProWorkList = Array.isArray(row.proWorkList) && row.proWorkList[0];
          //     return isProWorkList ? row.proWorkList[0]?.workCenterName : '-';
          //   },
          //   props: {
          //     labelKey: 'workName',
          //     valueKey: 'fId',
          //     queryKey: 'workCenterName',
          //     action: Api.system.pro.getWorkCenterList,
          //     dataCallback() {
          //       return res => {
          //         return res.data.data.records;
          //       };
          //     },
          //     params(data) {
          //       return {
          //         orgId: data.prdOrgId,
          //         size: 999,
          //         current: 1,
          //       };
          //     },
          //   },
          // },
        ],
      },
    ],
  };
};

export default options;

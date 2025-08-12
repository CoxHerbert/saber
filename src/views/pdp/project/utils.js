import Const from '@/const';
export default {
  enableEditColums: ['assessment', 'fileId'],
  steps: [
    {
      label: '基本信息',
      value: 'basic',
      labelWidth: '100px',
      disabledEditMode: true,
      disabledEditWhileList: false, // 禁用字段 true 白名单模式， false 为黑名单模式
      enabledEditFields: ['assessment', 'fileId'],
      formItems: [
        {
          label: '可行性报告',
          prop: 'demandName',
          type: 'wf-select-single',
          props: {
            objectName: 'dcFea',
            query: {
              itSADraft: true,
            },
          },
        },
        {
          label: '项目编码',
          prop: 'projectCode',
          type: 'el-input',
          props: {
            disabled: true,
            placeholder: '系统自动生成',
          },
        },
        {
          label: '项目名称',
          prop: 'projectName',
          type: 'el-input',
          required: true,
          props: {
            placeholder: '请输入项目名称',
          },
        },
        {
          label: '行业类别',
          prop: 'industryDictId',
          type: 'el-select',
          dictKey: 'DC_CRM_SECTOR',
          required: true,
          labelKey: 'dictValue',
          valueKey: 'id',
          props: {
            placeholder: '请选择行业类别',
          },
        },
        {
          label: '商机名称',
          prop: 'opportunitiyId',
          type: 'dc-select-dialog',
          props: {
            objectName: 'opps',
            type: 'input',
            placeholder: '请选择商机名称',
            multiple: false,
            disabled: false,
          },
        },
        {
          label: '商机编码',
          prop: 'opportunitiyCode',
          type: 'el-input',
          props: {
            disabled: true,
            placeholder: '系统自动生成',
          },
        },
        {
          label: '客户',
          prop: 'customerId',
          type: 'dc-select-dialog',
          required: true,
          props: {
            objectName: 'customer',
            type: 'input',
            placeholder: '请选择客户',
            multiple: false,
            disabled: false,
          },
        },
        {
          label: '终端客户项目代码',
          prop: 'customerCode',
          type: 'el-select-remote-search',
          dictKey: 'chekListOptions',
          labelKey: 'label',
          valueKey: 'value',
          remoteSearch: 'remoteSearch',
          loading: 'loadingRemote',
          props: {
            filterable: true,
            remote: true,
            'allow-create': true,
            multiple: true,
            placeholder: '输入关键词搜索或新增选项',
          },
        },
        {
          label: '设备种类',
          prop: 'quipmentDictId',
          type: 'el-select',
          required: true,
          dictKey: 'DC_PMS_PROJECT_QIOPMENT',
          labelKey: 'dictValue',
          valueKey: 'id',
          props: {
            multiple: true,
            placeholder: '请选择设备种类',
          },
        },
        {
          label: '项目类型',
          prop: 'projectDictId',
          type: 'el-select',
          dictKey: 'DC_PMS_PROJECT_TYPE',
          labelKey: 'dictValue',
          valueKey: 'id',
          required: true,
          props: {
            placeholder: '请选择项目类型',
          },
        },
        {
          label: '订单类型',
          prop: 'orderTypeDictId',
          type: 'el-select',
          dictKey: 'DC_PMS_PROJECT_ORDER',
          labelKey: 'dictValue',
          valueKey: 'id',
          required: true,
          props: {
            placeholder: '请选择订单类型',
          },
        },
        {
          label: '项目阶段',
          prop: 'phaseDictId',
          type: 'el-cascader',
          dictKey: 'DC_PMS_PROJECT_PHASE',
          required: true,
          required: true,
          props: {
            placeholder: '请选择项目阶段',
            props: {
              checkStrictly: true,
              value: 'dictKey',
              label: 'dictValue',
              emitPath: false,
            },
            placeholder: '请选择项目阶段',
            clearable: true,
          },
        },
        {
          label: '所属组织',
          prop: 'orgId',
          type: 'dc-select',
          required: true,
          props: {
            objectName: 'org',
            placeholder: '请选择',
            clearable: true,
          },
        },
        {
          label: '备注',
          prop: 'assessment',
          type: 'el-input',
          class: 'w-100',
          props: {
            type: 'textarea',
            rows: 2,
            placeholder: '请输入备注',
          },
        },
        {
          label: '相关附件',
          prop: 'fileId',
          type: 'dc-upload',
          class: 'w-100',
          props: {
            limig: 10,
            targetType: Const.targetType.CUSTOMER,
          },
        },
      ],
    },
    {
      label: '项目成员',
      value: 'dri',
      labelWidth: '100px',
      disabledEditMode: true,
      disabledEditWhileList: true, // 禁用字段 true 白名单模式， false 为黑名单模式
      enabledEditFields: ['funcFieldTemplateId'],
      formItems: [
        {
          label: '',
          type: 'dc-member',
        },
        // {
        //   label: '配置模板',
        //   prop: 'funcFieldTemplateId',
        //   type: 'dc-select-dialog-v2',
        //   required: true,
        //   props: {
        //     objectName: 'projectSettingTemplate',
        //     returnType: 'object',
        //     multiple: false,
        //     multipleLimit: 1,
        //     type: 'input',
        //     placeholder: '请选择配置模板',
        //   },
        // },
        // {
        //   label: '',
        //   type: 'dynamicsItems',
        //   prop: 'dcPdpFuncFields',
        // },
      ],
    },
    // {
    //   label: '项目部门DRI',
    //   value: 'dri',
    //   labelWidth: '80px',
    //   formItems: [
    //     {
    //       label: '机构DRI',
    //       prop: 'institutionsDriId',
    //       required: true,
    //       type: 'dc-select-user',
    //       props: {
    //         placeholder: '请选择机构DRI',
    //         multiple: false,
    //         'multiple-limit': 1,
    //       },
    //     },
    //     {
    //       label: '电气DRI',
    //       prop: 'electricalDriId',
    //       type: 'dc-select-user',
    //       props: {
    //         placeholder: '请选择电气DRI',
    //         multiple: false,
    //         'multiple-limit': 1,
    //       },
    //     },
    //     {
    //       label: '软件DRI',
    //       prop: 'softwareDriId',
    //       type: 'dc-select-user',
    //       props: {
    //         placeholder: '请选择软件DRI',
    //         multiple: false,
    //         'multiple-limit': 1,
    //       },
    //     },
    //     {
    //       label: 'BDDRI',
    //       prop: 'bdDriId',
    //       required: true,
    //       type: 'dc-select-user',
    //       props: {
    //         placeholder: '请选择BDDRI',
    //         multiple: false,
    //         'multiple-limit': 1,
    //       },
    //     },
    //     {
    //       label: 'TPMDRI',
    //       prop: 'tpmDriId',
    //       type: 'dc-select-user',
    //       required: true,
    //       props: {
    //         placeholder: '请选择TPMDRI',
    //         multiple: false,
    //         'multiple-limit': 1,
    //       },
    //     },
    //     {
    //       label: 'PMDRI',
    //       prop: 'pmDriId',
    //       type: 'dc-select-user',
    //       props: {
    //         placeholder: '请选择PMDRI',
    //         multiple: false,
    //         'multiple-limit': 1,
    //       },
    //     },
    //     {
    //       label: '视觉DRI',
    //       prop: 'versionDriId',
    //       type: 'dc-select-user',
    //       props: {
    //         placeholder: '请选择视觉DRI',
    //         multiple: false,
    //         'multiple-limit': 1,
    //       },
    //     },
    //   ],
    // },
    {
      label: '工艺&产品',
      value: 'crafts&product',
      labelWidth: '80px',
      formItems: [
        {
          label: '设备工艺',
          prop: 'technologyDictId',
          type: 'el-select',
          labelKey: 'dictValue',
          valueKey: 'id',
          dictKey: 'DC_PMS_PROJECT_TECHNOLOGY',
          props: {
            multiple: true,
            placeholder: '请选择设备工艺',
          },
        },
        {
          label: '其他工艺',
          prop: 'criticalTechnology',
          type: 'el-input',
          props: {
            placeholder: '请输入其他工艺',
          },
        },
        {
          label: '产能',
          prop: 'capacity',
          type: 'el-input',
          props: {
            placeholder: '请输入产能',
          },
        },
        {
          label: '客户产品',
          prop: 'customerProducts',
          type: 'el-input',
          props: {
            placeholder: '请输入客户产品',
          },
        },
        {
          label: '产品系列',
          prop: 'productRange',
          type: 'el-input',
          props: {
            placeholder: '请输入产品系列',
          },
        },
      ],
    },
  ],
};

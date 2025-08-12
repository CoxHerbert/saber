import Const from '@/const';
import dayjs from 'dayjs';

const TaskColumns = [
  {
    label: '父级计划',
    prop: 'parentId',
    type: 'el-cascader',
    dictKey: 'parentList',
    class: 'w50',
    props: {
      props: {
        multiple: false,
        checkStrictly: true,
      },
      clearable: true,
      placeholder: '请选择父级计划',
    },
  },
  {
    label: '计划类型',
    required: true,
    isTableColumn: true,
    prop: 'businessCategoryId',
    type: 'el-radio-group',
    class: 'w50',
    tableColumnProps: {
      minWidth: '80px',
    },
    props: {
      size: 'small',
      class: 'business-category plan-type-radio-group',
      style: 'transform: translateY(-3px)',
    },
    dictKey: 'DC_PMS_TEMPITEM_TYPE',
    tableType: 'dc-dict',
  },
  {
    label: '状态',
    prop: 'planStatusId',
    tableType: 'dc-dict',
    dictKey: 'DC_PMS_PLAN_STATUS',
    isTableColumn: true,
    onlyTable: true,
  },
  {
    label: '计划名称',
    prop: 'planName',
    class: 'w50',
    required: true,
    isTableColumn: true,
    type: 'el-input',
    tableColumnProps: {
      minWidth: '200px',
    },
    props: {
      placeholder: '请输入计划名称',
    },
  },
  {
    label: '处理人',
    required: true,
    prop: 'handlePersonId',
    class: 'w50',
    isTableColumn: true,
    isChargeDialog: true,
    type: 'dc-select-user',
    tableType: 'dc-view',
    tableColumnProps: {
      minWidth: '80px',
    },
    tableControlProps: {
      objectName: 'user',
    },
    props: {
      placeholder: '请选择处理人',
      multiple: false,
      multipleLimit: 1,
    },
  },
  {
    label: '计划开始时间',
    prop: 'startDate',
    tableColumnProps: {
      minWidth: '100px',
    },
    isTableColumn: true,
    required(formData) {
      return true; // formData.businessCategoryId !== '1917109206417195010';
    },
    class: 'w50',
    type: 'el-date-picker',
    isChargeDialog: true,
    props: {
      type: 'date',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请输入计划开始时间',
    },
  },
  {
    label: '计划结束时间',
    prop: 'endDate',
    tableColumnProps: {
      minWidth: '100px',
    },
    isTableColumn: true,
    isChargeDialog: true,
    required(formData) {
      return true;
      //   return formData.businessCategoryId !== '1917109206417195010';
    },
    getRules(formData) {
      return [
        {
          required: true,
          validator(rule, value, callback) {
            if ([null, undefined, ''].includes(value)) {
              callback(new Error('计划结束时间不能为空'));
            } else if (
              formData.startDate &&
              dayjs(formData.startDate).valueOf() > dayjs(formData.endDate).valueOf()
            ) {
              callback(new Error('计划开始时间必须小于等于计划结束时间'));
            } else {
              callback();
            }
          },
          trigger: ['blur', 'change'],
        },
      ];
    },
    class: 'w50',
    type: 'el-date-picker',
    props: {
      type: 'date',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请输入计划开始时间',
    },
  },
  {
    label: '阶段类型',
    isTableColumn: true,
    prop: 'phaseType',
    type: 'el-select',
    class: 'w50',
    tableColumnProps: {
      minWidth: '80px',
    },
    props: {
      clearable: true,
      class: 'business-category plan-type-radio-group',
      style: 'transform: translateY(-3px)',
    },
    dictKey: 'DC_PDP_PHASE_TYPE',
    tableType: 'dc-dict',
    labelKey: 'dictValue',
    valueKey: 'dictKey',
    showFunc(formData) {
      return (
        !!formData.businessCategoryId &&
        ['1917109206417195010'].includes(formData.businessCategoryId)
      );
    },
  },
  {
    label: '业务名称',
    type: 'el-select',
    required: true,
    prop: 'businessType',
    dictKey: 'processCorrelationOptions',
    labelKey: 'businessTypeName',
    valueKey: 'id',
    class: 'w50',
    showFunc(formData) {
      return (
        !!formData.businessCategoryId &&
        !['1862011232290770945', '1917109206417195010'].includes(formData.businessCategoryId)
      );
    },
    props: {
      placeholder: '请选择业务名称',
    },
  },
  {
    label: '流程',
    prop: 'processId',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1859779087373963266';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '业务功能名称',
    prop: 'funcName',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1862011185801105410';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '业务功能类型',
    prop: 'funcType',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1862011185801105410';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '系统功能地址',
    prop: 'funcUrl',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1862011185801105410';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '系统代码方法',
    prop: 'systemCodeMethod',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1867000908414631938';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '系统代码名称',
    prop: 'systemCodeName',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1867000908414631938';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '系统代码地址',
    prop: 'systemCodePath',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1867000908414631938';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '系统代码类型',
    prop: 'systemCodeType',
    type: 'el-input',
    class: 'w50',
    showFunc(formData) {
      return formData.businessCategoryId === '1867000908414631938';
    },
    props: {
      disabled: true,
      placeholder: '选择业务名称自动填入',
    },
  },
  {
    label: '文件夹',
    type: 'el-select',
    prop: 'docFolder',
    labelKey: 'label',
    valueKey: 'value',
    class: 'w50',
    required: true,
    showFunc(formData) {
      return formData.businessCategoryId === '1859779038095085570';
    },
    dictKey: 'DC_FOLDER_TYPE',
    props: {
      placeholder: '根据业务自动填入',
      disabled: true,
    },
  },
  {
    label: '文件类型',
    type: 'el-select',
    prop: 'docTypeId',
    class: 'w50',
    required: true,
    labelKey: 'label',
    valueKey: 'value',
    showFunc(formData) {
      return formData.businessCategoryId === '1859779038095085570';
    },
    dictKey: 'DC_PMS_DOCUMENT_TYPE',
    props: {
      placeholder: '根据业务自动填入',
      disabled: true,
    },
  },
  {
    label: '文件模板',
    type: 'dc-upload',
    prop: 'docTemplate',
    class: 'w100',
    showFunc(formData) {
      return formData.businessCategoryId === '1859779038095085570';
    },
    dictKey: 'DC_PMS_DOCUMENT_TYPE',
    props: {
      targetType: Const.targetType.SYSTEM,
      isUpload: true,
      isRemove: true,
    },
  },
  {
    label: '附件上传',
    prop: 'attachment',
    class: 'w100',
    type: 'dc-upload',
    props: {
      targetType: Const.targetType.P_PROJECT,
    },
  },
  {
    label: '任务说明',
    type: 'el-input',
    class: 'w100',
    isTableColumn: true,
    props: {
      type: 'textarea',
      rows: 2,
      placeholder: '请输入任务说明',
    },
  },
];

export default {
  add: {
    columns: TaskColumns.filter(col => !col.onlyTable),
  },
  charge: {
    columns: TaskColumns.filter(col => col.isChargeDialog),
  },
  edit: [
    {
      label: '计划详情',
      key: 'detailInfo',
      renderType: 'form',
      columns: TaskColumns.filter(col => !col.onlyTable),
    },
    {
      label: '子计划',
      key: 'children',
      renderType: 'table',
      columns: TaskColumns.filter(col => col.isTableColumn),
    },
    // {
    //   label: '详细信息',
    //   key: 'detailInfo',
    //   groups: [
    //     {
    //       label: '任务信息',
    //       columns: TaskColumns,
    //     },
    //     {
    //       label: '执行信息',
    //       columns: [],
    //     },
    //   ],
    // },
    // {
    //   label: '子计划',
    //   withNumber: true,
    //   getNumber(formData) {
    //     return formData?.children?.length;
    //   },
    //   key: 'childrenInfo',
    // },
  ],
};

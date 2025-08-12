import Api from '@/api/index';
export default {
  columns: [
    {
      name: '基本信息',
      classList: 'form-basic-group',
      renderType: 'form',
      items: [
        { prop: 'taskNumber', type: 'input', label: '任务单编号' },
        // { prop: 'billNo', type: 'input', label: '单据编号' },
        {
          prop: 'billType',
          label: '单据类型',
          type: 'dict',
          dictKey: 'DC_BILL_TYPE',
          label: '单据类型',
          required: true,
          withGroup: true,
          labelKey: 'dictValue',
          valueKey: 'dictValue',
        },
        {
          prop: 'dcErpOrderStatus',
          label: '单据状态',
          type: 'dict',
          dictKey: 'DC_ERP_ORDER_STATUS',
          required: true,
          withGroup: false,
          labelKey: 'label',
          valueKey: 'value',
          props: {
            disabled: true,
          },
        },
        {
          prop: 'bdName',
          type: 'select-user',
          required: true,
          label: 'BD负责人',
        },
        { prop: 'customerProductName', type: 'input', label: '客户产品' },
        { prop: 'endCustomerName', type: 'input', label: '终端客户' },
        {
          prop: 'auditUserId',
          type: 'dc-select-user',
          label: '审核人',
          showFunc(detailData) {
            return ['1876789881673412609', '1876789924404981761'].includes(
              detailData?.dcErpOrderStatus
            );
          },
          props: {
            placeholder: '请选择',
            multiple: false,
            'multiple-limit': '1',
          },
        },
        {
          prop: 'auditTime',
          type: 'date',
          label: '审核日期',
          showFunc(detailData) {
            return ['1876789881673412609', '1876789924404981761'].includes(
              detailData?.dcErpOrderStatus
            );
          },
          props: {
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            format: 'yyyy-MM-dd HH:mm:ss',
            disabled: true,
          },
        },
        {
          prop: 'rejectReason',
          type: 'input',
          label: '驳回原因',
          showFunc(detailData) {
            return (
              detailData.rejectReason &&
              ['1876789881673412609', '1876789924404981761'].includes(detailData?.dcErpOrderStatus)
            );
          },
          props: {
            disabled: true,
          },
        },
        {
          prop: 'createUserId',
          type: 'dc-select-user',
          label: '创建人',
          props: {
            placeholder: '请选择',
            multiple: false,
            'multiple-limit': '1',
            disabled: true,
          },
        },
        {
          prop: 'createTime',
          type: 'date',
          label: '创建日期',
          props: {
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            disabled: true,
          },
        },
      ],
    },
    {
      name: '明细信息',
      classList: 'form-detail-group',
      renderType: 'table',
      prop: 'dcErpOrderNeList',
      items: [
        {
          type: 'selection',
          fixed: 'left',
          width: '55',
          showFunc(detailData) {
            return detailData?.dcErpOrderStatus === '1876789881673412609';
          },
        },
        {
          prop: 'operationName',
          minWidth: '120px',
          type: 'select-user',
          required: true,
          label: '运营跟单',
        },
        {
          prop: 'materialNumber',
          minWidth: '120px',
          label: '物料编码',
          minWidth: '160px',
          type: 'remote-select',
          props: {
            queryKey: 'number',
            labelKey: 'fnumber',
            valueKey: 'fnumber',
            action: Api.pdp.execution.materials,
          },
          required: true,
        },
        {
          prop: 'materialName',
          minWidth: '220px',
          type: 'common',
          is: 'el-input',
          props: {
            disabled: true,
          },
          label: '物料名称',
        },
        {
          prop: 'number',
          minWidth: '80px',
          type: 'common',
          is: 'el-input',
          label: '数量',
        },
        {
          prop: 'version',
          minWidth: '80px',
          type: 'common',
          is: 'el-input',
          label: '版本号',
        },
        {
          prop: 'inventoryCategoryName',
          label: '存货类别',
          minWidth: '160px',
          type: 'common',
          required: true,
          is: 'el-input',
          props: {
            disabled: true,
            placeholder: '选择物料编码自动生成',
          },
        },
        {
          prop: 'billNumber',
          fixed: 'left',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          showFunc(detailData) {
            return ['1876789881673412609', '1876789924404981761'].includes(
              detailData?.dcErpOrderStatus
            );
          },
          label: '专案号',
          props: {
            disabled: true,
            placeholder: '系统生成',
          },
        },
        {
          prop: 'projectNumber',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          required: true,
          label: '项目编号',
        },
        {
          prop: 'orderTypeName',
          minWidth: '100px',
          type: 'dict',
          dictKey: 'DC_PMS_PROJECT_ORDER',
          labelKey: 'dictValue',
          valueKey: 'dictValue',
          required: true,
          label: '订单类型',
        },
        {
          prop: 'tpmName',
          minWidth: '100px',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.tpm,
          },
          label: 'tpm',
          required: true,
        },
        {
          prop: 'insidePmName',
          minWidth: '120px',
          type: 'select-user',
          label: '内部PM',
        },
        {
          prop: 'institutionsName',
          minWidth: '120px',
          type: 'select-user',
          label: '机构工程',
        },
        {
          prop: 'electronName',
          minWidth: '120px',
          type: 'select-user',
          label: '电子工程',
        },
        {
          prop: 'softwareName',
          minWidth: '120px',
          type: 'select-user',
          label: '软件工程',
        },
        {
          prop: 'electricalName',
          minWidth: '120px',
          type: 'select-user',
          label: '电气工程',
        },
        {
          prop: 'phaseName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '阶段',
        },
        {
          prop: 'deviceAttributeName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '设备属性',
        },
        {
          prop: 'projectTypeName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '项目类型',
        },
        {
          prop: 'projectName',
          minWidth: '220px',
          type: 'common',
          is: 'el-input',
          label: '项目名称',
        },
        { prop: 'customerName', minWidth: '220px', type: 'common', is: 'el-input', label: '客户' },
        {
          prop: 'customerProductName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '客户产品',
        },
        {
          prop: 'productSeriesName',
          minWidth: '120px',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.productSeriation,
          },
          label: '产品系列',
        },

        {
          prop: 'unitName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '单位',
        },
        {
          prop: 'orderDate',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '下单日期',
        },
        {
          prop: 'customerDeliveryDate',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '客户交期',
        },
        {
          prop: 'contactPersonName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '收货人',
        },
        {
          prop: 'receiveLocation',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '收货地址',
        },
        {
          prop: 'endCustomerName',
          minWidth: '220px',
          type: 'common',
          is: 'el-input',
          label: '终端客户',
        },
        {
          prop: 'freeReasonName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '免费原因',
        },
        {
          prop: 'costProjectNumber',
          minWidth: '220px',
          type: 'common',
          is: 'el-input',
          label: '成本归属专案',
        },
        {
          prop: 'responsiblePersonName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '责任人',
        },
        {
          prop: 'deviceName',
          minWidth: '120px',
          type: 'common',
          is: 'el-input',
          label: '设备名称',
        },
        { prop: 'note', minWidth: '220px', type: 'common', is: 'el-input', label: '备注' },
      ],
    },
  ],
};

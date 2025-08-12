import Api from '@/api/index';
export default {
  columns: [
    {
      name: '基本信息',
      classList: 'form-basic-group',
      renderType: 'form',
      prop: 'basic',
      showToggleExpand: true,
      items: [
        {
          prop: 'taskNumber',
          type: 'input',
          label: '任务单编号',
          props: {
            placeholder: '系统自动生成',
            disabled: true,
          },
        },
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
          // type: 'select-user',
          required: true,
          label: 'BD负责人',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.salers,
          },
        },
        {
          prop: 'customerProductName',
          type: 'dict',
          label: '客户产品',
          dictKey: '客户产品',
          labelKey: 'bizValue',
          valueKey: 'bizValue',
          required: true,
        },
        {
          prop: 'endCustomerName',
          label: '终端客户',
          type: 'remote-select',
          required: true,
          props: {
            action: Api.pdp.execution.endCustomers,
            labelKey: 'customerFName',
            valueKey: 'customerFName',
          },
        },
        {
          prop: 'attachmentId',
          label: '附件',
          type: 'dc-upload',
          props: {
            limit: '10',
            fileType: [, 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
            targetType: 'ERP_ORDER',
          },
        },
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
            disabled: true,
            placeholder: '请选择',
            multiple: false,
            'multiple-limit': 1,
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
          prop: 'causeOfRejection',
          type: 'input',
          label: '驳回原因',
          showFunc(detailData) {
            return (
              detailData.causeOfRejection &&
              ['1876789881673412609', '1876789924404981761', '1876789752111362049'].includes(
                detailData?.dcErpOrderStatus
              )
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
            'multiple-limit': 1,
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
            return ['1876789752111362049', '1876789881673412609'].includes(
              detailData?.dcErpOrderStatus
            );
          },
        },
        {
          type: 'dataIndex',
          label: '序号',
          prop: 'dataIndex',
          fixed: 'left',
          width: '80',
        },
        {
          prop: 'billNumber',
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
          prop: 'operationName',
          minWidth: '160px',
          type: 'select-user',
          fixed: 'left',
          required: true,
          label: '运营跟单',
        },
        {
          prop: 'materialNumber',
          minWidth: '120px',
          label: '物料编码',
          minWidth: '200px',
          fixed: 'left',
          type: 'remote-select',

          props: {
            renderLabel(op, labelKey) {
              return `${op[labelKey]}(${op.fname})`;
            },
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
            placeholder: '选择物料编码自动生成',
            disabled: true,
          },
          label: '物料名称',
        },
        {
          prop: 'version',
          minWidth: '220px',
          type: 'common',
          is: 'el-input',
          required: true,
          props: {
            placeholder: '请输入版本',
          },
          label: '版本号',
        },
        {
          prop: 'number',
          minWidth: '180px',
          type: 'common',
          is: 'el-input-number',
          props: {
            min: 0,
            controls: false,
            precision: 2,
            placeholder: '请输入数量',
          },
          label: '数量',
          required: true,
        },
        {
          prop: 'inventoryCategoryName',
          label: '存货类别',
          minWidth: '200px',
          type: 'common',
          required: true,
          is: 'el-input',
          props: {
            disabled: true,
            placeholder: '选择物料编码自动生成',
          },
        },
        {
          prop: 'projectNumber',
          minWidth: '220px',
          // type: 'common',
          // is: 'el-input',
          required: true,
          label: '项目编号',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.projectNumbers,
          },
        },
        {
          prop: 'orderTypeName',
          minWidth: '170px',
          type: 'dict',
          dictKey: 'DC_PMS_PROJECT_ORDER',
          labelKey: 'dictValue',
          valueKey: 'dictValue',
          required: true,
          label: '订单类型',
        },
        {
          prop: 'tpmName',
          minWidth: '170px',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.tpm,
          },
          label: 'tpm',
          required: true,
        },
        // {
        //   prop: 'bdName',
        //   minWidth: '120px',
        //   type: 'select-user',
        //   label: 'bd(业务)',
        //   required: true,
        // },
        {
          prop: 'insidePmName',
          minWidth: '120px',
          type: 'select-user',
          label: '内部PM',
          required: true,
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
          minWidth: '200px',
          label: '阶段',
          type: 'dict',
          dictKey: '阶段',
          labelKey: 'bizValue',
          valueKey: 'bizValue',
          required: true,
        },
        {
          prop: 'deviceAttributeName',
          minWidth: '200px',
          // type: 'common',
          // is: 'el-input',
          label: '设备属性',
          type: 'dict',
          dictKey: '设备属性',
          labelKey: 'bizValue',
          valueKey: 'bizValue',
          required: true,
        },
        {
          prop: 'projectTypeName',
          minWidth: '200px',
          type: 'dict',
          label: '项目类型',
          dictKey: '项目类型',
          labelKey: 'bizValue',
          valueKey: 'bizValue',
          required: true,
        },
        {
          prop: 'projectName',
          minWidth: '220px',
          // type: 'common',
          // is: 'el-input',
          label: '项目名称',
          type: 'remote-select',
          required: true,
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.projectNames,
          },
        },
        {
          prop: 'customerName',
          label: '客户',
          required: true,
          minWidth: '220px',
          type: 'remote-select',
          fixed: 'left',
          props: {
            action: Api.pdp.execution.customers,
            labelKey: 'customerFName',
            valueKey: 'customerFName',
          },
        },
        // {
        //   prop: 'customerProductName',
        //   minWidth: '120px',
        //   type: 'common',
        //   is: 'el-input',
        //   label: '客户产品',
        // },
        {
          prop: 'productSeriesName',
          minWidth: '220px',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.productSeriation,
          },
          label: '产品系列',
          required: true,
        },

        {
          prop: 'unitName',
          minWidth: '160px',
          // type: 'common',
          // is: 'el-input',
          label: '单位',
          type: 'dict',
          dictKey: '计量单位',
          labelKey: 'bizValue',
          valueKey: 'bizValue',
        },
        {
          prop: 'orderDate',
          minWidth: '150px',
          type: 'common',
          is: 'el-date-picker',
          props: {
            format: 'YYYY-MM-DD',
            valueFormat: 'YYYY-MM-DD',
            placeholder: '请选择下单日期',
          },
          label: '下单日期',
        },
        {
          prop: 'customerDeliveryDate',
          minWidth: '150px',
          type: 'common',
          is: 'el-date-picker',
          props: {
            format: 'YYYY-MM-DD',
            valueFormat: 'YYYY-MM-DD',
            placeholder: '请选择客户交期',
          },
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
        // {
        //   prop: 'endCustomerName',
        //   minWidth: '120px',
        //   type: 'common',
        //   is: 'el-input',
        //   label: '终端客户',
        // },
        {
          prop: 'freeReasonName',
          minWidth: '200px',
          label: '免费原因',
          type: 'dict',
          dictKey: '免费原因',
          labelKey: 'bizValue',
          valueKey: 'bizValue',
        },
        {
          prop: 'costProjectNumber',
          minWidth: '220px',
          // type: 'common',
          // is: 'el-input',
          label: '成本归属专案',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.projectNumbers,
          },
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
          minWidth: '220px',
          label: '设备名称',
          type: 'remote-select',
          props: {
            labelKey: 'fname',
            valueKey: 'fname',
            action: Api.pdp.execution.equipmentName,
          },
        },
        { prop: 'note', minWidth: '120px', type: 'common', is: 'el-input', label: '备注' },
      ],
    },
  ],
};

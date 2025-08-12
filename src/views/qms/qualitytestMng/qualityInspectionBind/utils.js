import { secondToHour } from '@/utils/util';
/** 质检绑定配置 */
const options = {
  columns: [
    // {
    //   width: '55px',
    //   type: 'selection',
    // },
    {
      prop: '',
      label: '序号',
      width: '55px',
      type: 'index',
      render(scope) {
        return scope.$index + 1;
      },
    },
    {
      prop: 'billNumber',
      label: '计划单号',
      type: 'rowText',
      width: '160px',
    },
    {
      prop: 'mtono',
      label: '专案号',
      type: 'rowText',
      width: '120px',
    },
    {
      prop: 'materialCode',
      label: '物料编码',
      type: 'rowText',
      width: '160px',
    },
    {
      prop: 'materialName',
      label: '物料名称',
      type: 'rowText',
      width: '200px',
    },
    {
      prop: 'splitAmount',
      label: '数量',
      type: 'rowText',
      width: '60px',
    },
    {
      prop: 'planStartTime',
      label: '开始时间/结束时间',
      type: 'rowCustomText',
      width: '98px',
      render(scoped) {
        return `${scoped.row.planStartTime}/${scoped.row.planEndTime}`;
      },
    },
    {
      prop: 'chargePersonId',
      label: '负责人',
      width: '100px',
      objectName: 'user',
      showKey: 'realName',
      type: 'dc-view',
    },
    {
      prop: 'pqeChargePersonId',
      label: 'PQE负责人',
      width: '100px',
      objectName: 'user',
      showKey: 'realName',
      type: 'dc-view',
    },
    {
      prop: 'ipqcChargePersonId',
      label: 'IPQC负责人',
      width: '100px',
      objectName: 'user',
      showKey: 'realName',
      type: 'dc-view',
    },
    {
      prop: 'totalWorkingHours',
      label: '计划工时',
      type: 'rowCustomText',
      width: '120px',
      render(scoped) {
        return `${secondToHour(scoped.row.totalWorkingHours)}小时`;
      },
    },
    {
      prop: 'reportHours',
      label: '汇报工时',
      type: 'rowCustomText',
      width: '120px',
      render(scoped) {
        return `${secondToHour(scoped.row.reportHours)}小时`;
      },
    },
    {
      prop: 'erpReportHours',
      label: 'ERP汇报工时',
      type: 'rowCustomText',
      width: '120px',
      render(scoped) {
        return `${secondToHour(scoped.row.erpReportHours)}小时`;
      },
    },
    {
      prop: 'businessStatusName',
      label: '业务状态',
      type: 'rowText',
      width: '80px',
    },
    {
      prop: 'completionTime',
      label: '齐套时间',
      type: 'rowText',
      width: '100px',
    },
    {
      prop: 'workGroupName',
      label: '生产组别',
      type: 'rowText',
      width: '100px',
    },
    {
      prop: 'planStatusCode',
      label: '排程状态',
      type: 'dict',
      dictKey: 'DC_MES_MPS_SCHEDULE_STATUS',
      width: '90px',
    },

    {
      prop: 'options',
      width: 120,
      label: '操作',
      slot: '',
      type: 'actions',
      fixed: 'right',
      children: [
        {
          type: 'button',
          label: '指派人员',
          action: 'edit',
        },
      ],
    },
  ],
};

export default options;

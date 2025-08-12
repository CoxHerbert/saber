/** 线材执行单 */
const options = () => {
  return {
    columns: [
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'motno',
        label: '专案号',
        type: 'rowText',
        width: 100,
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入专案号',
        },
      },
      {
        prop: 'abnormalMaterial',
        label: '异常物料',
        minWidth: 120,
        search: true,
        transVal(scope) {
          try {
            const abnormalMaterial = JSON.parse(scope.row?.abnormalMaterial);
            return abnormalMaterial?.fname;
          } catch (error) {
            return '-';
          }
        },
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'milAddress',
        label: '异常地点',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'startProcessUser',
        label: '异常发起人',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'institutionId',
        label: 'PQE确认人',
        type: 'dc-view',
        width: 100,
        objectName: 'user',
      },
      {
        prop: 'abnormalMatters',
        label: '异常描述',
        type: 'rowText',
        minWidth: 120,
      },
      {
        prop: 'switchProcess',
        label: '异常类型',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'pqeType',
        label: '处理方式',
        type: 'rowText',
        minWidth: 100,
      },
      {
        prop: 'processingPersonnelId',
        label: '责任人',
        width: 80,
        search: true,
        transVal(scope) {
          try {
            const abnormalMaterial = JSON.parse(scope.row?.processingPersonnel);
            return abnormalMaterial?.realName;
          } catch (error) {
            return '-';
          }
        },
        searchProps: {
          is: 'dc-select-user',
        },
      },
      {
        prop: 'personInChargeId',
        label: '负责人',
        type: 'dc-select-user',
        minWidth: 100,
        search: true,
        searchProps: {
          is: 'dc-select-user',
          props: {
            objectName: 'user',
          },
        },
      },
      {
        prop: 'completeDate',
        label: '完成时间',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'causeAnalysis',
        label: '原因分析',
        type: 'rowText',
        minWidth: 140,
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'countermeasure',
        label: '对策',
        type: 'rowText',
        minWidth: 140,
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'replyTime',
        label: '责任人回复时间',
        type: 'rowText',
        minWidth: 140,
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'replyUserName',
        label: '责任人名称',
        type: 'rowText',
        minWidth: 140,
        search: true,
        searchProps: {
          is: 'input',
        },
      },
      {
        prop: 'closeCase',
        label: '结案信息',
        type: 'rowText',
        minWidth: 100,
        search: true,
        searchProps: {
          is: 'input',
          props: { placeholder: '是 / 否' },
        },
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
            label: '详情',
            action: 'look',
          },
        ],
      },
    ],
  };
};

export default options;

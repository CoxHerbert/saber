/** 项目预算配置 */
const options = () => {
  return {
    columns: [
      // {
      //   type: 'selection',
      //   width: '55px',
      //   align: 'center',
      // },
      {
        prop: '',
        label: '序号',
        width: '60px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'billNo',
        label: '单据编号',
        type: 'rowText',
      },
      {
        prop: 'pricingStatus',
        label: '核价状态',
        type: 'rowCustomText',
        render(scope) {
          const pricingStatusEnum = {
            0: '未核价',
            1: '已核价',
          };
          return pricingStatusEnum[scope.row.pricingStatus];
        },
      },
      {
        prop: 'documentStatus',
        label: '单据状态',
        type: 'rowText',
      },
      {
        prop: 'billName',
        label: '单据类型',
        type: 'rowText',
      },
      {
        prop: 'date',
        label: '日期',
        type: 'rowText',
      },
      {
        prop: 'operatName',
        label: '运营跟单',
        type: 'rowText',
      },
      {
        prop: 'orgName',
        label: '组织名称',
        type: 'rowText',
      },
      {
        prop: 'options',
        width: 120,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: [
          // {
          //   type: 'button',
          //   label: '查看',
          //   action: 'look',
          //   // showFunc(scope) {
          //   //   return true;
          //   // },
          // },
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
            permissionId: 'ERP_ORDER_PRICING',
            // showFunc(scope) {
            //   return true;
            // },
          },
        ],
      },
    ],
  };
};

export default options;

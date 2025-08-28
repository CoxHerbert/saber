import dayjs from 'dayjs';

const options = () => {
  return {
    columns: [
      // { type: 'selection', width: '40px', align: 'center', fixed: 'left' },
      { prop: '', label: '序号', width: '60px', align: 'center', type: 'index' },
      {
        label: '专案号',
        prop: 'mtono',
        search: true,
        type: 'input',

        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },
      // {
      //   prop: 'updateUser',
      //   label: '负责人',
      //   width: '100px',
      //   objectName: 'user',
      //   showKey: 'realName',
      //   type: 'dc-view',
      // },
      {
        label: '编码',
        prop: 'fnumber',
        search: true,
        type: 'input',

        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },
      {
        label: '名称',
        prop: 'materialName',
        search: false,
        type: 'input',

        props: {
          disabled: true,
        },
      },
      {
        label: '版本',
        prop: 'version',
        search: false,
        type: 'input',
        width: 60,
        props: {
          disabled: true,
        },
      },
      {
        label: '源单',
        prop: 'srcBillNo',
        search: false,
        type: 'input',
        props: {
          disabled: true,
        },
      },
      {
        label: '下单日期',
        prop: 'approveDate',
        search: false,
        type: 'input',
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.approveDate)) return '-';
          return dayjs(scope.row.approveDate).format('YYYY-MM-DD');
        },
      },
      {
        label: '交期',
        prop: 'arrivalDate',
        search: false,
        type: 'input',
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.arrivalDate)) return '-';
          return dayjs(scope.row.arrivalDate).format('YYYY-MM-DD');
        },
      },
      {
        label: '材料费',
        prop: 'materialFee',
        type: 'input',
        props: {
          disabled: true,
        },
      },
      {
        label: '加工费',
        prop: 'processFee',
        search: false,
        type: 'input',
        props: {
          disabled: true,
        },
      },
      {
        label: '表处费',
        prop: 'surfaceFee',
        search: false,
        type: 'input',
        props: {
          disabled: true,
        },
      },
      {
        label: '单件价格',
        prop: 'currentOutsourcePrice',
        search: false,
        type: 'input',
        props: {
          disabled: true,
        },
      },
      {
        label: '数量',
        prop: 'qty',
        search: false,
        type: 'input',
        required: true,
        props: {
          type: 'number',
          disabled: true,
        },
      },
      {
        label: '材质',
        prop: 'erpSpecificationName',
        search: true,
        type: 'input',
        searchProps: { is: 'input' },
        props: {
          disabled: true,
        },
      },

      {
        label: '状态',
        prop: 'quotationStatusId',
        search: true,
        type: 'dict',
        dictKey: 'DC_WX_VALENCE_STATUS',
        required: true,
        width: 100,
        searchProps: { is: 'dict' },
        props: {
          disabled: true,
        },
      },

      {
        prop: 'options',
        width: 120,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
        children: [
          {
            type: 'button',
            label: '去核价',
            action: 'pricingdetail',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_WHJ';
            },
          },
          {
            type: 'button',
            label: '查看详情',
            action: 'lookdetail',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_YHJ';
            },
          },

          {
            type: 'button',
            label: '查看详情',
            action: 'lookdetail',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_BHJ' ? false : '';
            },
          },
        ],
      },
    ],
  };
};
export default options;

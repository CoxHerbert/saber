/** 历史价格 */
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
        prop: 'updateTime',
        label: '推送时间',
        type: 'rowText',
      },
      {
        prop: 'fnumber',
        label: '物料编码',
        type: 'rowText',
      },
      {
        prop: 'price',
        label: '推送价格',
        type: 'rowText',
      },
    ],
  };
};

export default options;

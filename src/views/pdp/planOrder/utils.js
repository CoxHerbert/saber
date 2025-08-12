// 附加字段
export const subColumns = [
  {
    label: '统计类别',
    width: '140px',
    render(_, row) {
      return row.phase !== '/' ? `${row.type}  ${row.phase}` : row.phase;
    },
    prop: 'phase',
  },
  {
    label: '单独下PO人数',
    width: '100px',
    prop: 'PO',
  },
  {
    label: '包含机台报价内人数',
    width: '100px',
    prop: 'price',
  },
  // {
  //   label: '阶段时间',
  //   width: '200px',
  //   prop: 'startTime',
  //   render(t, row) {
  //     return t ? `${row.startTime}-${row.endTime}` : '-';
  //   },
  // },
  {
    label: '报价内人数起止时间',
    width: '200px',
    prop: 'startTime',
    render(t, row) {
      return t ? `${row.startTime}-${row.endTime}` : '-';
    },
  },
  {
    label: 'Free人数',
    width: '100px',
    prop: 'free',
  },
  {
    label: 'L1人数',
    width: '100px',
    render(num) {
      return num ? num.toString().match(/^\d+(?:\.\d{0,2})?/)[0] : num;
    },
    prop: 'L1',
  },
  {
    label: 'L2人数',
    width: '100px',
    render(num) {
      return num ? num.toString().match(/^\d+(?:\.\d{0,2})?/)[0] : num;
    },
    prop: 'L2',
  },
  {
    label: 'L3人数',
    width: '100px',
    render(num) {
      return num ? num.toString().match(/^\d+(?:\.\d{0,2})?/)[0] : num;
    },
    prop: 'L3',
  },
];

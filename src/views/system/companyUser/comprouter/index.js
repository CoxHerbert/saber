/** 入库单配置 */
const options = {
  columns: [
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
      label: '部门',
      width: 200,
      prop: 'department',
      type: 'dc-view',
      search: true,
      objectName: 'dept',
    },
    {
      label: '被考核人',
      prop: 'employeeName',
      // searchType: 'user',
      type: 'dc-view',
      search: true,
      objectName: 'user',
    },
    {
      label: '周期筛选',
      prop: 'assessmentPeriod',
      type: 'rowText',
      search: true,
    },
  ],
};

export default options;

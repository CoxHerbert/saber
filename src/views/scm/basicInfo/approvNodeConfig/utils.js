/** 质检绑定配置 */
const options = {
  columns: [
    {
      width: '55px',
      type: 'selection',
    },
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
      prop: 'nodeName',
      label: '审批节点名称',
      type: 'rowText',
      width: '160px',
    },
    {
      prop: 'nodeCode',
      label: '审批节点编码',
      type: 'rowText',
      width: '120px',
    },
    {
      prop: 'roleNames',
      label: '配置角色',
      type: 'rowText',
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      type: 'rowText',
      width: '160px',
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
          label: '编辑',
          permissionId: 'APPROV_NODE_CONFIG_DETAIL',
          action: 'edit',
        },
        // {
        //   type: 'button',
        //   label: '删除',
        //   action: 'delete',
        // },
      ],
    },
  ],
};

export default options;

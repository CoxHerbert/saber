import Const from '@/const'; // 根据实际路径调整导入

/** 交付启动会配置 */
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
      align: 'center',
      render(scope) {
        return scope.$index + 1;
      },
    },
    {
      prop: 'projectId',
      label: '项目名称',
      objectName: 'project',
      type: 'dc-view',
      width: 140,
    },
    {
      prop: 'createUser',
      label: '创建人',
      objectName: 'user',
      showKey: 'realName',
      type: 'dc-view',
      width: 100,
    },
    {
      prop: 'createTime',
      label: '创建时间',
      type: 'rowText',
      width: 160,
    },
    {
      prop: 'fileIds',
      label: '附件',
      type: 'dc-upload',
      width: 160,
      props: {
        isUpload: false,
        isRemove: false,
        pain: true,
        targetType: Const.targetType.CUSTOMER_RLIST,
      },
    },
    {
      prop: 'remark',
      label: '备注说明',
      type: 'rowText',
    },
    {
      prop: 'options',
      width: 200,
      label: '操作',
      slot: '',
      type: 'actions',
      fixed: 'right',
      children: [
        {
          type: 'button',
          permissionId: 'DC_PDP_PRO_START_DETAIL',
          label: '查看',
          action: 'look',
        },
        {
          type: 'button',
          label: '编辑',
          permissionId: 'DC_PDP_PRO_START_EDIT',
          action: 'edit',
        },
        {
          type: 'button',
          label: '删除',
          permissionId: 'DC_PDP_PRO_START_DEL',
          action: 'delete',
        },
      ],
    },
  ],
};

export default options;

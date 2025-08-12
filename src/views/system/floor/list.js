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
      // {
      //   prop: 'leaderUserId',
      //   label: '负责人ID',
      //   type: 'rowText',
      //   search: true,
      //   width: 170,
      //   searchProps: {
      //     is: 'input',
      //     placeholder: '请输入负责人',
      //   },
      // },
      {
        prop: 'currentNodeUserName',
        label: '负责人姓名',
        type: 'rowText',

        width: 130,
      },

      {
        prop: 'leaderUserPhone',
        label: '楼层负责人联系方式',
        type: 'rowText',
        search: true,
        width: 150,
        searchProps: {
          is: 'input',
          placeholder: '楼层负责人联系方式',
        },
      },
      {
        prop: 'leaderUserDept',
        label: '楼层负责人部门',
        type: 'rowText',
        minWidth: 140,
      },
      {
        prop: 'leaderImage',
        label: '负责人图片',
        type: 'imageUrl',
        width: 120,
      },
      {
        prop: 'equipmentId',
        label: '设备Id-智能盒子',
        type: 'rowText',
        // search: true,
        // minWidth: 140,
        // searchProps: {
        //   is: 'input',
        //   placeholder: '设备Id-智能盒子',
        // },
      },
      {
        prop: 'flowName',
        label: '设备名称',
        type: 'rowText',
        search: true,
        minWidth: 140,
        searchProps: {
          is: 'input',
          placeholder: '设备名称',
        },
      },

      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 150,
        children: [
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
          },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
          },
        ],
      },
    ],
  };
};

export default options;

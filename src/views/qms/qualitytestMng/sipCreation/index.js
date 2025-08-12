/** 检验配置页面 */
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
        prop: 'category',
        label: '类别',
        type: 'dict',
        search: true,
        align: 'center',
        width: 100,
        dictKey: 'DC_INSPECTION_CLASS', // 绑定下拉项数组变量
        labelKey: 'dictVal',
        valueKey: 'dictKey',
        searchProps: {
          is: 'dict',
          clearable: true,
          placeholder: '请选择类别',
        },
      },
      {
        prop: 'checkType',
        label: '类型',
        type: 'dict',
        search: true,
        align: 'center',
        width: 80,
        dictKey: 'DC_SIP_CHECK_TYPE', // 绑定下拉项数组变量
        labelKey: 'dictVal',
        valueKey: 'dictKey',
        searchProps: {
          is: 'dict',
          clearable: true,
          placeholder: '请选择类型',
        },
      },
      {
        prop: 'materialNumberCollection',
        label: '专案/物料/标识',
        type: 'rowText',
        align: 'center',
        minWidth: 240,
        transVal(scope, dicts) {
          if (scope.row.checkType === 'DC_SIP_CHECK_TYPE_BS') {
            const findDic = dicts.find(dic => dic.dictKey === scope.row.materialNumberCollection);
            return !!findDic ? findDic?.dictValue : '-';
          }
          return scope.row.materialNumberCollection || '-';
        },
      },
      {
        prop: 'configDate',
        label: '更新时间',
        type: 'rowText',
        align: 'center',
        width: 160,
      },
      {
        prop: 'isConfig',
        label: '启动状态',
        type: 'dict',
        align: 'center',
        width: 100,
        dictKey: 'DC_COMMON_TRUEORFALSE',
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 200,
        children: [
          {
            type: 'button',
            label: '配置',
            action: 'config',
            permission(scope) {
              return {
                id: 'SIP_CREATION_CONFIG',
                row: scope.row,
              };
            },
          },
          {
            type: 'button',
            label: '编辑',
            action: 'edit',
            permission(scope) {
              return {
                id: 'SIP_CREATION_EDIT',
                row: scope.row,
              };
            },
          },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
            permission(scope) {
              return {
                id: 'SIP_CREATION_DEL',
                row: scope.row,
              };
            },
          },
          {
            type: 'button',
            label: '复制',
            action: 'copy',
            permission(scope) {
              return {
                id: 'SIP_CREATION_COPY',
                row: scope.row,
              };
            },
          },
        ],
      },
    ],
  };
};

export default options;

export default {
  groups: [
    {
      label: '基本信息',
      renderType: 'form',
      columns: [
        {
          label: '客户全称',
          prop: 'fullname',
        },
        {
          label: '客户编码',
          prop: 'customerCode',
        },
        {
          label: '法定代表人',
          prop: 'legalPerson',
        },
        {
          label: '注册资本',
          prop: 'regCap',
        },
        {
          label: '成立日期',
          prop: 'regDate',
        },
        {
          label: '社会信用代码',
          prop: 'taxNo',
        },
        {
          label: '经营状态',
          prop: 'runningStatus',
        },
        {
          label: '企业注册号',
          prop: 'regCode',
        },
        {
          label: '注册地址',
          prop: 'regAddress',
          hasTooltip: true,
        },
        {
          label: '注销日期',
          prop: 'oppsBackground',
        },
        {
          label: '所属工商局',
          prop: 'govBelong',
        },
        {
          label: '企业类型',
          prop: 'regType',
        },
        // {
        //   label: '经营范围',
        //   prop: 'companyScope',
        //   hasExpand: true,
        // },
      ],
    },
    {
      label: '厂区信息',
      renderType: 'table-form',
      columns: [
        {
          label: '厂区编码',
          prop: 'factoryCode',
        },
        {
          label: '区域',
          prop: 'areaName',
        },
        {
          label: '详细地址',
          prop: 'address',
        },
      ],
    },
    {
      label: '客户属性',
      renderType: 'form',
      columns: [
        {
          label: '客户分类',
          prop: 'cusCategory',
          type: 'dict',
          options: 'DC_CRM_CUS_CATEGORY',
        },
        {
          label: '人员规模',
          prop: 'staffSize',
          type: 'dict',
          options: 'DC_CRM_CUS_STAFF_SIZE',
        },
        {
          label: '客户级别',
          prop: 'cusLevel',
          type: 'dict',
          options: 'DC_CRM_CUS_LEVEL',
        },
        {
          label: '共享方式',
          prop: 'cusShareType',
          type: 'dict',
          options: 'DC_CRM_CUS_SHARE_TYPE',
        },
        {
          label: '共享人',
          prop: 'sharerUser',
          type: 'user',
          showKey: 'realName',
        },
        {
          label: '客户类别',
          prop: 'sector',
          type: 'dict',
          options: 'DC_CRM_SECTOR',
        },
        {
          label: '公司负责人',
          prop: 'personInChargeUser',
          type: 'user',
          showKey: 'realName',
        },
        {
          label: '经营范围',
          prop: 'companyScope',
        },
        {
          label: '公司网址',
          prop: 'customerWebUrl',
        },
      ],
    },
    {
      label: '系统信息',
      renderType: 'form',
      columns: [
        {
          prop: 'createUser',
          label: '登记人',
          type: 'dc-view',
          objectName: 'user',
        },
        {
          prop: 'updateUser',
          label: '修改人',
          type: 'dc-view',
          objectName: 'user',
        },
        {
          prop: 'createTime',
          label: '登记时间',
        },
        {
          prop: 'updateTime',
          label: '修改时间',
        },
        {
          prop: 'createDept',
          label: '登记人部门',
          type: 'dc-view',
          objectName: 'dept',
        },
        {
          prop: 'updateDept',
          label: '修改人部门',
          type: 'dc-view',
          objectName: 'dept',
        },
      ],
    },
  ],
};

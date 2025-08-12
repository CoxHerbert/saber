import Layout from '@/page/index/index.vue';

/**
 * 路由创建规范
 * 名称使用全称使用小驼峰命名，例如
 * 商机 文件夹名称为 businessOpportunities
 * 列表为 businessOpportunities/list 组件的name为 BusinessOpportunitiesList
 * 新增或者编辑为 businessOpportunities/submit/:id 组件的name为 BusinessOpportunitiesSubmit
 * 详情为 businessOpportunities/detail/:id 组件的name为 BusinessOpportunitiesDetail
 * **/
export default [
  {
    path: '/wel',
    component: () => import('@/page/index/index.vue'),
    redirect: '/desk/index',
    children: [
      {
        path: 'index',
        name: '首页',
        meta: {
          i18n: 'dashboard',
        },
        component: () => import(/* webpackChunkName: "views" */ '@/views/wel/index.vue'),
      },
    ],
  },
  //crm静态路由
  {
    path: '/crm',
    component: Layout,
    redirect: '/businessOpportunities/list',
    name: 'crm',
    children: [
      {
        path: 'client/demandSchedule/create',
        name: '新建需求表',
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/client/demandSchedule/submit.vue'),
      },
      {
        path: 'client/demandSchedule/edit/:id',
        name: '编辑需求表',
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/client/demandSchedule/submit.vue'),
      },
      {
        path: 'client/demandSchedule/detail/:id',
        name: '查看需求表',
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/client/demandSchedule/detail.vue'),
      },

      {
        path: 'setting/rlist-configue-setting/:mode/:id',
        name: '查看编辑或新增需求表配置',
        meta: {
          i18n: 'test',
          parentMenuId: '1930801806709170178',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/setting/rlist-configue-edit.vue'),
      },
      {
        path: 'setting/rlist-technology-configue-setting/:mode/:id',
        name: '查看编辑或新增需求工艺配置',
        meta: {
          i18n: 'test',
          parentMenuId: '1930801806709170178',
        },
        component: () =>
          import(
            /* webpackChunkName: "crm" */ '@/views/crm/setting/rlist-technology-confiuge-edit.vue'
          ),
      },

      {
        path: 'client/demandSchedule/update/:id',
        name: '升级需求表',
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/client/demandSchedule/submit.vue'),
      },
      {
        path: 'businessOpportunities/create',
        name: '新建商机',
        meta: {
          i18n: 'test',
          parentMenuId: '1850019778656595969',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/businessOpportunities/submit.vue'),
      },
      {
        path: 'businessOpportunities/edit/:id',
        name: '编辑商机',
        meta: {
          i18n: 'test',
          parentMenuId: '1850019778656595969',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/businessOpportunities/submit.vue'),
      },
      {
        path: 'businessOpportunities/detail/:id',
        name: '商机详情',
        meta: {
          i18n: 'test',
          parentMenuId: '1850019778656595969',
        },
        component: () =>
          import(
            /* webpackChunkName: "crm" */ '@/views/crm/businessOpportunities/detail/index.vue'
          ),
      },
      {
        path: 'myClients/submit/:id',
        name: '新增客户',
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () => import(/* webpackChunkName: "crm" */ '@/views/crm/myClients/submit.vue'),
      },
      {
        path: 'myClients/edit/:id',
        name: '编辑客户',
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () => import(/* webpackChunkName: "crm" */ '@/views/crm/myClients/submit.vue'),
      },
      {
        path: 'myClients/detail/:id',
        name: '客户详情',
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/myClients/detail/index.vue'),
      },
      {
        path: 'businessOpportunities/business/create',
        name: '新建商机 ', // 用于我的客户详情内的创建商机按钮
        meta: {
          i18n: 'test',
          parentMenuId: '1850018730936995841',
        },
        component: () =>
          import(/* webpackChunkName: "crm" */ '@/views/crm/myClients/businessCreate/index.vue'),
      },
    ],
  },
  // wms
  {
    path: '/wms',
    component: Layout,
    name: 'wms',
    children: [
      {
        path: 'warehousingEntry/:id',
        name: '入库提交',
        meta: {
          i18n: 'test',
          parentMenuId: '1872119564056989697',
        },
        component: () =>
          import(
            /* webpackChunkName: "wms" */ '@/views/wms/warehouseRecord/warehousingEntry/index.vue'
          ),
      },
      {
        path: 'outboundOrder/:id',
        name: '出库提交',
        meta: {
          i18n: 'test',
          parentMenuId: '1872119564056989697',
        },
        component: () =>
          import(
            /* webpackChunkName: "wms" */ '@/views/wms/warehouseRecord/outboundOrder/index.vue'
          ),
      },
    ],
  },
  // pdp
  {
    path: '/pdp',
    component: Layout,
    name: '可行性评估',
    children: [
      {
        path: 'feasibility/steps/:id',
        name: '可行性评估进度',
        meta: {
          i18n: 'test',
          parentMenuId: '1850049580101636098',
        },
        component: () =>
          import(/* webpackChunkName: "wms" */ '@/views/pdp/feasibility/submitSteps/index.vue'),
      },
      {
        path: 'review/steps/:id',
        name: '评审',
        meta: {
          i18n: 'test',
          parentMenuId: '1850056040570548226',
        },
        component: () =>
          import(/* webpackChunkName: "wms" */ '@/views/pdp/review/submitSteps/index.vue'),
      },
      {
        path: 'review/detail/:id',
        name: '评审详情',
        meta: {
          i18n: 'test',
          parentMenuId: '1850056040570548226',
        },
        component: () =>
          import(/* webpackChunkName: "wms" */ '@/views/pdp/review/detail/index.vue'),
      },
      {
        path: 'project/submit/:id',
        name: '项目立项',
        meta: {
          i18n: 'test',
          parentMenuId: '1850050339483807746',
        },
        component: () => import(/* webpackChunkName: "wms" */ '@/views/pdp/project/submit.vue'),
      },
      {
        path: 'planSheet/detail/:tab/:id',
        name: '现场计划单概况',
        meta: {
          i18n: 'test',
          parentMenuId: '1888745926575652866',
        },
        component: () =>
          import(/* webpackChunkName: "wms" */ '@/views/pdp/planSheet/detail/index.vue'),
      },
      // {
      //   path: 'planSheet/add',
      //   name: '新增计划单',
      //   meta: {
      //     i18n: 'test',
      //     parentMenuId: '1888745926575652866',
      //   },
      //   component: () =>
      //     import(/* webpackChunkName: "views" */ '@/views/pdp/planSheet/add/index.vue'),
      // },
      // {
      //   path: 'planSheet/edit',
      //   name: '编辑计划单',
      //   meta: {
      //     i18n: 'test',
      //     parentMenuId: '1888745926575652866',
      //   },
      //   component: () =>
      //     import(/* webpackChunkName: "views" */ '@/views/pdp/planSheet/edit/index.vue'),
      // },
      {
        path: 'project/detail/:tab/:projectId',
        name: '项目概况',
        meta: {
          i18n: 'test',
          parentMenuId: '1850050339483807746',
        },
        component: () =>
          import(/* webpackChunkName: "wms" */ '@/views/pdp/project/detail/index.vue'),
      },
      {
        path: '/planOrder/count',
        name: '计划统计',
        meta: {
          i18n: 'test',
          parentMenuId: '1850050339483807746',
        },
        component: () => import(/* webpackChunkName: "wms" */ '@/views/pdp/planOrder/count.vue'),
      },
      {
        path: 'project/case/:projectId/:projectCaseId',
        name: '专案详情',
        meta: {
          i18n: 'test',
          parentMenuId: '1850053474822516737',
        },
        component: () =>
          import(/* webpackChunkName: "wms" */ '@/views/pdp/project/case/detail.vue'),
      },
      {
        path: '/pdp/execution/add',
        name: '执行单新增',
        meta: {
          i18n: 'test',
          parentMenuId: '1913143624737734658',
        },
        component: () =>
          import(/* webpackChunkName: "pdp" */ '@/views/pdp/execution/add/index.vue'),
      },
      {
        path: '/pdp/execution/detail',
        name: '执行单详情',
        meta: {
          i18n: 'test',
          parentMenuId: '1913143624737734658',
        },
        component: () =>
          import(/* webpackChunkName: "pdp" */ '@/views/pdp/execution/detail/index.vue'),
      },
      {
        path: '/pdp/execution/edit',
        name: '执行单编辑',
        meta: {
          i18n: 'test',
          parentMenuId: '1913143624737734658',
        },
        component: () =>
          import(/* webpackChunkName: "pdp" */ '@/views/pdp/execution/edit/index.vue'),
      },
      {
        path: 'pdpSetting/reviewItemConfig/config',
        name: '评审项配置',
        meta: {
          i18n: 'test',
          parentMenuId: '1948194888883167234',
        },
        component: () =>
          import(
            /* webpackChunkName: "pdp" */ '@/views/pdp/pdpSetting/reviewItemConfig/config.vue'
          ),
      },
      //
      // {
      //   path: 'feasibility/steps/:id',
      //   name: '可行性评估进度',
      //   meta: {
      //     i18n: 'test',
      //     parentMenuId: '1850049580101636098',
      //   },
      //   component: () =>
      //     import(/* webpackChunkName: "views" */ '@/views/pdp/feasibility/submitSteps/index.vue'),
      // },
      // {
      //   path: 'feasibility/detail/:id',
      //   name: '可行性评估',
      //   meta: {
      //     i18n: 'test',
      //   },
      //   component: () =>
      //     import(/* webpackChunkName: "views" */ '@/views/pdp/feasibility/detail/index.vue'),
      // },
    ],
  },
  // 交付启动会创建或编辑
  {
    path: '/pdp/deliverystart/addorEdite',
    component: Layout,
    name: 'deliverystart',
    children: [
      {
        path: '/pdp/deliverystart/addorEdite',
        name: '交付启动会创建或编辑',
        meta: {
          parentMenuId: '1850052519084003330',
        },
        component: () =>
          import(/* webpackChunkName: "pdp" */ '@/views/pdp/deliverystart/addorEdite.vue'),
      },
    ],
  },
  // pdpSetting
  {
    path: '/pdpSetting',
    component: Layout,
    name: 'PDP配置',
    children: [
      {
        path: 'planTemplate/:templateId',
        name: '计划模板明细配置',
        meta: {
          i18n: 'test',
          parentMenuId: '1861699735340113921',
        },
        component: () =>
          import(/* webpackChunkName: "pdp" */ '@/views/pdpSetting/planTemplate/detail/index.vue'),
      },
    ],
  },
  // 项目预算编辑
  {
    path: '/pdp/projectBudget/addorEdite',
    component: Layout,
    name: 'projectBudget',
    children: [
      {
        path: '/pdp/projectBudget/addorEdite',
        name: '项目预算编辑',
        meta: {
          parentMenuId: '1921739306794270721',
        },
        component: () =>
          import(/* webpackChunkName: "pdp" */ '@/views/pdp/projectBudget/add/index.vue'),
      },
    ],
  },
  // 工作台
  {
    path: '/desk',
    component: Layout,
    redirect: '/desk/index',
    children: [
      {
        path: 'index',
        name: '工作台',
        meta: {
          i18n: 'desk',
          parentMenuId: '1872125141990576129',
        },
        component: () => import(/* webpackChunkName: "desk" */ '@/views/desk/index.vue'),
      },
      {
        path: 'article/:id',
        name: '我的文档',
        meta: {
          hasTagReturnBtn: true,
          i18n: 'article',
          parentMenuId: '1933716602850193410',
        },
        component: () =>
          import(/* webpackChunkName: "desk" */ '@/views/desk/wiki/wiki/article.vue'),
      },
    ],
  },
  {
    path: '/knowledge',
    component: Layout,
    redirect: '/knowledge/wiki',
    children: [
      {
        path: 'post/:id',
        name: '文档查看',
        meta: {
          hideTagReturnBtn: true,
          // hasTagReturnBtn: true,
          i18n: 'post',
          parentMenuId: '1933402041406820353',
        },
        component: () => import(/* webpackChunkName: "knowledge" */ '@/views/knowledge/post.vue'),
      },
    ],
  },
  {
    path: '/dict-vertical',
    component: Layout,
    redirect: '/dict-vertical/index',
    children: [
      {
        path: 'index',
        name: '字典管理',
        meta: {
          i18n: 'dict',
        },
        component: () =>
          import(/* webpackChunkName: "system" */ '@/views/util/demo/dict-vertical.vue'),
      },
    ],
  },
  {
    path: '/info',
    component: Layout,
    redirect: '/info/index',
    name: '用户',
    children: [
      {
        path: 'index',
        name: '个人信息',
        meta: {
          i18n: 'info',
        },
        component: () => import(/* webpackChunkName: "system" */ '@/views/system/userinfo.vue'),
      },
    ],
  },
  // {
  //   path: '/wiki',
  //   component: Layout,
  //   redirect: '/wiki/index',
  //   name: '知识',
  //   children: [
  //     {
  //       path: 'index',
  //       name: '知识中心',
  //       meta: {
  //         i18n: 'info',
  //         parentMenuId: '1872119173441458177',
  //       },
  //       component: () => import(/* webpackChunkName: "page" */ '@/views/wiki/index.vue'),
  //     },
  //   ],
  // },
  {
    path: '/work/process/leave',
    component: Layout,
    redirect: '/work/process/leave/form',
    children: [
      {
        path: 'form/:processDefinitionId',
        name: '请假流程',
        meta: {
          i18n: 'work',
        },
        component: () =>
          import(/* webpackChunkName: "page" */ '@/views/work/process/leave/form.vue'),
      },
      {
        path: 'handle/:taskId/:processInstanceId/:businessId',
        name: '处理请假流程',
        meta: {
          i18n: 'work',
        },
        component: () =>
          import(/* webpackChunkName: "page" */ '@/views/work/process/leave/handle.vue'),
      },
      {
        path: 'detail/:processInstanceId/:businessId',
        name: '请假流程详情',
        meta: {
          i18n: 'work',
        },
        component: () =>
          import(/* webpackChunkName: "page" */ '@/views/work/process/leave/detail.vue'),
      },
    ],
  },
  {
    path: '/workflow',
    component: Layout,
    children: [
      {
        path: 'design/process/:id',
        name: '模型设计2',
        component: () =>
          import(
            /* webpackChunkName: "workflow" */ '@/views/plugin/workflow/pages/design/index.vue'
          ),
      },
      {
        path: 'design/model/history/:id',
        name: '模型历史',
        component: () =>
          import(
            /* webpackChunkName: "workflow" */ '@/views/plugin/workflow/pages/design/model-history.vue'
          ),
      },
      {
        path: 'design/form/history/:id',
        name: '表单历史',
        component: () =>
          import(
            /* webpackChunkName: "workflow" */ '@/views/plugin/workflow/pages/design/form-history.vue'
          ),
      },
      {
        path: 'process/start/:params',
        name: '创建',
        component: () =>
          import(
            /* webpackChunkName: "workflow" */ '@/views/plugin/workflow/pages/process/form/start.vue'
          ),
      },
      {
        path: 'process/detail/:params',
        name: '流程详情',
        component: () =>
          import(
            /* webpackChunkName: "workflow" */ '@/views/plugin/workflow/pages/process/form/detail.vue'
          ),
        meta: {
          // 强制展示返回上一页
          hasTagReturnBtn: true,
        },
      },
    ],
  },

  {
    path: '/qms/qualitytestMng/sipCreation/addEditeconfig',
    component: Layout,
    name: 'QMS',
    children: [
      {
        path: '/qms/qualitytestMng/sipCreation/addEditeconfig',
        name: '编辑配置',
        meta: {
          parentMenuId: '1894207861758545921',
        },
        component: () =>
          import(
            /* webpackChunkName: "QMS" */ '@/views/qms/qualitytestMng/sipCreation/addEditeconfig.vue'
          ),
      },
    ],
  },

  {
    path: '/qms/quality-inspection-record/detail',
    component: Layout,
    name: 'quality-inspection-record-detail',
    children: [
      {
        path: '/qms/quality-inspection-record/detail',
        name: '质检记录详情',
        meta: {
          parentMenuId: '1914504794796380161',
        },
        component: () =>
          import(/* webpackChunkName: "QMS" */ '@/views/qms/quality-inspection-record/detail.vue'),
      },
    ],
  },
  {
    path: '/scm/basicInfo/supplier/addorEdite',
    component: Layout,
    name: 'SCM',
    children: [
      {
        path: '/scm/basicInfo/supplier/addorEdite',
        name: '新增/编辑供应商',
        meta: {
          parentMenuId: '1904015353451692033',
        },
        component: () =>
          import(/* webpackChunkName: "SCM" */ '@/views/scm/basicInfo/supplier/addorEdite.vue'),
      },
    ],
  },
  {
    path: '/scm/basicInfo/material/addorEdite',
    component: Layout,
    name: 'material1',
    children: [
      {
        path: '/scm/basicInfo/material/addorEdite',
        name: '新增/编辑物料',
        meta: {
          parentMenuId: '1902160610854780930',
        },
        component: () =>
          import(/* webpackChunkName: "SCM" */ '@/views/scm/basicInfo/material/addorEdite.vue'),
      },
    ],
  },
  {
    path: '/scm/inventoryMng/outOrder/addorEdit',
    component: Layout,
    name: 'material',
    children: [
      {
        path: '/scm/inventoryMng/outOrder/addorEdit',
        name: '新增或编辑出库单',
        meta: {
          parentMenuId: '1906522681770033154',
        },
        component: () =>
          import(/* webpackChunkName: "SCM" */ '@/views/scm/inventoryMng/outOrder/addorEdit.vue'),
      },
    ],
  },

  {
    path: '/scm/inventoryMng/wareHousEntry/addOrEdit',
    component: Layout,
    name: 'wareHousEntry',
    children: [
      {
        path: '/scm/inventoryMng/wareHousEntry/addOrEdit',
        name: '新增或编辑入库单',
        meta: {
          parentMenuId: '1902160610854780930',
        },
        component: () =>
          import(
            /* webpackChunkName: "SCM" */ '@/views/scm/inventoryMng/warehouseEntry/addOrEdit.vue'
          ),
      },
    ],
  },

  {
    path: '/scm/purchasmng/purchaseOrder/addorEdite',
    component: Layout,
    name: 'purchaseOrder',
    children: [
      {
        path: '/scm/purchasmng/purchaseOrder/addorEdite',
        name: '采购订单',
        meta: {
          parentMenuId: '1904694466134982657',
        },
        component: () =>
          import(
            /* webpackChunkName: "SCM" */ '@/views/scm/purchasmng/purchaseOrder/addorEdite.vue'
          ),
      },
    ],
  },

  {
    path: '/scm/purchasmng/purchaseRequest/addorEdite',
    component: Layout,
    name: 'purchaseRequest',
    children: [
      {
        path: '/scm/purchasmng/purchaseRequest/addorEdite',
        name: '采购申请单',
        meta: {
          parentMenuId: '1904694062110261250',
        },
        component: () =>
          import(
            /* webpackChunkName: "SCM" */ '@/views/scm/purchasmng/purchaseRequest/addorEdite.vue'
          ),
      },
    ],
  },
  {
    path: '/scm/saleMng/saleOrder/addorEdite',
    component: Layout,
    name: 'saleOrder',
    children: [
      {
        path: '/scm/saleMng/saleOrder/addorEdite',
        name: '销售订单',
        meta: {
          parentMenuId: '1905793420624969729',
        },
        component: () =>
          import(/* webpackChunkName: "SCM" */ '@/views/scm/saleMng/saleOrder/addorEdite.vue'),
      },
    ],
  },

  {
    path: '/scm/saleMng/forecastSheet/addorEdite',
    component: Layout,
    name: 'forecastSheet22',
    children: [
      {
        path: '/scm/saleMng/forecastSheet/addorEdite',
        name: '预测单',
        meta: {
          parentMenuId: '1906528728865882113',
        },
        component: () =>
          import(/* webpackChunkName: "SCM" */ '@/views/scm/saleMng/forecastSheet/addorEdite.vue'),
      },
    ],
  },
  {
    path: '/mes',
    component: Layout,
    name: 'wireManage',
    children: [
      {
        path: 'wireManage/wireBOM/addOrEdit',
        name: '线材BOM详情',
        meta: {
          parentMenuId: '1930800534564184065',
        },
        component: () =>
          import(
            /* webpackChunkName: "MES" */ '@/views/mes/wireManage/wireBOM/addOrEdit/index.vue'
          ),
      },
      {
        path: 'wireManage/wireExecutionOrder/addOrEdit',
        name: '线材执行单详情',
        meta: {
          parentMenuId: '1932609668223778818',
        },
        component: () =>
          import(
            /* webpackChunkName: "MES" */ '@/views/mes/wireManage/wireExecutionOrder/addOrEdit/index.vue'
          ),
      },
      {
        path: 'wireManage/wireChangeOrder/addOrEdit',
        name: '线材变更单详情',
        meta: {
          parentMenuId: '1932713877985923074',
        },
        component: () =>
          import(
            /* webpackChunkName: "MES" */ '@/views/mes/wireManage/wireChangeOrder/addOrEdit/index.vue'
          ),
      },
      {
        path: 'mops/prodPlan/addOrEdit',
        name: '生产主计划生成工序生成工序',
        meta: {
          parentMenuId: '1930800534564184065',
        },
        component: () =>
          import(/* webpackChunkName: "MES" */ '@/views/mes/mops/prodPlan/addOrEdit/index.vue'),
      },
      {
        path: 'mops/solutionPlan/addOrEdit',
        name: '生产排程计划编辑或详情',
        meta: {
          parentMenuId: '1942860346571812865',
        },
        component: () =>
          import(/* webpackChunkName: "MES" */ '@/views/mes/mops/solutionPlan/addOrEdit/index.vue'),
      },
    ],
  },
  {
    path: '/system/process-outsourcing/addorEdite',
    component: Layout,
    name: 'process-outsourcing2',
    children: [
      {
        path: '/system/process-outsourcing/addorEdite2',
        name: '工序外发编辑',
        meta: {
          parentMenuId: '1902160610854780930',
        },
        component: () =>
          import(
            /* webpackChunkName: "system" */ '@/views/system/process-outsourcing/addOrEdit/index.vue'
          ),
      },
    ],
  },
  {
    path: '/system/outsource-quotation/pricingdetail',
    component: Layout,
    name: 'process-pricingdetail',
    children: [
      {
        path: '/system/outsource-quotation/pricingdetail',
        name: '核价详情',
        meta: {
          parentMenuId: '1938159657252417538',
        },
        component: () =>
          import(
            /* webpackChunkName: "system" */ '@/views/system/outsource-quotation/pricingdetail/index.vue'
          ),
      },
    ],
  },
  {
    path: '/system/companyUser/index',
    component: Layout,
    name: 'process-companyUser',
    children: [
      {
        path: '/system/companyUser/index',
        name: '员工考核详情',
        meta: {
          parentMenuId: '1947538631130144769',
        },
        component: () =>
          import(/* webpackChunkName: "system" */ '@/views/system/companyUser/index.vue'),
      },
    ],
  },
  // {
  //   path: '/scm/wareHouseOutbound/addOrEdit',
  //   component: Layout,
  //   name: 'wareHouseOutbound',
  //   children: [
  //     {
  //       path: '/scm/wareHouseOutbound/addOrEdit',
  //       name: '出库单',
  //       meta: {
  //         parentMenuId: '1902160610854780930',
  //       },
  //       component: () =>
  //         import(/* webpackChunkName: "views" */ '@/views/scm/wareHouseOutbound/addorEdite.vue'),
  //     },
  //   ],
  // },
];

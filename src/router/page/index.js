export default [
  {
    path: '/login',
    name: '登录页',
    component: () => import(/* webpackChunkName: "page" */ '@/page/login/index.vue'),
    meta: {
      keepAlive: false,
      isTab: false,
      isAuth: false,
    },
  },
  {
    path: '/resetPassword',
    name: '重置密码',
    component: () => import(/* webpackChunkName: "page" */ '@/page/login/resetPassword.vue'),
    meta: {
      keepAlive: false,
      isTab: false,
    },
  },
  {
    path: '/sop-doc',
    name: 'sop文档',
    component: () => import(/* webpackChunkName: "page" */ '@/page/sop-doc/index.vue'),
    meta: {
      keepAlive: false,
      isTab: false,
    },
  },
  {
    path: '/jump/:id',
    name: '页面跳转...',
    component: () => import(/* webpackChunkName: "page" */ '@/page/jump/index.vue'),
  },
  {
    path: '/process-priview',
    name: '流程图预览',
    component: () => import(/* webpackChunkName: "page" */ '@/page/process-priview/index.vue'),
    meta: {
      isAuth: false,
    },
  },
  {
    path: '/oauth/redirect/:source',
    name: '第三方登录',
    component: () => import(/* webpackChunkName: "page" */ '@/page/login/index.vue'),
    meta: {
      keepAlive: false,
      isTab: false,
      isAuth: false,
    },
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "page" */ '@/components/error-page/404.vue'),
    name: '404',
    meta: {
      keepAlive: false,
      isTab: false,
      isAuth: false,
    },
  },
  {
    path: '/403',
    component: () => import(/* webpackChunkName: "page" */ '@/components/error-page/403.vue'),
    name: '403',
    meta: {
      keepAlive: false,
      isTab: false,
      isAuth: false,
    },
  },
  {
    path: '/500',
    component: () => import(/* webpackChunkName: "page" */ '@/components/error-page/500.vue'),
    name: '500',
    meta: {
      keepAlive: false,
      isTab: false,
      isAuth: false,
    },
  },
  {
    path: '/',
    name: '主页',
    redirect: '/wel',
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404',
  },
  {
    path: '/dashboard/projectSchedule',
    name: '计划排程',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () =>
      import(/* webpackChunkName: "views" */ '@/views/dashboard/projectSchedule/index.vue'),
  },
  {
    path: '/dashboard/floorboard/index',
    name: '楼层大屏',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () =>
      import(/* webpackChunkName: "views" */ '@/views/dashboard/floorboard/index.vue'),
  },
  {
    path: '/dashboard/assemblyboard',
    name: '装配看板',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () =>
      import(/* webpackChunkName: "views" */ '@/views/dashboard/assemblyboard/list.vue'),
  },
  {
    path: '/dashboard/onSitePlan',
    name: '现场计划',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () =>
      import(/* webpackChunkName: "views" */ '@/views/dashboard/onSitePlan/index.vue'),
  },
  {
    path: '/dashboard/humanResources/index',
    name: '人力看板',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () =>
      import(/* webpackChunkName: "views" */ '@/views/dashboard/humanResources/index.vue'),
  },
  {
    path: '/dashboard/suppliersdownload/suppliersdownload',
    name: '供应商自助下图',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () =>
      import(
        /* webpackChunkName: "views" */ '@/views/dashboard/suppliersdownload/suppliersdownload.vue'
      ),
  },
  // {
  //   path: '/system/companyUser/comprouter',
  //   name: '员工考核1',
  //   meta: {
  //     isAuth: false,
  //     isTab: false,
  //   },
  //   component: () =>
  //     import(/* webpackChunkName: "views" */ '@/views/system/companyUser/comprouter.vue'),
  // },
  {
    path: '/dashboard/commandRoom/index',
    name: '指挥室数据大屏',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () =>
      import(/* webpackChunkName: "views" */ '@/views/dashboard/commandRoom/index.vue'),
  },
  {
    path: '/desk/webviewNfdesign',
    name: '用于h5端查看流程设计',
    meta: {
      isAuth: false,
      isTab: false,
    },
    component: () => import(/* webpackChunkName: "views" */ '@/views/desk/webviewNfdesign.vue'),
  },
];

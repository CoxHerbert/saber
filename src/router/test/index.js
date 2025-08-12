export default [
  {
    path: '/test',
    name: '测试页',
    component: () => import('@/page/test/index.vue'),
    meta: {
      keepAlive: false,
      isTab: false,
      isAuth: false,
      timeKey: 'time',
    },
  },
];

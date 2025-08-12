import router from './router/';
import store from './store';
import { getToken } from '@/utils/auth';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import { gantt } from 'dhtmlx-gantt';
import { versionCheck } from '@/utils/versionCheck';
NProgress.configure({ showSpinner: false });
import website from '@/config/website';

const syncSetToken = token => {
  return new Promise(resolve => {
    store.commit('SET_TOKEN', token);
    setTimeout(() => {
      resolve();
    }, 300);
  });
};

router.beforeEach(async (to, from, next) => {
  await versionCheck();
  if (website.urlTokenWhiteList.includes(to.path)) {
    await syncSetToken(to.query.token);
    next();
    return;
    // store.commit('SET_TOKEN', to.query.token);
  }
  const meta = to.meta || {};
  const isMenu = meta.menu === undefined ? to.query.menu : meta.menu;
  store.commit('SET_IS_MENU', isMenu === undefined);
  if (gantt) gantt.clearAll();
  if (Array.isArray(store.getters.eventArrs)) {
    store.getters.eventArrs.forEach(eventId => {
      gantt.detachEvent(eventId);
    });
  }
  if (getToken() && !website.urlTokenWhiteList.includes(to.path)) {
    const btnPermission = store.state.user.btnPermission;
    store.dispatch('UpdateWorkCountStatistic');
    if (!(Object.keys(btnPermission).length > 0)) {
      await store.dispatch('getBtnPermissions').then(() => {});
    }

    if (to.path === '/login') {
      //如果登录成功访问登录页跳转到主页
      next({ path: '/' });
    } else if (store.getters.userInfoAll?.pwStatus !== 0 && to.path !== '/resetPassword') {
      next({ path: '/resetPassword' });
    } else if (to.path === '/dashboard/humanResources' || to.path === '/dashboard/commandRoom') {
      var origin = window.location.origin;
      window.open(`${origin}${to.path}`, 'target');
      return;
    } else {
      if (store.getters.token.length === 0) {
        store.dispatch('FedLogOut').then(() => {
          next({ path: '/login' });
        });
      } else {
        const meta = to.meta || {};
        const query = to.query || {};
        if (meta.target) {
          window.open(query.url?.replace(/#/g, '&'));
          return;
        } else if (meta.isTab !== false) {
          store.commit('ADD_TAG', {
            name: query.name || to.name,
            path: to.path,
            fullPath: to.path,
            params: to.params,
            query: to.query,
            meta: meta,
          });
        }
        next();
      }
    }
  } else {
    // 判断是否需要认证，没有登录访问去登录页
    if (meta.isAuth === false) {
      next();
    } else {
      next('/login');
    }
  }
});

router.afterEach(to => {
  NProgress.done();
  // let title = router.$avueRouter.generateTitle(to, { label: 'name' });
  // router.$avueRouter.setTitle(title);
  store.commit('SET_IS_SEARCH', false);
});

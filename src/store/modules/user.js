import {
  setToken,
  setRefreshToken,
  removeToken,
  removeRefreshToken,
  getRefreshToken,
} from '@/utils/auth';
import { setStore, getStore } from '@/utils/store';
import { validatenull } from '@/utils/validate';
import { deepClone, transformTreeData } from '@/utils/util';
import {
  loginByUsername,
  loginBySocial,
  loginBySso,
  loginByPhone,
  logout,
  refreshToken,
  getButtons,
  registerUser,
  getDataPermissionButtons,
  // getUserInfo,
} from '@/api/user';
import { getUserInfo } from '@/api/system/user';
import Api from '@/api/index';
import { getRoutes } from '@/api/system/menu';
import { formatPath } from '@/router/avue-router';
import { ElMessage } from 'element-plus';
import { encrypt } from '@/utils/sm2';

/** 精简一下按钮数据 */
const transformBtnAuths = data => {
  const result = {};
  Object.keys(data).forEach(k => {
    const item = data[k] || {};
    result[k] = {
      name: item.name,
      btnType: item.btnType,
      dataPromissionType: item.dataPromissionType,
      dataPromissionDeptType: item.dataPromissionDeptType,
    };
  });
  return result;
};

const user = {
  state: {
    tenantId: getStore({ name: 'tenantId' }) || '',
    userInfo: getStore({ name: 'userInfo' }) || [],
    permission: getStore({ name: 'permission' }) || {},
    // 数据级按钮权限
    btnPermission: {},
    // 部门信息（用于按钮级数据权限鉴权）
    deptInfo: {},

    roles: [],
    menuId: {},
    menu: getStore({ name: 'menu' }) || [],
    menuAll: getStore({ name: 'menuAll' }) || [],
    token: getStore({ name: 'token' }) || '',
    refreshToken: getStore({ name: 'refreshToken' }) || '',
    workCountStatistic: {
      processCount: 0,
      taskCount: 0,
    },
    userInfoAll: getStore({ name: 'userInfoAll' }) || {},
  },
  actions: {
    //根据用户名登录
    LoginByUsername({ commit, dispatch }, userInfo = {}) {
      return new Promise((resolve, reject) => {
        var a = encrypt(userInfo.password);
        loginByUsername(
          userInfo.tenantId,
          userInfo.deptId,
          userInfo.roleId,
          userInfo.username,
          a,
          userInfo.type,
          userInfo.key,
          userInfo.code
        )
          .then(res => {
            const data = res.data;
            if (data.error_description) {
              ElMessage({
                message: data.error_description,
                type: 'error',
              });
            } else {
              commit('SET_TOKEN', data.access_token);
              commit('SET_REFRESH_TOKEN', data.refresh_token);
              commit('SET_TENANT_ID', data.tenant_id);
              commit('SET_USER_INFO', data);
              commit('DEL_ALL_TAG');
            }
            dispatch('GetUserInfo').then(() => resolve());
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //根据第三方信息登录
    LoginBySocial({ commit, dispatch }, userInfo) {
      return new Promise((resolve, reject) => {
        loginBySocial(userInfo.tenantId, userInfo.source, userInfo.code, userInfo.state)
          .then(res => {
            const data = res.data;
            if (data.error_description) {
              ElMessage({
                message: data.error_description,
                type: 'error',
              });
            } else {
              commit('SET_TOKEN', data.access_token);
              commit('SET_REFRESH_TOKEN', data.refresh_token);
              commit('SET_USER_INFO', data);
              commit('SET_TENANT_ID', data.tenant_id);
              commit('DEL_ALL_TAG');
            }
            dispatch('GetUserInfo').then(() => resolve());
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //根据单点信息登录
    LoginBySso({ commit, dispatch }, userInfo) {
      return new Promise((resolve, reject) => {
        loginBySso(userInfo.state, userInfo.code)
          .then(res => {
            const data = res.data;
            if (data.error_description) {
              ElMessage({
                message: data.error_description,
                type: 'error',
              });
            } else {
              commit('SET_TOKEN', data.access_token);
              commit('SET_REFRESH_TOKEN', data.refresh_token);
              commit('SET_USER_INFO', data);
              commit('SET_TENANT_ID', data.tenant_id);
              commit('DEL_ALL_TAG');
            }
            dispatch('GetUserInfo').then(() => resolve());
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //根据手机信息登录
    LoginByPhone({ commit, dispatch }, userInfo) {
      return new Promise((resolve, reject) => {
        loginByPhone(
          userInfo.tenantId,
          encrypt(userInfo.phone),
          userInfo.codeId,
          userInfo.codeValue
        )
          .then(res => {
            const data = res.data;
            if (data.error_description) {
              ElMessage({
                message: data.error_description,
                type: 'error',
              });
            } else {
              commit('SET_TOKEN', data.access_token);
              commit('SET_REFRESH_TOKEN', data.refresh_token);
              commit('SET_USER_INFO', data);
              commit('SET_TENANT_ID', data.tenant_id);
              commit('DEL_ALL_TAG');
            }
            dispatch('GetUserInfo').then(() => resolve());
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //用户注册
    RegisterUser({ commit }, userInfo = {}) {
      return new Promise((resolve, reject) => {
        registerUser(
          userInfo.tenantId,
          userInfo.name,
          userInfo.account,
          encrypt(userInfo.password),
          userInfo.phone,
          userInfo.email
        ).then(res => {
          const data = res.data;
          if (data.error_description) {
            ElMessage({
              message: data.error_description,
              type: 'error',
            });
            reject(data.error_description);
          } else {
            commit('SET_TOKEN', data.access_token);
            commit('SET_REFRESH_TOKEN', data.refresh_token);
            commit('SET_USER_INFO', data);
            commit('SET_TENANT_ID', data.tenant_id);
            commit('DEL_ALL_TAG');
          }
          resolve();
        });
      });
    },
    GetUserInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then(res => {
            const data = res.data.data;
            commit('SET_USER_INFO_ALL', data);
            commit('SET_ROLES', data.roles);
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //刷新token
    RefreshToken({ state, commit }, userInfo) {
      return new Promise((resolve, reject) => {
        refreshToken(
          getRefreshToken(),
          state.tenantId,
          !validatenull(userInfo) ? userInfo.deptId : state.userInfo.dept_id,
          !validatenull(userInfo) ? userInfo.roleId : state.userInfo.role_id
        )
          .then(res => {
            const data = res.data;
            commit('SET_TOKEN', data.access_token);
            commit('SET_REFRESH_TOKEN', data.refresh_token);
            commit('SET_USER_INFO', data);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 登出
    LogOut({ commit }) {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            commit('SET_TOKEN', '');
            commit('SET_MENU_ALL_NULL', []);
            commit('SET_MENU', []);
            commit('SET_ROLES', []);
            commit('DEL_ALL_TAG', []);
            commit('SET_USER_INFO', {});
            commit('SET_USER_INFO_ALL', {});
            removeToken();
            removeRefreshToken();
            removeToken();
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    //注销session
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '');
        commit('SET_MENU_ALL_NULL', []);
        commit('SET_MENU', []);
        commit('SET_ROLES', []);
        commit('DEL_ALL_TAG', []);
        removeToken();
        removeRefreshToken();
        removeToken();
        resolve();
      });
    },
    GetMenu({ commit, dispatch }) {
      return new Promise(resolve => {
        getRoutes().then(res => {
          const data = transformTreeData(res.data.data || []);
          let menu = deepClone(data);
          menu.forEach(ele => formatPath(ele, true));
          commit('SET_MENU', menu);
          commit('SET_MENU_ALL', menu);
          dispatch('GetButtons');
          resolve(menu);
        });
      });
    },
    getBtnPermissions({ commit }) {
      return new Promise(resolve => {
        getDataPermissionButtons()
          .then(res => {
            if (res.data?.code === 200) {
              commit('SET_DEPT_INFO', res.data?.data?.dept || {});
              commit('SET_BTN_PERMISSION', transformBtnAuths(res.data?.data?.menu || {}));
              resolve();
            }
          })
          .catch(e => {
            console.error('获取数据级，按钮权限 数据失败', e);
          });
      });
    },

    GetButtons({ commit }) {
      return new Promise(resolve => {
        getButtons().then(res => {
          const data = res.data.data;
          commit('SET_PERMISSION', data);
          resolve();
        });
      });
    },
    // 更新待办书任务数量
    UpdateWorkCountStatistic({ commit }) {
      return new Promise(resolve => {
        Api.common.process.getWorkCount().then(res => {
          const data = res.data.data;
          commit('SET_WORK_COUNT_STATISTIC', data);
          resolve();
        });
      });
    },
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      setToken(token);
      state.token = token;
      setStore({ name: 'token', content: state.token });
    },
    SET_REFRESH_TOKEN: (state, refreshToken) => {
      setRefreshToken(refreshToken);
      state.refreshToken = refreshToken;
      setStore({ name: 'refreshToken', content: state.refreshToken });
    },
    SET_MENU_ID(state, menuId) {
      state.menuId = menuId;
    },
    SET_TENANT_ID: (state, tenantId) => {
      state.tenantId = tenantId;
      setStore({ name: 'tenantId', content: state.tenantId });
    },
    SET_USER_INFO: (state, userInfo) => {
      if (validatenull(userInfo.user_id) && validatenull(userInfo.account)) {
        state.userInfo = { user_name: 'unauth', role_name: 'unauth' };
      } else {
        if (validatenull(userInfo.avatar)) {
          userInfo.avatar = '/img/bg/img-logo.png';
        }
        state.userInfo = userInfo;
      }
      setStore({ name: 'userInfo', content: state.userInfo });
    },
    SET_USER_INFO_ALL: (state, userInfo) => {
      state.userInfoAll = userInfo;
      setStore({ name: 'userInfoAll', content: state.userInfoAll });
    },
    SET_MENU_ALL: (state, menuAll) => {
      let menu = state.menuAll;
      menuAll.forEach(ele => {
        let index = menu.findIndex(item => item.path === ele.path);
        if (index === -1) {
          menu.push(ele);
        } else {
          menu[index] = ele;
        }
      });
      state.menuAll = menu;
      setStore({ name: 'menuAll', content: state.menuAll });
    },
    SET_MENU_ALL_NULL: state => {
      state.menuAll = [];
      setStore({ name: 'menuAll', content: state.menuAll });
    },
    SET_MENU: (state, menu) => {
      state.menu = menu;
      setStore({ name: 'menu', content: state.menu });
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    /** 设置按钮权限 */
    SET_BTN_PERMISSION: (state, permission) => {
      state.btnPermission = permission;
      // console.log('state.btnPermission', state.btnPermission);
      // 不用storage 防止本地存储爆栈
      // setStore({ name: 'btnPermission', content: state.btnPermission });
    },
    SET_DEPT_INFO: (state, permission) => {
      state.deptInfo = permission;
      // console.log('state.deptInfo', state.deptInfo);
    },

    SET_PERMISSION: (state, permission) => {
      let result = [];

      function getCode(list) {
        list.forEach(ele => {
          if (typeof ele === 'object') {
            const children = ele.children;
            const code = ele.code;
            if (children) {
              getCode(children);
            } else {
              result.push(code);
            }
          }
        });
      }

      getCode(permission);
      state.permission = {};
      result.forEach(ele => {
        state.permission[ele] = true;
      });
      setStore({ name: 'permission', content: state.permission });
    },
    SET_WORK_COUNT_STATISTIC: (state, workCountStatistic) => {
      state.workCountStatistic = workCountStatistic;
    },
  },
};
export default user;

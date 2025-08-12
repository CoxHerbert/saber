import { getStore, setStore } from '@/utils/store';

import { getDictionary } from '@/api/system/dict';

const dict = {
  state: {
    flowRoutes: getStore({ name: 'flowRoutes' }) || {},
    dict: new Array(),
  },
  actions: {
    FlowRoutes({ commit }) {
      return new Promise((resolve, reject) => {
        getDictionary({ code: 'flow' })
          .then(res => {
            commit('SET_FLOW_ROUTES', res.data.data);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 获取字典
    getDict({ state }, _key) {
      if (_key == null && _key == '') {
        return null;
      }
      try {
        for (let i = 0; i < state.dict.length; i++) {
          if (state.dict[i].key == _key) {
            return state.dict[i].value;
          }
        }
      } catch (e) {
        return null;
      }
    },
    // 设置字典
    setDict({ state }, { _key, value }) {
      if (_key !== null && _key !== '') {
        state.dict.push({
          key: _key,
          value: value,
        });
      }
    },
  },
  mutations: {
    SET_FLOW_ROUTES: (state, data) => {
      state.flowRoutes = data.map(item => {
        return {
          routeKey: `${item.code}_${item.dictKey}`,
          routeValue: item.remark,
        };
      });
      setStore({ name: 'flowRoutes', content: state.flowRoutes });
    },
  },
};

export default dict;

import { setStore, getStore } from '@/utils/store';

const processRenderWidthStoreKey = 'pocessRenderWidth';

/** 流程设置 */
export default {
  state: {
    processRenderWidth: getStore({ name: processRenderWidthStoreKey }) || 1200,
  },
  actions: {
    updateProcessRenderWidth({ commit }, status) {
      commit('SET_PROCESS_RENDER_WIDTH', status);
    },
  },
  mutations: {
    SET_PROCESS_RENDER_WIDTH: (state, width) => {
      const widthSet = Math.max(width, 900);
      state.processRenderWidth = widthSet;
      setStore({ name: processRenderWidthStoreKey, content: widthSet });
    },
  },
};

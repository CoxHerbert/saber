export default {
  state: {
    hasUnsavedChanges: false,
  },
  actions: {
    updateHasUsavedChanges({ commit }, status) {
      commit('SET_HAS_UNSAVED_CHANGES', status);
    },
  },
  mutations: {
    SET_HAS_UNSAVED_CHANGES: (state, status) => {
      state.hasUnsavedChanges = status;
    },
  },
};

const gantt = {
  state: {
    eventArrs: [],
  },
  actions: {
    UpdateEventArrs({ commit }, events) {
      commit('SET_EVENT_ARRS', events);
    },
  },
  mutations: {
    SET_EVENT_ARRS: (state, events) => {
      state.eventArrs = events;
    },
  },
};
export default gantt;

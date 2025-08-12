import { createStore } from 'vuex';
import user from './modules/user';
import common from './modules/common';
import tags from './modules/tags';
import dict from './modules/dict';
import cache from './modules/cache';
import gantt from './modules/gantt';
import page from './modules/page';
import getters from './getters';
import process from './modules/process';

const store = createStore({
  modules: {
    user,
    common,
    tags,
    dict,
    cache,
    gantt,
    page,
    process,
  },
  getters,
});

export default store;

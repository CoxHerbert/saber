import { setStore, getStore, removeStore } from 'utils/store';
import website from '@/config/website';

const common = {
  state: {
    language: getStore({ name: 'language' }) || 'zh-cn',
    isCollapse: false,
    isFullScren: false,
    isMenu: true,
    isSearch: false,
    isRefresh: true,
    colorName: getStore({ name: 'colorName' }),
    themeName: getStore({ name: 'themeName' }),
    website: website,
    setting: website.setting,
  },
  mutations: {
    SET_LANGUAGE: (state, language) => {
      state.language = language;
      setStore({
        name: 'language',
        content: state.language,
      });
    },
    SET_COLLAPSE: state => {
      state.isCollapse = !state.isCollapse;
    },
    SET_IS_MENU: (state, menu) => {
      state.isMenu = menu;
    },
    SET_IS_REFRESH: (state, refresh) => {
      state.isRefresh = refresh;
    },
    SET_IS_SEARCH: (state, search) => {
      state.isSearch = search;
    },
    SET_FULLSCREN: state => {
      state.isFullScren = !state.isFullScren;
    },
    SET_COLOR_NAME: (state, colorName) => {
      state.colorName = colorName;
      setStore({
        name: 'colorName',
        content: state.colorName,
      });
    },
    SET_THEME_NAME: (state, themeName) => {
      state.themeName = themeName;
      setStore({
        name: 'themeName',
        content: state.themeName,
      });
    },
  },
};
export default common;

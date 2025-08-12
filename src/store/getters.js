const getters = {
  tag: state => state.tags.tag,
  language: state => state.common.language,
  setting: state => state.common.setting,
  userInfo: state => state.user.userInfo,
  workCountStatistic: state => state.user.workCountStatistic,
  colorName: state => state.common.colorName,
  themeName: state => state.common.themeName,
  isRefresh: state => state.common.isRefresh,
  isSearch: state => state.common.isSearch,
  isHorizontal: state => state.common.setting.sidebar === 'horizontal',
  isCollapse: state => state.common.isCollapse,
  isFullScren: state => state.common.isFullScren,
  isMenu: state => state.common.isMenu,
  tagList: state => state.tags.tagList,
  tagsKeep: (state, getters) => {
    return getters.tagList
      .filter(ele => {
        return (ele.meta || {}).keepAlive;
      })
      .map(ele => ele.fullPath);
  },
  tagWel: state => state.tags.tagWel,
  token: state => state.user.token,
  roles: state => state.user.roles,
  permission: state => state.user.permission,
  menuId: state => state.user.menuId,
  menu: state => state.user.menu,
  menuAll: state => state.user.menuAll,
  userInfoAll: state => state.user.userInfoAll,
  flowRoutes: state => state.dict.flowRoutes,
  globalData: state => state.cache.globalData,
  curlData: state => state.cache.curlData,
  eventArrs: state => state.gantt.eventArrs,
};
export default getters;

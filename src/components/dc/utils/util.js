import cacheData from './../constant/cacheData';
import ComponentApi from './../../api/index';
import store from '@/store/';

export default {
  /*
   * 获取对象实体
   * */
  async getObject({ objectName, ids }) {
    try {
      const currentObject = cacheData[objectName];
      let _ids;
      if (Array.isArray(ids)) {
        _ids = ids.map(item => item?.id || item);
      } else if (typeof ids === 'object' && ids !== null) {
        try {
          _ids = [ids?.id];
        } catch (error) {
          _ids = [];
        }
      } else if (typeof ids === 'string') {
        _ids = ids.split(',');
      }
      if (!_ids.length) return;
      if (!_ids || (Array.isArray(_ids) && _ids.length === 0)) return;
      await ComponentApi.cache.getView({
        url: currentObject.value.url,
        data: _ids,
      });

      const currentGlobalData = store.getters.globalData[currentObject.url];
      return _ids.map(id => currentGlobalData[id] || id);
    } catch (error) {}
  },
};

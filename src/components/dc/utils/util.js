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
      if (!currentObject) return;

      let _ids = [];
      if (Array.isArray(ids)) {
        _ids = ids.map(item => item?.id ?? item);
      } else if (ids && typeof ids === 'object') {
        _ids = [ids.id];
      } else if (typeof ids === 'string') {
        _ids = ids.split(',');
      }

      if (!_ids.length) return;

      await ComponentApi.cache.getView({
        url: currentObject.url,
        data: _ids,
      });

      const currentGlobalData = store.getters.globalData[currentObject.url] || {};
      return _ids.map(id => currentGlobalData[id] || id);
    } catch {
      // ignore
    }
  },
};

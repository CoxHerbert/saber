import request from '@/axios';

export default {
  // 搜索
  // search(params) {
  //   return request({
  //     url: '/blade-bip/user-wiki/wiki-document-search-for-key',
  //     method: 'get',
  //     params,
  //   });
  // },
  search(params) {
    return request({
      url: '/blade-bip/ew-wiki/search',
      method: 'get',
      params,
    });
  },
  hotDocument(params) {
    return request({
      url: '/blade-bip/dc-wiki-hot-document/visit-stat',
      // url: '/blade-bip/user-wiki/wiki-hot-documents',
      method: 'get',
      params,
    });
  },
  shot(params) {
    return request({
      url: '/blade-bip/dc-wiki-hot-document/spot',
      method: 'post',
      data: params,
    });
  },
  clickGetDetail(params) {
    return request({
      url: '/blade-bip/user-wiki/wiki-hotspot',
      method: 'post',
      data: params,
    });
  },
  getDetailByPath(params) {
    return request({
      url: '/blade-bip/feign/client/skip/wiki/pages/by-path',
      method: 'get',
      params: params,
    });
  },
  getDetailById(params) {
    return request({
      url: `/blade-bip/ew-wiki/${params.id}`,
      method: 'get',
    });
  },
  // 待接口完善
  rightTree() {
    return request({
      url: '/blade-bip/feign/client/skip/wiki/pages/trees',
      method: 'get',
      params: {
        // parent: '',
        // mode: 'ALL',
        path: 'ew-wiki',
        locale: 'zh',
        // includeAncestors: true,
      },
    });
  },
};

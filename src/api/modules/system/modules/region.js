import request from '@/axios';

export default {
  getList(current, size, params) {
    return request({
      url: '/blade-system/region/list',
      method: 'get',
      params: {
        ...params,
        current,
        size,
      },
    });
  },

  getLazyTreegetList(parentCode, params) {
    return request({
      url: '/blade-system/region/lazy-tree',
      method: 'get',
      params: {
        ...params,
        parentCode,
      },
    });
  },

  getLazyTreeLevelThree( params) {
    return request({
      url: '/blade-system/region/lazy-tree-level-three',
      method: 'get',
      params
    });
  },

  getDetailgetList(code) {
    return request({
      url: '/blade-system/region/detail',
      method: 'get',
      params: {
        code,
      },
    });
  },

  removegetList(id) {
    return request({
      url: '/blade-system/region/remove',
      method: 'post',
      params: {
        id,
      },
    });
  },

  submitgetList(row) {
    return request({
      url: '/blade-system/region/submit',
      method: 'post',
      data: row,
    });
  },
};

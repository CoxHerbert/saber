import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-system/dept/list',
      method: 'get',
      params,
    });
  },

  getLazyList(params) {
    return request({
      url: '/blade-system/dept/lazy-list',
      method: 'get',
      params,
    });
  },

  remove(params) {
    return request({
      url: '/blade-system/dept/remove',
      method: 'post',
      params,
    });
  },

  add(data) {
    return request({
      url: '/blade-system/dept/submit',
      method: 'post',
      data,
    });
  },

  update(data) {
    return request({
      url: '/blade-system/dept/submit',
      method: 'post',
      data,
    });
  },

  getDept(id) {
    return request({
      url: '/blade-system/dept/detail',
      method: 'get',
      params: {
        id,
      },
    });
  },

  getDeptTree(tenantId) {
    return request({
      url: '/blade-system/dept/tree',
      method: 'get',
      params: {
        tenantId,
      },
    });
  },

  getDeptLazyTree(parentId) {
    return request({
      url: '/blade-system/dept/lazy-tree',
      method: 'get',
      params: {
        parentId,
      },
    });
  },
};

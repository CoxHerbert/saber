import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-system/dict-biz/list',
      method: 'get',
      params,
    });
  },

  getParentList(params) {
    return request({
      url: '/blade-system/dict-biz/parent-list',
      method: 'get',
      params,
    });
  },

  getChildList(params) {
    return request({
      url: '/blade-system/dict-biz/child-list',
      method: 'get',
      params,
    });
  },

  remove(params) {
    return request({
      url: '/blade-system/dict-biz/remove',
      method: 'post',
      params,
    });
  },

  add(data) {
    return request({
      url: '/blade-system/dict-biz/submit',
      method: 'post',
      data,
    });
  },

  update(data) {
    return request({
      url: '/blade-system/dict-biz/submit',
      method: 'post',
      data,
    });
  },

  getDict(params) {
    return request({
      url: '/blade-system/dict-biz/detail',
      method: 'get',
      params,
    });
  },
  getDictTree() {
    return request({
      url: '/blade-system/dict-biz/tree?code=DICT',
      method: 'get',
    });
  },

  getDictionary(params) {
    return request({
      url: '/blade-system/dict-biz/dictionary',
      method: 'get',
      params,
    });
  },

  getDicts(code) {
    return request({
      url: `/blade-system/dict-biz/dictionary?code=${code}`,
      method: 'get',
    });
  },
};

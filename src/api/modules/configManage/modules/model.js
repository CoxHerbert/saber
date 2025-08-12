import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-develop/model/list',
      method: 'get',
      params,
    });
  },

  getModelPrototype(params) {
    return request({
      url: '/blade-develop/model/model-prototype',
      method: 'get',
      params,
    });
  },
};

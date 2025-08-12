import request from '@/axios';

// 列表
export default {
  list(params) {
    return request({
      url: '/blade-bip/dc-scm-exchange-rate/list',
      method: 'get',
      params,
    });
  },
  detail(params) {
    return request({
      url: '/blade-bip/dc-scm-exchange-rate/detail',
      method: 'get',
      params,
    });
  },
  submit(params) {
    return request({
      url: '/blade-bip/dc-scm-exchange-rate/submit',
      method: 'post',
      data: params,
    });
  },
  remove(params) {
    return request({
      url: '/blade-bip/dc-scm-exchange-rate/remove',
      method: 'delete',
      params,
    });
  },
};

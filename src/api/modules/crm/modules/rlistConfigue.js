import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/rlist-configue/list',
      method: 'get',
      params,
    });
  },
  detail(params) {
    return request({
      url: '/blade-bip/rlist-configue/detail',
      method: 'get',
      params,
    });
  },
  remove(params) {
    return request({
      url: '/blade-bip/rlist-configue/remove',
      method: 'DELETE',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-bip/rlist-configue/submit',
      method: 'post',
      data,
    });
  },
};

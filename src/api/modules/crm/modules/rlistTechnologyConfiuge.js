import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/rlist-technology-confiuge/list',
      method: 'get',
      params,
    });
  },
  detail(params) {
    return request({
      url: '/blade-bip/rlist-technology-confiuge/detail',
      method: 'get',
      params,
    });
  },
  remove(params) {
    return request({
      url: '/blade-bip/rlist-technology-confiuge/remove',
      method: 'DELETE',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-bip/rlist-technology-confiuge/submit',
      method: 'post',
      data,
    });
  },
};

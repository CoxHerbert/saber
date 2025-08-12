import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-bip/skip-url/dc/scm/order/get-page-list',
      method: 'get',
      params,
    });
  },
};

import request from '@/axios';

export default {
  // 及时库存列表
  list(params) {
    return request({
      url: '/blade-bip/erp-inventory',
      method: 'get',
      params,
    });
  },
};

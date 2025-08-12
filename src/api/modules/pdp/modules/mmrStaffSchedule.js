import request from '@/axios';

export default {
  detail(params) {
    return request({
      url: '/blade-bip/mmr-staff-schedule/detail-by-order-id',
      method: 'get',
      params,
    });
  },
};

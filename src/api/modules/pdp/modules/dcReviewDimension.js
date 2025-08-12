import request from '@/axios';

export default {
  // 评审模版列表
  list() {
    return request({
      url: '/blade-bip/dc-review-dimension/review-dimension-template',
      method: 'get',
    });
  },
};

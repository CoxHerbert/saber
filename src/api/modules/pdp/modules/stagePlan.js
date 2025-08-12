import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-phase/list',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-bip/mmr-plan-order-phase/submit',
      method: 'post',
      data,
    });
  },
};

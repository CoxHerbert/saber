import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-opt/dispatch-application',
      method: 'get',
      params,
    });
  },
};

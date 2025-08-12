import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-opt/registration-application',
      method: 'get',
      params,
    });
  },
  processForm(params) {
    return request({
      url: '/blade-workflow/feign/client/process/get-process-form',
      method: 'get',
      params,
    });
  },
};

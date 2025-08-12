import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/dc-review-issues/find-template-data',
      method: 'get',
      params,
    });
  },
};

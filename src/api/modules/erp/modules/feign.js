import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-erp/feign/client/mtono/list',
      method: 'get',
      params,
    });
  },
};

import request from '@/axios';

export default {
  // 主数据列表
  wxRegState(params) {
    return request({
      url: '/blade-bip/redis/current-time-millis/get',
      method: 'get',
      params,
    });
  },
};

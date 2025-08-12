import request from '@/axios';

export default {
  // 列表
  list(params) {
    return request({
      url: '/blade-bip/PdpExecutePricing/execute-list',
      method: 'get',
      params,
    });
  },
  // 明细查询
  detail(params) {
    return request({
      url: '/blade-bip/PdpExecutePricing/execute-detail',
      method: 'get',
      params,
    });
  },
  // 修改
  submit(data) {
    return request({
      url: '/blade-bip/PdpExecutePricing/execute-submit',
      method: 'post',
      data,
    });
  },
};

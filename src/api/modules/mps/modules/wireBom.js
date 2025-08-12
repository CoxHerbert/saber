import request from '@/axios';

export default {
  // 列表
  list(params) {
    return request({
      url: '/blade-bip/WireBom/bom-list',
      method: 'get',
      params,
    });
  },
  // 明细查询
  detail(params) {
    return request({
      url: '/blade-bip/WireBom/bom-detail',
      method: 'get',
      params,
    });
  },

  // 明细查询
  remove(params) {
    return request({
      url: '/bldae-bip/WireBom/remove',
      method: 'get',
      params,
    });
  },
};

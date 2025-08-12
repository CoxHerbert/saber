import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-count/list',
      method: 'get',
      params,
    });
  },

  // 保存接口
  submit(data) {
    return request({
      url: '/blade-bip/mmr-plan-order-count/submit',
      method: 'post',
      data,
    });
  },

  // 删除接口
  remove(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-count/remove',
      method: 'DELETE',
      params,
    });
  },

  // 详情接口
  detail(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-count/detail',
      method: 'GET',
      params,
    });
  },

  // 详情查明细
  detailByOrderId(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-count/detail-by-order-id',
      method: 'GET',
      params,
    });
  },
  //   // 有效计划接口
  //   findeFfectivePhase(params) {
  //     return request({
  //       url: '/blade-bip/mmr-plan-order/find-effective-phase',
  //       method: 'GET',
  //       params,
  //     });
  //   },
};

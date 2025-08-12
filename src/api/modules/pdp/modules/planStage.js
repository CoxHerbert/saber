import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/dc-mmr-plan-order-category/list',
      method: 'get',
      params,
    });
  },

  // 保存接口
  submit(data) {
    return request({
      url: '/blade-bip/dc-mmr-plan-order-category/submit',
      method: 'post',
      data,
    });
  },

  // 删除接口
  remove(params) {
    return request({
      url: '/blade-bip/dc-mmr-plan-order-category/remove',
      method: 'DELETE',
      params,
    });
  },

  // 详情接口
  detail(params) {
    return request({
      url: '/blade-bip/dc-mmr-plan-order-category/detail',
      method: 'GET',
      params,
    });
  },

  //   计划查询

  // 主数据列表
  serchList(params) {
    return request({
      url: '/blade-bip/dc-mmr-plan-order-category/find-phase-tasks',
      method: 'get',
      params,
    });
  },
};

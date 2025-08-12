import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/dc-fea/list',
      method: 'get',
      params,
    });
  },

  // 保存
  subimt(data) {
    return request({
      url: '/blade-bip/dc-fea/create',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(params) {
    return request({
      url: '/blade-bip/dc-fea/remove',
      method: 'delete',
      params,
    });
  },

  // 明细
  detail(params) {
    return request({
      url: '/blade-bip/dc-fea/detail',
      method: 'get',
      params,
    });
  },

  // 提交
  subimtArchiving(data) {
    return request({
      url: '/blade-bip/dc-fea/feasibility-assessment-archiving',
      method: 'put',
      data,
    });
  },
};
